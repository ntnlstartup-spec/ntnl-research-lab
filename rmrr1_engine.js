/* LTF Market | RMRR1 V1 | Reconstrucao causal outcome-free.
 * Fonte: AR-RMRR1 B0702, LQ3.117, USB Passport.
 * TRANS Beta(1,1), RUN cap4 Beta(3,2); UP/FLAT/DOWN por movimento
 * ordinal t-1 para t. REL=(HIT+1)/(SUP+2); fonte local maximiza REL.
 * Apenas W10 (target terminacao 1) em C1001..C3751 pertence ao
 * universo historico avaliado. Demais concursos: extensao experimental.
 * Sem suporte a apostas reais ou alegacao de capacidade preditiva.
 */
(function(root){
 "use strict";
 const SOURCE="HISTORICO_CANONICO_1_3783", ALGORITHM="RMRR1_RANK_MOBILITY_RELIABILITY_V1";
 const HISTORY_END=3783, MIN_TARGET=1001, MAX_TARGET=3784;
 const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
 0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
 0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
 0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
 0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
 0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
 0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
 0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 function rotr(x,n){return (x>>>n)|(x<<(32-n));}
 function sha256(s){
  const data=Array.from(s).map(c=>c.charCodeAt(0));if(data.some(x=>x>127))throw Error("SHA256 exige texto ASCII");
  const bitLength=data.length*8;data.push(128);while(data.length%64!==56)data.push(0);
  for(let i=7;i>=0;i--)data.push(i>=4?0:bitLength>>>(i*8)&255);
  const state=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  for(let at=0;at<data.length;at+=64){
   const w=new Uint32Array(64);
   for(let i=0;i<16;i++){let o=at+4*i;w[i]=((data[o]<<24)|(data[o+1]<<16)|(data[o+2]<<8)|data[o+3])>>>0;}
   for(let i=16;i<64;i++){let x=w[i-15],y=w[i-2];w[i]=(w[i-16]+(rotr(x,7)^rotr(x,18)^(x>>>3))+w[i-7]+(rotr(y,17)^rotr(y,19)^(y>>>10)))>>>0;}
   let [a,b,c,d,e,f,g,h]=state;
   for(let i=0;i<64;i++){
    const t1=(h+(rotr(e,6)^rotr(e,11)^rotr(e,25))+((e&f)^(~e&g))+K[i]+w[i])>>>0;
    const t2=((rotr(a,2)^rotr(a,13)^rotr(a,22))+((a&b)^(a&c)^(b&c)))>>>0;
    h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
   }
   const vals=[a,b,c,d,e,f,g,h];for(let i=0;i<8;i++)state[i]=(state[i]+vals[i])>>>0;
  }
  return state.map(n=>n.toString(16).padStart(8,"0")).join("");
 }
 if(sha256("abc")!=="ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")
  throw Error("RMRR1: autoteste SHA256 falhou");
 function category(prev,current){return prev>current?0:prev===current?1:2;} // 0 UP, 1 FLAT, 2 DOWN
 function maskAt(t){
  if(!root.MAX11_008||typeof root.MAX11_008.historyMask!=="function")
   throw Error("RMRR1 precisa da base canonica MAX11.008 com leitura historica");
  return root.MAX11_008.historyMask(t);
 }
 function generate(target){
  if(!Number.isSafeInteger(target)||target<MIN_TARGET||target>MAX_TARGET)
   throw Error("RMRR1: target valido C1001..C3784; fora do escopo W10 e experimental");
  const transHit=Array.from({length:26},()=>[0,0]),transMiss=Array.from({length:26},()=>[0,0]);
  const runHit=Array.from({length:26},()=>Array.from({length:2},()=>[0,0,0,0,0]));
  const runMiss=Array.from({length:26},()=>Array.from({length:2},()=>[0,0,0,0,0]));
  const lengths=new Uint16Array(26);lengths.fill(1);
  const supp=[[0,0,0],[0,0,0]],hits=[[0,0,0],[0,0,0]];
  let previousRanks=null,selected=null,tieCount=0,chosenRun=0;
  for(let q=2;q<=target;q++){
   const previousMask=maskAt(q-1),p=[new Float64Array(26),new Float64Array(26)],rank=[];
   for(let n=1;n<=25;n++){
    const state=(previousMask>>>(n-1))&1,depth=Math.min(lengths[n],4);
    const yes=transHit[n][state],no=transMiss[n][state],ry=runHit[n][state][depth],rn=runMiss[n][state][depth];
    p[0][n]=(yes+1)/(yes+no+2);p[1][n]=(ry+3)/(ry+rn+5);
   }
   for(let component=0;component<2;component++){
    const ordered=Array.from({length:25},(_,i)=>i+1).sort((a,b)=>p[component][b]-p[component][a]||a-b);
    const ranks=new Uint8Array(26);ordered.forEach((n,i)=>{ranks[n]=i+1});rank[component]=ranks;
   }
   if(q>=3){
    if(q===target){
     const scored=[];
     for(let n=1;n<=25;n++){
      const cT=category(previousRanks[0][n],rank[0][n]),cR=category(previousRanks[1][n],rank[1][n]);
      const relT=(hits[0][cT]+1)/(supp[0][cT]+2),relR=(hits[1][cR]+1)/(supp[1][cR]+2),gap=relR-relT;
      let source=gap>1e-12?1:gap< -1e-12?0:null;
      if(source===null){
       tieCount++;
       const prefix="AR_RMRR1_TIE|"+target+"|"+n+"|";
       source=sha256(prefix+"TRANS")<sha256(prefix+"RUN")?0:1;
      }
      chosenRun+=source;
      scored.push({numero:n,score:p[source][n],source:source===1?"RUN":"TRANS",gap});
     }
     scored.sort((a,b)=>b.score-a.score||a.numero-b.numero);
     selected=scored;break;
    }
    // Apenas outcomes de q<=target-1 entram no REL do target.
    const resultMask=maskAt(q);
    for(let component=0;component<2;component++)for(let n=1;n<=25;n++){
     const c=category(previousRanks[component][n],rank[component][n]);
     supp[component][c]++;hits[component][c]+=(resultMask>>>(n-1))&1;
    }
   }
   previousRanks=rank;
   if(q<target){
    // Mesmo acumulador TRANS/RUN usado no nucleo MAX11.008.
    const nextMask=maskAt(q);
    for(let n=1;n<=25;n++){
     const state=(previousMask>>>(n-1))&1,next=(nextMask>>>(n-1))&1,depth=Math.min(lengths[n],4);
     if(next){transHit[n][state]++;runHit[n][state][depth]++;}
     else{transMiss[n][state]++;runMiss[n][state][depth]++;}
     lengths[n]=state===next?lengths[n]+1:1;
    }
   }
  }
  if(!selected||selected.length!==25)throw Error("RMRR1: ranking incompleto");
  const ranking=selected.map(x=>x.numero),ticket=ranking.slice(0,15),eligible=target<=3751&&target%10===1;
  return {algorithm:ALGORITHM,source:SOURCE,target,lastDraw:target-1,ranking,ticket,
   sortedTicket:ticket.slice().sort((a,b)=>a-b),scores:selected,runSelections:chosenRun,
   tieCount,originalResearchScope:eligible,
   validation:"AGGREGATE_PARITY_RUN_3616_6900_AND_DISCOVERY_HITS_14_7_3; FULL_TICKET_LEDGER_UNAVAILABLE",
   status:"USB_D_RESEARCH_NOT_REAL_READY"};
 }
 root.RMRR1=Object.freeze({generate,historyEnd:HISTORY_END,
  researchScope:"C1001..C3751 mod10=1",status:"P1_FAIL_USB_D_RESEARCH"});
})(typeof window!=="undefined"?window:globalThis);
