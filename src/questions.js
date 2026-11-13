// Evidence-grounded interview question plans for human reviewers.
// Generic drafting is a fallback; the optional FLAN-T5 module can supply extra drafts.
const clean=v=>String(v||"").trim().replace(/\s+/g," ").replace(/[?.!]+$/,"").slice(0,140);
const clip=v=>clean(v).slice(0,180);
const priorityValue=c=>Math.max(1,Math.min(5,Number(c?.weight)||1));
export const byPriority=(a,b)=>priorityValue(b)-priorityValue(a)
 ||(a.priority==="required"?-1:1)-(b.priority==="required"?-1:1)
 ||String(a.label).localeCompare(String(b.label));
function chooseIndex(label,len,source,matched){
 let hash=matched?19:7;
 for(const ch of String(label+"|"+source))hash=(hash*31+ch.charCodeAt(0))>>>0;
 return hash%len;
}
function questionFor(check){
 const label=clean(check.label),kind=check.kind||"requirement",supported=!!check.matched;
 const evidence=check.evidence?clip(check.evidence):"";
 const templates={
 skill:supported?[
  `Your CV mentions ${label}. Which real deliverable used it most heavily, and what was your contribution?`,
  `What was the hardest problem you solved using ${label}, and how did you verify the result?`,
  `For ${label}, what would you repeat or change from your most recent project?`,
  `How did you choose to apply ${label}, and what alternatives did you evaluate?`
 ]:[
  `Which project best demonstrates practical experience with ${label}, and what did you deliver?`,
  `Have you used ${label} in a professional or personal project? Which tasks were yours?`,
  `What relevant experience could demonstrate how you would work with ${label} in this role?`,
  `Which hands-on example would help us understand your familiarity with ${label}?`
 ],
 experience:[
  `Could you walk through the roles and dates that support ${label}, separating direct and related work?`,
  `Which positions contribute to your experience in ${label}, and what did you do during each period?`,
  `Can you describe the career timeline relevant to ${label} and when your responsibilities changed?`,
  `What kinds of hands-on work make up your experience in ${label}, rather than just time in the field?`
 ],
 responsibility:supported?[
  `Your CV mentions ${label}. Which decisions did you personally own and what was the result?`,
  `When working on ${label}, what obstacle did you overcome and how did you assess success?`,
  `What was your precise role in ${label}, and how did you work with other people involved?`,
  `For ${label}, what would you change if you repeated the assignment today?`
 ]:[
  `Can you describe a time you worked on something comparable to ${label}? What was the outcome?`,
  `How would you plan ${label}, and what past work informs your approach?`,
  `Which previous responsibility is most transferable to ${label}, and why?`,
  `What practical example could show your ability to handle ${label}?`
 ],
 qualification:[
  `Which formal qualification or equivalent learning best addresses ${label}?`,
  `Can you clarify how your qualifications or documented learning relate to ${label}?`,
  `Are there credentials or equivalent work-based learning relevant to ${label} that we should review?`,
  `What training, certification or comparable education supports ${label}?`
 ],
 industry:[
  `Which aspects of ${label} have you worked with directly, and what was the context?`,
  `What constraints or regulations particular to ${label} have affected your work?`,
  `Can you give an example of adapting your work to the needs of ${label}?`,
  `Which previous work best demonstrates familiarity with ${label}, and where would you need to learn more?`
 ],
 requirement:supported?[
  `Your CV describes ${label}. What was the context and measurable outcome?`,
  `Which decisions did you make while working on ${label}, and why?`,
  `What was the biggest challenge in ${label}, and what did you learn from it?`,
  `How did you collaborate with others while handling ${label}?`
 ]:[
  `Can you give an example of work related to ${label}, including what you contributed?`,
  `What comparable responsibility has prepared you to handle ${label}?`,
  `How would you approach ${label} in this job, and what experience supports your plan?`,
  `Which project or assignment best demonstrates ${label} and its outcome?`
 ]
 };
 const variants=templates[kind]||templates.requirement;
 const text=variants[chooseIndex(label,variants.length,evidence,supported)];
 return {text,category:kind,priority:priorityValue(check),matched:supported,
  status:supported?"Evidence to verify":"Not established in submitted evidence",
  source:check.source||"No CV evidence",context:supported?evidence:"",
  guidance:"Use the question to verify real experience; missing documentation is not a negative conclusion."};
}
export function interviewQuestions(checks,{limit=6,focus="all"}={}){
 const filtered=[...(checks||[])].sort(byPriority)
  .filter(c=>focus==="missing"?!c.matched:focus==="supported"?c.matched:true);
 const used=new Set(),out=[];
 for(const check of filtered){
  const key=clean(check.label).toLowerCase();if(!key||used.has(key))continue;
  used.add(key);
  out.push({requirement:check.label,...questionFor(check)});
  if(out.length>=limit)break;
 }
 return out;
}
export function profileVerificationQuestions(delta,{limit=4}={}){
 const claims=(delta?.newlyEvidenced||[]).map(x=>({
  label:x.label,kind:x.kind,priority:"required",weight:x.weight||3,
  matched:true,source:"LinkedIn",evidence:x.evidence
 })).sort(byPriority).slice(0,limit);
 return claims.map(c=>{
  const label=clean(c.label);
  const type=c.kind||"requirement";
  const variants={
   skill:`Your LinkedIn profile mentions ${label}, which wasn't documented in your CV. What have you delivered using it, and when?`,
   responsibility:`Your profile adds experience in ${label}. Which project demonstrates your direct contribution and outcome?`,
   experience:`Your profile provides additional detail about ${label}. Can you walk through the roles, dates and relevant responsibilities?`,
   qualification:`Your profile mentions ${label}. Which credential or equivalent learning could you provide if needed?`,
   industry:`Your LinkedIn profile mentions ${label}. In which roles did you gain direct exposure, and what work did you perform?`
  };
  return {requirement:c.label,category:type,priority:priorityValue(c),matched:true,
   status:"New LinkedIn-only claim",source:"LinkedIn",context:clip(c.evidence),
   text:variants[type]||`Your LinkedIn profile adds ${label}. What project or verifiable work example supports this new claim?`,
   stage:"LinkedIn-only — verify independently"};
 });
}

/**
 * Guaranteed question availability: for every requested slot choose an unused
 * requirement-grounded variant. No speculative candidate achievements.
 */
export function alternativeQuestion(checks,existing=[],stage="resume",attempt=0){
 const ordered=[...(checks||[])].sort(byPriority);
 const used=new Set(existing.map(q=>String(q.text||"").trim().toLowerCase()));
 if(!ordered.length){
  // Neutral, non-evaluative prompts when the JD has no extractable criteria.
  const prompts=[
   "Which responsibilities from this job description align most closely with your previous work?",
   "What example from your previous work would help us understand your approach to this role?",
   "Which part of the advertised role would you need to learn more about before starting?",
   "What would you ask the team to clarify about the responsibilities in this job description?",
   "What recent work are you proud of that you believe is relevant to this role?",
   "How would you describe the type of work you most enjoy in relation to this position?"
  ];
  const eligible=prompts.find(p=>!used.has(p.toLowerCase()))||prompts[attempt%prompts.length];
  return {text:eligible,requirement:"Role discussion",priority:1,category:"general",source:"Job description",status:"Open-ended"};
 }
 for(let turn=0;turn<Math.max(ordered.length*30,30);turn++){
  const c=ordered[(attempt+turn)%ordered.length];
  const base=questionFor(c);
  const label=clean(c.label),k=base.category,variant=Math.floor((attempt+turn)/ordered.length)%10;
  const prefix=stage==="profile"?"The profile additionally mentions ":"The job calls for ";
  const templates=[
   base.text,
   `For ${label}, what actual experience would you choose to discuss and why?`,
   `What was your most recent responsibility connected to ${label}?`,
   `Can you walk me through a real situation related to ${label}, without assuming you have direct experience?`,
   `Which relevant task involving ${label} required the most collaboration, and what was your contribution?`,
   `What would you want to clarify about ${label} before taking on this role?`,
   `What is one lesson from previous work that you would bring to ${label}?`,
   `Could you give an example that demonstrates your understanding of ${label} in practice?`,
   `What was the result of your closest experience with ${label}, and how did you know?`,
   `When thinking about ${label}, which previous role gave you the most relevant preparation?`
  ];
  const text=templates[variant];
  if(!used.has(text.toLowerCase()))return {...base,text,requirement:c.label,category:k,priority:priorityValue(c),stage,source:"Requirement-based draft"};
 }
 // The available requirement is still presented as an unverified question.
 const c=ordered[attempt%ordered.length];
 const label=clean(c.label);
 return {...questionFor(c),text:`Could you describe an example relevant to ${label} and explain your personal contribution?`,requirement:c.label,stage};
}
export function fillQuestionSet(checks,existing=[],count=6,stage="resume",seed=0){
 const out=existing.filter(q=>q&&typeof q.text==="string").slice(0,count);
 let i=0;
 while(out.length<count&&i<200){
  const next=alternativeQuestion(checks,out,stage,seed+i);
  if(!out.some(q=>q.text.toLowerCase()===next.text.toLowerCase()))out.push(next);
  i++;
 }
 return out.slice(0,count);
}
