/**
 * Optional, browser-local semantic evidence exploration.
 * Never changes calibrated evidence scores or hiring decisions.
 * Model downloads from Hugging Face once; candidate text inference stays in browser.
 */
let modelPromise;
export function splitEvidence(text,maxChunks=20){
 const lines=String(text||"").replace(/\r/g,"\n").split(/\n+|(?<=[.!?])\s+(?=[A-Z])/);
 const chunks=[];
 for(const line of lines){
  const cleaned=line.replace(/\s+/g," ").trim();
  if(cleaned.length<15)continue;
  for(let i=0;i<cleaned.length&&chunks.length<maxChunks;i+=350){
   const part=cleaned.slice(i,i+450).trim();
   if(part.length>=15)chunks.push(part);
  }
  if(chunks.length>=maxChunks)break;
 }
 return chunks;
}
export function similarity(a,b){let dot=0,aa=0,bb=0;for(let i=0;i<Math.min(a.length,b.length);i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]}return aa&&bb?dot/Math.sqrt(aa*bb):0}
export async function semanticLeads(candidate,checks){
 const missing=(checks||[]).filter(c=>!c.matched).slice(0,6);
 const chunks=splitEvidence(candidate?.resume,20);
 if(!missing.length||!chunks.length)return [];
 if(!modelPromise)modelPromise=import("@huggingface/transformers").then(({pipeline})=>pipeline("feature-extraction","Xenova/all-MiniLM-L6-v2",{device:"wasm",dtype:"q8"})).catch(e=>{modelPromise=null;throw e});
 const embed=await modelPromise;
 const inputs=[...missing.map(c=>"Job requirement: "+c.label),...chunks];
 const output=await embed(inputs,{pooling:"mean",normalize:true});
 const vectors=output.tolist(),results=[];
 missing.forEach((req,i)=>{
  let best={score:-1,index:-1};
  chunks.forEach((chunk,j)=>{
   const score=similarity(vectors[i],vectors[missing.length+j]);
   if(score>best.score)best={score,index:j};
  });
  // Similarity is a lead to inspect, not evidence that a requirement is met.
  if(best.score>=0.57)results.push({requirement:req.label,similarity:Number(best.score.toFixed(2)),excerpt:chunks[best.index]});
 });
 return results.sort((a,b)=>b.similarity-a.similarity);
}
