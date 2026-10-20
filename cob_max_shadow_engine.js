// LTF COB-MAX V1.19: gerador sombra multiobjetivo (2 reinicios, busca tabu, recombinacao)
// So usa carteiras ja congeladas; preserva primeiros 11, H10, K1/K0 e controles.
// Busca ganhos geometricos 13+ com protecao monotona 14+; SEM previsao nem promessa de ROI.
(function(root){'use strict';
const V='COB_MAX_MULTI_SHADOW_V1_19',TOTAL=3268760,SIZE=1<<25;
const key=g=>g.join(',');
const valid=g=>Array.isArray(g)&&g.length===15&&new Set(g).size===15&&g.every(n=>Number.isInteger(n)&&n>=1&&n<=25);
function rand(seed){let x=2166136261;for(const ch of String(seed)){x^=ch.charCodeAt(0);x=Math.imul(x,16777619);}
 return()=>{x+=0x6D2B79F5;let z=x;z=Math.imul(z^z>>>15,z|1);z^=z+Math.imul(z^z>>>7,z|61);return((z^z>>>14)>>>0)/4294967296;};}
function visit(g,level,fn){let m=0;const inBits=[],outside=[];
 for(const n of g){const bit=1<<(n-1);inBits.push(bit);m|=bit;}
 for(let n=1;n<=25;n++){const bit=1<<(n-1);if(!(m&bit))outside.push(bit);}
 fn(m);for(let i=0;i<15;i++){const x=m^inBits[i];for(let j=0;j<10;j++)fn(x|outside[j]);}
 if(level===13)for(let i=0;i<15;i++)for(let j=i+1;j<15;j++){const x=m^inBits[i]^inBits[j];for(let a=0;a<10;a++)for(let b=a+1;b<10;b++)fn(x|outside[a]|outside[b]);}
}
function change(g,r,n){const v=g.slice(),out=[];for(let k=1;k<=25;k++)if(!g.includes(k))out.push(k);
 for(let t=0;t<n;t++){const i=Math.floor(r()*15),j=Math.floor(r()*10),old=v[i];v[i]=out[j];out[j]=old;}return v.sort((a,b)=>a-b);}
function combine(g,other,r,count){const v=g.slice(),newDigits=other.filter(n=>!v.includes(n));if(!newDigits.length)return change(g,r,1);
 for(let t=0;t<Math.min(count,newDigits.length);t++){const i=Math.floor(r()*15),j=Math.floor(r()*newDigits.length),old=v[i];v[i]=newDigits[j];newDigits.splice(j,1);if(!v.includes(old))newDigits.push(old);}
 return v.sort((a,b)=>a-b);}
function optimize(parts,seed,geo13,geo14){
 if(!geo13?.coverage||!geo14?.coverage14||!Array.isArray(parts)||!parts.length)throw Error('COB-MAX: motores ou carteiras ausentes');
 const baseline=parts.map(p=>{if(!p?.id||!Array.isArray(p.games)||p.games.some(g=>!valid(g))||
  new Set(p.games.map(key)).size!==p.games.length)throw Error('COB-MAX: carteira invalida');
  return p.games.map(g=>g.slice());});
 const old=baseline.flat(),n=old.length;
 const baseline13=geo13.coverage(old),baseline14=geo14.coverage14(old);
 const movable=[];baseline.forEach((gs,p)=>{if(gs.length===88)for(let i=11;i<88;i++)movable.push({p,i});});
 const origKeys=new Map();for(const g of old){const k=key(g);origKeys.set(k,(origKeys.get(k)||0)+1);}
 const origDistinct=origKeys.size;
 let chosen=baseline,score13=baseline13,score14=baseline14,selectedRestart=-1,changed=0,trialCount=0;
 for(let restart=0;restart<2;restart++){
  const gs=baseline.map(group=>group.map(g=>g.slice())),r=rand('COB-MAX|'+seed+'|'+restart);
  const counts13=new Uint8Array(SIZE),counts14=new Uint8Array(SIZE),used=new Map();
  let covers13=0,covers14=0;
  function add(g){const k=key(g);used.set(k,(used.get(k)||0)+1);
   visit(g,13,m=>{if(counts13[m]===255)throw Error('COB-MAX: contador13 excedido');if(!counts13[m]++)covers13++;});
   visit(g,14,m=>{if(counts14[m]===255)throw Error('COB-MAX: contador14 excedido');if(!counts14[m]++)covers14++;});}
  function remove(g){const k=key(g),times=used.get(k);if(times===1)used.delete(k);else used.set(k,times-1);
   visit(g,13,m=>{if(!--counts13[m])covers13--;});visit(g,14,m=>{if(!--counts14[m])covers14--;});}
  function gain(g){let a=0,b=0;visit(g,13,m=>{if(!counts13[m])a++;});visit(g,14,m=>{if(!counts14[m])b++;});return[a,b];}
  for(const g of gs.flat())add(g);
  if(covers13!==baseline13||covers14!==baseline14)throw Error('COB-MAX: divergencia cobertura inicial');
  const order=movable.map(v=>{let overlaps=0;visit(gs[v.p][v.i],13,m=>{if(counts13[m]>1)overlaps++;});
    return{...v,overlaps,duplicate:(origKeys.get(key(gs[v.p][v.i]))||0)>1?1:0};})
    .sort((a,b)=>b.duplicate-a.duplicate||b.overlaps-a.overlaps||a.p-b.p||a.i-b.i);
  const recent=[],seenPos=new Map();let changes=0,tries=0;
  const steps=Math.min(64,order.length),pool=Math.min(160,order.length);
  for(let t=0;t<steps;t++){
   if(!pool)break;
   let pick=t<16?t:(restart*31+t*2+Math.floor(r()*31))%pool;
   let v=order[pick],pos=v.p+':'+v.i;
   if(t-(seenPos.get(pos)??-1000)<12)continue;
   seenPos.set(pos,t);
   const oldGame=gs[v.p][v.i],oldKey=key(oldGame);
   remove(oldGame);
   const [restore13,restore14]=gain(oldGame),was13=covers13+restore13,was14=covers14+restore14;
   let winner=null,winnerKey='',top13=was13,top14=was14;
   for(let z=0;z<8;z++){
    let candidate;
    if(z<=2)candidate=change(oldGame,r,z+1);
    else if(z<=5)candidate=change(oldGame,r,z-2);
    else{
     const otherP=(v.p+1+Math.floor(r()*(gs.length-1)))%gs.length;
     const partner=gs[otherP][Math.floor(r()*gs[otherP].length)];
     candidate=combine(oldGame,partner,r,z===8?2:1);
    }
    const k=key(candidate);
    if(k===oldKey||used.has(k)||recent.includes(k))continue;
    tries++;
    const [g13,g14]=gain(candidate),new13=covers13+g13,new14=covers14+g14;
    // Ambos os objetivos protegidos; 13+ tem prioridade e 14+ desfaz empate.
    if(new13<was13||new14<was14||(new13===was13&&new14===was14))continue;
    if(new13>top13||(new13===top13&&new14>top14)||(new13===top13&&new14===top14&&k<winnerKey)){
     winner=candidate;winnerKey=k;top13=new13;top14=new14;
    }
   }
   if(winner){
    gs[v.p][v.i]=winner;add(winner);changes++;
    recent.push(oldKey);if(recent.length>36)recent.shift();
   }else add(oldGame);
  }
  const flat=gs.flat(),actual13=geo13.coverage(flat),actual14=geo14.coverage14(flat);
  if(actual13!==covers13||actual14!==covers14||actual13<baseline13||actual14<baseline14||
   flat.length!==n||new Set(flat.map(key)).size<origDistinct||
   gs.some((group,p)=>group.some((g,i)=>i<11&&key(g)!==key(baseline[p][i]))))
    throw Error('COB-MAX: invariantes de protecao falharam');
  trialCount+=tries;
  if(actual13>score13||(actual13===score13&&actual14>score14)){
   chosen=gs;score13=actual13;score14=actual14;selectedRestart=restart;changed=changes;
  }
 }
 const final=chosen.flat();
 return{parts:chosen,metrics:{version:V,numberOfGames:n,mutableGames:movable.length,
  restarts:2,selectedRestart,tabuMemory:36,candidatesTested:trialCount,modifiedGames:changed,
  originalDistinct:origDistinct,finalDistinct:new Set(final.map(key)).size,
  duplicateTicketsEliminated:new Set(final.map(key)).size-origDistinct,
  original13:baseline13,final13:score13,original14:baseline14,final14:score14,
  gain13:score13-baseline13,gain14:score14-baseline14,
  percent13Before:100*baseline13/TOTAL,percent13After:100*score13/TOTAL,
  percent14Before:100*baseline14/TOTAL,percent14After:100*score14/TOTAL,
  immutableFirst11:true,noExtraGames:true,activeUnchanged:true,
  methods:['MULTISTART','SHORT_TABU','CROSS_ROBOT_RECOMBINATION','EXACT_UNION_C13_C14'],
  note:'Otimo global NAO comprovado; geometria nao indica vantagem preditiva nem melhora do ROI esperado.'}};
}
root.LTF_COB_MAX_V1=Object.freeze({version:V,optimize});
})(window);