import test from 'node:test';
import assert from 'node:assert/strict';
import {phrase,criteriaFromJob,assess,SAMPLE,SAMPLE_JD} from './matching.js';

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
