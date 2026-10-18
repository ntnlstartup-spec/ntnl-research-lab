// LTF H10 V1 — motor independente de hipóteses internas rotativas.
// Não importa motores K1/K0, não utiliza o sorteio-alvo nem altera histórico.
// Hipóteses e respectivas fórmulas são congeladas antes do resultado virtual.
(function(global){
'use strict';
const families=[
 'Convolução circular de somas',
 'Diferença simétrica espelhada',
 'Determinantes discretos modulares',
 'Geometria minimax no anel',
 'Produtos residuais cruzados',
 'Segundas diferenças finitas',
 'Interferência harmônica temporal',
 'Polinômios de permutação modular'
];
const wrap=z=>((z%25)+25)%25+1;
function plan(done){
 if(!Number.isSafeInteger(done)||done<0)throw Error('H10: número de rodadas inválido.');
 const block=Math.floor(done/4),family=block%families.length,variant=Math.floor(block/families.length)+1;
 return {id:'H10-'+String(block+1).padStart(3,'0'),slot:10,block:block+1,
  family,variant,name:families[family],roundInBlock:done%4+1,blockLength:4,
  originalK1K0:false,numberOfGames:11,source:'HIPOTESE_INTERNA_DEMONSTRATIVA'};
}
function generate(idea,past){
 if(!idea||!Array.isArray(past)||past.length<3)throw Error('H10: são necessários ao menos 3 sorteios anteriores.');
 const valid=a=>Array.isArray(a)&&a.length===15&&new Set(a).size===15&&a.every(n=>Number.isInteger(n)&&n>=1&&n<=25);
 if(!past.every(valid))throw Error('H10: histórico de entrada inválido.');
 const [A,B,C]=past,offset=(idea.block*7+idea.variant*3)%25,v=idea.variant,score=Array(26).fill(0);
 const add=(n,w=1)=>{score[n]+=w};
 let formula='';
 switch(idea.family){
 case 0:
  for(const a of A)for(const b of B)add(wrap(a+b+offset-2));
  formula='H(n)=Σ[a+b+δ≡n (mod 25)], δ='+offset;break;
 case 1:
  for(let n=1;n<=25;n++){
   const bit=(Number(A.includes(n))+Number(B.includes(n))+Number(C.includes(n)))%2;
   if(bit)add(wrap(25-n+offset),3);
   else add(wrap(n+offset),1);
  }
  formula='H(n)=reflexão modular do XOR de três resultados; δ='+offset;break;
 case 2:
  for(let i=0;i<15;i++)for(let j=i+1;j<15;j++)
   add(wrap(A[i]*B[j]-A[j]*B[i]+offset));
  formula='H(n)=resíduos de determinantes 2×2 entre sorteios; δ='+offset;break;
 case 3:
  const anchors=A.slice(0,5).map(x=>wrap(x+offset-1));
  for(let n=1;n<=25;n++){
   const worst=Math.max(...anchors.map(a=>Math.min(Math.abs(n-a),25-Math.abs(n-a))));
   add(n,13-worst);
  }
  formula='H(n)=13−max dist_circular(n, 5 âncoras); δ='+offset;break;
 case 4:
  for(const a of A)for(const b of B)add(wrap(a*b+offset-1));
  formula='H(n)=Σ[a·b+δ≡n (mod 25)], δ='+offset;break;
 case 5:
  for(let i=0;i<15;i++)for(let j=0;j<15;j++)
   add(wrap(A[i]-2*B[j]+C[(i+j)%15]+offset-1));
  formula='H(n)=resíduo da diferença discreta a_i−2b_j+c_(i+j); δ='+offset;break;
 case 6:
  for(let n=1;n<=25;n++)for(let t=0;t<past.length;t++){
   const phase=2*Math.PI*((t+1)*(n+offset+v))/25;
   add(n,(past[t].includes(n)?1:-1)*(Math.cos(phase)+Math.sin(2*phase)));
  }
  formula='H(n)=Σ sinal·(cos(fase)+sen(2fase)); fase='+offset;break;
 case 7:
  for(const a of A)for(const b of C)
   add(wrap(a*a+(2*v+1)*b+v*a*b+offset-1));
  formula='H(n)=Σ[a²+'+(2*v+1)+'b+'+v+'ab+δ≡n (mod 25)], δ='+offset;break;
 default:throw Error('H10: família matemática não encontrada.');
 }
 const ranking=Array.from({length:25},(_,i)=>i+1).sort((a,b)=>score[b]-score[a]||a-b);
 if(new Set(ranking).size!==25||score.some(x=>!Number.isFinite(x)))throw Error('H10: ranking reprovado.');
 return {ranking,formula,scores:ranking.map(n=>score[n])};
}
global.LTF_H10_V1=Object.freeze({families:Object.freeze(families.slice()),plan,generate});
})(window);
