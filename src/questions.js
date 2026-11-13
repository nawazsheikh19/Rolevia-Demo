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
 const ordered=[...(checks||[])].sort((a,b)=>(stage==="profile"?Number(b.source==="LinkedIn")-Number(a.source==="LinkedIn"):0)||byPriority(a,b));
 const norm=v=>String(v||"").trim().toLowerCase().replace(/\s+/g," ");
 const used=new Set(existing.map(q=>norm(q.text)));
 const patterns=["What practical experience do you have that relates to {label}?","Can you describe a recent example relevant to {label} and explain your contribution?","Which responsibility from previous work is closest to {label}?","What would you want to clarify about {label} before starting?","How would you approach a new assignment involving {label}?","What lessons from prior work would you bring to {label}?","Which part of {label} would require the most collaboration?","How would you plan work connected to {label}?","Which outcome would help us understand your experience with {label}?","What obstacles could arise when handling {label}, and how would you respond?","Where would you look for guidance when dealing with {label}?","How would you know work involving {label} had been successful?","What feedback have you received about work relevant to {label}?","Can you describe a decision you made in an assignment related to {label}?","What would you do differently if you revisited work related to {label}?","What other skills have you used alongside {label}?","How have you adapted when circumstances changed around {label}?","What experience from another industry could transfer to {label}?","Which tools or processes would you expect to use for {label}, and why?","How would you explain your approach to {label} to a colleague outside your specialty?","What would a successful first month working on {label} look like?","How would you prioritize tasks related to {label} alongside other deadlines?","How would you identify a problem early in work related to {label}?","What is one example of communicating results associated with {label}?","What would you want to learn about {label} from the current team?","Which previous project would make you most prepared for {label}?","What might make {label} challenging in this particular role?","What kind of support would help you contribute to {label} effectively?","How would you handle uncertainty while working on {label}?","Which improvements could you suggest to a process involving {label}?"];
 const linkedin=["The supplied LinkedIn profile mentions {label}. What example and dates support it?","What context can you provide for the LinkedIn information on {label}?","Which parts of the LinkedIn statement about {label} reflect your own work?","What would you like us to verify about the profile information on {label}?","How does the profile information about {label} relate to your recent role?"];
 const general=["Which responsibilities in the job description relate most closely to your previous work?","What kind of work example would help us understand your approach to this job?","What would you clarify about this role before deciding whether it is a good fit?","Which past assignment best illustrates how you could contribute to this position?","What would you like to learn about the responsibilities of this position?","How do you typically collaborate when starting a new assignment?"];
 const index=Math.max(0,Math.floor(Number(attempt)||0));
 if(!ordered.length){
  for(let j=0;j<general.length;j++){const text=general[(index+j)%general.length];if(!used.has(norm(text)))return {text,requirement:"Role discussion",category:"general",priority:1,source:"Job description"};}
  return {text:general[index%general.length],requirement:"Role discussion",category:"general",priority:1,source:"Job description"};
 }
 for(let step=0;step<ordered.length;step++){
  const c=ordered[(index+step)%ordered.length];
  const candidates=[...(stage==="profile"&&c.source==="LinkedIn"?linkedin:[]),...patterns];
  const base=Math.floor(index/Math.max(1,ordered.length));
  for(let j=0;j<candidates.length;j++){
   const text=candidates[(base+j)%candidates.length].replaceAll("{label}",clean(c.label));
   if(used.has(norm(text)))continue;
   return {text,requirement:c.label,category:c.kind||"requirement",priority:priorityValue(c),matched:!!c.matched,context:c.matched?clip(c.evidence):"",source:"Grounded alternative",stage};
  }
 }
 for(const text of general){if(!used.has(norm(text)))return {text,requirement:"Role discussion",category:"general",priority:1,source:"Job description"};}
 return {text:general[index%general.length],requirement:"Role discussion",category:"general",priority:1,source:"Job description"};
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
