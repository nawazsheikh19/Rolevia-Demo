import test from "node:test";
import assert from "node:assert/strict";
import {profileDelta} from "./profile.js";
test("LinkedIn adds independently surfaced evidence",()=>{
 const candidate={resume:"Python",linkedin:"Built production dashboards with SQL and Power BI"};
 const c=[{label:"Python",kind:"skill",aliases:["python"],weight:3},{label:"Power BI",kind:"skill",aliases:["power bi"],weight:3},{label:"SQL",kind:"skill",aliases:["sql"],weight:3}];
 const d=profileDelta(candidate,c);
 assert.equal(d.before.percent,33);assert.equal(d.after.percent,100);
 assert.equal(d.newlyEvidenced.length,2);assert.equal(d.corroborated,1);
 assert.deepEqual(d.newlyEvidenced.map(x=>x.label).sort(),["Power BI","SQL"]);
});
test("A profile that adds no criteria explicitly reports no change",()=>{
 const d=profileDelta({resume:"Python SQL",linkedin:"Experienced in Python"},[{label:"Python",aliases:["python"],weight:1},{label:"SQL",aliases:["sql"],weight:1}]);
 assert.equal(d.newlyEvidenced.length,0);assert.match(d.note,/does not add/);
});
test("Missing LinkedIn never penalizes candidate",()=>{
 const d=profileDelta({resume:"Python"},[{label:"Python",aliases:["python"],weight:1}]);
 assert.equal(d.hasProfile,false);assert.equal(d.delta,0);
});
