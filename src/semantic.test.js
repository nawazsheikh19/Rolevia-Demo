import test from "node:test";
import assert from "node:assert/strict";
import {splitEvidence,similarity} from "./semantic.js";
test("chunks resume into bounded statements",()=>{
 const chunks=splitEvidence("Built forecasting dashboards for finance stakeholders. Improved month-end reporting accuracy.\nManaged a customer support team.");
 assert.ok(chunks.length>=2);
 assert.ok(chunks.every(x=>x.length<=450&&x.length>=15));
});
test("cosine similarity is bounded and meaningful",()=>{
 assert.ok(Math.abs(similarity([1,0],[1,0])-1)<0.001);
 assert.ok(Math.abs(similarity([1,0],[0,1]))<0.001);
});
test("no model loads when no unsupported requirements exist",()=>{
 assert.deepEqual(splitEvidence(""),[]);
});
