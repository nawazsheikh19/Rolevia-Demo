import test from 'node:test';
import assert from 'node:assert/strict';
import {phrase,criteriaFromJob,assess,SAMPLE,SAMPLE_JD} from './matching.js';
import {SCENARIOS} from './scenarios.js';

test('skill boundary prevents Java / JavaScript confusion',()=>{assert.equal(phrase('JavaScript','Java'),false);assert.equal(phrase('Java','Java'),true)});
test('job extracts several job-related dimensions',()=>{
 const criteria=criteriaFromJob(SAMPLE_JD);
 for(const kind of ['skill','experience','qualification','responsibility','industry'])assert.ok(criteria.some(c=>c.kind===kind),kind);
 const exp=criteria.find(c=>c.kind==='experience');
 assert.equal(exp.minYears,5);
 assert.equal(exp.experienceFocus,'Machine learning');
});
test('a long unrelated career does not satisfy domain-specific experience',()=>{
 const c={resume:'Frontend engineer with 7 years of experience in JavaScript.'};
 const criteria=criteriaFromJob('5 years of experience in machine learning.');
 assert.equal(assess(c,criteria).checks.find(x=>x.kind==='experience').matched,false);
});
test('missing evidence remains unknown, not rejected',()=>{
 const checks=assess({resume:'Works as a data scientist.'},criteriaFromJob('Python and SQL')).checks;
 assert.ok(checks.every(c=>!c.matched&&c.evidence===''));
});
test('explicitly negative skill evidence is not counted as a positive',()=>{
 assert.equal(assess({resume:'No Kubernetes experience.'},criteriaFromJob('Kubernetes required.')).percent,0);
});
test('LinkedIn is an optional second-stage source',()=>{
 const c={resume:'Python',linkedin:'AWS'};
 const r=[{label:'AWS',kind:'skill',weight:3,aliases:['aws']}];
 assert.equal(assess(c,r).percent,0);
 assert.equal(assess(c,r,true).percent,100);
 assert.equal(assess(c,r,true).checks[0].source,'LinkedIn');
});
test('synthetic senior engineer has broader evidence than unrelated profile',()=>{
 const criteria=criteriaFromJob(SAMPLE_JD);
 assert.ok(assess(SAMPLE[0],criteria).percent>assess(SAMPLE[2],criteria).percent);
});
test('empty rubric has no numeric score',()=>assert.equal(assess(SAMPLE[0],[]).percent,null));

test('extracts unfamiliar tools from job requirement bullets',()=>{
 const jd='Senior Analyst\nRequirements:\n- Experience with Looker, Snowflake, and dbt\n- Build weekly forecasting dashboards\n- Collaborate with the finance team\nPreferred:\n- Familiarity with HubSpot';
 const criteria=criteriaFromJob(jd);
 for(const name of ['Looker','Snowflake','dbt','HubSpot'])assert.ok(criteria.some(x=>x.label===name),name);
 assert.ok(criteria.some(x=>x.kind==='responsibility'&&/forecasting dashboards/i.test(x.label)));
 assert.ok(criteria.find(x=>x.label==='HubSpot').priority==='preferred');
});
test('extracts new responsibilities and language criteria from narrative prose',()=>{
 const jd='Customer Support Manager. You will lead a distributed team and deliver training programs. Proven experience handling customer escalations and managing SLAs. Fluent in German preferred.';
 const criteria=criteriaFromJob(jd);
 assert.ok(criteria.some(x=>/distributed team/i.test(x.label)));
 assert.ok(criteria.some(x=>/customer escalations/i.test(x.label)));
 assert.ok(criteria.some(x=>/German/i.test(x.label)));
});
test('does not derive hiring requirements from benefits or protected characteristics',()=>{
 const jd='Benefits:\n- Competitive package and holiday allowance\n- Equal opportunity: age, gender, nationality, disability\nRequirements:\n- Build weekly forecasting dashboards';
 const criteria=criteriaFromJob(jd);
 assert.ok(criteria.some(x=>/forecasting dashboards/i.test(x.label)));
 assert.ok(criteria.every(x=>!/holiday allowance|age|gender|nationality|disability/i.test(x.label)));
});
test('does not invent job criteria from uninformative prose',()=>{
 const criteria=criteriaFromJob('We offer a competitive package. Apply now. Our mission is to help everyone.');
 assert.equal(criteria.length,0);
});

test('example workspaces cover multiple industries',()=>{
 for(const name of ['account','ml','operations','finance','nursingAdmin','marketing','hospitality','construction','sales'])assert.ok(SCENARIOS[name],name);
 for(const [key,scenario] of Object.entries(SCENARIOS)){
  assert.ok(criteriaFromJob(scenario.job).length>=3,key);
  assert.equal(scenario.candidates.length,3,key);
  assert.ok(scenario.candidates.every(c=>c.resume&&c.name),key);
 }
});

test('matches strong related wording but flags it for verification',()=>{
 const criteria=[{label:'Build weekly inventory reports',kind:'responsibility',aliases:['Build weekly inventory reports'],weight:3}];
 const c=assess({resume:'Built weekly inventory reports in a regional warehouse.'},criteria).checks[0];
 assert.equal(c.matched,true);assert.match(c.matchMethod,/verify/);
});
test('unrelated words do not produce speculative responsibility evidence',()=>{
 const criteria=[{label:'Analyze account health and identify churn risks',kind:'responsibility',aliases:['Analyze account health and identify churn risks'],weight:3}];
 assert.equal(assess({resume:'Built a warehouse inventory report.'},criteria).checks[0].matched,false);
});
