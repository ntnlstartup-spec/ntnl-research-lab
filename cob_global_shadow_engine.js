// LTF COB-GLOBAL V1.18 • Otimizacao combinatoria 13+ com piso 14+.
// Carteiras sombra prospectivas, nunca reescreve passado ou altera apostas.
(function(root){'use strict';
const V='COB_GLOBAL_13_14_SHADOW_V1_18',U=3268760,SPACE=1<<25,key=g=>g.join(',');
const valid=g=>Array.isArray(g)&&g.length===15&&new Set(g).size===15&&g.every(n=>Number.isInteger(n)&&n>=1&&n<=25);
function random(seed){let a=2166136261;for(const c of String(seed)){a^=c.charCodeAt(0);a=Math.imul(a,16777619)}return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}}
function visit(g,level,fn){let mask=0;const inn=[],out=[];for(const n of g){const b=1<<(n-1);mask|=b;inn.push(b)}for(let n=1;n<=25;n++){const b=1<<(n-1);if(!(mask&b))out.push(b)}
 fn(mask);for(let i=0;i<15;i++){const a=mask^inn[i];for(let j=0;j<10;j++)fn(a|out[j])}
 if(level===13)for(let i=0;i<15;i++)for(let j=i+1;j<15;j++){const a=mask^inn[i]^inn[j];for(let x=0;x<10;x++)for(let y=x+1;y<10;y++)fn(a|out[x]|out[y])}
}
function variant(g,r,two){let a=g.slice(),outside=[];for(let n=1;n<=25;n++)if(!g.includes(n))outside.push(n);
 for(let z=0;z<(two?2:1);z++){const i=Math.floor(r()*15),j=Math.floor(r()*10),old=a[i];a[i]=outside[j];outside[j]=old}
 return a.sort((a,b)=>a-b)}
function optimize(parts,seed,geo13,geo14){
 if(!geo13?.coverage||!geo14?.coverage14||!Array.isArray(parts)||!parts.length)throw Error('COB GLOBAL: entradas invalidas');
 const groups=parts.map(p=>{if(!p?.id||!Array.isArray(p.games)||p.games.some(g=>!valid(g))||new Set(p.games.map(key)).size!==p.games.length)
  throw Error('COB GLOBAL: carteira invalida');return p.games.map(g=>g.slice())});
 const before=groups.flat(),N=before.length,mutable=[];
 groups.forEach((arr,p)=>{if(arr.length===88)for(let i=11;i<88;i++)mutable.push({p,i})});
 const original13=geo13.coverage(before),original14=geo14.coverage14(before);
 const c13=new Uint8Array(SPACE),c14=new Uint8Array(SPACE);let n13=0,n14=0;
 function add(g){visit(g,13,m=>{if(c13[m]===255)throw Error('COB GLOBAL: contador saturado');if(!c13[m]++)n13++});visit(g,14,m=>{if(c14[m]===255)throw Error('COB GLOBAL: contador saturado');if(!c14[m]++)n14++})}
 function remove(g){visit(g,13,m=>{if(!--c13[m])n13--});visit(g,14,m=>{if(!--c14[m])n14--})}
 function gain(g){let a=0,b=0;visit(g,13,m=>{if(!c13[m])a++});visit(g,14,m=>{if(!c14[m])b++});return [a,b]}
 for(const g of before)add(g);
 if(n13!==original13||n14!==original14)throw Error('COB GLOBAL: medicao inicial divergente');
 const keys=new Set(before.map(key)),rng=random(seed);
 const order=mutable.map(v=>{let overlap=0;visit(groups[v.p][v.i],13,m=>{if(c13[m]>1)overlap++});return {...v,overlap}})
  .sort((a,b)=>b.overlap-a.overlap||a.p-b.p||a.i-b.i);
 let changed=0,attempts=0;
 for(let cycle=0;cycle<2;cycle++)for(let x=0;x<Math.min(120,order.length);x++){
  const {p,i}=order[(x+cycle*29)%order.length],prev=groups[p][i],prevKey=key(prev);
  keys.delete(prevKey);remove(prev);
  const [back13,back14]=gain(prev),was13=n13+back13,was14=n14+back14;
  let chosen=null,chosenKey='',best13=was13,best14=was14;
  for(let t=0;t<7;t++){const g=variant(prev,rng,t%4===0),k=key(g);if(k===prevKey||keys.has(k))continue;
   attempts++;const [add13,add14]=gain(g),a=n13+add13,b=n14+add14;
   if(a<=was13||b<was14)continue;
   if(a>best13||(a===best13&&b>best14)||(a===best13&&b===best14&&k<chosenKey)){
    chosen=g;chosenKey=k;best13=a;best14=b;
   }
  }
  if(chosen){groups[p][i]=chosen;keys.add(chosenKey);add(chosen);changed++}
  else{keys.add(prevKey);add(prev)}
 }
 const after=groups.flat(),actual13=geo13.coverage(after),actual14=geo14.coverage14(after);
 if(n13!==actual13||n14!==actual14||actual13<original13||actual14<original14||
    after.length!==N||groups.some((arr,p)=>arr.some((g,i)=>i<11&&key(g)!==key(parts[p].games[i])))||
    new Set(after.map(key)).size<new Set(before.map(key)).size)throw Error('COB GLOBAL: invariantes falharam');
 return {parts:groups,metrics:{version:V,N,changedGames:changed,candidatesTested:attempts,original13,final13:actual13,
  original14,final14:actual14,gain13:actual13-original13,gain14:actual14-original14,
  percent13Before:100*original13/U,percent13After:100*actual13/U,
  percent14Before:100*original14/U,percent14After:100*actual14/U,
  unchangedFirst11:true,unchangedActive:true,noExtraGames:true,
  note:'Heuristica deterministica, sem prova de otimo global, previsao ou melhora do retorno esperado.'}};
}
root.LTF_COB_GLOBAL_V1=Object.freeze({version:V,optimize});
})(window);