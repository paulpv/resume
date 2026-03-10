import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { Document, Page, View, Text, Link, StyleSheet, Font } from '@react-pdf/renderer';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load data ──────────────────────────────────────────────────────────────
const dataFile = process.argv[2] ?? join(__dirname, 'resume-data.yaml');
const outFile  = process.argv[3] ?? join(__dirname, 'Paul_Peavyhouse_Resume_Anthropic.pdf');
const data = load(readFileSync(dataFile, 'utf8'));

// ── Theme ──────────────────────────────────────────────────────────────────
const BLUE  = '#1F5C99';
const DARK  = '#1A1A1A';
const MID   = '#444444';
const LIGHT = '#666666';
const RULE  = '#CCCCCC';

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: DARK,
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 36,
    paddingRight: 36,
  },

  // Contact / header
  name: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: DARK,
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 8,
    color: MID,
    textAlign: 'center',
    marginBottom: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  contactText: { color: MID, fontSize: 8 },
  contactLink: { color: BLUE, fontSize: 8 },
  hRule: {
    borderBottomWidth: 1.5,
    borderBottomColor: BLUE,
    marginBottom: 4,
    marginTop: 2,
  },

  // Summary
  summary: {
    fontSize: 9,
    color: MID,
    fontFamily: 'Helvetica-Oblique',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },

  // Section header
  sectionHeader: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    borderBottomWidth: 1,
    borderBottomColor: BLUE,
    paddingBottom: 1,
    marginTop: 8,
    marginBottom: 3,
  },

  // Competencies
  competencyRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  competencyCell: {
    flex: 1,
    backgroundColor: '#EEF4FB',
    padding: 5,
    marginHorizontal: 2,
  },
  competencyHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    marginBottom: 2,
  },
  competencyDetail: {
    fontSize: 8,
    color: MID,
  },

  // Job entry
  jobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 0,
  },
  jobCompany: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  jobLocation: {
    fontSize: 9,
    color: MID,
  },
  jobDates: {
    fontSize: 9,
    color: LIGHT,
    fontFamily: 'Helvetica-Oblique',
  },
  jobTitle: {
    fontSize: 9,
    color: BLUE,
    fontFamily: 'Helvetica-Oblique',
    marginBottom: 2,
  },

  // Bullets
  bullet: {
    fontSize: 8.5,
    color: DARK,
    lineHeight: 1.35,
    marginBottom: 1.5,
    paddingLeft: 12,
  },

  // Skills table
  skillRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  skillLabel: {
    width: 90,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
  },
  skillValue: {
    flex: 1,
    fontSize: 8.5,
    color: MID,
  },

  // Education
  eduRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  eduInstitution: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  eduDetail: {
    fontSize: 9,
    color: MID,
  },
  eduNote: {
    fontSize: 8,
    color: LIGHT,
    fontFamily: 'Helvetica-Oblique',
    marginBottom: 2,
  },
});

// ── Components ─────────────────────────────────────────────────────────────

const SEP = '  \u2022  ';
const ContactSep = () => <Text style={s.contactText}>{SEP}</Text>;

const ContactLine = ({ contact }) => {
  const { name, email, phone, location, links } = contact;
  return (
    <View style={s.contactLine}>
      <Text style={s.contactText}>{location}</Text>
      <ContactSep />
      <Text style={s.contactText}>{phone}</Text>
      <ContactSep />
      <Link src={`mailto:${email}`} style={s.contactLink}>{email}</Link>
      {links.map(({ label, url, short }, i) => (
        <View key={i} style={{ flexDirection: 'row' }}>
          <ContactSep />
          <Text style={s.contactText}>{label}: </Text>
          <Link src={url} style={s.contactLink}>{short}</Link>
        </View>
      ))}
    </View>
  );
};

const SectionHeader = ({ children }) => (
  <Text style={s.sectionHeader}>{children}</Text>
);

const BULLET = '\u2022';

const Bullet = ({ text }) => (
  <Text style={s.bullet}>{BULLET + '  ' + text}</Text>
);

const JobEntry = ({ entry }) => (
  <View>
    <View style={s.jobRow}>
      <Text style={s.jobCompany}>{entry.company}<Text style={s.jobLocation}>{' \u2014 ' + entry.location}</Text></Text>
      <Text style={s.jobDates}>{entry.dates}</Text>
    </View>
    <Text style={s.jobTitle}>{entry.title}</Text>
    {(entry.bullets ?? []).map((b, i) => <Bullet key={i} text={b} />)}
  </View>
);

const Competencies = ({ items }) => (
  <View style={s.competencyRow}>
    {items.map(({ heading, detail }, i) => (
      <View key={i} style={s.competencyCell}>
        <Text style={s.competencyHeading}>{heading}</Text>
        <Text style={s.competencyDetail}>{detail}</Text>
      </View>
    ))}
  </View>
);

const Skills = ({ items }) => (
  <View>
    {items.map(({ label, value }, i) => (
      <View key={i} style={s.skillRow}>
        <Text style={s.skillLabel}>{label}</Text>
        <Text style={s.skillValue}>{value}</Text>
      </View>
    ))}
  </View>
);

const Education = ({ items }) => (
  <View>
    {items.map(({ institution, location, field, note }, i) => (
      <View key={i}>
        <View style={s.eduRow}>
          <Text style={s.eduInstitution}>{institution}</Text>
          <Text style={s.eduDetail}>{field + SEP + location}</Text>
        </View>
        {note && <Text style={s.eduNote}>{note}</Text>}
      </View>
    ))}
  </View>
);

// ── Document ───────────────────────────────────────────────────────────────

const Resume = () => (
  <Document>
    <Page size="LETTER" style={s.page}>

      {/* Header */}
      <Text style={s.name}>{data.contact.name}</Text>
      <ContactLine contact={data.contact} />
      <View style={s.hRule} />
      <Text style={s.summary}>{data.summary}</Text>

      {/* Core Competencies */}
      <SectionHeader>CORE COMPETENCIES</SectionHeader>
      <Competencies items={data.competencies} />

      {/* Experience */}
      <SectionHeader>PROFESSIONAL EXPERIENCE</SectionHeader>
      {data.experience.map((e, i) => <JobEntry key={i} entry={e} />)}

      {/* Projects */}
      <SectionHeader>SELECTED PROJECTS</SectionHeader>
      {data.projects.map((e, i) => <JobEntry key={i} entry={e} />)}

      {/* Skills */}
      <SectionHeader>SKILLS</SectionHeader>
      <Skills items={data.skills} />

      {/* Education */}
      <SectionHeader>EDUCATION</SectionHeader>
      <Education items={data.education} />

      {/* Patents & Publications */}
      <SectionHeader>PATENTS {'&'} PUBLICATIONS</SectionHeader>
      {data.patents.map((t, i) => <Bullet key={i} text={t} />)}
      {data.publications.map((t, i) => <Bullet key={`pub${i}`} text={t} />)}

    </Page>
  </Document>
);

// ── Render ─────────────────────────────────────────────────────────────────
await renderToFile(<Resume />, outFile);
console.log(`Written: ${outFile}`);
