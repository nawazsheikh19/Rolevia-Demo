// Evidence-led demonstrator: assessments are not employment decisions.
export const taxonomy={
"Python":["python"],"SQL":["sql","postgresql","mysql"],"Machine learning":["machine learning","scikit-learn","sklearn"],
"Generative AI":["generative ai","genai","large language models","llm"],
"RAG":["rag","retrieval augmented generation","retrieval-augmented generation"],
"FastAPI":["fastapi"],"AWS":["aws","amazon web services"],
"Azure":["azure"],"Google Cloud":["google cloud","gcp"],"Docker":["docker"],
"Kubernetes":["kubernetes","k8s"],"Communication":["stakeholder communication","stakeholder engagement"],
"Leadership":["team leadership","mentored engineers","led a team"],"Java":["java"],
"React":["react","reactjs"],"Data engineering":["data engineering","etl","data pipelines"],
"NLP":["nlp","natural language processing"],"Project management":["project management","scrum"],
"Statistics":["statistics","statistical modelling"],"Testing":["unit testing","pytest","integration testing"]
};
const domains={
"Healthcare":["healthcare","clinical","hospital"],"Financial services":["financial services","banking","fintech","insurance"],
"E-commerce":["e-commerce","ecommerce","online retail"],"SaaS":["saas","software as a service"],
"Manufacturing":["manufacturing","industrial production"],"Education":["education technology","edtech"]
};
const duties={
"Production deployment":["deploy models","deployed models","production ml","production systems","deploy machine learning","model serving","deployed services"],
"System design":["system design","design architectures","designed architectures","architect scalable","solution architecture"],
"Mentoring":["mentor engineers","mentored engineers","coach engineers","coached engineers"],
"Stakeholder collaboration":["stakeholder management","worked with stakeholders","stakeholder collaboration","cross-functional teams","cross-functional collaboration"],
"Model monitoring":["model monitoring","model observability","monitor model performance","drift detection"],
"Data pipelines":["build data pipelines","built data pipelines","etl pipelines"],
"Technical leadership":["lead engineering team","led engineering team","technical leadership","led a team"]
};
export const SAMPLE_JD="Senior Machine Learning Engineer. Requirements: 5+ years of experience in machine learning. Strong Python, SQL, RAG, Generative AI and AWS. Responsibilities: design architectures, deploy models to production, mentor engineers and collaborate with cross-functional teams. Bachelor's degree in Computer Science preferred. Experience in financial services is desirable.";
export const SAMPLE=[
{name:"Alex Morgan",resume:"Senior Machine Learning Engineer with 7 years of experience in machine learning. Built RAG and generative AI systems using Python and SQL. Designed architectures and deployed models to production on AWS. Mentored engineers in cross-functional teams. Bachelor's degree in Computer Science. Worked at a fintech.",linkedin:"Technical lead for production machine learning systems in banking."},
{name:"Taylor Reed",resume:"Data scientist with 4 years of experience in machine learning using Python, SQL and statistics. Delivered analysis to stakeholders. BSc Mathematics.",linkedin:"Led an internal AWS cloud deployment project."},
{name:"Jordan Lee",resume:"Frontend developer with React and Java. Five years of experience building web interfaces. Worked with cross-functional teams.",linkedin:"Studied Python and introductory machine learning in a course."}
];
const normalize=x=>String(x||"").toLowerCase();
export function phrase(text,term){
const t=normalize(term).trim(),s=normalize(text);if(!t)return false;
let i=s.indexOf(t);while(i>=0){let a=i===0||!/[\da-z]/.test(s[i-1]),b=i+t.length===s.length||!/[\da-z]/.test(s[i+t.length]);if(a&&b)return true;i=s.indexOf(t,i+1)}return false;
}
function snippet(text,aliases){
const s=String(text||""),lower=normalize(s);
for(const alias of aliases||[]){
if(!phrase(s,alias))continue;
let at=lower.indexOf(normalize(alias));
while(at>=0){
const before=lower.slice(Math.max(0,at-45),at);
if(!/(?:\bno\b|\bwithout\b|\blacks?\b|\bnever\b|\bnot\b|\bwant to learn\b|\binterested in\b)\s+(?:\w+\s+){0,2}$/.test(before))return s.slice(Math.max(0,at-75),Math.min(s.length,at+alias.length+95)).replace(/\s+/g," ").trim();
at=lower.indexOf(normalize(alias),at+1);
}
}
return null;
}
function make(label,kind,aliases,weight,priority="required",extra={}){return {label,kind,aliases,weight:priority==="preferred"?Math.min(weight,2):weight,priority,...extra}}
function priorityFor(job,term){
const line=String(job).split(/[\n.;]+/).find(l=>phrase(l,term));
return line&&/\b(preferred|desirable|nice.to.have|bonus|advantageous|ideally)\b/i.test(line)?"preferred":"required";
}
export function criteriaFromJob(job){
const text=String(job||"").slice(0,40000),out=[];
for(const [label,aliases] of Object.entries(taxonomy)){const all=[label,...aliases];if(all.some(t=>phrase(text,t)))out.push(make(label,"skill",all,3,priorityFor(text,all.find(t=>phrase(text,t)))))}
for(const [label,aliases] of Object.entries(domains)){if(aliases.some(t=>phrase(text,t)))out.push(make(label,"industry",aliases,2,priorityFor(text,aliases.find(t=>phrase(text,t)))))}
for(const [label,aliases] of Object.entries(duties)){if(aliases.some(t=>phrase(text,t)))out.push(make(label,"responsibility",aliases,4,priorityFor(text,aliases.find(t=>phrase(text,t)))))}
const year=[...text.matchAll(/\b(\d{1,2})\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:relevant\s+|professional\s+)?(?:experience|working|in)\b/gi)].map(x=>Number(x[1])).filter(n=>n>0&&n<=30);
if(year.length){let min=Math.max(...year);const specific=text.match(/\b\d{1,2}\s*\+?\s*years?\s+(?:of\s+)?(?:relevant\s+|professional\s+)?experience\s+in\s+([a-z ]{3,40})/i);const focus=specific?Object.keys(taxonomy).find(k=>phrase(specific[1],k))||null:null;out.push(make("At least "+min+" years of "+(focus||"relevant")+" experience","experience",[],4,"required",{minYears:min,experienceFocus:focus}))}
for(const [label,rule,aliases] of [
["Bachelor's degree",/\b(bachelor'?s?|b\.?sc\.?|b\.?eng\.?|undergraduate degree)\b/i,["bachelor","bachelors","bachelor's","bsc","b.sc","beng","undergraduate degree"]],
["Master's degree",/\b(master'?s?|m\.?sc\.?|m\.?eng\.?)\b/i,["master","masters","master's","msc","m.sc","meng"]],
["PhD",/\b(ph\.?d\.?|doctorate)\b/i,["phd","ph.d","doctorate"]]
])if(rule.test(text))out.push(make(label,"qualification",aliases,2,priorityFor(text,aliases[0])));
return out.slice(0,35);
}
function experienceEvidence(text,min,focus){
const str=String(text||"");
const values=[...str.matchAll(/\b(\d{1,2})\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:relevant\s+|professional\s+)?(?:experience|working|in)\b/gi)];
const hit=values.find(m=>Number(m[1])>=min&&Number(m[1])<=50&&(!focus||phrase(str.slice(m.index,Math.min(str.length,m.index+125)),focus)));
return hit?str.slice(Math.max(0,hit.index-35),hit.index+hit[0].length+95).replace(/\s+/g," "):null;
}
export function assess(candidate,criteria,useLinkedIn=false){
const sources=[["Resume",candidate?.resume||""]];if(useLinkedIn&&candidate?.linkedin?.trim())sources.push(["LinkedIn",candidate.linkedin]);
const checks=(criteria||[]).filter(c=>c?.label?.trim()).map(c=>{
let evidence=null,source="";
for(const [name,text] of sources){evidence=c.kind==="experience"?experienceEvidence(text,c.minYears||999,c.experienceFocus):snippet(text,c.aliases?.length?c.aliases:[c.label]);if(evidence){source=name;break}}
return {label:c.label,kind:c.kind||"skill",priority:c.priority||"required",weight:Number(c.weight)||1,matched:!!evidence,source,evidence:evidence||""};
});
const totalWeight=checks.reduce((sum,c)=>sum+c.weight,0),matchedWeight=checks.reduce((sum,c)=>sum+(c.matched?c.weight:0),0);
const groups={};for(const c of checks){groups[c.kind]??={supported:0,total:0};groups[c.kind].total++;if(c.matched)groups[c.kind].supported++}
return {percent:totalWeight?Math.round(100*matchedWeight/totalWeight):null,checks,groups,evidenced:checks.filter(c=>c.matched).length,total:checks.length};
}
