import {SAMPLE,SAMPLE_JD} from "./matching.js";
/** Synthetic sample workspaces. Never use or imply actual applicants. */
export const SCENARIOS={
 "ml":{label:"Machine learning engineer",job:SAMPLE_JD,candidates:SAMPLE},
 "operations":{
  label:"Operations coordinator",
  job:"Operations Coordinator\nRequirements:\n- Experience coordinating suppliers and logistics\n- Proficiency with Excel and inventory reporting\n- Ability to manage schedules and resolve delivery delays\n- Strong communication with warehouse and finance teams\nResponsibilities:\n- Build weekly inventory reports\n- Coordinate supplier deliveries\n- Track purchase orders and identify process improvements\nPreferred:\n- Familiarity with Power BI",
  candidates:[
   {name:"Morgan Patel",resume:"Operations coordinator managing warehouse schedules and supplier deliveries. Built weekly inventory reports in Excel. Tracked purchase orders and resolved delivery delays.",linkedin:"Worked with finance teams on inventory forecasts using Power BI."},
   {name:"Jamie Evans",resume:"Customer support associate with strong communication skills. Managed customer queries and created weekly team schedules.",linkedin:"Completed training in supply chain logistics."},
   {name:"Avery Chen",resume:"Logistics specialist managing delivery schedules and supplier relationships. Experienced with Excel and inventory reporting.",linkedin:"Implemented purchase order process improvements for a distribution team."}
  ]
 },
 "account":{
  label:"Customer success manager",
  job:"Customer Success Manager\nKey responsibilities:\n- Manage enterprise customer relationships and renewals\n- Lead customer onboarding and stakeholder communication\n- Analyze account health and identify churn risks\n- Deliver quarterly business reviews\nRequired qualifications:\n- Experience with CRM tools such as Salesforce\n- Strong negotiation and communication skills\nPreferred:\n- Experience in SaaS",
  candidates:[
   {name:"Robin Brooks",resume:"Customer success professional in SaaS with Salesforce CRM experience. Managed enterprise renewals, led customer onboarding and delivered quarterly business reviews.",linkedin:"Owned account health reporting and worked to reduce churn risk."},
   {name:"Casey Taylor",resume:"Account executive with strong negotiation skills. Managed customer relationships and Salesforce sales pipelines.",linkedin:"Coordinated onboarding of several key accounts."},
   {name:"Skyler Jordan",resume:"Operations analyst delivering reporting dashboards and forecasting projects. Helped stakeholders analyze sales performance.",linkedin:"Completed CRM training."}
  ]
 }
};

SCENARIOS["finance"]={
  "label": "Finance analyst",
  "job": "Financial Analyst\nRequirements:\n- Financial planning and analysis\n- Excel financial modelling\n- Budget variance reporting\n- Work with department leaders on forecasts\nResponsibilities:\n- Prepare monthly financial reports\n- Explain variances to non-financial stakeholders\nPreferred:\n- Power BI or Tableau",
  "candidates": [
    {
      "name": "Ariel Grant",
      "resume": "Finance analyst who prepared monthly budgets and Excel financial models. Explained variance trends to department heads.",
      "linkedin": "Created Power BI reporting dashboards."
    },
    {
      "name": "Noor Riley",
      "resume": "Retail accounts assistant responsible for invoices and expense records. Helped with monthly financial reporting.",
      "linkedin": "Excel training and budget forecast preparation."
    },
    {
      "name": "Devon Bell",
      "resume": "Data analyst building Tableau reporting with SQL. Worked with business stakeholders on revenue forecasting.",
      "linkedin": "Completed accounting fundamentals."
    }
  ]
};

SCENARIOS["nursingAdmin"]={
  "label": "Healthcare administration",
  "job": "Healthcare Administration Coordinator\nRequirements:\n- Patient appointment scheduling\n- Accurate clinical record handling\n- Data privacy and confidentiality\n- Communication with patients and healthcare professionals\nResponsibilities:\n- Coordinate clinic schedules\n- Maintain accurate administrative records\n- Resolve appointment issues\nPreferred:\n- Experience with electronic health record systems",
  "candidates": [
    {
      "name": "Charlie Fox",
      "resume": "Clinic administrator coordinating patient appointments and maintaining confidential clinical records. Worked with nurses on scheduling changes.",
      "linkedin": "Helped update electronic health record workflows."
    },
    {
      "name": "Parker Reese",
      "resume": "Office administrator responsible for record keeping and communication with customers. Managed schedules and correspondence.",
      "linkedin": "Attended health administration training."
    },
    {
      "name": "Drew Miller",
      "resume": "Customer support associate scheduling calls and managing confidential service records.",
      "linkedin": "Volunteered as a hospital reception assistant."
    }
  ]
};

SCENARIOS["marketing"]={
  "label": "Digital marketing",
  "job": "Digital Marketing Executive\nRequired:\n- Manage paid search and social campaigns\n- Report campaign performance using Google Analytics\n- Create content calendars\n- Coordinate with designers and sales teams\n- A/B testing and conversion optimisation\nPreferred:\n- Email marketing automation",
  "candidates": [
    {
      "name": "Remy Stone",
      "resume": "Digital marketer managing paid campaigns, Google Analytics reporting and creative content calendars. Collaborated with sales teams.",
      "linkedin": "Tested landing pages and email marketing automation."
    },
    {
      "name": "Sage Murphy",
      "resume": "Content writer creating blogs and publishing social media posts. Supported creative campaigns and newsletters.",
      "linkedin": "Completed online Google Analytics course."
    },
    {
      "name": "Avery Cole",
      "resume": "Sales coordinator experienced with CRM and stakeholder communication. Produced campaign reports in Excel.",
      "linkedin": "Participated in product marketing planning."
    }
  ]
};

SCENARIOS["hospitality"]={
  "label": "Hospitality management",
  "job": "Hotel Duty Manager\nRequirements:\n- Coordinate front desk and housekeeping operations\n- Handle guest complaints professionally\n- Manage staff rotas and shift handovers\n- Monitor occupancy and booking systems\nResponsibilities:\n- Improve guest satisfaction\n- Escalate safety incidents promptly\nPreferred:\n- Budget tracking and supplier coordination",
  "candidates": [
    {
      "name": "Jamie Parker",
      "resume": "Hotel supervisor managing front desk shifts, guest complaints and housekeeping schedules. Monitored booking occupancy.",
      "linkedin": "Tracked supplier costs and budget reporting."
    },
    {
      "name": "Rory Quinn",
      "resume": "Restaurant supervisor coordinating staff rotas and customer service. Handled escalation issues.",
      "linkedin": "Supported hotel events and bookings."
    },
    {
      "name": "Leah Patel",
      "resume": "Receptionist managing bookings and guest check-in. Trained new front desk staff.",
      "linkedin": "Completed hospitality management training."
    }
  ]
};

SCENARIOS["construction"]={
  "label": "Construction project coordination",
  "job": "Construction Project Coordinator\nRequirements:\n- Track project milestones and delivery schedules\n- Coordinate subcontractors and suppliers\n- Maintain project documentation\n- Support site safety reporting\n- Communicate cost and schedule changes\nPreferred:\n- Microsoft Project and procurement administration",
  "candidates": [
    {
      "name": "Harper Evans",
      "resume": "Construction coordinator tracking site milestones, subcontractor schedules and project documentation. Issued site safety reports.",
      "linkedin": "Used Microsoft Project for construction timelines."
    },
    {
      "name": "Taylor Brooks",
      "resume": "Procurement assistant coordinating suppliers and purchase orders. Maintained project records.",
      "linkedin": "Supported building refurbishment projects."
    },
    {
      "name": "Morgan Lee",
      "resume": "Office administrator maintaining schedules and vendor communication. Produced weekly reports.",
      "linkedin": "Completed construction project management introduction."
    }
  ]
};

SCENARIOS["sales"]={
  "label": "B2B sales account manager",
  "job": "B2B Account Manager\nRequirements:\n- Manage enterprise customer accounts\n- Negotiate renewals and contract terms\n- Maintain accurate CRM records\n- Prepare pipeline forecasts\n- Collaborate with product and customer support\nPreferred:\n- Experience in SaaS",
  "candidates": [
    {
      "name": "Alex Harper",
      "resume": "Account manager in SaaS responsible for enterprise renewals and Salesforce CRM updates. Delivered pipeline forecasts.",
      "linkedin": "Negotiated complex commercial contract terms."
    },
    {
      "name": "Kai Martin",
      "resume": "Sales representative managing inbound leads and CRM notes. Worked with support teams on customer inquiries.",
      "linkedin": "Completed account management training."
    },
    {
      "name": "Quinn Avery",
      "resume": "Customer success specialist managing onboarding and client communication. Worked with product teams.",
      "linkedin": "Supported account renewals."
    }
  ]
};
