import test from "node:test";
import assert from "node:assert/strict";
import {byPriority,interviewQuestions,profileVerificationQuestions,fillQuestionSet,alternativeQuestion} from "./questions.js";
test("5 is highest priority and comes before 1",()=>{
 const checks=[{label:"Lower",weight:1,kind:"skill",matched:false},{label:"Top",weight:5,kind:"skill",matched:false},{label:"Medium",weight:3,kind:"responsibility",matched:true,evidence:"Built dashboards"}];
 assert.deepEqual([...checks].sort(byPriority).map(x=>x.label),["Top","Medium","Lower"]);
});
test("question types vary and work before LinkedIn",()=>{
 const checks=[
 {label:"Python",kind:"skill",weight:5,matched:false},
 {label:"Lead customer onboarding",kind:"responsibility",weight:4,matched:true,evidence:"Led onboarding with clients"},
 {label:"Bachelor's degree",kind:"qualification",weight:3,matched:false},
 {label:"Healthcare",kind:"industry",weight:2,matched:false},
 {label:"5 years of relevant experience",kind:"experience",weight:1,matched:false}
 ];
 const q=interviewQuestions(checks);
 assert.equal(q.length,5);
 assert.deepEqual(q.map(x=>x.priority),[5,4,3,2,1]);
 assert.equal(new Set(q.map(x=>x.text)).size,5);
 assert.match(q[1].text,/onboarding/i);
 assert.match(q[2].text,/Bachelor/i);
});
test("profile-only follow ups differ from CV questions",()=>{
 const delta={newlyEvidenced:[{label:"Power BI",kind:"skill",weight:4,evidence:"Power BI dashboard project"}]};
 const q=profileVerificationQuestions(delta);
 assert.equal(q.length,1);
 assert.match(q[0].text,/LinkedIn profile/i);
 assert.equal(q[0].priority,4);
});
test("no LinkedIn claims means no profile-only questions",()=>assert.deepEqual(profileVerificationQuestions({newlyEvidenced:[]}),[]));

test("always supplies six distinct resume questions even for a single requirement",()=>{
 const checks=[{label:"Excel inventory forecasting",kind:"requirement",matched:false,weight:5}];
 const questions=fillQuestionSet(checks,[],6,"resume");
 assert.equal(questions.length,6);
 assert.equal(new Set(questions.map(q=>q.text)).size,6);
 assert.ok(questions.every(q=>q.text.includes("Excel inventory forecasting")));
});
test("X replacement avoids the deleted question and retains the planned count",()=>{
 const checks=[{label:"Customer onboarding",kind:"responsibility",matched:true,weight:4,evidence:"Led onboarding"}];
 const plan=fillQuestionSet(checks,[],6,"resume");
 const removed=plan[2];
 plan[2]=alternativeQuestion(checks,[...plan.filter((_,i)=>i!==2),removed],"resume",2);
 assert.equal(plan.length,6);
 assert.notEqual(plan[2].text,removed.text);
});
test("LinkedIn followup questions can be five and remain grounded in role requirements",()=>{
 const checks=[{label:"Supplier logistics",kind:"responsibility",weight:4,matched:true,evidence:"Managed suppliers"}];
 const qs=fillQuestionSet(checks,[],5,"profile");
 assert.equal(qs.length,5);
 assert.ok(qs.every(q=>q.text.includes("Supplier logistics")));
});
test("recruiter-entered question can occupy a slot without changing the plan length",()=>{
 const qs=fillQuestionSet([],[],6,"resume");
 qs[0]={text:"Which responsibilities would you most enjoy in this role?",source:"Recruiter"};
 assert.equal(qs.length,6);
 assert.equal(qs[0].source,"Recruiter");
});

test("repeated requests provide 20 genuinely different alternatives for one role requirement",()=>{
 const checks=[{label:"Pharmacy inventory control",kind:"responsibility",weight:5,matched:false}];
 const history=[];
 for(let i=0;i<20;i++){
  const next=alternativeQuestion(checks,history,"resume",i);
  assert.ok(next.text.includes("Pharmacy inventory control"),"grounding lost on "+i);
  history.push(next);
 }
 assert.equal(new Set(history.map(x=>x.text)).size,20);
});
test("alternatives work across nontechnical professions",()=>{
 const professions=["Classroom learning support","Hotel front desk coordination","Healthcare appointment scheduling","Budget variance analysis","Supply chain delivery","Retail store operations","Construction site reporting"];
 for(const label of professions){
  const checks=[{label,kind:"responsibility",matched:false,weight:4}];
  const out=fillQuestionSet(checks,[],6,"resume");
  assert.equal(out.length,6,label);
  assert.equal(new Set(out.map(q=>q.text)).size,6,label);
  assert.ok(out.every(q=>q.text.includes(label)),label);
 }
});
test("removing a question does not require replacement and preserves remaining question order",()=>{
 const checks=[{label:"Supplier coordination",kind:"responsibility",matched:false,weight:3}];
 const plan=fillQuestionSet(checks,[],6);
 const second=plan[1].text;
 plan.splice(0,1);
 assert.equal(plan.length,5);
 assert.equal(plan[0].text,second);
});
test("recruiter-authored question can be added before all suggested questions",()=>{
 const plan=fillQuestionSet([{label:"Inventory control",kind:"responsibility",weight:4}],[],6);
 plan.unshift({source:"Recruiter",text:"What concerns would you raise in the first month?",priority:5});
 plan.sort((a,b)=>Number(b.source==="Recruiter")-Number(a.source==="Recruiter"));
 assert.equal(plan[0].source,"Recruiter");
 assert.equal(plan.length,7);
});
