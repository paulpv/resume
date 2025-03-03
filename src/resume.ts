export interface Links {
  readonly Resume: URL;
  readonly LinkedIn: URL;
  readonly GitHub: URL;
  readonly StackOverflow: URL;
}

export interface Contact {
  readonly Email: string;
  readonly Phone: string | Array<string>;
  readonly Address: string;
  readonly Links: Links;
}

export interface Objective {
  readonly Title: string;
  readonly Emphasis: string;
  readonly Technologies: string;
  readonly Locations: ReadonlyArray<string>;
}

export interface Job {
  readonly Company: string;
  readonly Position: string;
  readonly Duration: string;
  readonly Details: ReadonlyArray<string>;
}

export interface Project {
  readonly Company: string;
  readonly Position: string;
  readonly Duration: string;
  readonly Details: ReadonlyArray<string>;
}

export interface Skill {
  readonly Name: string;
}

export interface Education {
  readonly Institution: string;
  readonly Study: string;
}

export type ResumeData = {
  readonly Summary: string;
  readonly Objective: Objective;
  readonly Employment: ReadonlyArray<Job>;
  readonly Projects: ReadonlyArray<Project>;
  readonly Skills: ReadonlyArray<Skill>;
  // Patents
  // Publications
  readonly Education: ReadonlyArray<Education>;
  // Miscellaneous
  // Hobbies
  // References
  // Updated
  // Ruler100
} & {
  readonly [contactKey in Exclude<string,
    "Summary" |
    "Objective" |
    "Employment" |
    "Projects" |
    "Skills" |
    "Education">
  ]: Contact;
};
