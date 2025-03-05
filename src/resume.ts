export interface Links {
  readonly Resume: URL;
  readonly LinkedIn: URL;
  readonly GitHub: URL;
  readonly StackOverflow: URL;
}

export interface Contact {
  readonly Email: string;
  readonly Phone: string | ReadonlyArray<string>;
  readonly Address: string;
  readonly Links: Links;
}

export interface Objective {
  readonly Title: string;
  readonly Emphasis: string;
  readonly Technologies: string;
  readonly Locations: ReadonlyArray<string>;
}

export class Job {
  readonly Roles: ReadonlyMap<string, string>;
  readonly Team: string;
  readonly Description: ReadonlyArray<string>;
  readonly MajorContributions: ReadonlyArray<string>;
  readonly Products?: ReadonlyMap<string, any>;
  readonly Info: ReadonlyArray<string>;

  constructor(json: Record<string, any>) {
    const {
      Description: _description,
      "Major Contributions": MajorContributions,
      Products: _products,
      Info,
      Team,
      ...roles
    } = json;

    const _roles = new Map();
    for (const [key, value] of Object.entries(roles)) {
      if (typeof value === 'string') {
        _roles.set(key, value);
      } else {
        throw new Error(`Invalid or missing Role value for key: ${key}`);
      }
    }
    this.Roles = _roles;

    this.Description = _description;
    this.MajorContributions = MajorContributions;

    if (_products) {
      const products = new Map();
      for (const [productName, productValue] of Object.entries(_products)) {
        products.set(productName, productValue);
      }
      this.Products = products;
    }

    this.Info = Info;
    this.Team = Team;
  }
}

export interface Project {
  readonly Company: string;
  readonly Position: string;
  readonly Duration: string;
  readonly Details: ReadonlyArray<string>;
}

export interface Skill {
  readonly Skill: string;
  readonly Level: string;
  readonly From: string;
  readonly Last: string;
}

export class ResumeData {
  public contactName: string;
  public contact: Contact;
  public summary: ReadonlyArray<string>;
  public objective: Objective;
  public employment: ReadonlyMap<string, ReadonlyArray<Job>>;
  //public projects: ReadonlyArray<Project>;
  public skills: ReadonlyArray<Skill>;
  public education: ReadonlyMap<string, string>;

  constructor(
    contactName: string,
    contact: Contact,
    summary: ReadonlyArray<string>,
    objective: Objective,
    employment: ReadonlyMap<string, ReadonlyArray<Job>>,
    //projects: ReadonlyArray<Project>,
    skills: ReadonlyArray<ReadonlyArray<any>>,
    education: ReadonlyMap<string, string>,
  ) {
    this.contactName = contactName;
    this.contact = contact;
    this.summary = summary;
    this.objective = objective;

    const _employment = new Map();
    for (const [key, value] of Object.entries(employment)) {
      const jobArray = value.map((job: Record<string, any>) => new Job(job));
      _employment.set(key, jobArray);
    }
    this.employment = _employment;

    //this.projects = projects;

    const _skills = skills.map((skill: ReadonlyArray<any>) => {
      if (skill.length !== 4) {
        throw new Error('Invalid Skill');
      }
      const [Skill, Level, From, Last] = skill;
      return { Skill, Level, From, Last };
    });
    this.skills = _skills;

    const _education = new Map();
    for (const [key, value] of Object.entries(education)) {
      _education.set(key, value);
    }
    this.education = _education;
  }

  static fromJSON(json: any): ResumeData {
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON input');
    }

    const {
      Summary: summary,
      Objective: objective,
      Employment: employment,
      //Projects: projects,
      Skills: skills,
      Education: education,
      ...remainder
    } = json;

    if (!objective || typeof objective !== 'object') {
      throw new Error('Invalid or missing Objective');
    }
    if (!employment || typeof employment !== 'object') {
      throw new Error('Invalid or missing Employment');
    }
    // if (!projects || !Array.isArray(projects)) {
    //   throw new Error('Invalid or missing Projects');
    // }
    if (!skills || !Array.isArray(skills)) {
      throw new Error('Invalid or missing Skills');
    }
    if (!education || typeof education !== 'object') {
      throw new Error('Invalid or missing Education');
    }

    const remainderKeys = Object.keys(remainder);
    if (remainderKeys.length === 0) {
      throw new Error('Expected at least one remaining key for contactName');
    }
    const contactName = remainderKeys[0];
    const contact = remainder[contactName];
    if (!contact || typeof contact !== 'object') {
      throw new Error('Invalid contact information');
    }

    return new ResumeData(
      contactName,
      contact,
      summary,
      objective,
      employment,
      //projects,
      skills,
      education,
    );
  }
};
