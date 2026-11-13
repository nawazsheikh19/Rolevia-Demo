import test from "node:test";
import assert from "node:assert/strict";
import {validateQuestionDraft} from "./question-ai.js";
test("rejects unsafe and irrelevant AI question drafts",()=>{
 assert.equal(validateQuestionDraft("Are you married, and have you used Python?","Python"),null);
 assert.equal(validateQuestionDraft("Tell me about your role in finance forecasting?","Kubernetes"),null);
 assert.equal(validateQuestionDraft("Define Python?","Python"),null);
});
test("accepts a grounded, job-related behavioral draft",()=>{
 assert.equal(validateQuestionDraft("Could you describe a Python project you delivered and its outcome?","Python"),"Could you describe a Python project you delivered and its outcome?");
});
