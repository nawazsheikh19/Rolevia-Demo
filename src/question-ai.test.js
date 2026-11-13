import test from "node:test";
import assert from "node:assert/strict";
import {validateQuestionDraft} from "./question-ai.js";
test("rejects unsafe and irrelevant AI question drafts",()=>{
 assert.equal(validateQuestionDraft("Are you married, and have you used Python?","Python"),null);
 assert.equal(validateQuestionDraft("Tell me about your role in finance forecasting?","Kubernetes"),null);
 assert.equal(validateQuestionDraft("Define Python?","Python"),null);
});
test("accepts a grounded, job-related behavioral draft",()=>{
 assert.equal(validateQuestionDraft("Could you describe a relevant Python project and explain how you would contribute?","Python"),"Could you describe a relevant Python project and explain how you would contribute?");
});

test("rejects drafts assuming unsupported candidate achievements",()=>{
 assert.equal(validateQuestionDraft("You built a Python platform at Google, how did it help?","Python"),null);
 assert.equal(validateQuestionDraft("Your work at Acme with Python was successful, correct?","Python"),null);
});
