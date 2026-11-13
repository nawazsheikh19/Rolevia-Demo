import test from "node:test";
import assert from "node:assert/strict";
import {MOCK_CATALOG,mockListing} from "./mock-catalog.js";
import {criteriaFromJob,assess} from "./matching.js";

const roles=Object.entries(MOCK_CATALOG);

test("at least nine professions and three distinct mock job descriptions per role",()=>{
 assert.ok(roles.length>=9);
 for(const [role,family] of roles){
  assert.equal(family.jobs.length,3,role);
  assert.equal(new Set(family.jobs.map(j=>j.title)).size,3,role);
  assert.equal(new Set(family.jobs.map(j=>j.job)).size,3,role);
  for(const listing of family.jobs){
   assert.equal(mockListing(role,listing.id),listing);
   assert.ok(criteriaFromJob(listing.job).length>=5,listing.id);
  }
 }
});

test("every listing includes six unique fully fictional resumes and LinkedIn profiles",()=>{
 let count=0;
 for(const [role,family] of roles){
  const profiles=[];
  for(const listing of family.jobs){
   assert.equal(listing.candidates.length,6,listing.id);
   assert.equal(new Set(listing.candidates.map(c=>c.resume)).size,6,listing.id);
   assert.equal(new Set(listing.candidates.map(c=>c.linkedin)).size,6,listing.id);
   assert.ok(listing.candidates.every(c=>c.resume.includes("FICTIONAL PERSON")&&c.linkedin.includes("FICTIONAL")),listing.id);
   assert.ok(listing.candidates.every(c=>c.resume.length>350&&c.linkedin.length>200),listing.id);
   assert.ok(listing.candidates.every(c=>c.name.startsWith("Mock Candidate ")),listing.id);
   profiles.push(...listing.candidates.map(c=>c.linkedin));count+=listing.candidates.length;
  }
  assert.ok(new Set(profiles).size>=3,role);
 }
 assert.equal(count,162);
});

test("each mock job produces meaningful candidate differences and LinkedIn-stage changes",()=>{
 for(const [role,family] of roles){
  for(const listing of family.jobs){
   const criteria=criteriaFromJob(listing.job);
   const resumeResults=listing.candidates.map(c=>assess(c,criteria));
   const profileResults=listing.candidates.map(c=>assess(c,criteria,true));
   assert.ok(new Set(resumeResults.map(r=>r.percent)).size>=2,listing.id);
   assert.ok(profileResults.filter((r,i)=>r.percent!==resumeResults[i].percent).length>=3,listing.id);
  }
 }
});

test("mockListing does not silently load a different role's listing",()=>{
 assert.equal(mockListing("finance","marketing-1"),null);
 assert.equal(mockListing("missing","finance-1"),null);
});
