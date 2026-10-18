/* LTF Market — BOTTLENECK_DOMINANT40 / LQ3.068 + frozen LQ3.080 shadow feature.
 * Derived without retuning from LQ3_080_BOTTLENECK_SHADOW_TAGGER_V1.py,
 * recovered from official LQ3_079_083_PACOTE_AUDITORIA.zip (SHA256 ca422ca4...).
 * Independent parity audit: 276/276 historical targets, Discovery 87/176,
 * Holdout 53/100, integer-feature FNV1a32=58ac061b.
 * The historical K1 is the unchanged C3 ticket only if TAG_ON; K0 otherwise.
 * All multi-game portfolios shown by the app are experimental.
 * Source ends at C3783; no extension to later contests without fresh sources.
 * Shadow tag may not alter ticket, experimental validation, or real-money policy.
 */
(function(root){
'use strict';
const MAX=root.MAX11_008,SALDO=root.SALDO60_K9E6,C3=root.C3_OWN_SUPPORT;
if(!MAX||!SALDO||!C3||typeof MAX.generate!=='function'||typeof SALDO.generate!=='function'||typeof C3.generate!=='function')
 throw Error('BOTTLENECK: motores MAX/SALDO/C3 originais indisponíveis');
const FIRST=1001,LAST=3781,THRESHOLD=0.20;
function eligible(target){
 return Number.isSafeInteger(target)&&target>=FIRST&&target<=LAST&&target%10===1;
}
function generate(target){
 if(!eligible(target))throw Error('BOTTLENECK original somente C1001..C3781, concursos terminados em 1');
 const max=MAX.generate(target),saldo=SALDO.generate(target),c3=C3.generate(target);
 if(max.lastDraw!==target-1||saldo.lastDraw!==target-1||c3.lastDraw!==target-1)
  throw Error('BOTTLENECK: violação temporal pré-draw');
 const mr=new Map(max.ranking.map((n,i)=>[n,i+1]));
 // The original SALDO has two independent rank spaces: KEEP 1..15, ENTER 1..10.
 // The experimental display ranking groups selected KEEP9, ENTER6, remaining KEEP6, ENTER4.
 const keep=[...saldo.ranking.slice(0,9),...saldo.ranking.slice(15,21)];
 const enter=[...saldo.ranking.slice(9,15),...saldo.ranking.slice(21,25)];
 if(new Set(keep).size!==15||new Set(enter).size!==10||keep.some(n=>enter.includes(n)))
  throw Error('BOTTLENECK: SALDO internal ranking corrupted');
 const kr=new Map(keep.map((n,i)=>[n,i+1])),er=new Map(enter.map((n,i)=>[n,i+1]));
 const saldoTicket=new Set(saldo.ticket),core=max.ticket.filter(n=>saldoTicket.has(n));
 if(!core.length||core.length!==c3.intersection.length)
  throw Error('BOTTLENECK: invalid MAX x SALDO core');
 let maxLow=0,saldoLow=0;
 for(const n of core){
  const mStrength=(26-mr.get(n))/25;
  const sStrength=kr.has(n)?1-(kr.get(n)-1)/14:1-(er.get(n)-1)/9;
  if(!Number.isFinite(mStrength)||!Number.isFinite(sStrength))
   throw Error('BOTTLENECK: invalid number strength');
  if(mStrength<sStrength)maxLow++;
  else if(sStrength<mStrength)saldoLow++;
 }
 const ties=core.length-maxLow-saldoLow;
 const gap=Math.abs(maxLow-saldoLow)/core.length;
 const tagOn=gap>=THRESHOLD;
 return Object.freeze({
  algorithm:'LQ3_068_BOTTLENECK_DOMINANT40_V1',
  shadowTagger:'LQ3_080_BOTTLENECK_SHADOW_TAGGER_V1',
  target,lastDraw:target-1,eligible:true,tag_on:tagOn,
  core_size:core.length,max_low_count:maxLow,saldo_low_count:saldoLow,tie_count:ties,
  core_max_bottleneck_share:maxLow/core.length,
  core_saldo_bottleneck_share:saldoLow/core.length,
  core_bottleneck_tie_share:ties/core.length,
  core_bottleneck_balance_gap:gap,threshold:THRESHOLD,
  decision:tagOn?'K1_C3_UNCHANGED':'K0_ABSTAIN',
  original_ticket:tagOn?c3.ticket.slice():null,
  experimental_ranking:tagOn?c3.ranking.slice():null,
  source:'MAX11_008_PLUS_SALDO60_PLUS_C3_CAUSAL',
  readiness:'FAIL_REAL_READINESS_11_OF_15',
  original_scope:'HISTORICAL_W10_1001_3781',
  experimental_portfolio_not_validated:true,
  no_real_money_authorization:true
 });
}
function audit(){
 let discovery=0,holdout=0,h=2166136261;
 const items=[];
 for(let t=FIRST;t<=3751;t+=10){
  const x=generate(t);if(x.tag_on){if(t<=2751)discovery++;else holdout++;}
  items.push([t,x.core_size,x.max_low_count,x.saldo_low_count,x.tie_count].join(':'));
 }
 const str=items.join('\n');
 for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
 const fingerprint=h.toString(16).padStart(8,'0');
 const ok=items.length===276&&discovery===87&&holdout===53&&fingerprint==='58ac061b';
 return Object.freeze({ok,total:items.length,discovery,holdout,fingerprint,expected:'58ac061b'});
}
for(const [t,core,ml,sl,ties] of [[3761,10,3,7,0],[3771,9,3,5,1],[3781,10,7,2,1]]){
 const x=generate(t);
 if(x.core_size!==core||x.max_low_count!==ml||x.saldo_low_count!==sl||x.tie_count!==ties||!x.tag_on)
  throw Error('BOTTLENECK: fixture C'+t+' mismatch');
}
root.BOTTLENECK_D40=Object.freeze({
 generate,eligible,audit,firstTarget:FIRST,lastEligibleTarget:LAST,threshold:THRESHOLD,
 historicalParity:'276/276',readiness:'FAIL_11_OF_15',referenceFingerprint:'58ac061b'
});
})(typeof window!=='undefined'?window:globalThis);
