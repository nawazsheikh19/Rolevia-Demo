# Rolevia prototype — research and safeguards

## Product scope
Recruiter-first workspace: job description, up to 15 candidate resumes, editable weighted skill criteria, anonymized ranked export, LinkedIn enrichment as a second step, candidate evidence panel and manual selection.

## Competitive reference points
Greenhouse and Workable illustrate the importance of structured candidate review, recruiter-controlled criteria, explainability and human-in-the-loop recruiting. This prototype is deliberately smaller than a full ATS. Validate the workflow with real recruiters before introducing interviews, workflows, integrations or pricing.

## Independent review status
No independent human SME, recruiter, legal professional or multi-agent code review was completed. Requirements and code were reviewed within the assistant workflow. Do not describe these as independently audited.

## Scoring caveats
Matching is token/phrase evidence coverage weighted by manually adjustable criteria. It does not infer truth, proficiency, professional experience, relevance of work, chronology, seniority, negation or overall job fitness. A 75% score represents weighted lexical coverage only. Use for synthetic demonstrations, not automated hiring decisions. Do not reject or advance candidates solely on the number. Test with counterexamples, protected-attribute proxies, false positives and negative statements before any real use.

## Privacy / GDPR limitations
Documents are parsed locally in the browser. Extracted text is stored in IndexedDB and expires after 24h from latest edit, with deletion on next load or while the page remains open; manual deletion is available. Application-level encryption, organization sign-in, tenant isolation, deletion across backups, access logs and enterprise retention controls are absent. Browser extensions, compromised machines and local backups can access data. Do not upload actual applicant personal information for this pilot. No LinkedIn scraping is performed; only pasted candidate-provided data.

Real recruitment requires employer-controlled lawful basis, privacy notices, purpose limitation, minimization, retention schedules, access controls, individual rights procedures, DPIA assessment where warranted, vendor assessment, security controls and evaluation of the EU AI Act's employment AI obligations. The system has not undergone a compliance audit. GitHub Pages is for a demo, not production SaaS.

## Deployment
Run `npm install`, `npm test`, `npm run dev` locally. GitHub Pages workflow builds automatically on main if repository Pages source is set to GitHub Actions. No API keys or external inference needed.
