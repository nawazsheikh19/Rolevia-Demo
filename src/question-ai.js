/**
 * Optional browser-local question rewriting with a small FLAN-T5 model.
 * Generated questions are drafts for human editing, never hiring assessments.
 * Uses only a requirement and short source excerpt; never makes an external inference request.
 */
import {alternativeQuestion} from "./questions.js";
let textGenerator;
let lastFailure="";
const prohibited=/\b(?:age|date of birth|married|marital status|pregnant|pregnancy|religion|ethnicity|race|nationality|citizenship|disability|sexual orientation|political views)\b/i;
export function validateQuestionDraft(input,requirement){
 const candidate=String(input||"").trim().replace(/\s+/g," ").slice(0,260);
 if(candidate.length<22||candidate.length>230||!candidate.endsWith("?")||prohibited.test(candidate))return null;
 if(!/^(?:how|what|which|when|where|why|can|could|would|tell me|describe|please describe)\b/i.test(candidate))return null;
 if(/\b(?:you (?:have|already|built|managed|led|worked|delivered|designed)|your (?:work at|time at|project at))\b/i.test(candidate))return null;
 if(/^(?:what is|define|list)\b/i.test(candidate))return null; // Avoid superficial quizzes in place of experience verification
 if(/\b(?:as an ai|language model|cannot answer|not enough information)\b/i.test(candidate))return null;
 // Require overlap with role terms or source phrase; otherwise could be irrelevant/hallucinated.
 const key=String(requirement||"").toLowerCase().match(/[a-z]{4,}/g)||[];
 if(!key.some(t=>candidate.toLowerCase().includes(t)))return null;
 return candidate;
}
export async function draftInterviewQuestion(check,existing=[],stage="resume"){
 const fallback=()=>({...alternativeQuestion([check],existing,stage,existing.length+4),source:"Grounded local alternative · offline",modelError:lastFailure});
 const label=String(check?.label||"").slice(0,115);
 if(!label)return fallback();
 if(lastFailure)return fallback();
 try{
 if(!textGenerator)textGenerator=import("@huggingface/transformers")
  .then(({pipeline})=>pipeline("text2text-generation","Xenova/flan-t5-small",{device:"wasm",dtype:"q8"}))
  .catch(e=>{textGenerator=null;throw e});
 const generate=await textGenerator;
 const excerpt=String(check?.evidence||"").slice(0,180);
 const prompt="Write one short, specific interview question asking for a real work example. "+
 "Do not invent achievements. Avoid personal characteristics. Job requirement: "+label+
 ". "+(excerpt?"Candidate document excerpt: "+excerpt+". ":"No documented example provided. ")+
 "Ask what they personally did and what resulted. Question:";
 const result=await generate(prompt,{max_new_tokens:75,do_sample:false});
 const raw=result?.[0]?.generated_text||"";
 const question=validateQuestionDraft(raw,label);
 if(!question||existing.some(x=>x.text?.toLowerCase()===question.toLowerCase()))return fallback();
 return {text:question,source:"Local FLAN-T5 draft · human review required"};
 }catch(e){lastFailure=String(e?.message||e).slice(0,220);textGenerator=null;return fallback();}
}
export function resetQuestionModel(){lastFailure="";textGenerator=null;}
export function questionModelError(){return lastFailure;}

