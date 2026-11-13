// Evidence-based demonstration rubric. Not a validated employment decision system.
export const taxonomy={
'Python':['python'],'SQL':['sql','postgresql','mysql'],'Machine learning':['machine learning','scikit-learn','sklearn','predictive models'],'Generative AI':['generative ai','genai','large language models','llm'],'RAG':['rag','retrieval augmented generation','retrieval-augmented generation'],'FastAPI':['fastapi'],'AWS':['aws','amazon web services'],'Azure':['azure'],'Google Cloud':['gcp','google cloud'],'Docker':['docker'],'Kubernetes':['kubernetes','k8s'],'Communication':['communication','stakeholder management','stakeholder engagement'],'Leadership':['team leadership','mentored engineers','led a team'],'Java':['java'],'React':['react','reactjs'],'Data engineering':['data engineering','etl','data pipelines'],'NLP':['nlp','natural language processing'],'Project management':['project management','scrum'],'Statistics':['statistics','statistical modelling'],'Testing':['unit testing','pytest','integration testing']
};
export const SAMPLE_JD='Senior Machine Learning Engineer: Python, SQL, machine learning, generative AI, RAG, FastAPI, AWS and Docker required; Kubernetes and communication desirable.';
export const SAMPLE=[
{name:'Alex Morgan',resume:'6 years Python and SQL. Built machine learning RAG and generative AI systems. Deployed FastAPI services with Docker on AWS.',linkedin:'Led a team with stakeholder communication and Kubernetes experience.'},
{name:'Taylor Reed',resume:'Data scientist experienced in Python, SQL, machine learning and statistics. Presented analysis to stakeholders.',linkedin:'Completed hands-on Docker and AWS learning projects.'},
{name:'Jordan Lee',resume:'Frontend developer experienced in React, Java and project management.',linkedin:'Studied Python and FastAPI.'}
];
export const phrase=(text,term)=>{const s=String(text||'').toLowerCase(),t=String(term||'').toLowerCase().trim();if(!t)return false;const escaped=t.replace(/[.*+?^$()|[\]{}\\]/g,'\\$&');return new RegExp('(^|[^a-z0-9])'+escaped+'(?=$|[^a-z0-9])','i').test(s)};
export function criteriaFromJob(job){return Object.entries(taxonomy).filter(([k,v])=>[k,...v].some(t=>phrase(job,t))).map(([label,aliases])=>({label,aliases:[label,...aliases],weight:3}))}
export function assess(candidate,criteria,useLinkedIn=false){
const sources=[['Resume',candidate.resume||'']];if(useLinkedIn&&candidate.linkedin?.trim())sources.push(['LinkedIn',candidate.linkedin]);
const checks=criteria.map(item=>{const hit=sources.map(([source,text])=>{const term=(item.aliases?.length?item.aliases:[item.label]).find(x=>phrase(text,x));return term?{source,evidence:text.slice(Math.max(0,text.toLowerCase().indexOf(term.toLowerCase())-45),text.toLowerCase().indexOf(term.toLowerCase())+term.length+85).replace(/\s+/g,' ')}:null}).find(Boolean);return {label:item.label,weight:Number(item.weight)||1,matched:!!hit,source:hit?.source||'',evidence:hit?.evidence||''}});
const all=checks.reduce((a,x)=>a+x.weight,0),matched=checks.reduce((a,x)=>a+(x.matched?x.weight:0),0);
return {percent:all?Math.round(100*matched/all):null,checks,evidenced:checks.filter(x=>x.matched).length,total:checks.length};
}
