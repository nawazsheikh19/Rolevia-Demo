# Rolevia — Recruiter Demo

**Evidence-first candidate-to-role intelligence for recruiter feedback — not a full ATS.**

Rolevia is an early-stage talent intelligence prototype designed to help recruiters compare candidate resumes with a job description, identify supporting evidence across skills, experience, responsibilities, qualifications and industry context, and prepare a structured shortlist for **human review**.

### 🌐 Open the demo

**[Launch Rolevia Recruiter Demo](https://nawazsheikh19.github.io/Rolevia-Demo/)**

No installation or account is required. Open the link in Chrome or Microsoft Edge on Windows or another modern computer. The optional AI explorer downloads a public Hugging Face model on first use, which may be slow on older laptops; the ordinary matching workflow works without it.

> **Prototype status:** The link is the intended GitHub Pages address. If it does not load, the website's GitHub Actions deployment may still need to succeed.

## IMPORTANT DEMO NOTICE

This is a free evaluation preview, **not a live recruitment product**. Use fictional CVs and jobs only. Rankings are not hiring decisions, and the browser's temporary storage is not an enterprise database.

## What can you try?

1. **Start with sample data:** Choose an example profession (machine learning, operations or customer success) and select **Load sample workspace** to see three fictional candidates.
2. **Configure a role:** Paste a job description or upload a PDF, DOCX, or TXT file. Generate suggested matching criteria, and review or adjust the criteria and weights.
3. **Upload resumes:** Add several candidate resumes in a batch (up to 15, with a 5 MB limit per file).
4. **Review the shortlist:** Open **Candidate ranking** to compare weighted requirement-coverage percentages, matched evidence, and unconfirmed skills.
5. **Add LinkedIn information (optional):** Open a candidate and paste information lawfully supplied from their LinkedIn profile. Rolevia shows exactly which requirements gained evidence, what merely repeats the résumé, what remains unconfirmed, and questions worth asking. The original resume-only ranking is preserved.
6. **Test data controls:** Export an anonymized CSV, make a demonstration selection, or manually delete the local workspace.

**What does the match percentage mean?** It shows how much of the configured, weighted requirements have matching words or phrases in the supplied text. It is **not** a prediction of job performance, a verified measure of candidate suitability, or a recommendation to hire or reject someone.

## Optional free AI

Select **Explore related evidence with free AI** on a candidate to download a small Hugging Face embedding model and search the résumé for passages with similar meaning to uncovered job requirements. It does **not** verify qualifications, adjust the match percentage, or make hiring recommendations. Using this feature downloads model files from Hugging Face/its delivery network; it processes résumé text locally in the browser. Use only synthetic sample profiles in this version.

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
