import test from "node:test";
import assert from "node:assert/strict";
import {classifyJobPriority,suggestCriteriaPriorities} from "./priority-model.js";
import {criteriaFromJob} from "./matching.js";

test("must-have and essential qualifications default to priority five",()=>{
 const job="Role\nMust have:\n- Python\n- SQL\nNice to have:\n- Power BI";
 for(const label of ["Python","SQL"])assert.equal(classifyJobPriority(job,{label}).weight,5);
 assert.equal(classifyJobPriority(job,{label:"Power BI"}).weight,2);
});
test("required preferred and neutral statements get distinct initial weights",()=>{
 const job="Office coordinator\nRequired:\n- Customer onboarding\nPreferred:\n- Salesforce";
 const required=classifyJobPriority(job,{label:"Customer onboarding"}),preferred=classifyJobPriority(job,{label:"Salesforce"});
 assert.equal(required.weight,4);
 assert.equal(required.priority,"required");
 assert.equal(preferred.weight,2);
 assert.equal(preferred.priority,"preferred");
 assert.equal(classifyJobPriority("Role\n- Data quality reporting",{label:"Data quality reporting"}).weight,3);
});
test("importance follows job context across professions",()=>{
 const jobs=[
  ["Hospitality\nEssential requirements:\n- Guest complaint handling\nGood to have:\n- Revenue reporting","Guest complaint handling","Revenue reporting"],
  ["Construction\nMandatory:\n- Site safety reporting\nDesirable:\n- Microsoft Project","Site safety reporting","Microsoft Project"],
  ["Finance\nMust have:\n- Budget analysis\nNice to have:\n- Tableau","Budget analysis","Tableau"]
 ];
 for(const [job,critical,optional] of jobs){
  assert.equal(classifyJobPriority(job,{label:critical}).weight,5);
  assert.equal(classifyJobPriority(job,{label:optional}).weight,2);
 }
});
test("extracted criteria show suggested weights and recruiter overrides are not locked",()=>{
 const items=criteriaFromJob("Operations Lead\nMust have:\n- SQL\nPreferred:\n- Power BI");
 assert.equal(items.find(x=>x.label==="SQL")?.weight,5);
 assert.equal(items.find(x=>x.label==="Power BI")?.weight,2);
 const updated=suggestCriteriaPriorities("Role\nRequirements:\n- Inventory reporting",[{label:"Inventory reporting",aliases:["Inventory reporting"]}]);
 assert.equal(updated[0].manualWeight,false);
 updated[0].weight=1;updated[0].manualWeight=true;
 assert.equal(updated[0].weight,1);
});
