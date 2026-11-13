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

// Extra role vocabulary is a fallback, not a fixed ceiling on requirements.
const extendedSkills={
"TypeScript":["typescript"],"JavaScript":["javascript","node.js","nodejs"],
"Go":["golang","go language"],"C#":["c#","c sharp"],"C++":["c++"],
"Terraform":["terraform"],"CI/CD":["ci/cd","continuous integration","continuous delivery"],
"Git":["git","github","gitlab"],"Linux":["linux"],"REST APIs":["rest api","restful api","rest apis"],
"GraphQL":["graphql"],"Microservices":["microservices","microservice architecture"],
"PostgreSQL":["postgresql","postgres"],"MongoDB":["mongodb"],"Redis":["redis"],
"Snowflake":["snowflake"],"Databricks":["databricks"],"Spark":["apache spark","pyspark"],
"Kafka":["kafka"],"Airflow":["airflow"],"dbt":["dbt"],"Tableau":["tableau"],
"Power BI":["power bi","powerbi"],"Excel":["excel"],"Salesforce":["salesforce"],
"SAP":["sap"],"CRM":["crm","customer relationship management"],
"Figma":["figma"],"Agile":["agile","scrum","kanban"],
"OAuth":["oauth","openid connect","oidc"],"Security":["cybersecurity","information security","security engineering"],
"API integration":["api integration","system integrations","integrating apis"],
"Prompt engineering":["prompt engineering"],"LLM evaluation":["llm evaluation","model evaluation","evaluate llms"],
"Vector databases":["vector database","vector search","pinecone","weaviate","milvus"],
"LangChain":["langchain"],"LangGraph":["langgraph"],"MCP":["model context protocol","mcp server"],
"PyTorch":["pytorch"],"TensorFlow":["tensorflow"],"MLOps":["mlops"],
"Monitoring":["observability","monitoring","prometheus","grafana"],
"Data visualization":["data visualization","data visualisation"],"ETL":["etl","elt"],
"Budget management":["budget management","budget planning","managing budgets"],
"Customer success":["customer success"],"Recruitment":["talent acquisition","recruitment","recruiting"],
"Negotiation":["negotiation","negotiating"],"Technical writing":["technical writing","documentation"]
};
const genericSkip=/\b(?:equal opportunity|our company|we offer|benefits|compensation|salary|holiday allowance|vacation|apply now|please apply|about us|diversity statement|employment opportunity|contact us|working hours|the successful candidate|you will join|our mission|our values|competitive package|free snacks)\b/i;
const protectedSkip=/\b(?:age|gender|male|female|ethnicity|racial|religion|nationality|citizenship|marital status|pregnancy|disability|sexual orientation|date of birth)\b/i;
const headings=/^(?:requirements?|qualifications?|what you(?:'ll| will) (?:bring|do)|you (?:have|bring|will)|must.have|nice.to.have|preferred|responsibilities|duties|experience|skills|about (?:you|the role)|the role|essential criteria|desirable criteria|key responsibilities|minimum qualifications|preferred qualifications)\s*:?\s*$/i;
const cue=/\b(?:experience (?:with|in|using|of)|proficien(?:t|cy) (?:in|with)|expertise (?:in|with)|knowledge of|familiarity with|ability to|capable of|must (?:have|be|know)|required to|responsible for|skilled (?:in|at)|strong (?:understanding of|knowledge of)|hands.on (?:with|experience in)|you(?:'ll| will) (?:build|design|develop|lead|manage|own|deliver|implement|maintain)|(?:build|design|develop|lead|manage|own|deliver|implement|maintain) (?:and\s+\w+\s+)?(?:scalable|reliable|complex|production|cross.functional))\b/i;
function cleanRequirement(raw){
 return String(raw).replace(/^[\s•*+\-\d.)]+/,"").replace(/^(?:you(?:'ll| will| should| must)?|we (?:need|are looking for)|required|preferred|essential|desirable)\s*[:\-]?\s*/i,"").replace(/\s+/g," ").replace(/[,:;.\s]+$/,"").trim();
}
function segments(text){
 // Layout matters: bullet points carry intent even when a skills dictionary does not know the term.
 const lines=String(text||"").replace(/\r/g,"\n").split("\n");
 const output=[];let section="";let bulletMode=false;
 for(const line of lines){
  const trimmed=line.trim();if(!trimmed)continue;
  if(headings.test(trimmed)){section=trimmed.toLowerCase();bulletMode=true;continue}
  const bullet=/^\s*(?:[-*•]|\d+[.)])\s+/.test(line);
  const strict=bullet||bulletMode&&/(?:requirements?|qualifications?|responsibilities|duties|skills|experience|preferred|desirable|must|you have|you bring)/.test(section);
  const cleaned=cleanRequirement(trimmed);
  for(const item of cleaned.split(/(?<=[.!?])\s+(?=[A-Z])/)){
   const phraseText=cleanRequirement(item);
   if(phraseText)output.push({text:phraseText,strict,section});
  }
 }
 return output;
}
function genericCriteria(text,existing){
 const result=[],seen=new Set(existing.map(x=>normalize(x.label)));
 const preferredSection=section=>/\b(?:preferred|desirable|nice.to.have)\b/.test(section);
 const stop=/^(?:a|an|the|and|or|of|to|with|in|on|for|from|using|strong|solid|deep|good|great|excellent|proven|ability|knowledge|experience|expertise|proficiency|familiarity|understanding|working|hands.on|skills?|required|preferred|essential|desirable|minimum|nice|have|be|is|are|you|we|will|should|our)$/i;
 const add=(label,kind,aliases,preferred,source)=>{
  label=cleanRequirement(label);
  if(label.length<3||label.length>125||genericSkip.test(label)||protectedSkip.test(label))return;
  if(seen.has(normalize(label)))return;
  // Skip near duplicates of existing canonical requirements.
  if(existing.some(c=>c.aliases?.some(a=>normalize(a)===normalize(label))))return;
  seen.add(normalize(label));
  result.push(make(label,kind,aliases,kind==="responsibility"?4:3,preferred?"preferred":"required",{source:"extracted",jobEvidence:source}));
 };
 for(const item of segments(text)){
  const line=item.text;
  if(genericSkip.test(line)||protectedSkip.test(line)||headings.test(line)||line.length>250)continue;
  const preferred=preferredSection(item.section)||/\b(preferred|desirable|nice.to.have|bonus|advantageous)\b/i.test(line);
  // Recognize known technologies that previous taxonomy missed, even in prose.
  for(const [label,aliases] of Object.entries(extendedSkills)){
   if([label,...aliases].some(t=>phrase(line,t)))add(label,"skill",[label,...aliases],preferred,line);
  }
  if(!item.strict&&!cue.test(line))continue;
  if(/^requirements?:|^qualifications?:|^responsibilities?:/i.test(line))continue;
  if(/^experience in (?:financial services|healthcare|e-commerce|saas) is (?:desirable|preferred)/i.test(line))continue;
  const parts=line.split(/[,;]|\s+(?:and|or)\s+(?=[A-Z][A-Za-z0-9+#/. ]{1,35}(?:[,;.]|$))/);
  for(let part of parts){
   part=cleanRequirement(part)
    .replace(/^.*?\b(?:you will|you\x27ll)\s+(?=(?:lead|build|develop|design|manage|deliver|own|maintain|create|implement)\b)/i,"")
    .replace(/^.*?\b(?:ability to)\s+(?=(?:troubleshoot|build|lead|design|communicate|manage|deliver|solve)\b)/i,"")
    .replace(/^(?:\d+\+?\s*years?\s+(?:of\s+)?(?:experience\s+)?(?:with|in|using)\s+)/i,"")
    .replace(/^(?:proven |strong |solid |deep |hands.on |excellent |good |advanced )?(?:experience|proficiency|expertise|familiarity|knowledge|understanding|background|skills?)\s+(?:with|in|of|using|at)\s+/i,"")
    .replace(/^(?:must have|should have|required to|responsible for|ability to|able to)\s+/i,"")
    .replace(/^and\s+/i,"")
    .replace(/\s+(?:preferred|desirable|required|essential|is desirable|is preferred)$/i,"");
   if(/^\b(?:at least|minimum|up to)\s+\d+\b/i.test(part)||/^\d+\s*\+?\s*years?/i.test(part))continue;
   if(part.length<4||part.length>105||!/[a-z]{3}/i.test(part))continue;
   const tokens=part.toLowerCase().match(/[a-z][a-z0-9+#/-]*/g)||[];
   const meaningful=tokens.filter(t=>!stop.test(t));
   if(meaningful.length<2)continue;
   // Known dictionary entries already cover the exact short items.
   if(existing.some(c=>c.aliases?.some(a=>normalize(a)===normalize(part))))continue;
   if(/^(?:bachelor|master|phd|degree)\b/i.test(part))continue;
   if(/\b(?:years? of experience|financial services is desirable|work authorization)\b/i.test(part))continue;
   const responsibility=/^(?:design|build|develop|maintain|implement|lead|manage|deliver|own|coordinate|mentor|optimize|improve|support|create|analyze|analyse|collaborate|communicate|drive|deploy|architect|evaluate)\b/i.test(part);
   add(part,responsibility?"responsibility":"requirement",[part],preferred,line);
  }
 }
 return result;
}

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
return [...out,...genericCriteria(text,out)].slice(0,70);
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
