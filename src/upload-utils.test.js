import test from "node:test";
import assert from "node:assert/strict";
import {selectResumeFiles} from "./upload-utils.js";
const file=(name,path="")=>({name,webkitRelativePath:path});
test("folder and individual selections accept only PDF DOCX TXT regardless of case",()=>{
 const files=[file("one.PDF","roles/one.PDF"),file("two.docx","roles/nested/two.docx"),file("three.txt"),file("photo.jpg"),file(".DS_Store"),file("hidden.pdf","roles/.hidden/hidden.pdf")];
 const result=selectResumeFiles(files,30);
 assert.deepEqual(result.selected.map(f=>f.name),["one.PDF","two.docx","three.txt"]);
 assert.equal(result.unsupported,3);
 assert.equal(result.overLimit,0);
});
test("unsupported files do not consume 30 candidate slots",()=>{
 const files=[...Array.from({length:12},(_,i)=>file("noise"+i+".png")),...Array.from({length:35},(_,i)=>file("cv"+i+".pdf"))];
 const result=selectResumeFiles(files,30);
 assert.equal(result.selected.length,30);
 assert.equal(result.unsupported,12);
 assert.equal(result.overLimit,5);
});
test("respects available room and never selects more than 30",()=>{
 assert.equal(selectResumeFiles(Array.from({length:40},(_,i)=>file(i+".txt")),40).selected.length,30);
 assert.equal(selectResumeFiles([file("one.pdf"),file("two.pdf")],1).selected.length,1);
 assert.equal(selectResumeFiles([file("one.pdf")],0).selected.length,0);
});
test("does not mutate or serialize the original folder path",()=>{
 const uploaded=file("candidate.pdf","large/folder/subfolder/candidate.pdf");
 const selected=selectResumeFiles([uploaded],1);
 assert.equal(selected.selected[0],uploaded);
});
