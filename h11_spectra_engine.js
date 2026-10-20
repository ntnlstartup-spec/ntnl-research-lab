// H11 SPECTRA-G V1 • 11o robô independente, somente laboratório SOMBRA.
// Quatro camadas matemáticas fixas; não usa resultado-alvo, não ajusta pesos pós-sorteio.
// Dois geradores pareados (sinal temporal x sinais aleatórios) e a MESMA geometria.
(function(root){'use strict';
const V='H11_SPECTRA_G_V1',N=25,TOTAL=3268760;
const valid=a=>Array.isArray(a)&&a.length===15&&new Set(a).size===15&&a.every(n=>Number.isInteger(n)&&n>=1&&n<=25);
const key=a=>a.join(',');
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let z=hash(seed);return()=>{z+=0x6D2B79F5;let t=z;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function visits(g,depth,fn){let mask=0;const inn=[],out=[];
 for(const n of g){let b=1<<(n-1);mask|=b;inn.push(b);}
 for(let n=1;n<=25;n++){const b=1<<(n-1);if(!(mask&b))out.push(b);}
 fn(mask);for(const a of inn){const m=mask^a;for(const b of out)fn(m|b);}
 if(depth===13)for(let i=0;i<15;i++)for(let j=i+1;j<15;j++){
  const m=mask^inn[i]^inn[j];for(let a=0;a<10;a++)for(let b=a+1;b<10;b++)fn(m|out[a]|out[b]);}
}
function coverage(games,depth){const used=new Set();for(const g of games)visits(g,depth,m=>used.add(m));return used.size;}
function features(past){
 const h=past.slice(0,12);if(h.length<8||!h.every(valid))throw Error('H11: necessários 8 a 12 sorteios anteriores válidos');
 const f=Array.from({length:4},()=>Array(26).fill(0));let totalWeights=0;
 for(let t=0;t<h.length;t++){
  const w=Math.pow(.84,t);totalWeights+=w;
  for(const n of h[t])f[0][n]+=w;
  // Rede de afinidade interna: pares condicionados ao último sorteio.
  for(const n of h[t])for(const j of h[t])if(n!==j&&h[0].includes(j))f[1][n]+=w/14;
 }
 // Grafo de transição causal: presença anterior → presença posterior
 for(let t=0;t<h.length-1;t++){const w=Math.pow(.86,t);
  for(const n of h[t])for(const p of h[t+1]){
   const circular=Math.min((n-p+25)%25,(p-n+25)%25);
   f[2][p]+=w*(1/(1+circular))/15;
  }
 }
 // Interferência espectral de ondas discretas no anel das 25 dezenas.
 for(let n=1;n<=25;n++)for(let t=0;t<h.length;t++){
  const sign=h[t].includes(n)?1:-1,w=Math.pow(.91,t);
  f[3][n]+=w*sign*(Math.cos(2*Math.PI*(n+3*t)/25)+
                      .5*Math.sin(4*Math.PI*(n+5*t)/25));
 }
 const normalize=x=>{const xs=x.slice(1),mean=xs.reduce((a,b)=>a+b,0)/25;
  const variance=xs.reduce((a,b)=>a+(b-mean)**2,0)/25,sd=Math.sqrt(variance)||1;
  return x.map((v,i)=>i===0?0:(v-mean)/sd);
 };
 const z=f.map(normalize);const score=Array(26).fill(0);
 for(let n=1;n<=25;n++)score[n]=.33*z[0][n]+.26*z[1][n]+.24*z[2][n]+.17*z[3][n];
 return {score,components:z,historyDepth:h.length,weights:[.33,.26,.24,.17],
  description:['Decaimento temporal','Grafo de coocorrência','Transição circular causal','Interferência harmônica']};
}
function build(rank,matrix,seed){
 const initial=matrix.map(row=>row.map(pos=>rank[pos-1]).sort((a,b)=>a-b));
 if(initial.length!==11||initial.some(g=>!valid(g))||new Set(initial.map(key)).size!==11)throw Error('H11: matriz inicial inválida');
 const random=rng('H11|'+seed),current=initial.map(g=>g.slice());
 const masks13=new Set(),masks14=new Set();const seen=new Set();
 function gains(g){let a=0,b=0;visits(g,13,m=>{if(!masks13.has(m))a++;});visits(g,14,m=>{if(!masks14.has(m))b++;});return [a,b];}
 function add(g){seen.add(key(g));visits(g,13,m=>masks13.add(m));visits(g,14,m=>masks14.add(m));}
 let modifications=0;
 for(let i=0;i<11;i++){
  const old=current[i];let best=old,improvement=0,best14=-1;
  // 12 vizinhos com 1 ou 2 trocas por posição, mesmo método no controle.
  const pool=[old];for(let t=0;t<12;t++){
   const g=old.slice(),out=[];for(let n=1;n<=25;n++)if(!old.includes(n))out.push(n);
   for(let z=0;z<(t%3===0?2:1);z++){
    const at=Math.floor(random()*15),idx=Math.floor(random()*10),previous=g[at];
    g[at]=out[idx];out[idx]=previous;
   }
   pool.push(g.sort((a,b)=>a-b));
  }
  for(const g of pool){const k=key(g);if(seen.has(k))continue;const [gain13,gain14]=gains(g);
   if(gain13>improvement||(gain13===improvement&&gain14>best14)){
    best=g;improvement=gain13;best14=gain14;
   }}
  // Nunca rebaixar a geometria individual frente à matriz original naquela etapa.
  const [old13,old14]=gains(old),[new13,new14]=gains(best);
  if(new13<old13||new14<old14)best=old;
  current[i]=best;if(key(best)!==key(old))modifications++;add(best);
 }
 const exact13=coverage(current,13),exact14=coverage(current,14);
 if(exact13!==masks13.size||exact14!==masks14.size||
   current.some(g=>!valid(g))||new Set(current.map(key)).size!==11)throw Error('H11: auditoria combinatória falhou');
 return {games:current,metrics:{initial13:coverage(initial,13),final13:exact13,
  initial14:coverage(initial,14),final14:exact14,modified:modifications,
  percent13:100*exact13/TOTAL,percent14:100*exact14/TOTAL}};
}
function generate(past,matrix,contest){
 if(!Number.isSafeInteger(contest)||contest<1)throw Error('H11: concurso inválido');
 const data=features(past),ranking=Array.from({length:25},(_,i)=>i+1)
  .sort((a,b)=>data.score[b]-data.score[a]||a-b);
 const r=rng('H11|CONTROL|'+contest);
 const controlRank=Array.from({length:25},(_,i)=>i+1);
 for(let i=24;i>0;i--){const k=Math.floor(r()*(i+1));[controlRank[i],controlRank[k]]=[controlRank[k],controlRank[i]];}
 const main=build(ranking,matrix,'MAIN|'+contest),control=build(controlRank,matrix,'CONTROL|'+contest);
 const all=Array.from({length:25},(_,i)=>i+1);
 if(ranking.length!==25||new Set(ranking).size!==25||new Set(controlRank).size!==25||
  [...main.games,...control.games].some(g=>!valid(g)))throw Error('H11: carteira inválida');
 return {version:V,games:main.games,control:control.games,ranking,controlRanking:controlRank,
  metrics:main.metrics,controlMetrics:control.metrics,method:'FOUR_LAYER_SPECTRAL_GRAPH_TEMPORAL',
  layers:data.description,weights:data.weights,depth:data.historyDepth,contestsUsed:'ONLY_PREVIOUS',
  controls:'CONTROL_RANK_SHUFFLED_PLUS_IDENTICAL_GEOMETRY',noPredictionGuarantee:true};
}
root.LTF_H11_V1=Object.freeze({version:V,generate,coverage:(gs)=>({c13:coverage(gs,13),c14:coverage(gs,14)})});
})(window);
