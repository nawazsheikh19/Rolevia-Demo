# Rolevia — Recruiter Demo

**A simpler way to review candidate-to-role alignment.**

Rolevia is an early-stage talent intelligence prototype designed to help recruiters compare candidate resumes with a job description, identify supporting evidence, and prepare a structured shortlist for **human review**.

### 🌐 Open the demo

**[Launch Rolevia Recruiter Demo](https://nawazsheikh19.github.io/Rolevia-Demo/)**

No installation or account is required. Open the link in Chrome or Microsoft Edge on a Windows laptop or other modern computer. The first load requires an internet connection.

> **Prototype status:** The link is the intended GitHub Pages address. If it does not load, the website's GitHub Actions deployment may still need to succeed.

## What can you try?

1. **Start with sample data:** Select **Try synthetic candidates** to load a fictional job description and three fictional candidate profiles.
2. **Configure a role:** Paste a job description or upload a PDF, DOCX, or TXT file. Generate suggested matching criteria, and review or adjust the criteria and weights.
3. **Upload resumes:** Add several candidate resumes in a batch (up to 15, with a 5 MB limit per file).
4. **Review the shortlist:** Open **Candidate ranking** to compare weighted requirement-coverage percentages, matched evidence, and unconfirmed skills.
5. **Add LinkedIn information (optional):** Open a candidate and paste information lawfully supplied from their LinkedIn profile. Rolevia displays a second-stage assessment; the original resume-only ranking is preserved.
6. **Test data controls:** Export an anonymized CSV, make a demonstration selection, or manually delete the local workspace.

**What does the match percentage mean?** It shows how much of the configured, weighted requirements have matching words or phrases in the supplied text. It is **not** a prediction of job performance, a verified measure of candidate suitability, or a recommendation to hire or reject someone.

## Privacy and limitations

**Please use only fictional/synthetic candidate information during this demo. Do not upload real applicant resumes or personal data.**

- The prototype processes documents in the browser. Extracted text is stored temporarily in the browser's IndexedDB, **not in a Rolevia cloud database**.
- Local records expire 24 hours after the last edit, with cleanup when the page next opens or during an active session. Use **Privacy & retention** to delete them sooner.
- This is **not** a production GDPR-compliant recruitment platform: there is no account authentication, encrypted application storage, multi-user workspace, audit logging, or enterprise access control.
- LinkedIn data is not automatically retrieved or scraped. The recruiter must provide the information.
- Matching is an explainable **keyword/phrase-based prototype**, not a fully trained or validated AI screening model. A human recruiter must assess all candidates independently.

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

This repository contains the public static proof of concept. The principal development repository, **Rolevia**, is maintained separately and privately.

To run locally with Node.js 22:

```bash
npm install
npm test
npm run dev
```

GitHub Pages deployment is handled by `.github/workflows/deploy.yml`; ensure the repository's Pages deployment source is configured as **GitHub Actions**.

**Rolevia is an experimental decision-support tool. It is not suitable for real employment decisions or processing actual applicant information in its current form.**
