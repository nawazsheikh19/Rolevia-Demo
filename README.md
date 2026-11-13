# Rolevia — Recruiter Demo

**Evidence-first candidate-to-role intelligence for recruiter feedback — not a full ATS.**

Rolevia is an early-stage talent intelligence prototype designed to help recruiters compare candidate resumes with a job description, identify supporting evidence across skills, experience, responsibilities, qualifications and industry context, and prepare a structured shortlist for **human review**.

### 🌐 Open the demo

**[Launch Rolevia Recruiter Demo](https://nawazsheikh19.github.io/Rolevia-Demo/)**

No installation or account is required. Open the link in Chrome or Microsoft Edge on Windows or another modern computer. The optional AI explorer downloads a public Hugging Face model on first use, which may be slow on older laptops; the ordinary matching workflow works without it.

> **Prototype status:** The link is the intended GitHub Pages address. If it does not load, the website's GitHub Actions deployment may still need to succeed.

## IMPORTANT DEMO NOTICE

This is a free evaluation preview, **not a live recruitment product**. Use fictional CVs and jobs only. Rankings are not hiring decisions, and the browser's temporary storage is not an enterprise database.

## Priority weights and evidence order

Each extracted job requirement has an editable **priority weight from 1 to 5**:

- **5 = Highest priority** — most influential in the evidence coverage percentage.
- **4 = High**, **3 = Medium**, **2 = Low**, **1 = Lowest**.

Requirement evidence appears **highest priority first** in the shortlist. *Required* versus *preferred* is a separate descriptor; check both settings before comparing CVs. The resulting percentage is only weighted textual coverage, not an objective ATS rating or probability of hiring success. More documented evidence does not guarantee better job performance.

## What can you try?

1. **Start with sample data:** Choose an example profession (machine learning, operations or customer success) and select **Load sample workspace** to see three fictional candidates.
2. **Configure a role:** Paste a job description or upload a PDF, DOCX, or TXT file. Generate suggested matching criteria, and review or adjust the criteria and weights.
3. **Upload resumes:** Add several candidate resumes in a batch (up to 15, with a 5 MB limit per file).
4. **Review the shortlist:** Open **Candidate ranking** to compare weighted requirement-coverage percentages, matched evidence, and unconfirmed skills.
5. **Add LinkedIn information (optional):** Open a candidate and paste information lawfully supplied from their LinkedIn profile. Rolevia shows exactly which requirements gained evidence, what merely repeats the résumé, what remains unconfirmed, and questions worth asking. The original resume-only ranking is preserved.
6. **Test data controls:** Export an anonymized CSV, make a demonstration selection, or manually delete the local workspace.

**What does the match percentage mean?** It shows how much of the configured, weighted requirements have matching words or phrases in the supplied text. It is **not** a prediction of job performance, a verified measure of candidate suitability, or a recommendation to hire or reject someone.

## Interview questions and LinkedIn comparison

Questions appear on the **CV-only review before adding LinkedIn**. They vary by requirement type (technical skill, responsibility, experience, qualification and industry), reference the submitted evidence where available, and address higher-priority requirements first. LinkedIn enrichments are displayed as **Before: CV-only → After: CV + LinkedIn**, listing newly evidenced claims, previously supported claims, and gaps requiring verification. New profile claims receive separate follow-up questions. A missing LinkedIn profile is not a negative signal.

**Another question** supplies a different role-grounded question immediately, without downloading a model. **Try LLM draft (experimental)** offers a separately confirmed, optional browser-local Qwen2.5-0.5B-Instruct download (quantized weights can be roughly 0.8 GB). AI-generated text is an editable draft, not verified evidence, and must be reviewed by the recruiter.

## Optional free AI

Select **Explore related evidence with free AI** on a candidate to download a small Hugging Face embedding model and search the résumé for passages with similar meaning to uncovered job requirements. It does **not** verify qualifications, adjust the match percentage, or make hiring recommendations. Using this feature downloads model files from Hugging Face/its delivery network; it processes résumé text locally in the browser. Use only synthetic sample profiles in this version.

## Synthetic upload acknowledgement

Before using the CV file upload control, the recruiter must affirm that documents are **fictional/synthetic and contain no real applicant information**. This is a demonstration safeguard, not a legal privacy guarantee. Sample workspaces can be used without uploading any documents.

## Privacy and limitations

**Please use only fictional/synthetic candidate information during this demo. Do not upload real applicant resumes or personal data.**

- The prototype processes documents in the browser. Extracted text is stored temporarily in the browser's IndexedDB, **not in a Rolevia cloud database**.
- Local records expire 24 hours after the last edit, with cleanup when the page next opens or during an active session. Use **Privacy & retention** to delete them sooner.
- This is **not** a production GDPR-compliant recruitment platform: there is no account authentication, encrypted application storage, multi-user workspace, audit logging, or enterprise access control.
- LinkedIn data is not automatically retrieved or scraped. The recruiter must provide the information.
- Matching combines **reviewable multi-dimensional rules, related-wording suggestions, and an optional free browser-local AI evidence explorer**, not a fully trained or validated AI screening model. A human recruiter must assess all candidates independently.

## Feedback we're looking for

We'd particularly value your perspective on whether:
- The workflow is intuitive and saves time during initial screening.
- The scoring criteria reflect real recruiter priorities.
- The evidence and missing-information explanations are useful.
- LinkedIn enrichment adds value beyond a resume.
- Any essential features or safeguards are missing.

Please share observations with the person who invited you to test Rolevia. **Do not include real candidate data in feedback.**

---

### For developers

This repository contains only the **public, synthetic-data demonstration**. The private **Rolevia** repository is the source of truth. Approved application files are intended to flow one way from private Rolevia to this public demo after tests pass; the private repository owner must configure the cross-repository release secret. This demo does not contain the production backend or authentic applicant data.

To run locally with Node.js 22:

```bash
npm install
npm test
npm run dev
```

GitHub Pages deployment is handled by `.github/workflows/deploy.yml`; ensure the repository's Pages deployment source is configured as **GitHub Actions**.

**Rolevia is an experimental decision-support tool. It is not suitable for real employment decisions or processing actual applicant information in its current form.**


## Mock data test lab — no applicant files needed

The **Mock test data** section at the top of **Job & uploads** supports nine professional families: machine learning/GenAI, operations and supply chain, customer success, finance, healthcare administration, marketing, hospitality, construction, and sales.

Each family has **three different fictional job descriptions**, and each description includes **six different mock CVs with six unique mock LinkedIn profiles**. Total test coverage: **27 job listings, 162 fictional resumes and 162 LinkedIn texts**. The work histories are deliberately invented, not scraped or copied from real applicants.

1. Choose a **Profession** and one of its three **Mock job listings**.
2. Click **Load mock JD** to populate only the job description and extract its rubric. If a current candidate batch exists, this requires confirmation before clearing it.
3. Click **Add 6 mock resumes** to populate the matching fictional batch, respecting the maximum 30 candidates. This action requires the selected mock JD already be loaded.
4. Or click **Load full mock test** to populate the JD, rubric and six resumes together.
5. Open **Candidate ranking** and select any mock candidate. Click **Load mock LinkedIn profile** to add that fictional candidate's LinkedIn text and test the evidence comparison.

Mock test data is clearly labeled as fictional and must never be interpreted as real candidate evidence. Review the rubric and generated results before assessing the product's usefulness.

## Recruiter interview and shortlist workflow

1. Open **Candidate ranking**, select a candidate and review requirements ordered by priority (5 highest, 1 lowest).
2. See **six CV-only interview questions**. Each has an editable text field. **× deletes a question without replacing it**. **Another question** replaces only the selected suggested question with an unused, job-grounded alternative; prior alternatives remain linked to that question to avoid an immediate repeat; deleting it also removes its history. **Add suggested question** explicitly adds another suggestion. Recruiter-authored questions are added in an amber-highlighted section at the very top rather than displacing existing suggestions.
3. In **Stage 2**, paste candidate-provided LinkedIn text if available. Clear before/after percentages describe *documented weighted requirements*, not validated ability. The labels mean: **new LinkedIn-only requirement evidence**, **already supported by the CV**, and **not documented in either source**.
4. If LinkedIn is provided, **five follow-up questions** appear, emphasizing profile-only claims first, then outstanding job criteria. They can be edited, deleted with ×, or individually refreshed; recruiter-authored priority questions can be added above them.
5. Select **Choose candidate** for as many candidates as needed. Open **Shortlist** to see selected versus other applicants. The selected group is ordered by the percentage of weighted requirement coverage based on the CV and optional LinkedIn; non-selected candidates remain available for human review.
6. Use **Delete other candidates** in the Shortlist tab, with confirmation, only after the desired candidates are selected. This retains the selected candidates and job rubric. **Delete entire batch** in the upload tab clears everyone while preserving the job rubric.

### Local question model limitations
**onnx-community/Qwen2.5-0.5B-Instruct** is an optional ONNX / Transformers.js browser-side instruct model, not a dedicated hiring-interview model. It is a comparatively large download; model hosting, browser memory, CDN and WASM runtime availability may prevent it from loading. It receives only a sanitized **job requirement**, not CV text, LinkedIn text or recruiter-written questions. Normal “Another question” replacements are generated locally without any network request. No model output is guaranteed free of hallucinations; the optional AI uses output checks and falls back to job-grounded templates if it fails. AI output can be unreliable or hallucinate, so recruiters must verify all questions and avoid protected characteristics; no automatic hiring decisions are made. The demo uses fictional profiles only.
