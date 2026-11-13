import test from 'node:test';import assert from 'node:assert/strict';import {phrase,criteriaFromJob,assess,SAMPLE,SAMPLE_JD} from './matching.js';
test('does not confuse Java with Javascript',()=>{assert.equal(phrase('Javascript','java'),false);assert.equal(phrase('Java','java'),true)});
test('recognizes requirements from JD',()=>assert.ok(criteriaFromJob(SAMPLE_JD).length>5));
test('LinkedIn is opt in for second stage',()=>{const c={resume:'Python',linkedin:'AWS'};const r=[{label:'AWS',weight:3,aliases:['aws']}];assert.equal(assess(c,r).percent,0);assert.equal(assess(c,r,true).percent,100)});
test('missing rubric does not invent score',()=>assert.equal(assess(SAMPLE[0],[]).percent,null));
