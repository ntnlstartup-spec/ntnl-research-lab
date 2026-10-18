/* NTNL Research Lab — C3_OWN_SUPPORT (LQ3.040 / LQ3.043).
 * Causal fusion of MAX11.008 and SALDO60 K9E6: K1 original at targets ending in 1.
 * The full 25-number ranking is an EXPERIMENTAL T30.72 extension only.
 * Scientific classification: REAL-READINESS FAIL (12/15); no real-money eligibility.
 */
(function(root){
'use strict';
const MAX=root.MAX11_008, SALDO=root.SALDO60_K9E6;
if(!MAX||!SALDO||typeof MAX.generate!=='function'||typeof SALDO.generate!=='function'||typeof SALDO.sha256!=='function')
 throw Error('C3_OWN_SUPPORT depende de MAX11.008 e SALDO60 autênticos.');
function generate(target){
 if(!Number.isSafeInteger(target)||target<1001||target>3781||target%10!==1)
  throw Error('C3 original elegível em concursos terminados em 1, C1001–C3781 no histórico disponível.');
 const m=MAX.generate(target), s=SALDO.generate(target);
 if(m.lastDraw!==target-1||s.lastDraw!==target-1||m.ticket.length!==15||s.ticket.length!==15)
  throw Error('C3: fontes sem integridade temporal');
 const mr=new Map(m.ranking.map((n,i)=>[n,i+1]));
 // SALDO.ranking = KEEP selected 9, ENTER selected 6, KEEP other 6, ENTER other 4.
 // This regrouping restores its original rank *within* the KEEP and ENTER pools.
 const keepRank=[...s.ranking.slice(0,9),...s.ranking.slice(15,21)];
 const enterRank=[...s.ranking.slice(9,15),...s.ranking.slice(21,25)];
 if(new Set(keepRank).size!==15||new Set(enterRank).size!==10)throw Error('C3: universo SALDO corrompido');
 const kr=new Map(keepRank.map((n,i)=>[n,i+1]));
 const er=new Map(enterRank.map((n,i)=>[n,i+1]));
 const ms=new Set(m.ticket),ss=new Set(s.ticket);
 const intersection=m.ticket.filter(n=>ss.has(n));
 const maxOnly=m.ticket.filter(n=>!ss.has(n));
 const saldoOnly=s.ticket.filter(n=>!ms.has(n));
 const own=(n,model)=>model==='MAX'?(26-mr.get(n))/25:
  kr.has(n)?1-(kr.get(n)-1)/14:1-(er.get(n)-1)/9;
 const hash=n=>SALDO.sha256(`LQ3_040_NUMBER_TIE_V1|${target}|${String(n).padStart(2,'0')}`);
 const exclusive=[...maxOnly.map(n=>({n,side:'MAX',strength:own(n,'MAX')})),
   ...saldoOnly.map(n=>({n,side:'SALDO',strength:own(n,'SALDO')}))];
 exclusive.sort((a,b)=>b.strength-a.strength||hash(a.n).localeCompare(hash(b.n))||a.n-b.n);
 const picked=exclusive.slice(0,15-intersection.length);
 const ticket=[...intersection,...picked.map(x=>x.n)].sort((a,b)=>a-b);
 if(ticket.length!==15||new Set(ticket).size!==15)throw Error('C3: cardinalidade do K1 inválida');
 // Only for the experimental T30.72 11-game wallet, not an original C3 ranking.
 const selected=new Set(ticket);
 const mainRanking=[...intersection].sort((a,b)=>mr.get(a)-mr.get(b)||a-b)
   .concat(picked.map(x=>x.n));
 const remaining=Array.from({length:25},(_,i)=>i+1).filter(n=>!selected.has(n))
   .sort((a,b)=>((26-mr.get(b))/25 + (kr.has(b)?1-(kr.get(b)-1)/14:1-(er.get(b)-1)/9))
              -((26-mr.get(a))/25 + (kr.has(a)?1-(kr.get(a)-1)/14:1-(er.get(a)-1)/9))||a-b);
 const ranking=[...mainRanking,...remaining];
 if(ranking.length!==25||new Set(ranking).size!==25||!ranking.slice(0,15).every(n=>selected.has(n)))
  throw Error('C3: ranking experimental inválido');
 return {algorithm:'C3_OWN_SUPPORT_LQ3_040_V1',target,lastDraw:target-1,source:'MAX11_008_PLUS_SALDO60_K9E6_CAUSAL',
  ticket,ranking,intersection:[...intersection].sort((a,b)=>a-b),maxOnly,saldoOnly,picked,
  rankingProvenance:'EXTENSAO_EXPERIMENTAL_T30_72',readiness:'FAIL_REAL_READINESS_12_OF_15'};
}
const fixture=generate(1001);
const expected=[1,2,6,7,9,10,12,13,14,15,18,21,22,23,25];
if(fixture.ticket.some((n,i)=>n!==expected[i]))throw Error('C3: fixture C1001 falhou');
root.C3_OWN_SUPPORT=Object.freeze({generate,verifiedFixture:1001,originalStatus:'FAIL_REAL_READINESS_12_OF_15'});
})(typeof window!=='undefined'?window:globalThis);