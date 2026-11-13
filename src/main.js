import * as pdfjs from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth/mammoth.browser";
import {criteriaFromJob,assess,SAMPLE,SAMPLE_JD} from "./matching.js";
import {profileDelta} from "./profile.js";
import {interviewQuestions,byPriority,fillQuestionSet,alternativeQuestion} from "./questions.js";
import {draftInterviewQuestion,questionModelError,resetQuestionModel} from "./question-ai.js";
import {semanticLeads} from "./semantic.js";
import {SCENARIOS} from "./scenarios.js";
import {MOCK_CATALOG,mockListing} from "./mock-catalog.js";
import {selectResumeFiles} from "./upload-utils.js";
import "./style.css";
pdfjs.GlobalWorkerOptions.workerSrc=worker;
const DB="rolevia-demo",RETENTION_MS=6*60*60*1000,root=document.getElementById("app");
let data={job:"",criteria:[],candidates:[],selected:null,syntheticConfirmed:false,savedAt:0};
let view="setup",active=null,notice="",saveTimer,workspaceEpoch=0;
let mockChoiceRole="ml",mockChoiceListing="";
const semanticByCandidate=new Map();let semanticBusy=false;let questionAiBusy=false;
const html=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore("records");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function databaseTransaction(mode,record){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction("records",mode==="read"?"readonly":"readwrite");const store=tx.objectStore("records");const r=mode==="read"?store.get("workspace"):mode==="delete"?store.delete("workspace"):store.put(record,"workspace");let result; r.onsuccess=()=>{result=r.result};tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=()=>{db.close();reject(tx.error||new Error("Storage transaction failed"))};tx.onabort=()=>{db.close();reject(tx.error||new Error("Storage transaction aborted"))}})}
let storageMutationQueue=Promise.resolve();
function database(mode,record){
 if(mode==="read")return databaseTransaction(mode,record);
 // Serialize writes and deletions so a pending save cannot restore deleted CVs.
 const action=()=>databaseTransaction(mode,record);
 const task=storageMutationQueue.then(action,action);
 storageMutationQueue=task.catch(()=>{});
 return task;
}
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{data.savedAt=Date.now();try{await database("write",{...data,expires:data.savedAt+RETENTION_MS})}catch{notice="This browser blocked local storage. Data will not persist.";render()}},250)}
function alertUser(s){notice=s;render()}
function selectedIds(){return Array.isArray(data.selectedIds)?data.selectedIds:(data.selected?[data.selected]:[])}
function toggleSelected(id){const ids=new Set(selectedIds());if(ids.has(id))ids.delete(id);else ids.add(id);data.selectedIds=[...ids];data.selected=null;save();render()}
function selectedRanked(){const ids=new Set(selectedIds());return ranked().filter(c=>ids.has(c.id)).sort((a,b)=>(b.enriched?.percent??b.base.percent??-1)-(a.enriched?.percent??a.base.percent??-1)||(b.base.percent??0)-(a.base.percent??0)||a.name.localeCompare(b.name))}
function ranked(){return data.candidates.map(c=>({...c,base:assess(c,data.criteria),enriched:c.linkedin?assess(c,data.criteria,true):null})).sort((a,b)=>(b.base.percent??-1)-(a.base.percent??-1)||a.name.localeCompare(b.name))}
function dom(tag,props={},children=[]){const e=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==="text")e.textContent=v;else if(k==="class")e.className=v;else if(k==="on")for(const [ev,fn] of Object.entries(v))e.addEventListener(ev,fn);else if(k==="value")e.value=v;else if(k==="checked")e.checked=v;else if(k==="disabled")e.disabled=v;else e.setAttribute(k,v)}for(const c of children)e.append(typeof c==="string"?document.createTextNode(c):c);return e}
function button(label,fn,cls="secondary",disabled=false){return dom("button",{class:cls,disabled,on:{click:fn},text:label})}
function section(title,description){return dom("section",{class:"panel"},[dom("h2",{text:title}),dom("p",{class:"muted",text:description})])}
function field(title,input){return dom("label",{class:"field"},[dom("span",{text:title}),input])}
function noticeBar(){return notice?dom("div",{class:"notice",role:"status","aria-live":"polite"},[dom("span",{text:notice}),button("×",()=>{notice="";render()},"plain")]):dom("span")}
function render(){root.replaceChildren();const layout=dom("div",{class:"layout"}),sidebar=dom("aside",{class:"sidebar"}),main=dom("main",{class:"main"});sidebar.append(dom("div",{class:"brand",text:"Rolevia."}),button("Job & uploads",()=>{view="setup";render()},view==="setup"?"nav active":"nav"),button("Candidate ranking ("+data.candidates.length+")",()=>{view="results";render()},view==="results"?"nav active":"nav"),button("Shortlist ("+selectedIds().length+")",()=>{view="shortlist";render()},view==="shortlist"?"nav active":"nav"),button("Privacy & retention",()=>{view="privacy";render()},view==="privacy"?"nav active":"nav"),dom("div",{class:"sidefoot",text:"Browser-only prototype • Local data • 6-hour expiry"}));main.append(dom("header",{class:"header"},[dom("strong",{text:"Rolevia / Recruiter workspace"}),dom("span",{class:"badge",text:"PILOT PREVIEW"})]));const content=dom("div",{class:"content"});content.append(noticeBar());if(view==="setup")renderSetup(content);else if(view==="results")renderResults(content);else if(view==="shortlist")renderShortlist(content);else renderPrivacy(content);main.append(content,dom("footer",{class:"footer",text:"Human-reviewed evidence assistance • Not an automated employment decision"}));layout.append(sidebar,main);root.append(layout)}
function heading(parent,eyebrow,title,detail){parent.append(dom("div",{class:"eyebrow",text:eyebrow}),dom("h1",{text:title}),dom("p",{class:"intro",text:detail}))}
function renderSetup(container){heading(container,"01 / ASSESSMENT SETUP","Find the right talent.","Import a role and up to 30 resumes. Review skills, experience, responsibilities, education and industry requirements before comparing candidates.");const mockRole=dom("select",{class:"control mock-role","aria-label":"Mock profession"});
for(const [key,role] of Object.entries(MOCK_CATALOG))mockRole.append(dom("option",{value:key,text:role.label}));
mockRole.value=MOCK_CATALOG[mockChoiceRole]?mockChoiceRole:Object.keys(MOCK_CATALOG)[0]||"";
const mockJob=dom("select",{class:"control mock-job","aria-label":"Mock job listing"});
const updateMockJobs=()=>{
 mockJob.replaceChildren();
 mockChoiceRole=mockRole.value;
 const family=MOCK_CATALOG[mockChoiceRole];
 for(const listing of family.jobs)mockJob.append(dom("option",{value:listing.id,text:listing.title}));
 mockJob.value=family.jobs.some(j=>j.id===mockChoiceListing)?mockChoiceListing:family.jobs[0]?.id||"";
 mockChoiceListing=mockJob.value;
};
mockRole.addEventListener("change",()=>{mockChoiceListing="";updateMockJobs()});
mockJob.addEventListener("change",()=>{mockChoiceListing=mockJob.value});
updateMockJobs();
const chosenMock=()=>mockListing(mockRole.value,mockJob.value);
function clearCandidateState(){
 workspaceEpoch++;
 data.candidates=[];data.selectedIds=[];data.selected=null;data.questionSets={};
 semanticByCandidate.clear();active=null;
}
function mockResumes(listing){
 return listing.candidates.map((person,i)=>({
  name:person.name,resume:person.resume,linkedin:"",
  sampleLinkedIn:person.linkedin,mockListingId:listing.id,mockPersonaIndex:i,
  filename:"mock-"+listing.id+"-candidate-"+(i+1)+".txt",
  id:crypto.randomUUID()
 }));
}
function loadMockJob(){
 const listing=chosenMock();if(!listing)return;
 if(data.candidates.length&&!confirm("Loading a different mock job description will clear "+data.candidates.length+" existing candidate(s), including their question plans and shortlist. Continue?"))return;
 clearCandidateState();data.job=listing.job;data.criteria=criteriaFromJob(listing.job);
 data.syntheticConfirmed=true;save();
 alertUser("Loaded mock job description: "+listing.title+". "+data.criteria.length+" reviewable criteria created. Add six mock resumes when ready.");
}
function addMockCandidates(){
 const listing=chosenMock();if(!listing)return;
 if(data.job.trim()!==listing.job.trim()){alertUser("Please select Load mock JD first, or use Load full mock test. This avoids comparing CVs against the wrong job.");return}
 const existing=new Set(data.candidates.filter(c=>c.mockListingId===listing.id).map(c=>c.mockPersonaIndex));
 const available=mockResumes(listing).filter(c=>!existing.has(c.mockPersonaIndex));
 if(!available.length){alertUser("All six mock CVs for this job are already loaded. Delete the mock batch to start again.");return}
 const capacity=Math.max(0,30-data.candidates.length);
 if(!capacity){alertUser("The 30-candidate limit has been reached. Remove candidates before adding another batch.");return}
 const additions=available.slice(0,capacity);
 data.candidates.push(...additions);data.syntheticConfirmed=true;save();
 alertUser("Added "+additions.length+" fictional resumes, each with its own optional mock LinkedIn profile. Use Candidate ranking to explore them.");
}
function loadFullMock(){
 const listing=chosenMock();if(!listing)return;
 if(data.candidates.length&&!confirm("Replace the current "+data.candidates.length+" candidate(s) and job description with the six CV mock test for "+listing.title+"? This clears current interview questions and selections."))return;
 clearCandidateState();data.job=listing.job;data.criteria=criteriaFromJob(listing.job);
 data.candidates=mockResumes(listing);data.syntheticConfirmed=true;save();
 alertUser("Mock test ready: "+listing.title+" · six fictional resumes · six optional LinkedIn profiles. Open Candidate ranking to try it.");
}
const mockPanel=dom("section",{class:"mock-lab","aria-label":"Mock test data"},[
 dom("div",{class:"mock-header"},[
  dom("div",{},[dom("strong",{text:"Mock test data · fictional only"}),dom("p",{text:"Choose a profession and one of three job listings. Each listing provides six different mock CVs and six mock LinkedIn profiles. No uploaded documents needed."})]),
  dom("span",{class:"mock-tag",text:"SYNTHETIC / TEST"})
 ]),
 dom("div",{class:"mock-controls"},[field("Profession",mockRole),field("Mock job listing (3 per role)",mockJob)]),
 dom("div",{class:"mock-actions"},[
  button("Load mock JD",loadMockJob,"secondary"),
  button("Add 6 mock resumes",addMockCandidates,"secondary"),
  button("Load full mock test",loadFullMock,"primary")
 ]),
 dom("p",{class:"mock-tip",text:"Tip: Load full mock test is the quickest way to try the candidate ranking. To test LinkedIn, open any mock candidate and choose Load mock LinkedIn. This does not use real applicant information."})
]);
container.append(mockPanel);
const columns=dom("div",{class:"columns"}),job=section("Job description","Paste job requirements or upload a PDF, Word, or text document.");const jobfile=dom("input",{type:"file",accept:".pdf,.docx,.txt",class:"control"});jobfile.onchange=async()=>{try{data.job=await parseFile(jobfile.files[0]);data.criteria=criteriaFromJob(data.job);data.questionSets={};save();alertUser(data.criteria.length+" suggested criteria found. Verify each extracted requirement before ranking.")}catch(e){alertUser(e.message)}};const area=dom("textarea",{class:"control big",placeholder:"Paste role requirements here...",maxlength:"30000",value:data.job});area.oninput=()=>{data.job=area.value;save()};job.append(field("Import job description",jobfile),field("Role requirements",area),button("Generate criteria",()=>{data.job=area.value;data.criteria=criteriaFromJob(data.job);save();alertUser(data.criteria.length+" suggested criteria found across job requirements. Review unfamiliar items and weights before ranking.")}));const cr=dom("div",{class:"rubric"});cr.append(dom("h3",{text:"Extracted job criteria ("+data.criteria.length+")"}),dom("p",{class:"muted",text:"Priority: 5 = highest, 1 = lowest. The dropdown starts with a context-based suggestion from must-have, required, preferred and nice-to-have wording; recruiters can change it at any time. Only the dropdown controls the weight."}),dom("div",{class:"priority-scale"},[
dom("span",{text:"1 · Lowest"}),dom("span",{text:"2 · Low"}),dom("span",{text:"3 · Medium"}),dom("span",{text:"4 · High"}),dom("span",{text:"5 · Highest"})
]));data.criteria.map((x,i)=>({x,i})).sort((a,b)=>byPriority(a.x,b.x)).forEach(({x,i})=>{const line=dom("div",{class:"criterion"}),name=dom("input",{class:"control",value:x.label,"aria-label":"Job requirement"}),weight=dom("select",{class:"control","aria-label":"Priority: 1 lowest, 5 highest"});for(let w=1;w<=5;w++){const o=dom("option",{value:w,text:String(w)});o.selected=w===Number(x.weight);weight.append(o)}name.onchange=()=>{x.label=name.value.trim().slice(0,80);x.aliases=[x.label];x.kind="custom";delete x.minYears;delete x.experienceFocus;save();render()};weight.onchange=()=>{x.weight=Number(weight.value);x.manualWeight=true;save();render()};line.append(name,weight,button("×",()=>{data.criteria.splice(i,1);save();render()},"plain"));cr.append(dom("div",{class:"criterion-meta",text:(x.kind||"custom").replace(/\b\w/g,c=>c.toUpperCase())}));cr.append(line)});cr.append(button("+ Add requirement",()=>{data.criteria.push({label:"New requirement",kind:"custom",priority:"required",aliases:["New requirement"],weight:3});save();render()}));job.append(cr);const uploads=section("Candidate resumes","Upload multiple PDF, DOCX, or TXT files, up to 5MB each.");
const ackInput=dom("input",{type:"checkbox",checked:!!data.syntheticConfirmed,"aria-label":"Confirm only fictional candidate files",on:{change:e=>{data.syntheticConfirmed=!!e.target.checked;save()}}});
uploads.append(dom("label",{class:"synthetic-consent"},[
 ackInput,dom("span",{text:"I confirm the uploaded CVs are fictional or synthetic and contain no real applicant personal information."})
]));
uploads.append(dom("p",{class:"muted",text:"Public proof of concept only. Do not upload real applicant records, confidential job documents or sensitive personal information."}));
const fileinput=dom("input",{type:"file",accept:".pdf,.docx,.txt",multiple:"",class:"control","aria-label":"Choose individual resume files"});
fileinput.onchange=async()=>{await upload([...fileinput.files]);fileinput.value=""};
const folderInput=dom("input",{type:"file",webkitdirectory:"",directory:"",multiple:"",class:"control","aria-label":"Choose a folder containing resumes"});
folderInput.onchange=async()=>{await upload([...folderInput.files]);folderInput.value=""};
const drop=dom("div",{class:"dropzone"},[
 dom("strong",{text:"Add fictional candidate resumes"}),
 dom("p",{text:"Choose individual PDF, DOCX or TXT files, or a whole folder (including nested folders). Up to 30 candidates, 5MB per file."}),
 dom("div",{class:"upload-choices"},[
  field("Upload files",fileinput),
  field("Upload folder",folderInput)
 ]),
 dom("small",{text:"Folder selection works in current Chrome and Edge browsers. Unsupported files are skipped. Folder paths are not saved."})
]);
drop.ondragover=e=>e.preventDefault();
drop.ondrop=e=>{e.preventDefault();upload([...e.dataTransfer.files])};
const batchHeader=dom("div",{class:"batch-header"},[
 dom("h3",{text:"Candidate batch ("+data.candidates.length+")"}),
 button("Delete entire batch",async()=>{
  if(!data.candidates.length)return;
  const count=data.candidates.length;
  if(!confirm("Delete all "+count+" candidates, including their uploaded résumé text and LinkedIn details? Your job description and matching criteria will be kept. This cannot be undone."))return;
  clearTimeout(saveTimer);
  workspaceEpoch++;
  data.candidates=[];data.selected=null;data.selectedIds=[];data.questionSets={};active=null;semanticByCandidate.clear();
  data.savedAt=Date.now();
  try{
   await database("write",{...data,expires:data.savedAt+RETENTION_MS});
   alertUser("Deleted "+count+" candidates. Your job description and criteria are ready for a new batch.");
  }catch(error){alertUser("Candidate list cleared in this tab, but browser storage deletion could not be confirmed. Use Privacy & retention to remove saved data before closing.");}
 },"danger",data.candidates.length===0)
]);
uploads.append(drop,batchHeader);for(const c of data.candidates)uploads.append(dom("div",{class:"file"},[dom("span",{text:c.name+" · "+c.filename}),button("Remove",()=>{data.candidates=data.candidates.filter(x=>x.id!==c.id);data.selectedIds=selectedIds().filter(id=>id!==c.id);if(data.selected===c.id)data.selected=null;delete data.questionSets?.[c.id+":resume"];delete data.questionSets?.[c.id+":profile"];semanticByCandidate.delete(c.id);save();render()},"plain")]));uploads.append(dom("div",{class:"safe",text:"Pilot safety: documents are parsed locally and text is stored in this browser for 24 hours after the latest edit. Use synthetic profiles only; this is not an enterprise-secure database."}),button("View ranked shortlist →",()=>{view="results";render()},"primary full",!data.candidates.length||!data.criteria.length));columns.append(job,uploads);container.append(columns)}

function renderQuestionEditor(parent,candidate,stage,checks,count){
 data.questionSets??={};
 const key=candidate.id+":"+stage;
 const alreadyCreated=Object.prototype.hasOwnProperty.call(data.questionSets,key);
 const current=(data.questionSets[key]||[]).filter(q=>q&&typeof q.text==="string"&&q.text.trim());
 const questions=alreadyCreated?current:fillQuestionSet(checks,[],count,stage);
 questions.sort((a,b)=>Number(b.source==="Recruiter")-Number(a.source==="Recruiter"));
 data.questionSets[key]=questions;
 const panel=dom("div",{class:"questions-panel"});
 panel.append(dom("h3",{text:(stage==="resume"?"CV interview questions":"Post-LinkedIn interview questions")+" ("+questions.length+")"}),
 dom("p",{text:stage==="resume"?"Begin with six suggested HR-friendly questions. × removes a question without replacement. Another question replaces only that one with a new distinct draft. Your own priority questions appear first.":"Begin with five optional follow-ups from LinkedIn-only claims and the job description. × permanently removes a question from this list; it does not create a replacement."}));
 if(questionModelError())panel.append(dom("p",{class:"safe",text:"Optional AI question model unavailable: "+questionModelError().slice(0,130)+". Grounded question alternatives work without it."}),
 button("Retry AI download",()=>{resetQuestionModel();alertUser("AI download retry enabled. Question replacements will continue working offline.")},"plain"));
 questions.forEach((q,i)=>{
  const row=dom("div",{class:"question-row"+(q.source==="Recruiter"?" recruiter-priority-question":"")});
  const bar=dom("div",{class:"question-head"});
  bar.append(dom("strong",{class:"question-context",text:"Q"+(i+1)+" · "+(q.source==="Recruiter"?"★ Recruiter priority · Your question":"Priority "+(q.priority||1)+"/5 · "+(q.category||"role")+(q.source?.includes("Qwen")?" · AI DRAFT — REVIEW":""))}),
   dom("button",{class:"plain remove-question","aria-label":"Remove question "+(i+1)+" without replacement",title:"Remove this question",text:"×",on:{click:()=>{
    questions.splice(i,1);
    data.questionSets[key]=questions;
    save();render();
   }}}));
  row.append(bar);
  const editor=dom("textarea",{class:"control question-edit","aria-label":"Interview question "+(i+1),rows:"2",maxlength:"450",value:q.text});
  editor.onchange=()=>{
   if(!editor.value.trim()){editor.value=q.text;return}
   q.text=editor.value.trim();q.source="Recruiter";data.questionSets[key]=questions;save();
  };
  row.append(editor);
  if(q.context)row.append(dom("small",{text:"Referenced submitted text: "+q.context}));
  if(q.source?.includes("Qwen"))row.append(dom("small",{class:"ai-draft-note",text:"This optional language-model draft may be inaccurate. Review for relevance, assumptions and inappropriate questions before using."}));
  if(q.source!=="Recruiter"){
  row.append(button("Another question",()=>{
    const basis=checks.find(c=>c.label===q.requirement)||checks[i%Math.max(1,checks.length)]||{label:q.requirement||"Job responsibilities",kind:q.category||"requirement",weight:q.priority||1};
    const oldHistory=(q.history||[]).concat(q.text).slice(-80);
    const seen=questions.filter((_,index)=>index!==i).concat(oldHistory.map(text=>({text})));
    const replacement=alternativeQuestion([basis],seen,stage,(q.revision||0)+1);
    questions[i]={...q,...replacement,requirement:basis.label,history:oldHistory,revision:(q.revision||0)+1,source:"Grounded alternative"};
    data.questionSets[key]=questions;save();render();
   },"secondary"));
  row.append(button(questionAiBusy?"AI loading…":"Try LLM draft (experimental)",async()=>{
    if(questionAiBusy)return;
    if(!confirm("Download a large free Qwen language model to this browser for optional question drafting? The model files may require around 800 MB of downloads and substantial memory and CPU on older laptops. No résumé or LinkedIn text will be sent in the prompt; only the job requirement. Generated drafts need human review."))return;
    questionAiBusy=true;alertUser("Preparing optional on-device Qwen model. Standard question alternatives remain available without AI.");
    const basis=checks.find(c=>c.label===q.requirement)||{label:q.requirement||"Job responsibilities",kind:q.category||"requirement",weight:q.priority||1};
    const history=(q.history||[]).concat(q.text).slice(-80);
    const seen=questions.filter((_,index)=>index!==i).concat(history.map(text=>({text})));
    try{
      const result=await draftInterviewQuestion(basis,seen,stage);
      const replacement=result.text&& !seen.some(item=>item.text.toLowerCase()===result.text.toLowerCase())
        ?result:alternativeQuestion([basis],seen,stage,(q.revision||0)+1);
      questions[i]={...q,...replacement,history,revision:(q.revision||0)+1,requirement:basis.label};
      data.questionSets[key]=questions;save();
      alertUser(result.modelError?"The model could not load. A distinct grounded question was supplied instead.":"New draft ready. Check that it is relevant and does not assume experience.");
    }catch(e){
      const replacement=alternativeQuestion([basis],seen,stage,(q.revision||0)+1);
      questions[i]={...q,...replacement,history,revision:(q.revision||0)+1};
      data.questionSets[key]=questions;save();alertUser("The AI model was unavailable. A distinct local alternative is ready.");
    }finally{questionAiBusy=false;render()}
  },"secondary",questionAiBusy));
  }
  panel.append(row);
 });
 panel.append(button("+ Add suggested question",()=>{
  const basis=checks.length?checks:[{label:"Responsibilities in this role",kind:"requirement",weight:3}];
  const next=alternativeQuestion(basis,questions,stage,questions.length);
  questions.push(next);data.questionSets[key]=questions;save();render();
 },"secondary"));
 const custom=dom("textarea",{class:"control question-edit",placeholder:"Write your own job-related interview question…",rows:"2",maxlength:"450"});
 panel.append(dom("h3",{text:"Add a recruiter priority question"}),dom("p",{text:"Your question will be added as a highlighted item at the top. It will not replace or erase any suggested questions."}),custom,
 button("★ Add priority question",()=>{
  const val=custom.value.trim();
  if(val.length<15){alertUser("Please enter a meaningful job-related interview question.");return}
  if(/\b(?:date of birth|how old|marital status|pregnan\w*|religion|ethnicity|sexual orientation|disabilit\w*|race|nationality|citizenship|children|childcare|medical history|personal health|family status|immigration status|gender)\b/i.test(val)){alertUser("Check the question for potentially discriminatory or protected-characteristic topics.");return}
  if(questions.some(q=>q.text.toLowerCase()===val.toLowerCase())){alertUser("This question already exists in the plan.");return}
  questions.unshift({text:val,source:"Recruiter",category:"recruiter priority",priority:5,requirement:"Recruiter-authored"});
  data.questionSets[key]=questions;save();alertUser("Priority question added at the top of the interview plan.");
 },"primary"));
 parent.append(panel);
}

function renderResults(container){const list=ranked();heading(container,"02 / CANDIDATE INTELLIGENCE","Ranked shortlist","The evidence-coverage score considers job-related skills, relevant experience, responsibilities, qualifications and industry context. It is not a validated suitability prediction.");if(!list.length){container.append(button("Add candidates",()=>{view="setup";render()}));return}active=list.some(c=>c.id===active)?active:list[0].id;const chosen=list.find(c=>c.id===active),assessment=chosen.enriched||chosen.base;const columns=dom("div",{class:"results"}),left=section("Resume-based ranking","All candidates are ranked by the same original resume-only criteria.");list.forEach((c,i)=>{const item=dom("div",{class:"candidate "+(c.id===active?"active":"")},[dom("div",{class:"candidatehead"},[dom("strong",{text:"#"+(i+1)+" "+c.name}),dom("b",{class:"percent",text:(c.base.percent??"—")+"%"})]),dom("div",{class:"progress"},[dom("i",{style:"width:"+(c.base.percent??0)+"%"})]),dom("small",{text:c.base.evidenced+" of "+c.base.total+" criteria evidenced"})]);item.setAttribute("role","button");item.setAttribute("tabindex","0");item.setAttribute("aria-label","Review candidate "+c.name);item.onclick=()=>{active=c.id;render()};item.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();active=c.id;render()}});left.append(item)});const csv=button("↓ Export anonymous CSV",()=>{const rows=[["Rank","Candidate","Resume coverage %","Evidence count","Total criteria","LinkedIn coverage %"],...list.map((c,i)=>[i+1,"Candidate "+(i+1),c.base.percent,c.base.evidenced,c.base.total,c.enriched?.percent??""])];const blob=new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"});const url=URL.createObjectURL(blob);const link=dom("a",{href:url,download:"rolevia-anonymous-ranking.csv"});link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});left.append(csv);left.append(button("Shortlist ("+selectedIds().length+")",()=>{view="shortlist";render()},"primary full"));const right=section(chosen.name,"Resume score: "+(chosen.base.percent??"—")+"%"+(chosen.enriched?" · With LinkedIn: "+chosen.enriched.percent+"%":""));right.append(dom("h3",{text:"Evidence by requirement category"}));for(const [category,count] of Object.entries(assessment.groups||{}))right.append(dom("div",{class:"group-summary"},[dom("strong",{text:category.replace(/\b\w/g,c=>c.toUpperCase())}),dom("span",{text:count.supported+" / "+count.total+" evidenced"})]));right.append(dom("h3",{text:"Documented requirement evidence"}));for(const c of [...assessment.checks].sort(byPriority))right.append(dom("div",{class:"evidence"},[dom("b",{class:c.matched?"good":"unknown",text:c.matched?"✓":"?"}),dom("div",{},[dom("strong",{text:"Priority "+c.weight+"/5 · "+c.label+" ["+(c.kind||"skill")+", "+(c.priority||"required")+"] · "+(c.matched?c.source+(c.matchMethod==="related wording — verify"?" · Related wording — verify":""):"Not established")}),dom("small",{text:c.evidence||"No direct evidence found. Verify with the candidate."})])]));renderQuestionEditor(right,chosen,"resume",chosen.base.checks,6);

const semanticPanel=dom("div",{class:"semantic-panel"});
semanticPanel.append(dom("h3",{text:"Optional AI · Related experience explorer"}),
dom("p",{text:"Search the résumé for meaningfully related project statements using a free Hugging Face model. The model downloads to your browser on first use. Suggestions never change the evidence score."}));
const currentLeads=semanticByCandidate.get(chosen.id);
if(currentLeads){
 if(currentLeads.length===0)semanticPanel.append(dom("p",{text:"No related passages surfaced for the first six unsupported requirements. This is not a negative finding."}));
 for(const lead of currentLeads)semanticPanel.append(dom("div",{class:"semantic-lead"},[
  dom("strong",{text:lead.requirement}),
  dom("small",{text:"Potentially related passage (similarity "+lead.similarity.toFixed(2)+", not a qualification score)"}),
  dom("p",{text:lead.excerpt})
 ]));
}
semanticPanel.append(button(semanticBusy?"Loading local AI model…":currentLeads?"Run semantic review again":"Explore related evidence with free AI",async()=>{
 if(semanticBusy)return;
 semanticBusy=true;alertUser("Downloading the free Hugging Face model if needed; all résumé analysis stays in this browser. This may use substantial memory and bandwidth.");
 try{
  const results=await semanticLeads(chosen,chosen.base.checks);
  semanticByCandidate.set(chosen.id,results);
  alertUser(results.length+" semantically related résumé passages found for review. No scores were changed.");
 }catch(error){alertUser("Local AI could not load in this browser. The deterministic review remains available. "+String(error?.message||"").slice(0,120))}
 finally{semanticBusy=false;render()}
},"secondary",semanticBusy));
right.append(semanticPanel);
right.append(dom("h3",{text:"Step 2 · LinkedIn enrichment"}),dom("p",{text:"Paste candidate-provided LinkedIn information. It is not scraped. The original resume ranking remains unchanged."}));const li=dom("textarea",{class:"control big",maxlength:"20000",placeholder:"Paste supplied profile information...",value:chosen.linkedin||""});right.append(li);
if(chosen.sampleLinkedIn&&!chosen.linkedin){
 right.append(button("Load mock LinkedIn profile",()=>{
  const original=data.candidates.find(c=>c.id===chosen.id);
  original.linkedin=original.sampleLinkedIn;data.questionSets??={};data.questionSets[original.id+":profile"]=(data.questionSets[original.id+":profile"]||[]).filter(q=>q.source==="Recruiter");
  save();alertUser("Mock LinkedIn profile loaded. Compare the CV-only findings with this fictional profile.");
 },"secondary"));
}
right.append(button("Update LinkedIn assessment",()=>{const original=data.candidates.find(c=>c.id===chosen.id);original.linkedin=li.value.slice(0,20000);data.questionSets??={};data.questionSets[original.id+":profile"]=(data.questionSets[original.id+":profile"]||[]).filter(q=>q.source==="Recruiter");save();alertUser("LinkedIn compared with the résumé. Updated profile questions while keeping recruiter-written questions.")}));if(chosen.linkedin?.trim()){
 const delta=profileDelta(chosen,data.criteria),card=dom("div",{class:"profile-delta"});
 card.append(dom("h3",{text:"LinkedIn comparison · What changed after adding LinkedIn?"}),
 dom("p",{text:"Stage 1: CV-only evidence → Stage 2: CV + candidate-provided LinkedIn. This is not verified information, and the original candidate ranking does not change."}),
 dom("div",{class:"stage-comparison"},[
  dom("div",{},[dom("small",{text:"BEFORE · CV only"}),dom("strong",{text:(delta.before.percent??"—")+"%"}),dom("span",{text:delta.before.evidenced+" supported requirements"})]),
  dom("span",{class:"stage-arrow",text:"→"}),
  dom("div",{},[dom("small",{text:"AFTER · CV + LinkedIn"}),dom("strong",{text:(delta.after.percent??"—")+"%"}),dom("span",{text:delta.after.evidenced+" supported requirements"})])
 ]),
 dom("div",{class:"delta-counts"},[
  dom("div",{},[dom("strong",{text:"+"+delta.newlyEvidenced.length}),dom("small",{text:"New requirements with matching text found only in LinkedIn"})]),
  dom("div",{},[dom("strong",{text:String(delta.corroborated)}),dom("small",{text:"Requirements already supported by the CV (not added by LinkedIn)"})]),
  dom("div",{},[dom("strong",{text:String(delta.unresolved.length)}),dom("small",{text:"Requirements with no matching text in either document (not a negative finding)"})])
 ]),
 dom("p",{text:delta.note}));
 if(delta.newlyEvidenced.length){
  card.append(dom("h3",{text:"New LinkedIn-only evidence to check"}));
  for(const item of delta.newlyEvidenced)card.append(dom("div",{class:"evidence"},[
   dom("b",{class:"good",text:"+"}),dom("div",{},[
    dom("strong",{text:"Priority "+item.weight+"/5 · "+item.label}),
    dom("small",{text:"Found in LinkedIn, not the CV: "+item.evidence})
   ])
  ]));
 }else card.append(dom("p",{text:"No additional job requirements were supported by the profile text. That is not a negative signal."}));

 right.append(card);
 const linkedInOnly=delta.newlyEvidenced.map(item=>({label:item.label,kind:item.kind,weight:item.weight,matched:true,source:"LinkedIn",evidence:item.evidence}));
 const outstanding=delta.after.checks.filter(item=>!item.matched);
 const represented=new Set([...linkedInOnly,...outstanding].map(x=>x.label.toLowerCase()));
 const otherJobRequirements=chosen.base.checks.filter(c=>!represented.has(c.label.toLowerCase()));
 const basis=[...linkedInOnly,...outstanding,...otherJobRequirements];
 renderQuestionEditor(right,chosen,"profile",basis,5);
}
right.append(dom("div",{class:"safe",text:"Counts refer to job requirements, not claims proven to be true. LinkedIn is optional, and human review is essential. Nothing here confirms a candidate has or lacks a skill."}));
right.append(button(selectedIds().includes(chosen.id)?"✓ Selected · Remove from shortlist":"Choose candidate",()=>toggleSelected(chosen.id),selectedIds().includes(chosen.id)?"secondary":"primary"));
right.append(button("View shortlist ("+selectedIds().length+")",()=>{view="shortlist";render()},"secondary"));
columns.append(left,right);container.append(columns)}

function renderShortlist(container){
 const selected=selectedRanked(),list=ranked(),ids=new Set(selectedIds());
 heading(container,"03 / REVIEWER SHORTLIST","Selected candidates","Manual selection; scores indicate documentary evidence coverage, not hiring suitability.");
 const summary=dom("div",{class:"shortlist-summary"},[
  dom("strong",{text:selected.length+" selected out of "+list.length+" candidates"}),
  dom("p",{text:"Selected candidates are ordered by CV + LinkedIn evidence coverage when available; other candidates remain separate. The CV-only ranking is unchanged."})
 ]);
 container.append(summary);
 const columns=dom("div",{class:"columns"}),included=section("Selected candidates ("+selected.length+")","Ordered by evidence coverage after optional LinkedIn enrichment."),excluded=section("Other candidates ("+(list.length-selected.length)+")","These records remain available for review.");
 if(!selected.length)included.append(dom("p",{text:"No candidates chosen yet. Use Choose candidate on the ranking page."}));
 function showCandidate(parent,c,selectedCandidate){
  const card=dom("div",{class:"candidate"});
  card.append(dom("div",{class:"candidatehead"},[
   dom("strong",{text:c.name}),
   dom("b",{class:"percent",text:(selectedCandidate?(c.enriched?.percent??c.base.percent):c.base.percent)+"%"})
  ]));
  card.append(dom("small",{text:"CV evidence: "+(c.base.percent??"—")+"%"+(c.enriched?" · CV + LinkedIn: "+c.enriched.percent+"%":" · No LinkedIn assessment")}));
  card.append(dom("div",{class:"shortlist-card-actions"},[
   button("Review",()=>{active=c.id;view="results";render()},"secondary"),
   button(selectedCandidate?"Remove from shortlist":"Choose candidate",()=>toggleSelected(c.id),selectedCandidate?"plain":"secondary")
  ]));
  parent.append(card);
 }
 selected.forEach(c=>showCandidate(included,c,true));
 list.filter(c=>!ids.has(c.id)).forEach(c=>showCandidate(excluded,c,false));
 columns.append(included,excluded);container.append(columns);
 container.append(button("Delete other candidates · Keep "+selected.length+" selected",async()=>{
  const removed=data.candidates.length-selected.length;
  if(!selected.length||!removed)return;
  if(!confirm("Delete "+removed+" unselected candidate(s) and their local CV and LinkedIn data? Retain all "+selected.length+" selected candidates. This cannot be undone."))return;
  clearTimeout(saveTimer);
  workspaceEpoch++;
  data.candidates=data.candidates.filter(c=>ids.has(c.id));
  data.selectedIds=data.candidates.map(c=>c.id);data.selected=null;
  data.questionSets=Object.fromEntries(Object.entries(data.questionSets||{}).filter(([key])=>[...ids].some(id=>key.startsWith(id+":"))));
  semanticByCandidate.clear();active=data.candidates[0]?.id||null;data.savedAt=Date.now();
  try{await database("write",{...data,expires:data.savedAt+RETENTION_MS});alertUser("Deleted "+removed+" unselected candidates; retained "+selected.length+".")}
  catch{alertUser("Cleared unselected candidates in the current tab, but storage persistence could not be confirmed.")}
 },"danger",!selected.length||selected.length===list.length));
}

function emptyWorkspace(){return {job:"",criteria:[],candidates:[],selected:null,selectedIds:[],questionSets:{},syntheticConfirmed:false,savedAt:0}}
async function clearWorkspace(){
 clearTimeout(saveTimer);saveTimer=null;workspaceEpoch++;semanticByCandidate.clear();active=null;
 // Clear visible in-memory applicant data, then await IndexedDB transaction commit.
 data=emptyWorkspace();view="setup";
 try{
  await database("delete");
  alertUser("All Rolevia workspace data was deleted from this browser's application storage.");
  return true;
 }catch(e){
  alertUser("Workspace cleared from this tab, but browser storage deletion could not be confirmed. Clear site data in browser settings before leaving this device.");
  return false;
 }
}
function renderPrivacy(container){
 heading(container,"04 / PRIVACY","Temporary data controls","All active workspace records are stored only in this browser; no Rolevia applicant database is connected.");
 const expiration=data.savedAt?new Date(data.savedAt+RETENTION_MS).toLocaleString():"No saved workspace";
 const card=section("Delete immediately or expire after six hours","Saved candidates: "+data.candidates.length+". Automatic expiry: "+expiration+".");
 card.append(dom("p",{text:"Choose Delete all workspace data to remove the job description, candidate CVs, LinkedIn text, questions, and shortlist immediately. Otherwise the workspace expires six hours after the last saved change. If the tab is closed, expired records are removed the next time Rolevia opens. This deletes Rolevia's IndexedDB workspace, not any original uploaded files, model caches, browser backups or exported downloads."}),
 button("Delete all workspace data",async()=>{
  if(!confirm("Permanently delete this browser's entire Rolevia workspace now? This includes all CV text, LinkedIn profiles, the job description, interview questions and shortlist. This cannot be undone."))return;
  await clearWorkspace();
 },"danger"));
 const legal=section("Before using actual applicants","This demo is not GDPR-certified and is not validated as an employment screening system.");
 legal.append(dom("p",{text:"Use fictional data only. Production requires lawful basis, transparency, rights handling, secure access, approved retention, and an appropriate risk or impact assessment. Local browser deletion does not delete files outside Rolevia."}));
 container.append(card,legal);
}
async function parseFile(file){if(!file)throw Error("Choose a document.");if(file.size>5*1024*1024)throw Error("File exceeds 5MB.");const ext=file.name.split(".").pop().toLowerCase();if(!["txt","pdf","docx"].includes(ext))throw Error("Only PDF, DOCX and TXT are supported.");let text="";if(ext==="txt")text=await file.text();else if(ext==="docx")text=(await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;else{const bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=="%PDF-")throw Error("Not a valid PDF.");const doc=await pdfjs.getDocument({data:bytes}).promise;if(doc.numPages>35)throw Error("PDF exceeds 35 pages.");for(let i=1;i<=doc.numPages;i++){const page=await doc.getPage(i);text+=(await page.getTextContent()).items.map(x=>x.str||"").join(" ")+"\n"}await doc.destroy()}if(!text.trim())throw Error("No selectable text found. Image-only scans are unsupported.");return text.slice(0,60000)}
async function upload(files){
 if(!data.syntheticConfirmed){alertUser("Before uploading, confirm that all CVs are fictional and contain no real personal data.");return}
 const {selected,unsupported,overLimit}=selectResumeFiles(files,Math.max(0,30-data.candidates.length));
 const uploadEpoch=workspaceEpoch;
 let ok=0,errors=[];
 for(const file of selected){
  if(uploadEpoch!==workspaceEpoch)return;
  try{
   const resume=await parseFile(file);
   if(uploadEpoch!==workspaceEpoch)return; // Deletion or workspace replacement occurred during parsing.
   data.candidates.push({
    id:crypto.randomUUID(),
    name:file.name.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").slice(0,100),
    filename:file.name,resume,linkedin:""
   });
   ok++;
  }catch(e){errors.push(file.name+": "+e.message)}
 }
 if(ok)save();
 const parts=[ok+" fictional resume(s) added."];
 if(unsupported)parts.push(unsupported+" unsupported or hidden file(s) skipped.");
 if(overLimit)parts.push(overLimit+" additional supported resume(s) exceeded the 30-candidate limit.");
 if(errors.length)parts.push(errors.slice(0,4).join("; ")+(errors.length>4?"; "+(errors.length-4)+" more parsing errors":""));
 alertUser(parts.join(" "));
}
async function boot(){
 try{
  const stored=await database("read");
  // Enforce the NEW 6-hour limit even on records written by older 24-hour builds.
  const expires=stored?Math.min(Number(stored.expires)||0,(Number(stored.savedAt)||0)+RETENTION_MS):0;
  if(stored&&expires>Date.now()){
   data={job:stored.job||"",criteria:stored.criteria||[],candidates:stored.candidates||[],selected:stored.selected||null,selectedIds:Array.isArray(stored.selectedIds)?stored.selectedIds:(stored.selected?[stored.selected]:[]),questionSets:stored.questionSets||{},syntheticConfirmed:!!stored.syntheticConfirmed,savedAt:stored.savedAt||0};
   if(data.candidates.length)view="results";
  }else if(stored){await database("delete");notice="Expired workspace records deleted."}
 }catch{notice="Browser storage unavailable. Please use fictional data only."}
 render();
}
setInterval(async()=>{
 if(data.savedAt&&Date.now()>=data.savedAt+RETENTION_MS){
  await clearWorkspace();
  notice="Six-hour automatic retention elapsed. Workspace cleared.";render();
 }
},60000);
boot();
