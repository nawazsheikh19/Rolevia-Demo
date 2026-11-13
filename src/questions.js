// Candidate-specific recruiter prompts grounded in visible requirements and evidence.
// No generated claims about a candidate. Suitable for synthetic-data prototype only.
const clean=value=>String(value||"").trim().replace(/\s+/g," ").replace(/[?.!]+$/,"").slice(0,140);
const clip=value=>clean(value).slice(0,180);
const priorityValue=c=>Math.max(1,Math.min(5,Number(c?.weight)||1));
export const byPriority=(a,b)=>priorityValue(b)-priorityValue(a)
  ||(a.priority==="required"?-1:1)-(b.priority==="required"?-1:1)
  ||String(a.label).localeCompare(String(b.label));
function categoryQuestion(check,sourceText){
 const label=clean(check.label),kind=check.kind||"requirement",missing=!check.matched;
 const prefix=missing?"Your application doesn't yet establish":"Your application mentions";
 const reminder="Ask for a concrete example; absence from a CV is not proof of lacking experience.";
 const templates={
 skill:missing?
  [`Which recent project or task best demonstrates your hands-on use of ${label}, and what did you personally deliver?`,
   `What have you used ${label} for in practice, and which parts did you implement yourself?`]:
  [`You mention ${label}. Which practical task depended most on it, and what was the outcome?`,
   `How did you apply ${label} in your most relevant work, and what trade-offs did you consider?`],
 experience:[
  `Could you walk through your relevant roles and dates for ${label}, including how much time was hands-on?`,
  `Which positions make up your experience in ${label}, and how would you distinguish direct from adjacent experience?`
 ],
 responsibility:missing?
  [`Tell me about a time you were responsible for: ${label}. What was your own contribution and the result?`,
   `How would you approach ${label} in this role, and what similar work have you completed?`]:
  [`You describe work related to ${label}. What decisions did you own and what changed as a result?`,
   `For ${label}, how did you coordinate the work, handle obstacles, and measure the outcome?`],
 qualification:[
  `Which qualification or equivalent learning best meets the role's requirement: ${label}?`,
  `Could you clarify the qualification, awarding institution or equivalent experience relevant to ${label}?`
 ],
 industry:[
  `What exposure have you had to ${label}, and which domain-specific constraints did you handle?`,
  `Which aspects of ${label} have you worked with directly rather than through adjacent roles?`
 ],
 requirement:missing?
  [`Can you describe a real example of ${label}, including your responsibility and the results?`,
   `What comparable experience would you draw on to handle ${label} in this position?`]:
  [`Your CV suggests ${label}. What was the context, and how did you know your approach worked?`,
   `What was your most challenging experience with ${label}, and what would you do differently?`]
 };
 const options=templates[kind]||templates.requirement;
 // Stable variety across criteria; priority is deliberately not a predictor of capability.
 const index=[...label].reduce((v,ch)=>v+ch.charCodeAt(0),0)%options.length;
 return {text:options[index],category:kind,priority:priorityValue(check),
   status:missing?"Not established in submitted evidence":"Evidence to verify",
   source:check.source||"No CV evidence",
   context:check.matched?clip(check.evidence):"",
   guidance:reminder};
}
export function interviewQuestions(checks,{limit=6,focus="all"}={}){
 const items=[...(checks||[])].sort(byPriority);
 const filtered=focus==="missing"?items.filter(c=>!c.matched):focus==="supported"?items.filter(c=>c.matched):items;
 // Avoid 6 near-duplicate questions about the same area.
 const used=new Set(),output=[];
 for(const check of filtered){
  const key=clean(check.label).toLowerCase();
  if(used.has(key))continue;
  used.add(key);
  output.push({requirement:check.label,matched:!!check.matched,...categoryQuestion(check)});
  if(output.length>=limit)break;
 }
 return output;
}
export function profileVerificationQuestions(delta,{limit=4}={}){
 const additions=(delta?.newlyEvidenced||[]).map(item=>({
   label:item.label,kind:item.kind,priority:"required",weight:item.weight||3,
   matched:true,source:"LinkedIn",evidence:item.evidence
 }));
 return interviewQuestions(additions,{limit}).map(question=>({
  ...question,stage:"LinkedIn-only — verify independently",
  text:question.text+" What dates and supporting examples could corroborate that profile claim?"
 }));
}
