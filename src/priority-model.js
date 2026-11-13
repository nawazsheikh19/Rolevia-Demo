/**
 * Explainable, local priority classification model for job descriptions.
 * It only suggests an initial importance weight, never infers candidate ability.
 * Recruiter dropdown changes override this suggestion.
 */
const preferred=/\b(?:nice[ -]to[ -]have|good[ -]to[ -]have|preferred|desirable|optional|bonus|advantageous|a plus|ideally|would be beneficial)\b/i;
const critical=/\b(?:must[ -]have|mandatory|non[ -]negotiable|essential|strictly required|absolutely required|critical|minimum qualifications?|minimum requirements?)\b/i;
const required=/\b(?:requirements?|required qualifications?|you must|need to have|you need|necessary|proficiency required|expected to|core skills?)\b/i;
const sectionalPreferred=/\b(?:preferred|desirable|optional|bonus|preferred qualifications?|desired qualifications?|desirable (?:criteria|skills?)|nice[ -]to[ -]have|good[ -]to[ -]have|bonus skills?|optional)\b/i;
const sectionalCritical=/\b(?:essential (?:criteria|qualifications?|requirements?|skills?)|must[ -]have|mandatory|minimum qualifications?|minimum requirements?)\b/i;
const sectionalRequired=/\b(?:required|requirements?|required qualifications?|required skills?|key responsibilities|responsibilities|duties|what you(?:'ll| will) do)\b/i;
const normalization=s=>String(s||"").toLowerCase().replace(/[^a-z0-9+#.]+/g," ").trim();
const matches=(line,alias)=>{const token=normalization(alias);return !!token&&(" "+normalization(line)+" ").includes(" "+token+" ")};
export function classifyJobPriority(job,criterion){
 const source=String(job||"").slice(0,40000);
 const aliases=[criterion?.label,...(criterion?.aliases||[])].filter(Boolean);
 const lines=source.replace(/\r/g,"\n").split("\n");
 let section="",best=null;
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();if(!line)continue;
  const heading=line.replace(/[:\s-]+$/,"");
  if(line.length<100 && !/^[-*•]|^\d+[.)]\s/.test(line) && (
    /^(?:essential|mandatory|minimum|must[ -]have|required|preferred|desirable|nice[ -]to[ -]have|good[ -]to[ -]have|optional|bonus|qualifications|requirements|responsibilities|duties|skills|key responsibilities)\b/i.test(heading)
  ) && /^(?:[\w\s'/-]{2,65}):?$/.test(line)){
   section=heading;continue;
  }
  const present=aliases.some(a=>matches(line,a));
  if(!present)continue;
  let weight=3,priority="required",reason="Mentioned in the job description",confidence="medium";
  if(sectionalPreferred.test(section)||preferred.test(line)){weight=2;priority="preferred";reason="Preferred / nice-to-have wording";confidence="high";}
  else if(sectionalCritical.test(section)||critical.test(line)){weight=5;reason="Explicit must-have / essential wording";confidence="high";}
  else if(sectionalRequired.test(section)||required.test(line)){weight=4;reason="Required or core responsibility";confidence="high";}
  else if(/\b(?:lead|own|accountable|ensure|deliver|manage|responsible for)\b/i.test(line)){weight=4;reason="Named as a core responsibility";}
  const result={weight,priority,reason,confidence,evidence:line.slice(0,220)};
  if(!best || result.weight>best.weight)best=result;
 }
 // Generic criterion extraction stores the original bullet as grounding.
 if(!best&&criterion?.jobEvidence){
  const evidence=String(criterion.jobEvidence);
  if(preferred.test(evidence))best={weight:2,priority:"preferred",reason:"Preferred wording in extracted bullet",confidence:"medium",evidence};
  else if(critical.test(evidence))best={weight:5,priority:"required",reason:"Essential wording in extracted bullet",confidence:"medium",evidence};
 }
 return best || {weight:3,priority:"required",reason:"No explicit importance cue; neutral default",confidence:"low",evidence:""};
}
export function suggestCriteriaPriorities(job,criteria){
 return (criteria||[]).map(c=>{
  const suggestion=classifyJobPriority(job,c);
  return {...c,weight:suggestion.weight,priority:suggestion.priority,prioritySuggestion:suggestion.reason,priorityConfidence:suggestion.confidence,priorityEvidence:suggestion.evidence,manualWeight:false};
 });
}
