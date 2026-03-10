const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, ExternalHyperlink, BorderStyle, WidthType,
  ShadingType, TabStopType,
} = require('docx');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ── Load data ──────────────────────────────────────────────────────────────
const dataFile = process.argv[2] || path.join(__dirname, 'resume-data.yaml');
const data = yaml.load(fs.readFileSync(dataFile, 'utf8'));

const outFile = process.argv[3] || path.join(__dirname, 'Paul_Peavyhouse_Resume_Anthropic.docx');

// ── Theme ──────────────────────────────────────────────────────────────────
const BLUE  = "1F5C99";
const DARK  = "1A1A1A";
const MID   = "444444";
const LIGHT = "666666";

const PAGE_W    = 12240;
const MARGIN    = 720; // 0.5in
const CONTENT_W = PAGE_W - 2 * MARGIN;

// ── Helpers ────────────────────────────────────────────────────────────────
function hRule() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 1 } },
    spacing: { before: 60, after: 60 },
    children: [],
  });
}

function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 140, after: 50 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 2 } },
    children: [new TextRun({ text, bold: true, size: 24, color: BLUE, font: "Arial" })],
  });
}

function jobEntry({ company, location, dates, title }) {
  return [
    new Paragraph({
      spacing: { before: 100, after: 0 },
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
      children: [
        new TextRun({ text: company, bold: true, size: 22, color: DARK, font: "Arial" }),
        new TextRun({ text: `  |  ${location}`, size: 20, color: MID, font: "Arial" }),
        new TextRun({ text: "\t", font: "Arial" }),
        new TextRun({ text: dates, size: 20, color: LIGHT, font: "Arial", italics: true }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text: title, size: 20, color: BLUE, font: "Arial", italics: true })],
    }),
  ];
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 14, after: 14 },
    children: [new TextRun({ text, size: 19, color: DARK, font: "Arial" })],
  });
}

function entryWithBullets(entry) {
  return [
    ...jobEntry(entry),
    ...(entry.bullets || []).map(b => bullet(b)),
  ];
}

// ── Build sections ─────────────────────────────────────────────────────────

function buildContact() {
  const { name, email, phone, location, links } = data.contact;
  const linkChildren = [];
  links.forEach(({ label, url, short }, i) => {
    if (i > 0) linkChildren.push(new TextRun({ text: "  \u2022  ", size: 18, color: MID, font: "Arial" }));
    linkChildren.push(new TextRun({ text: `${label}: `, size: 18, color: MID, font: "Arial" }));
    linkChildren.push(new ExternalHyperlink({
      link: url,
      children: [new TextRun({ text: short, size: 18, color: BLUE, font: "Arial", style: "Hyperlink" })],
    }));
  });

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text: name, bold: true, size: 52, color: DARK, font: "Arial" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 20 },
      children: [
        new TextRun({ text: `${location}  \u2022  `, size: 18, color: MID, font: "Arial" }),
        new TextRun({ text: phone, size: 18, color: MID, font: "Arial" }),
        new TextRun({ text: "  \u2022  ", size: 18, color: MID, font: "Arial" }),
        new ExternalHyperlink({
          link: `mailto:${email}`,
          children: [new TextRun({ text: email, size: 18, color: BLUE, font: "Arial", style: "Hyperlink" })],
        }),
        new TextRun({ text: "  \u2022  ", size: 18, color: MID, font: "Arial" }),
        ...linkChildren,
      ],
    }),
    hRule(),
  ];
}

function buildSummary() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 100 },
      children: [new TextRun({ text: data.summary, size: 20, color: MID, font: "Arial", italics: true })],
    }),
  ];
}

function buildCompetencies() {
  const cols = data.competencies;
  const colW = Math.floor(CONTENT_W / cols.length);
  return [
    sectionHeader("CORE COMPETENCIES"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: cols.map(() => colW),
      rows: [
        new TableRow({
          children: cols.map(({ heading, detail }) =>
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              width: { size: colW, type: WidthType.DXA },
              margins: { top: 60, bottom: 60, left: 80, right: 80 },
              shading: { fill: "EEF4FB", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 20 },
                  children: [new TextRun({ text: heading, bold: true, size: 19, color: BLUE, font: "Arial" })],
                }),
                new Paragraph({
                  spacing: { before: 0, after: 0 },
                  children: [new TextRun({ text: detail, size: 17, color: MID, font: "Arial" })],
                }),
              ],
            })
          ),
        }),
      ],
    }),
  ];
}

function buildExperience() {
  return [
    sectionHeader("PROFESSIONAL EXPERIENCE"),
    ...data.experience.flatMap(entryWithBullets),
  ];
}

function buildProjects() {
  return [
    sectionHeader("SELECTED PROJECTS"),
    ...data.projects.flatMap(entryWithBullets),
  ];
}

function buildSkills() {
  const COL1 = 2600;
  const COL2 = CONTENT_W - COL1;
  const noBorder = { style: BorderStyle.NONE };
  const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  return [
    sectionHeader("SKILLS"),
    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [COL1, COL2],
      rows: data.skills.map(({ label, value }) =>
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: COL1, type: WidthType.DXA },
              margins: { top: 40, bottom: 40, left: 0, right: 80 },
              children: [new Paragraph({
                children: [new TextRun({ text: label, bold: true, size: 18, color: BLUE, font: "Arial" })],
              })],
            }),
            new TableCell({
              borders,
              width: { size: COL2, type: WidthType.DXA },
              margins: { top: 40, bottom: 40, left: 0, right: 0 },
              children: [new Paragraph({
                children: [new TextRun({ text: value, size: 18, color: MID, font: "Arial" })],
              })],
            }),
          ],
        })
      ),
    }),
  ];
}

function buildEducation() {
  const paras = [sectionHeader("EDUCATION")];
  data.education.forEach(({ institution, location, field, note }) => {
    paras.push(new Paragraph({
      spacing: { before: 80, after: note ? 0 : 20 },
      children: [
        new TextRun({ text: institution, bold: true, size: 20, font: "Arial", color: DARK }),
        new TextRun({ text: `  \u2022  ${field}  \u2022  ${location}`, size: 20, font: "Arial", color: MID }),
      ],
    }));
    if (note) {
      paras.push(new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: note, size: 18, font: "Arial", color: LIGHT, italics: true })],
      }));
    }
  });
  return paras;
}

function buildPatentsAndPublications() {
  return [
    sectionHeader("PATENTS & PUBLICATIONS"),
    ...data.patents.map(t => bullet(t)),
    ...data.publications.map(t => bullet(t)),
  ];
}

// ── Assemble ───────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 480, hanging: 240 } } },
      }],
    }],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: 15840 },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    children: [
      ...buildContact(),
      ...buildSummary(),
      ...buildCompetencies(),
      ...buildExperience(),
      ...buildProjects(),
      ...buildSkills(),
      ...buildEducation(),
      ...buildPatentsAndPublications(),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outFile, buf);
  console.log(`Written: ${outFile}`);
});
