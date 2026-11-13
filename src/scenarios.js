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
