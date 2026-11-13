import * as pdfjs from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth/mammoth.browser";
import {criteriaFromJob,assess,SAMPLE,SAMPLE_JD} from "./matching.js";
import {profileDelta} from "./profile.js";
import {interviewQuestions,byPriority} from "./questions.js";
import {semanticLeads} from "./semantic.js";
import {SCENARIOS} from "./scenarios.js";
import "./style.css";
pdfjs.GlobalWorkerOptions.workerSrc=worker;
const DB="rolevia-demo",DAY=86400000,root=document.getElementById("app");
let data={job:"",criteria:[],candidates:[],selected:null,savedAt:0};
let view="setup",active=null,notice="",saveTimer;
const semanticByCandidate=new Map();let semanticBusy=false;
const html=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore("records");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function database(mode,record){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction("records",mode==="read"?"readonly":"readwrite");const store=tx.objectStore("records");const r=mode==="read"?store.get("workspace"):mode==="delete"?store.delete("workspace"):store.put(record,"workspace");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close()})}
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{data.savedAt=Date.now();try{await database("write",{...data,expires:data.savedAt+DAY})}catch{notice="This browser blocked local storage. Data will not persist.";render()}},250)}
function alertUser(s){notice=s;render()}
function ranked(){return data.candidates.map(c=>({...c,base:assess(c,data.criteria),enriched:c.linkedin?assess(c,data.criteria,true):null})).sort((a,b)=>(b.base.percent??-1)-(a.base.percent??-1)||a.name.localeCompare(b.name))}
function dom(tag,props={},children=[]){const e=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==="text")e.textContent=v;else if(k==="class")e.className=v;else if(k==="on")for(const [ev,fn] of Object.entries(v))e.addEventListener(ev,fn);else if(k==="value")e.value=v;else if(k==="checked")e.checked=v;else if(k==="disabled")e.disabled=v;else e.setAttribute(k,v)}for(const c of children)e.append(typeof c==="string"?document.createTextNode(c):c);return e}
function button(label,fn,cls="secondary",disabled=false){return dom("button",{class:cls,disabled,on:{click:fn},text:label})}
function section(title,description){return dom("section",{class:"panel"},[dom("h2",{text:title}),dom("p",{class:"muted",text:description})])}
function field(title,input){return dom("label",{class:"field"},[dom("span",{text:title}),input])}
function noticeBar(){return notice?dom("div",{class:"notice"},[dom("span",{text:notice}),button("×",()=>{notice="";render()},"plain")]):dom("span")}
function render(){root.replaceChildren();const layout=dom("div",{class:"layout"}),sidebar=dom("aside",{class:"sidebar"}),main=dom("main",{class:"main"});sidebar.append(dom("div",{class:"brand",text:"Rolevia."}),button("Job & uploads",()=>{view="setup";render()},view==="setup"?"nav active":"nav"),button("Candidate ranking ("+data.candidates.length+")",()=>{view="results";render()},view==="results"?"nav active":"nav"),button("Privacy & retention",()=>{view="privacy";render()},view==="privacy"?"nav active":"nav"),dom("div",{class:"sidefoot",text:"Browser-only prototype • Local data • 24-hour expiry"}));main.append(dom("header",{class:"header"},[dom("strong",{text:"Rolevia / Recruiter workspace"}),dom("span",{class:"badge",text:"PILOT PREVIEW"})]));const content=dom("div",{class:"content"});content.append(noticeBar());if(view==="setup")renderSetup(content);else if(view==="results")renderResults(content);else renderPrivacy(content);main.append(content,dom("footer",{class:"footer",text:"Human-reviewed evidence assistance • Not an automated employment decision"}));layout.append(sidebar,main);root.append(layout)}
function heading(parent,eyebrow,title,detail){parent.append(dom("div",{class:"eyebrow",text:eyebrow}),dom("h1",{text:title}),dom("p",{class:"intro",text:detail}))}
function renderSetup(container){heading(container,"01 / ASSESSMENT SETUP","Find the right talent.","Import a role and up to 30 resumes. Review skills, experience, responsibilities, education and industry requirements before comparing candidates.");const examplePicker=dom("select",{class:"control sample-picker","aria-label":"Synthetic sample role"});
for(const [id,scenario] of Object.entries(SCENARIOS))examplePicker.append(dom("option",{value:id,text:scenario.label}));
const sampleBar=dom("div",{class:"sample-bar"},[
 dom("div",{},[dom("strong",{text:"Explore another profession"}),dom("p",{text:"Use fictional candidates to test roles outside technology, with no applicant information."})]),
 examplePicker,
 button("Load sample workspace",()=>{
  if(data.candidates.length&&!confirm("Replace the current workspace with fictional sample candidates?"))return;
  const sample=SCENARIOS[examplePicker.value];
  semanticByCandidate.clear();
  data={job:sample.job,criteria:criteriaFromJob(sample.job),candidates:sample.candidates.map((candidate,i)=>({
   ...candidate,id:crypto.randomUUID(),filename:"synthetic-"+(i+1)+".txt",sampleLinkedIn:candidate.linkedin||"",linkedin:""
  })),selected:null,savedAt:0};
  save();alertUser(sample.label+" example loaded. Adjust criteria, then explore the shortlist.");
 },"secondary")
]);
container.append(sampleBar);
const columns=dom("div",{class:"columns"}),job=section("Job description","Paste job requirements or upload a PDF, Word, or text document.");const jobfile=dom("input",{type:"file",accept:".pdf,.docx,.txt",class:"control"});jobfile.onchange=async()=>{try{data.job=await parseFile(jobfile.files[0]);data.criteria=criteriaFromJob(data.job);save();alertUser(data.criteria.length+" suggested criteria found. Verify each extracted requirement before ranking.")}catch(e){alertUser(e.message)}};const area=dom("textarea",{class:"control big",placeholder:"Paste role requirements here...",maxlength:"30000",value:data.job});area.oninput=()=>{data.job=area.value;save()};job.append(field("Import job description",jobfile),field("Role requirements",area),button("Generate criteria",()=>{data.job=area.value;data.criteria=criteriaFromJob(data.job);save();alertUser(data.criteria.length+" suggested criteria found across job requirements. Review unfamiliar items and weights before ranking.")}));const cr=dom("div",{class:"rubric"});cr.append(dom("h3",{text:"Extracted job criteria ("+data.criteria.length+")"}),dom("p",{class:"muted",text:"Priority weights: 5 = highest importance, 1 = lowest. Scores reflect weighted document evidence, not suitability. Required vs preferred is a separate label; review both before ranking."}),dom("div",{class:"priority-scale"},[
dom("span",{text:"1 · Lowest"}),dom("span",{text:"2 · Low"}),dom("span",{text:"3 · Medium"}),dom("span",{text:"4 · High"}),dom("span",{text:"5 · Highest"})
]));data.criteria.forEach((x,i)=>{const line=dom("div",{class:"criterion"}),name=dom("input",{class:"control",value:x.label,"aria-label":"Job requirement"}),weight=dom("select",{class:"control","aria-label":"Priority: 1 lowest, 5 highest"});for(let w=1;w<=5;w++){const o=dom("option",{value:w,text:String(w)});o.selected=w===Number(x.weight);weight.append(o)}name.onchange=()=>{x.label=name.value.trim().slice(0,80);x.aliases=[x.label];x.kind="custom";delete x.minYears;delete x.experienceFocus;save();render()};weight.onchange=()=>{x.weight=Number(weight.value);save()};line.append(name,weight,button("×",()=>{data.criteria.splice(i,1);save();render()},"plain"));cr.append(dom("div",{class:"criterion-meta",text:(x.kind||"custom").replace(/\b\w/g,c=>c.toUpperCase())+" · "+(x.priority||"required")+" · Priority "+x.weight+"/5"}));cr.append(line)});cr.append(button("+ Add requirement",()=>{data.criteria.push({label:"New requirement",kind:"custom",priority:"required",aliases:["New requirement"],weight:3});save();render()}));job.append(cr);const uploads=section("Candidate resumes","Upload multiple PDF, DOCX, or TXT files, up to 5MB each.");const fileinput=dom("input",{type:"file",accept:".pdf,.docx,.txt",multiple:"",class:"control"});fileinput.onchange=()=>upload([...fileinput.files]);const drop=dom("div",{class:"dropzone"},[dom("strong",{text:"Upload multiple CVs"}),dom("p",{text:"PDF · DOCX · TXT · Max 30 candidates"}),fileinput]);drop.ondragover=e=>e.preventDefault();drop.ondrop=e=>{e.preventDefault();upload([...e.dataTransfer.files])};const batchHeader=dom("div",{class:"batch-header"},[
 dom("h3",{text:"Candidate batch ("+data.candidates.length+")"}),
 button("Delete entire batch",async()=>{
  if(!data.candidates.length)return;
  const count=data.candidates.length;
  if(!confirm("Delete all "+count+" candidates, including their uploaded résumé text and LinkedIn details? Your job description and matching criteria will be kept. This cannot be undone."))return;
  clearTimeout(saveTimer);
  data.candidates=[];data.selected=null;active=null;semanticByCandidate.clear();
  data.savedAt=Date.now();
  try{
   await database("write",{...data,expires:data.savedAt+DAY});
   alertUser("Deleted "+count+" candidates. Your job description and criteria are ready for a new batch.");
  }catch(error){alertUser("Candidate list cleared in this tab, but browser storage deletion could not be confirmed. Use Privacy & retention to remove saved data before closing.");}
 },"danger",data.candidates.length===0)
]);
uploads.append(drop,batchHeader);for(const c of data.candidates)uploads.append(dom("div",{class:"file"},[dom("span",{text:c.name+" · "+c.filename}),button("Remove",()=>{data.candidates=data.candidates.filter(x=>x.id!==c.id);save();render()},"plain")]));uploads.append(dom("div",{class:"safe",text:"Pilot safety: documents are parsed locally and text is stored in this browser for 24 hours after the latest edit. Use synthetic profiles only; this is not an enterprise-secure database."}),button("View ranked shortlist →",()=>{view="results";render()},"primary full",!data.candidates.length||!data.criteria.length));columns.append(job,uploads);container.append(columns)}
function renderResults(container){const list=ranked();heading(container,"02 / CANDIDATE INTELLIGENCE","Ranked shortlist","The evidence-coverage score considers job-related skills, relevant experience, responsibilities, qualifications and industry context. It is not a validated suitability prediction.");if(!list.length){container.append(button("Add candidates",()=>{view="setup";render()}));return}active=list.some(c=>c.id===active)?active:list[0].id;const chosen=list.find(c=>c.id===active),assessment=chosen.enriched||chosen.base;const columns=dom("div",{class:"results"}),left=section("Resume-based ranking","All candidates are ranked by the same original resume-only criteria.");list.forEach((c,i)=>{const item=dom("div",{class:"candidate "+(c.id===active?"active":"")},[dom("div",{class:"candidatehead"},[dom("strong",{text:"#"+(i+1)+" "+c.name}),dom("b",{class:"percent",text:(c.base.percent??"—")+"%"})]),dom("div",{class:"progress"},[dom("i",{style:"width:"+(c.base.percent??0)+"%"})]),dom("small",{text:c.base.evidenced+" of "+c.base.total+" criteria evidenced"})]);item.onclick=()=>{active=c.id;render()};left.append(item)});const csv=button("↓ Export anonymous CSV",()=>{const rows=[["Rank","Candidate","Resume coverage %","Evidence count","Total criteria","LinkedIn coverage %"],...list.map((c,i)=>[i+1,"Candidate "+(i+1),c.base.percent,c.base.evidenced,c.base.total,c.enriched?.percent??""])];const blob=new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"});const url=URL.createObjectURL(blob);const link=dom("a",{href:url,download:"rolevia-anonymous-ranking.csv"});link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});left.append(csv);const right=section(chosen.name,"Resume score: "+(chosen.base.percent??"—")+"%"+(chosen.enriched?" · With LinkedIn: "+chosen.enriched.percent+"%":""));right.append(dom("h3",{text:"Evidence by requirement category"}));for(const [category,count] of Object.entries(assessment.groups||{}))right.append(dom("div",{class:"group-summary"},[dom("strong",{text:category.replace(/\b\w/g,c=>c.toUpperCase())}),dom("span",{text:count.supported+" / "+count.total+" evidenced"})]));right.append(dom("h3",{text:"Documented requirement evidence"}));for(const c of [...assessment.checks].sort(byPriority))right.append(dom("div",{class:"evidence"},[dom("b",{class:c.matched?"good":"unknown",text:c.matched?"✓":"?"}),dom("div",{},[dom("strong",{text:"Priority "+c.weight+"/5 · "+c.label+" ["+(c.kind||"skill")+", "+(c.priority||"required")+"] · "+(c.matched?c.source+(c.matchMethod==="related wording — verify"?" · Related wording — verify":""):"Not established")}),dom("small",{text:c.evidence||"No direct evidence found. Verify with the candidate."})])]));const interview=dom("div",{class:"questions-panel"});
interview.append(dom("h3",{text:"CV-only review · Suggested interview questions"}),dom("p",{text:"Prepared before LinkedIn. These questions target the highest-priority role requirements and use CV evidence where available. Ask for concrete examples rather than treating gaps as failures."}));
for(const q of interviewQuestions(chosen.base.checks,{limit:6})){
 interview.append(dom("div",{class:"question-row"},[
  dom("div",{class:"question-context",text:"Priority "+q.priority+"/5 · "+q.category+" · "+q.status}),
  dom("p",{class:"question-text",text:q.text}),
  ...(q.context?[dom("small",{text:"CV basis: "+q.context})]:[])
 ]));
}
right.append(interview);
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
 right.append(button("Try fictional LinkedIn profile",()=>{
  const original=data.candidates.find(c=>c.id===chosen.id);
  original.linkedin=original.sampleLinkedIn;
  save();alertUser("Fictional LinkedIn information added. Review how the evidence changed.");
 },"secondary"));
}
right.append(button("Update LinkedIn assessment",()=>{const original=data.candidates.find(c=>c.id===chosen.id);original.linkedin=li.value.slice(0,20000);save();alertUser("LinkedIn compared with the résumé. Review the new evidence and follow-up questions.")}));if(chosen.linkedin?.trim()){
 const delta=profileDelta(chosen,data.criteria),card=dom("div",{class:"profile-delta"});
 card.append(dom("h3",{text:"LinkedIn comparison · What changed?"}),
 dom("p",{text:"Stage 1: CV-only evidence → Stage 2: CV + candidate-provided LinkedIn. This is not verified information, and the original candidate ranking does not change."}),
 dom("div",{class:"stage-comparison"},[
  dom("div",{},[dom("small",{text:"BEFORE · CV only"}),dom("strong",{text:(delta.before.percent??"—")+"%"}),dom("span",{text:delta.before.evidenced+" supported requirements"})]),
  dom("span",{class:"stage-arrow",text:"→"}),
  dom("div",{},[dom("small",{text:"AFTER · CV + LinkedIn"}),dom("strong",{text:(delta.after.percent??"—")+"%"}),dom("span",{text:delta.after.evidenced+" supported requirements"})])
 ]),
 dom("div",{class:"delta-counts"},[
  dom("div",{},[dom("strong",{text:"+"+delta.newlyEvidenced.length}),dom("small",{text:"New LinkedIn-only claims"})]),
  dom("div",{},[dom("strong",{text:String(delta.corroborated)}),dom("small",{text:"Already in CV"})]),
  dom("div",{},[dom("strong",{text:String(delta.unresolved.length)}),dom("small",{text:"Still unconfirmed"})])
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
 if(delta.linkedinQuestions.length){
  card.append(dom("h3",{text:"Questions about LinkedIn-only claims"}));
  for(const q of delta.linkedinQuestions)card.append(dom("div",{class:"question-row"},[
   dom("div",{class:"question-context",text:"Priority "+q.priority+"/5 · Profile-only evidence"}),
   dom("p",{class:"question-text",text:q.text})
  ]));
 }
 right.append(card);
}
right.append(dom("div",{class:"safe",text:"LinkedIn claims are unverified; absence of a LinkedIn profile is not a negative signal. Retain human review."}),button("Choose demo candidate & delete others",()=>{if(data.selected)return;if(!confirm("Keep this demonstration candidate and delete all other local candidate records?"))return;data.candidates=data.candidates.filter(c=>c.id===chosen.id);data.selected=chosen.id;save();alertUser("Other candidates deleted from this browser's workspace.")},"primary",!!data.selected));columns.append(left,right);container.append(columns)}
function renderPrivacy(container){heading(container,"03 / PRIVACY","Temporary data controls","Everything in this pilot stays in the recruiter's browser. No production candidate database is connected.");const card=section("Local retention","Saved candidates: "+data.candidates.length+". Last change: "+(data.savedAt?new Date(data.savedAt).toLocaleString():"none")+".");card.append(dom("p",{text:"Records expire 24 hours after the last edit. Expired information is removed when the application is opened or checked while open. IndexedDB is not application-encrypted; files may remain in browser backups or downloads outside Rolevia."}),button("Delete all workspace data",async()=>{if(!confirm("Delete all local data?"))return;clearTimeout(saveTimer);semanticByCandidate.clear();data={job:"",criteria:[],candidates:[],selected:null,savedAt:0};await database("delete").catch(()=>{});view="setup";alertUser("Workspace removed.")},"danger"));const legal=section("Before using actual applicants","This demo is not GDPR-certified and is not validated as an employment screening system.");legal.append(dom("p",{text:"Production requires lawful basis, transparency, rights handling, employer-defined retention, tenant isolation, secure access, appropriate hosting and impact assessment where required. LinkedIn data must be obtained lawfully. Human review and fairness testing are mandatory design priorities."}));container.append(card,legal)}
async function parseFile(file){if(!file)throw Error("Choose a document.");if(file.size>5*1024*1024)throw Error("File exceeds 5MB.");const ext=file.name.split(".").pop().toLowerCase();if(!["txt","pdf","docx"].includes(ext))throw Error("Only PDF, DOCX and TXT are supported.");let text="";if(ext==="txt")text=await file.text();else if(ext==="docx")text=(await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;else{const bytes=new Uint8Array(await file.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=="%PDF-")throw Error("Not a valid PDF.");const doc=await pdfjs.getDocument({data:bytes}).promise;if(doc.numPages>35)throw Error("PDF exceeds 35 pages.");for(let i=1;i<=doc.numPages;i++){const page=await doc.getPage(i);text+=(await page.getTextContent()).items.map(x=>x.str||"").join(" ")+"\n"}await doc.destroy()}if(!text.trim())throw Error("No selectable text found. Image-only scans are unsupported.");return text.slice(0,60000)}
async function upload(files){let ok=0,errors=[];for(const file of files.slice(0,Math.max(0,30-data.candidates.length))){try{const resume=await parseFile(file);data.candidates.push({id:crypto.randomUUID(),name:file.name.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").slice(0,100),filename:file.name,resume,linkedin:""});ok++}catch(e){errors.push(file.name+": "+e.message)}}save();alertUser(ok+" resume(s) added. "+errors.join("; "))}
async function boot(){try{const stored=await database("read");if(stored?.expires>Date.now()){data={job:stored.job||"",criteria:stored.criteria||[],candidates:stored.candidates||[],selected:stored.selected||null,savedAt:stored.savedAt||0};if(data.candidates.length)view="results"}else if(stored){await database("delete");notice="Expired records removed."}}catch{notice="Browser storage unavailable."}render()}
setInterval(async()=>{if(data.savedAt&&Date.now()>data.savedAt+DAY){await database("delete").catch(()=>{});clearTimeout(saveTimer);data={job:"",criteria:[],candidates:[],selected:null,savedAt:0};view="setup";alertUser("24-hour retention elapsed. Workspace cleared.")}},60000);
boot();
