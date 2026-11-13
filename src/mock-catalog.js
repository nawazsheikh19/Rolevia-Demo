/** Strictly fictional recruiter test catalog; 9 professional families × 3 jobs × 6 CVs. */
const ROLES={
  "ml": {
    "label": "Machine learning & GenAI",
    "family": "Machine learning",
    "variants": [
      [
        "Machine Learning Engineer — Production ML",
        [
          "Python model development",
          "Feature engineering with SQL",
          "Model training and evaluation",
          "Deploy models through APIs",
          "Monitor data drift and model quality"
        ],
        [
          "Partner with software engineers on production integrations",
          "Document model limitations and trade-offs"
        ],
        [
          "MLOps with Docker and CI/CD",
          "Cloud infrastructure experience"
        ]
      ],
      [
        "GenAI Engineer — Enterprise RAG",
        [
          "Python and REST APIs",
          "Retrieval-augmented generation and embeddings",
          "LLM evaluation and test datasets",
          "Privacy-aware prompt and data handling",
          "Observability and latency monitoring"
        ],
        [
          "Build evidence-grounded AI assistants",
          "Improve retrieval quality using evaluations"
        ],
        [
          "LangGraph agent workflows",
          "Vector search systems"
        ]
      ],
      [
        "Applied Data Scientist — Forecasting",
        [
          "Statistical modelling in Python",
          "Experiment design and hypothesis testing",
          "Time series forecasting",
          "Data analysis with SQL",
          "Communicate model assumptions to nontechnical teams"
        ],
        [
          "Build forecasting models for operations",
          "Create clear analysis presentations"
        ],
        [
          "A/B testing",
          "Cloud data platforms"
        ]
      ]
    ]
  },
  "operations": {
    "label": "Operations & supply chain",
    "family": "Operations",
    "variants": [
      [
        "Supply Chain Coordinator",
        [
          "Supplier communication and purchase orders",
          "Inventory reporting in Excel",
          "Coordinate delivery schedules",
          "Resolve late shipments and exceptions",
          "Track stock accuracy"
        ],
        [
          "Maintain supplier delivery records",
          "Escalate supply risks and document outcomes"
        ],
        [
          "ERP familiarity",
          "Power BI reporting"
        ]
      ],
      [
        "Operations Team Lead",
        [
          "Manage daily work schedules",
          "Lead process improvements",
          "Monitor service level agreements",
          "Coach team members",
          "Report operational performance"
        ],
        [
          "Coordinate cross-functional priorities",
          "Resolve recurring operational issues"
        ],
        [
          "Lean continuous improvement",
          "Workforce planning"
        ]
      ],
      [
        "Procurement Analyst",
        [
          "Analyze supplier spending",
          "Create procurement reports in Excel",
          "Compare vendor quotes",
          "Maintain contract records",
          "Communicate with finance stakeholders"
        ],
        [
          "Track purchase order accuracy",
          "Identify savings opportunities"
        ],
        [
          "SAP purchasing systems",
          "Supplier negotiation"
        ]
      ]
    ]
  },
  "account": {
    "label": "Customer success & support",
    "family": "Customer success",
    "variants": [
      [
        "Customer Success Manager — SaaS",
        [
          "Own customer onboarding",
          "Manage enterprise client relationships",
          "Track renewal risk and retention",
          "Maintain Salesforce CRM records",
          "Deliver quarterly business reviews"
        ],
        [
          "Build customer success plans",
          "Coordinate support and product escalations"
        ],
        [
          "SaaS customer lifecycle experience",
          "Account health dashboards"
        ]
      ],
      [
        "Technical Account Coordinator",
        [
          "Coordinate technical onboarding",
          "Understand customer integrations",
          "Maintain support ticket records",
          "Communicate with technical stakeholders",
          "Track service level agreements"
        ],
        [
          "Organize incident updates for customers",
          "Document recurring integration problems"
        ],
        [
          "API fundamentals",
          "Customer satisfaction analysis"
        ]
      ],
      [
        "Customer Support Team Lead",
        [
          "Coach support specialists",
          "Handle escalated customer complaints",
          "Monitor support response metrics",
          "Improve knowledge base articles",
          "Schedule customer service coverage"
        ],
        [
          "Run weekly service reviews",
          "Improve resolution workflows"
        ],
        [
          "Zendesk administration",
          "Multi-channel support"
        ]
      ]
    ]
  },
  "finance": {
    "label": "Finance & accounting",
    "family": "Finance",
    "variants": [
      [
        "Financial Planning Analyst",
        [
          "Budget forecasts and variance analysis",
          "Financial modelling in Excel",
          "Monthly management reporting",
          "Work with budget owners",
          "Analyze revenue and expenses"
        ],
        [
          "Prepare monthly forecasts",
          "Explain financial variances clearly"
        ],
        [
          "Power BI dashboards",
          "Scenario modelling"
        ]
      ],
      [
        "Accounts Payable Specialist",
        [
          "Process supplier invoices",
          "Perform payment reconciliations",
          "Maintain accounts payable records",
          "Resolve invoice discrepancies",
          "Collaborate with procurement teams"
        ],
        [
          "Manage month-end invoice checks",
          "Ensure timely supplier payments"
        ],
        [
          "ERP finance modules",
          "VAT record keeping"
        ]
      ],
      [
        "Commercial Finance Partner",
        [
          "Review product profitability",
          "Build pricing and margin models",
          "Present financial insights to business teams",
          "Monitor commercial KPIs",
          "Support annual budgeting"
        ],
        [
          "Challenge assumptions in forecasts",
          "Prepare commercial investment assessments"
        ],
        [
          "SQL analysis",
          "Stakeholder workshop facilitation"
        ]
      ]
    ]
  },
  "nursingAdmin": {
    "label": "Healthcare administration",
    "family": "Healthcare administration",
    "variants": [
      [
        "Clinic Scheduling Coordinator",
        [
          "Patient appointment scheduling",
          "Maintain confidential patient records",
          "Coordinate clinician availability",
          "Handle patient enquiries professionally",
          "Use electronic health record systems"
        ],
        [
          "Resolve appointment conflicts",
          "Maintain accurate clinic administration"
        ],
        [
          "Hospital reception experience",
          "Waiting list reporting"
        ]
      ],
      [
        "Medical Records Administrator",
        [
          "Maintain accurate patient documentation",
          "Apply data privacy procedures",
          "Control record access and retention",
          "Coordinate document requests",
          "Check administrative record quality"
        ],
        [
          "Support clinical teams with file retrieval",
          "Report missing documentation promptly"
        ],
        [
          "Electronic health record platforms",
          "Clinical terminology"
        ]
      ],
      [
        "Healthcare Service Operations Officer",
        [
          "Coordinate outpatient service workflows",
          "Monitor appointment backlogs",
          "Prepare service performance reports",
          "Communicate with medical and administrative teams",
          "Resolve referral administration issues"
        ],
        [
          "Improve patient communication processes",
          "Review service capacity and scheduling"
        ],
        [
          "Excel reporting",
          "Healthcare quality improvement"
        ]
      ]
    ]
  },
  "marketing": {
    "label": "Marketing & communications",
    "family": "Marketing",
    "variants": [
      [
        "Performance Marketing Executive",
        [
          "Manage paid search campaigns",
          "Analyze Google Analytics results",
          "Track conversion metrics",
          "Plan campaign budgets",
          "Test advertising creative"
        ],
        [
          "Report monthly acquisition performance",
          "Collaborate with sales on lead quality"
        ],
        [
          "Google Ads certification",
          "Landing page optimization"
        ]
      ],
      [
        "Content Marketing Specialist",
        [
          "Plan editorial content calendars",
          "Write customer-facing articles",
          "Research target audiences",
          "Measure content engagement",
          "Coordinate with design teams"
        ],
        [
          "Maintain brand voice across channels",
          "Improve search visibility of content"
        ],
        [
          "SEO tools",
          "Email newsletter planning"
        ]
      ],
      [
        "CRM Marketing Coordinator",
        [
          "Develop email marketing campaigns",
          "Maintain consent and suppression lists",
          "Segment customer audiences",
          "Measure campaign conversion rates",
          "Coordinate automation workflows"
        ],
        [
          "Plan customer lifecycle messaging",
          "Report campaign testing outcomes"
        ],
        [
          "HubSpot administration",
          "A/B testing"
        ]
      ]
    ]
  },
  "hospitality": {
    "label": "Hospitality & guest services",
    "family": "Hospitality",
    "variants": [
      [
        "Hotel Front Office Supervisor",
        [
          "Coordinate guest check-in and check-out",
          "Manage front desk rotas",
          "Resolve guest complaints",
          "Monitor reservation systems",
          "Train front desk colleagues"
        ],
        [
          "Coordinate room readiness with housekeeping",
          "Escalate guest safety incidents"
        ],
        [
          "Revenue management awareness",
          "Multilingual guest service"
        ]
      ],
      [
        "Restaurant Operations Manager",
        [
          "Manage daily restaurant shifts",
          "Schedule service staff",
          "Monitor food safety procedures",
          "Handle customer service issues",
          "Control stock and wastage"
        ],
        [
          "Improve service consistency",
          "Coordinate supplier deliveries"
        ],
        [
          "Budget tracking",
          "Hospitality training"
        ]
      ],
      [
        "Events and Conference Coordinator",
        [
          "Plan event schedules",
          "Communicate with suppliers and venues",
          "Manage event booking records",
          "Coordinate event-day staff",
          "Resolve last-minute customer requests"
        ],
        [
          "Prepare event run sheets",
          "Track event budgets and feedback"
        ],
        [
          "Conference management systems",
          "Contract negotiation"
        ]
      ]
    ]
  },
  "construction": {
    "label": "Construction & facilities",
    "family": "Construction",
    "variants": [
      [
        "Construction Project Coordinator",
        [
          "Track site milestones",
          "Coordinate subcontractor schedules",
          "Maintain project documentation",
          "Prepare site safety reports",
          "Communicate delivery changes"
        ],
        [
          "Support site meetings and action logs",
          "Track materials orders"
        ],
        [
          "Microsoft Project scheduling",
          "Procurement administration"
        ]
      ],
      [
        "Facilities Maintenance Planner",
        [
          "Schedule preventative maintenance",
          "Coordinate external contractors",
          "Track building work orders",
          "Monitor maintenance service levels",
          "Maintain compliance records"
        ],
        [
          "Prioritize urgent repairs",
          "Prepare maintenance performance summaries"
        ],
        [
          "Computerized maintenance management systems",
          "Supplier budget control"
        ]
      ],
      [
        "Quantity Surveying Assistant",
        [
          "Measure construction quantities",
          "Prepare cost estimates",
          "Review subcontractor quotations",
          "Maintain project cost records",
          "Support payment valuations"
        ],
        [
          "Report project cost changes",
          "Communicate commercial risks"
        ],
        [
          "Excel cost modelling",
          "Construction contract familiarity"
        ]
      ]
    ]
  },
  "sales": {
    "label": "Sales & account management",
    "family": "Sales",
    "variants": [
      [
        "B2B Account Executive",
        [
          "Build prospect pipelines",
          "Run product discovery meetings",
          "Maintain accurate CRM updates",
          "Negotiate commercial proposals",
          "Forecast quarterly sales"
        ],
        [
          "Coordinate product demonstrations",
          "Manage contract follow-ups"
        ],
        [
          "Salesforce opportunity management",
          "SaaS sales experience"
        ]
      ],
      [
        "Key Account Manager",
        [
          "Grow enterprise account relationships",
          "Prepare account plans",
          "Manage contract renewals",
          "Identify cross-sell opportunities",
          "Report account performance"
        ],
        [
          "Coordinate customer escalations",
          "Present account reviews to stakeholders"
        ],
        [
          "Commercial negotiation",
          "Industry market research"
        ]
      ],
      [
        "Sales Operations Analyst",
        [
          "Maintain CRM data quality",
          "Analyze conversion funnel metrics",
          "Prepare pipeline dashboards",
          "Support territory planning",
          "Improve sales reporting processes"
        ],
        [
          "Build weekly sales forecasts",
          "Document sales workflow improvements"
        ],
        [
          "SQL reporting",
          "Power BI dashboards"
        ]
      ]
    ]
  }
};
const names=["Mock Candidate A","Mock Candidate B","Mock Candidate C","Mock Candidate D","Mock Candidate E","Mock Candidate F"];
const archetypes=[
 {label:"direct experience",seniority:"five years",strength:[0,1,2,3,4],weakness:"",extra:"Presented practical outcomes to team stakeholders and kept work records up to date."},
 {label:"specialist",seniority:"four years",strength:[0,1,3],weakness:"No experience claimed for remaining requirements.",extra:"Worked independently on a specialist workstream and documented risks for colleagues."},
 {label:"transferable skills",seniority:"three years",strength:[1,2],weakness:"Transitioning from a related role and seeking relevant training.",extra:"Handled scheduling, communication and reporting in a different operational setting."},
 {label:"experienced generalist",seniority:"seven years",strength:[0,2,4],weakness:"Would need support learning unfamiliar systems.",extra:"Led cross-functional planning and resolved ambiguous operational issues."},
 {label:"career starter",seniority:"one year",strength:[0],weakness:"Early-career profile with limited direct experience.",extra:"Completed supervised work tasks and created clear learning notes."},
 {label:"adjacent domain",seniority:"six years",strength:[1,3,4],weakness:"Work history is primarily in an adjacent profession.",extra:"Adapted existing business processes for a new sector and coordinated project handovers."}
];
function mockCandidate(config,roleKey,variantIndex,i){
 const [title,requirements,duties,preferred]=config,profile=archetypes[i];
 const applied=profile.strength.map(n=>requirements[n]).filter(Boolean);
 const other=profile.strength.length?requirements.filter((_,index)=>!profile.strength.includes(index)):[...requirements];
 const role=ROLES[roleKey];
 const cv=[
  "MOCK RESUME — FICTIONAL PERSON / NOT A REAL APPLICANT",
  names[i]+" | Test persona: "+profile.label,
  "Professional summary: "+profile.seniority+" of work experience related to "+role.family.toLowerCase()+". "+profile.extra,
  "Recent position: "+(i===0?title:i===1?role.family+" Specialist":i===2?"Operations Associate":i===3?role.family+" Lead":i===4?"Junior Coordinator":role.family+" Analyst")+".",
  "Responsibilities and documented work:",
  ...applied.map((req,j)=>"- "+req+". "+(j%2===0?"Worked with colleagues to coordinate the work and document results.":"Reported progress and maintained accurate records.")),
  "- "+(duties[(i+variantIndex)%duties.length]||"Maintained project documentation")+".",
  "Additional context: "+profile.weakness,
  "Professional development: "+(i%2===0?preferred[0]:preferred[1])+".",
  "Mock data notice: all work histories and outcomes above are invented for demonstration; no contact details or identifying data are included."
 ].join("\n");
 const linkedin=[
  "MOCK LINKEDIN PROFILE — FICTIONAL / NEVER SCRAPED",
  names[i]+" | "+role.family+" | "+profile.label,
  "About: Working on job-related projects in "+role.family.toLowerCase()+". Interested in process improvement and clear collaboration.",
  "Experience: "+profile.seniority+" across fictional employer projects, with examples of "+(other[(i+variantIndex)%Math.max(1,other.length)]||requirements[(i+1)%requirements.length])+".",
  "Project highlight: "+(duties[(i+variantIndex+1)%duties.length]||"Coordinated project deliverables")+". Collaborated on reporting and documentation.",
  "Additional skills: "+preferred[i%preferred.length]+".",
  "Profile statement: demonstration content only; claims are unverified and must never be used as real recruitment evidence."
 ].join("\n");
 return {name:names[i],resume:cv,linkedin,mock:true};
}
export const MOCK_CATALOG=Object.fromEntries(Object.entries(ROLES).map(([key,role])=>[key,{
 label:role.label, jobs:role.variants.map((config,index)=>{
  const [title,requirements,duties,preferred]=config;
  return {id:key+"-"+(index+1),title,
   job:["MOCK JOB DESCRIPTION — FICTIONAL COMPANY",title,"About the role: Join a fictional "+role.family.toLowerCase()+" team that values accurate reporting, thoughtful communication and clear documentation.",
     "Requirements:",...requirements.map(x=>"- "+x),"Responsibilities:",...duties.map(x=>"- "+x),"Preferred:",...preferred.map(x=>"- "+x),
     "Assessment note: recruiters should verify all evidence and never infer capability solely from CV text."].join("\n"),
   candidates:names.map((_,i)=>mockCandidate(config,key,index,i))};
 })
}])) ;
export function mockListing(roleKey,listingId){
 const role=MOCK_CATALOG[roleKey];
 return role?.jobs.find(j=>j.id===listingId)||null;
}
