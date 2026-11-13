/**
 * Optional browser-local question rewriting with a Qwen2.5-0.5B instruct language model.
 * Generated questions are drafts for human editing, never hiring assessments.
 * Passes only a sanitized job requirement to on-device inference. No applicant résumé or profile text is provided to the generator.
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
  .then(({pipeline})=>pipeline("text-generation","onnx-community/Qwen2.5-0.5B-Instruct",{device:"wasm",dtype:"q4"}))
  .catch(e=>{textGenerator=null;throw e});
 const generate=await textGenerator;
 // The model sees only a short job requirement, never a candidate CV or LinkedIn profile.
 const safeLabel=label.replace(/[<>\\r\\n{}]/g," ").replace(/\\s+/g," ").trim().slice(0,105);
 const avoid=existing.slice(-8).map(q=>String(q.text||"").slice(0,100)).join(" | ");
 const messages=[
  {role:"system",content:"You help a human recruiter draft fair, job-related interview questions. Output only ONE open-ended question. Never presume the candidate has done anything. Never ask about personal protected characteristics. No claims about the candidate."},
  {role:"user",content:"Job requirement: "+safeLabel+". Write an open-ended behavioral or situational question about this requirement. Do not repeat these prior questions: "+avoid.slice(0,550)+". Include the job requirement in the question."}
 ];
 const output=await generate(messages,{max_new_tokens:95,temperature:0.8,top_p:0.9,do_sample:true,return_full_text:false});
 const candidate=output?.[0]?.generated_text;
 const raw=Array.isArray(candidate)?String(candidate[candidate.length-1]?.content||""):String(candidate||"");
 const question=validateQuestionDraft(raw,label);
 if(!question||existing.some(x=>x.text?.toLowerCase()===question.toLowerCase()))return fallback();
 return {text:question,source:"Qwen 0.5B on-device draft · human review required"};
 }catch(e){lastFailure=String(e?.message||e).slice(0,220);textGenerator=null;return fallback();}
}
export function resetQuestionModel(){lastFailure="";textGenerator=null;}
export function questionModelError(){return lastFailure;}

