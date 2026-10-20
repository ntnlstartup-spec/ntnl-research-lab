// COB14-SHADOW V1.16 — otimizacao local prospectiva, de cobertura EXATA de 14 ou 15.
// 151 resultados vizinhos por bilhete (1 + 15*10); teto 151*N, nao otimo global provado.
// Mantem COB13+, primeira matriz de 11 jogos, controles originais, H10, K1/K0 e historico.
(function(root){
'use strict';
const V='COB14_SHADOW_V1_16',U=3268760,B=151;
const key=g=>g.join(',');
const valid=g=>Array.isArray(g)&&g.length===15&&new Set(g).size===15&&g.every(n=>Number.isInteger(n)&&n>=1&&n<=25);
function fnv(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0;}
function rng(seed){let a=fnv(String(seed));return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function neigh(g,fn){let m=0;for(const n of g)m|=1<<(n-1);fn(m);for(const n of g){const v=m^(1<<(n-1));for(let k=1;k<=25;k++)if((m&(1<<(k-1)))===0)fn(v|(1<<(k-1)));}}
function coverage14(gs){let masks=new Set();for(const g of gs){if(!valid(g))throw Error('COB14: bilhete invalido');neigh(g,x=>masks.add(x));}return masks.size;}
function replaceOne(g,r){const v=g.slice(),inside=new Set(g),out=[];for(let n=1;n<=25;n++)if(!inside.has(n))out.push(n);v[Math.floor(r()*15)]=out[Math.floor(r()*10)];return v.sort((a,b)=>a-b);}
function variant(g,r){const out=replaceOne(g,r);return r()<.38?replaceOne(out,r):out;}
function optimize(parts,seed,c13){
 if(!Array.isArray(parts)||!parts.length||!c13?.coverage)throw Error('COB14: entrada invalida');
 const mutable=[],all=[],byParts=[];
 for(let a=0;a<parts.length;a++){
  const p=parts[a];if(!p?.id||!Array.isArray(p.games)||p.games.some(x=>!valid(x))||new Set(p.games.map(key)).size!==p.games.length)throw Error('COB14: carteira invalida');
  byParts.push([]);
  for(let i=0;i<p.games.length;i++){const g=p.games[i].slice();byParts[a].push(all.length);all.push(g);if(p.games.length===88&&i>=11)mutable.push(all.length-1);}
 }
 const n=all.length,original=all.map(g=>g.slice()),origUnique=new Set(all.map(key)).size;
 const b14=coverage14(all),b13=c13.coverage(all),counts=new Map(),used=new Set(all.map(key));
 for(const g of all)neigh(g,m=>counts.set(m,(counts.get(m)||0)+1));
 const r=rng('LTF|COB14|'+seed),attempted=new Set();
 // Gera as opcoes uma vez; recalcula o ganho marginal ao aplicar cada troca.
 // Reduz o tempo de tela congelada em tablets sem enfraquecer a verificacao exata.
 let checks=0,acceptedMoves=0,current13=b13;const MAX_CHECKS=24,MAX_MOVES=10,options=[];
 for(const ix of mutable){
  const old=all[ix],oldSet=new Set();neigh(old,m=>oldSet.add(m));
  const lost=[...oldSet].filter(m=>counts.get(m)===1).length;
  for(let z=0;z<5;z++){
   const next=variant(old,r),k=key(next),pair=ix+'|'+k;
   if(used.has(k)||attempted.has(pair))continue;
   let gain=0;neigh(next,m=>{if(!counts.has(m)||(oldSet.has(m)&&counts.get(m)===1))gain++;});
   const delta=gain-lost;
   if(delta>0)options.push({ix,next,k,delta,pair});
  }
 }
 options.sort((a,b)=>b.delta-a.delta||a.ix-b.ix||a.k.localeCompare(b.k));
 const changed=new Set();
 for(const opt of options){
  if(checks>=MAX_CHECKS||acceptedMoves>=MAX_MOVES)break;
  if(changed.has(opt.ix)||used.has(opt.k)||attempted.has(opt.pair))continue;
  const old=all[opt.ix],oldMasks=new Set();neigh(old,m=>oldMasks.add(m));
  const lost=[...oldMasks].filter(m=>counts.get(m)===1).length;
  let gain=0;neigh(opt.next,m=>{if(!counts.has(m)||(oldMasks.has(m)&&counts.get(m)===1))gain++;});
  if(gain-lost<=0)continue;
  attempted.add(opt.pair);checks++;all[opt.ix]=opt.next;
  const after13=c13.coverage(all);
  if(after13<current13){all[opt.ix]=old;continue;}
  neigh(old,m=>{const n=counts.get(m);if(n===1)counts.delete(m);else counts.set(m,n-1);});
  neigh(opt.next,m=>counts.set(m,(counts.get(m)||0)+1));
  used.delete(key(old));used.add(opt.k);current13=after13;
  acceptedMoves++;changed.add(opt.ix);
 }
 const candidate14=counts.size,candidate13=current13,won=candidate14>b14&&candidate13>=b13;
 const final=won?all:original;
 const rebuilt=parts.map((p,i)=>byParts[i].map(ix=>final[ix].slice()));
 if(rebuilt.flat().length!==n||rebuilt.some((p,i)=>p.some((g,j)=>!valid(g)||(j<11&&key(g)!==key(parts[i].games[j]))))||
 new Set(rebuilt.flat().map(key)).size<origUnique)throw Error('COB14: invariantes violados');
 return {parts:rebuilt,metrics:{version:V,accepted:won,base14:b14,final14:won?candidate14:b14,base13:b13,final13:won?candidate13:b13,
  percent14Before:100*b14/U,percent14After:100*(won?candidate14:b14)/U,
  percent13Before:100*b13/U,percent13After:100*(won?candidate13:b13)/U,
  gain14:won?candidate14-b14:0,gain13:won?candidate13-b13:0,
  modifiedGames:won?acceptedMoves:0,numberOfGames:n,numberOfMutableGames:mutable.length,
  theoreticalUpperBound14:Math.min(U,n*B),upperBoundPercent14:100*Math.min(U,n*B)/U,
  checks,immutableFirst11:true,activePortfolioUnchanged:true,noExtraTickets:true,
  protection:'EXACT_13PLUS_NO_REGRESSION_AND_14PLUS_MONOTONIC',
  warning:'Heuristica local, nao prova otimo global nem vantagem preditiva.'}};
}
root.LTF_COB14_V1=Object.freeze({version:V,coverage14,optimize});
})(window);
