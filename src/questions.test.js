import test from "node:test";
import assert from "node:assert/strict";
import {byPriority,interviewQuestions,profileVerificationQuestions} from "./questions.js";
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
 assert.match(q[2].text,/qualification/i);
});
test("profile-only follow ups differ from CV questions",()=>{
 const delta={newlyEvidenced:[{label:"Power BI",kind:"skill",weight:4,evidence:"Power BI dashboard project"}]};
 const q=profileVerificationQuestions(delta);
 assert.equal(q.length,1);
 assert.match(q[0].text,/corroborate/i);
 assert.equal(q[0].priority,4);
});
test("no LinkedIn claims means no profile-only questions",()=>assert.deepEqual(profileVerificationQuestions({newlyEvidenced:[]}),[]));
