import {assess} from "./matching.js";
/** Difference-only LinkedIn review. No decision, verification, or inferred credentials. */
export function profileDelta(candidate,criteria){
 const before=assess(candidate,criteria,false);
 const after=assess(candidate,criteria,true);
 const newlyEvidenced=after.checks.filter((check,i)=>check.matched&&!before.checks[i].matched);
 const corroborated=after.checks.filter((check,i)=>check.matched&&before.checks[i].matched);
 const unresolved=after.checks.filter(check=>!check.matched);
 const linkedInOnly=newlyEvidenced.map(check=>({
   label:check.label,kind:check.kind,source:"LinkedIn (self-reported)",evidence:check.evidence
 }));
 const followUps=unresolved.filter(check=>check.priority==="required").slice(0,4).map(check=>
  "Can you describe a specific example demonstrating "+check.label.toLowerCase()+" and your personal contribution?"
 );
 if(!followUps.length&&newlyEvidenced.length){
  followUps.push("Which new profile claim can you verify with a recent project example, date, and outcome?");
 }
 const hasProfile=!!String(candidate?.linkedin||"").trim();
 return {
   before,after,hasProfile,delta:hasProfile?(after.percent??0)-(before.percent??0):0,
   newlyEvidenced:linkedInOnly,
   corroborated:corroborated.length,
   unresolved:unresolved.map(x=>({label:x.label,priority:x.priority})),
   followUps,
   note:!hasProfile?"No profile supplied. Nothing has been enriched.":
     !newlyEvidenced.length?"The supplied profile does not add evidence for any currently unmatched requirement. That is not a negative hiring signal.":
     "New profile claims are unverified and should be checked with the candidate. The original resume-only ranking is unchanged."
 };
}
