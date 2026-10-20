// LTF COB13+ V1 — OTIMIZAÇÃO COMBINATÓRIA DE CARTEIRAS VIRTUAIS
// Universo: C(25,15)=3268760. Para cada bilhete, exatamente 4876 resultados
// permitem 13, 14 ou 15 acertos. Mede uniões EXATAS, não previsão.
(function(global){
'use strict';
const UNIVERSE=3268760, WORDS=1<<20, VERSION='COB13_V1_0';
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function rng(seed){let a=hash(seed);return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
function validGame(g){return Array.isArray(g)&&g.length===15&&new Set(g).size===15&&g.every(n=>Number.isInteger(n)&&n>=1&&n<=25);}
const key=g=>g.slice().sort((a,b)=>a-b).join(',');
function visit(g,cb){
 let mask=0;const ib=new Array(15),outside=[];
 for(let i=0;i<15;i++){ib[i]=1<<(g[i]-1);mask|=ib[i];}
 for(let n=1;n<=25;n++){const b=1<<(n-1);if(!(mask&b))outside.push(b);}
 cb(mask);
 for(let i=0;i<15;i++){
  const m=mask^ib[i];for(let q=0;q<10;q++)cb(m|outside[q]);
 }
 for(let i=0;i<15;i++)for(let j=i+1;j<15;j++){
  const m=mask^ib[i]^ib[j];for(let p=0;p<10;p++)for(let q=p+1;q<10;q++)cb(m|outside[p]|outside[q]);
 }
}
function insert(bits,g){
 let delta=0;
 visit(g,m=>{const i=m>>>5,b=1<<(m&31);if((bits[i]&b)===0){bits[i]|=b;delta++;}});
 return delta;
}
function gain(bits,g){
 let delta=0;
 visit(g,m=>{if((bits[m>>>5]&(1<<(m&31)))===0)delta++;});
 return delta;
}
function coverage(games){
 if(!Array.isArray(games)||games.some(g=>!validGame(g)))throw Error('COB13: carteira com bilhete inválido.');
 const bits=new Uint32Array(WORDS);let covered=0;
 for(const g of games)covered+=insert(bits,g);
 return covered;
}
function propose(g,rank,rand,swaps){
 let next=g.slice(),missing=rank.filter(n=>!next.includes(n));
 for(let i=0;i<swaps;i++){
  const remove=Math.floor(rand()*next.length),add=Math.floor(rand()*missing.length);
  const old=next[remove];next[remove]=missing[add];missing[add]=old;
 }
 next.sort((a,b)=>a-b);return next;
}
function optimize(games,rank,seed){
 if(!Array.isArray(games)||games.length!==88||games.some(g=>!validGame(g))||
  new Set(games.map(key)).size!==88)throw Error('COB13: exige 88 bilhetes únicos e válidos.');
 if(!Array.isArray(rank)||rank.length!==25||new Set(rank).size!==25||
  rank.some(n=>!Number.isInteger(n)||n<1||n>25))throw Error('COB13: ranking inválido.');
 const baseline=coverage(games),bits=new Uint32Array(WORDS),rand=rng('LTF-COB13|'+String(seed));
 const portfolio=[],seen=new Set();let count=0,swapped=0;
 for(let i=0;i<games.length;i++){
  const base=games[i].slice(),baseKey=key(base);let chosen=null,chosenGain=-1,chosenKey='';
  const list=i<11?[base]:[base,propose(base,rank,rand,1),propose(base,rank,rand,2),propose(base,rank,rand,1)];
  for(const v of list){
   const k=key(v);if(seen.has(k))continue;
   const score=gain(bits,v);
   if(score>chosenGain||(score===chosenGain&&k<chosenKey)){chosen=v;chosenGain=score;chosenKey=k;}
  }
  if(!chosen)throw Error('COB13: não foi possível montar 88 jogos distintos.');
  if(i<11&&chosenKey!==baseKey)throw Error('COB13: tentativa de alterar matriz original.');
  if(chosenKey!==baseKey)swapped++;
  seen.add(chosenKey);portfolio.push(chosen);count+=insert(bits,chosen);
 }
 const applied=count>baseline;
 const final=applied?portfolio:games.map(g=>g.slice());
 if(final.length!==88||new Set(final.map(key)).size!==88||final.slice(0,11).some((g,i)=>key(g)!==key(games[i])))throw Error('COB13: falha de invariantes.');
 return {games:final,metrics:{version:VERSION,enabled:true,applied,algorithm:'GREEDY_CANDIDATAS_LOCAIS_13PLUS_EXATO',baselineCovered:baseline,covered:applied?count:baseline,gain:applied?count-baseline:0,
  percentBefore:baseline/UNIVERSE*100,percentAfter:(applied?count:baseline)/UNIVERSE*100,modifiedTickets:applied?swapped:0,
  originalFirst11Intact:true,candidateTrialsPerExtension:4,numberOfGames:88,universe:UNIVERSE,coverageDefinition:'FRAÇÃO_DOS_SORTEIOS_POSSÍVEIS_COM_PELO_MENOS_UM_BILHETE_13PLUS',
  warning:'Cobertura geométrica exata NÃO implica previsão, vantagem em ROI ou maior expectativa de acertos de 13+.'}};
}
global.LTF_COB13_V1=Object.freeze({version:VERSION,universe:UNIVERSE,coverage,optimize});
})(window);
