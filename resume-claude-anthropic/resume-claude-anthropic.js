import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile  = process.argv[2] ?? join(__dirname, 'resume-data.yaml');
const outFile   = process.argv[3] ?? join(__dirname, 'resume.html');
const data      = load(readFileSync(dataFile, 'utf8'));

// ── Helpers ────────────────────────────────────────────────────────────────

const bullet  = text => `<li>${text}</li>`;
const bullets = list => list?.length ? `<ul>${list.map(bullet).join('')}</ul>` : '';

const jobEntry = ({ company, location, dates, title, bullets: bs }) => `
  <div class="job">
    <div class="job-header">
      <span class="job-company">${company}</span>
      <span class="job-location"> &mdash; ${location}</span>
      <span class="job-dates">${dates}</span>
    </div>
    <div class="job-title">${title}</div>
    ${bullets(bs)}
  </div>`;

const section = (heading, content) => `
  <section>
    <h2>${heading}</h2>
    ${content}
  </section>`;

// ── Sections ───────────────────────────────────────────────────────────────

const contact = () => {
  const { name, email, phone, location, links } = data.contact;
  const linkItems = links.map(({ label, url, short }) =>
    `<span>${label}: <a href="${url}">${short}</a></span>`
  ).join('<span class="sep">&bull;</span>');
  return `
    <header>
      <h1>${name}</h1>
      <div class="contact-line">
        <span>${location}</span>
        <span class="sep">&bull;</span>
        <span>${phone}</span>
        <span class="sep">&bull;</span>
        <a href="mailto:${email}">${email}</a>
        <span class="sep">&bull;</span>
        ${linkItems}
      </div>
      <div class="summary">${data.summary}</div>
    </header>`;
};

const competencies = () => `
  <section>
    <h2>CORE COMPETENCIES</h2>
    <div class="competency-grid">
      ${data.competencies.map(({ heading, detail }) => `
        <div class="competency-cell">
          <div class="competency-heading">${heading}</div>
          <div class="competency-detail">${detail}</div>
        </div>`).join('')}
    </div>
  </section>`;

const experience  = () => section('PROFESSIONAL EXPERIENCE', data.experience.map(jobEntry).join(''));
const projects    = () => section('SELECTED PROJECTS',       data.projects.map(jobEntry).join(''));

const skills = () => section('SKILLS', `
  <table class="skills-table">
    ${data.skills.map(({ label, value }) => `
      <tr>
        <td class="skill-label">${label}</td>
        <td class="skill-value">${value}</td>
      </tr>`).join('')}
  </table>`);

const education = () => section('EDUCATION', data.education.map(({ institution, location, field, note }) => `
  <div class="edu-entry">
    <div class="edu-main">
      <span class="edu-institution">${institution}</span>
      <span class="edu-detail">${field} &bull; ${location}</span>
    </div>
    ${note ? `<div class="edu-note">${note}</div>` : ''}
  </div>`).join(''));

const patentsAndPublications = () => section('PATENTS &amp; PUBLICATIONS',
  `<ul>${[...data.patents, ...data.publications].map(bullet).join('')}</ul>`);

// ── CSS ────────────────────────────────────────────────────────────────────

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue:  #1F5C99;
    --dark:  #1A1A1A;
    --mid:   #444444;
    --light: #666666;
    --comp-bg: #EEF4FB;
    --font: 'Arial', sans-serif;
  }

  body {
    font-family: var(--font);
    font-size: 9.5pt;
    color: var(--dark);
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.5in;
  }

  /* Header */
  h1 {
    font-size: 22pt;
    text-align: center;
    margin-bottom: 4px;
  }

  .contact-line {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 2px;
    font-size: 8pt;
    color: var(--mid);
    margin-bottom: 6px;
  }

  .contact-line a       { color: var(--blue); text-decoration: none; }
  .contact-line .sep    { color: var(--mid); padding: 0 3px; }

  .summary {
    font-style: italic;
    text-align: center;
    color: var(--mid);
    font-size: 9pt;
    margin: 6px 0 8px;
  }

  hr, header { border-bottom: 1.5px solid var(--blue); padding-bottom: 6px; }

  /* Sections */
  section { margin-top: 10px; }

  h2 {
    font-size: 10.5pt;
    color: var(--blue);
    border-bottom: 1px solid var(--blue);
    padding-bottom: 1px;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  /* Competencies */
  .competency-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }

  .competency-cell {
    background: var(--comp-bg);
    padding: 5px 7px;
  }

  .competency-heading {
    font-weight: bold;
    font-size: 9pt;
    color: var(--blue);
    margin-bottom: 2px;
  }

  .competency-detail { font-size: 8pt; color: var(--mid); }

  /* Job entries */
  .job { margin-top: 7px; break-inside: avoid; }

  .job-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .job-company  { font-weight: bold; font-size: 10pt; }
  .job-location { font-size: 9pt; color: var(--mid); flex: 1; }
  .job-dates    { font-style: italic; font-size: 9pt; color: var(--light); white-space: nowrap; }
  .job-title    { font-style: italic; color: var(--blue); font-size: 9pt; margin-bottom: 2px; }

  /* Bullets */
  ul {
    padding-left: 18px;
    margin: 2px 0;
  }

  li {
    font-size: 8.5pt;
    line-height: 1.35;
    margin-bottom: 1.5px;
  }

  /* Skills */
  .skills-table { width: 100%; border-collapse: collapse; }

  .skill-label {
    font-weight: bold;
    color: var(--blue);
    font-size: 8.5pt;
    width: 110px;
    vertical-align: top;
    padding: 1.5px 0;
  }

  .skill-value {
    font-size: 8.5pt;
    color: var(--mid);
    padding: 1.5px 0;
  }

  /* Education */
  .edu-entry  { margin-top: 5px; }

  .edu-main { display: flex; justify-content: space-between; align-items: baseline; }

  .edu-institution { font-weight: bold; font-size: 9.5pt; }
  .edu-detail      { font-size: 9pt; color: var(--mid); }
  .edu-note        { font-style: italic; font-size: 8pt; color: var(--light); }

  /* Print */
  @media print {
    body          { padding: 0; font-size: 9pt; }
    a             { color: inherit; text-decoration: none; }
    .contact-line a, h2, .job-title, .competency-heading, .skill-label { color: var(--blue); }
    .job          { break-inside: avoid; }
  }

  @page { size: letter; margin: 0.5in; }
`;

// ── Render ─────────────────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.contact.name} — Resume</title>
  <style>${css}</style>
</head>
<body>
  ${contact()}
  ${competencies()}
  ${experience()}
  ${projects()}
  ${skills()}
  ${education()}
  ${patentsAndPublications()}
</body>
</html>`;

writeFileSync(outFile, html);
console.log(`Written: ${outFile}`);
