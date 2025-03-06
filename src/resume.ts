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

export interface Preferences {
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
      if (typeof value === 'string' && 
        /* "YYYY/DD..." */
        /^\d{4}\/\d{2}/.test(key)) {
        _roles.set(key, value);
      } else {
        console.warn(`Unexpected Job key: "${key}"`);
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

export class ProjectDetail {
  readonly Description?: ReadonlyArray<string>;
  readonly Info?: ReadonlyArray<any>;
  readonly Links?: ReadonlyArray<string>;
  readonly SubProjects?: ReadonlyMap<string, ProjectDetail>;

  constructor(json: any) {
    if (Array.isArray(json)) {
      this.Description = json;
    } else if (typeof json === 'object') {
      const {
        Description,
        Info,
        Link,
        Links,
        ...subProjects
      } = json;
      if (Description) {
        this.Description = Description;
      }
      if (Info) {
        this.Info = Info;
      }

      const links = [];
      if (Link) {
        links.push(Link);
      }
      if (Links) {
        links.push(...Links);
      }
      if (links.length > 0) {
        this.Links = links;
      }

      if (Object.keys(subProjects).length > 0) {
        const _subProjects = new Map();
        for (const [key, value] of Object.entries(subProjects)) {
          const projectDetail = new ProjectDetail(value);
          _subProjects.set(key, projectDetail);
        }
        this.SubProjects = _subProjects;
      }
    }
  }
}

export class Project {
  readonly Roles: ReadonlyMap<string, string>;
  readonly Links?: ReadonlyArray<string>;
  readonly Description: ReadonlyArray<string>;
  readonly Info: ReadonlyArray<any>;
  readonly Projects?: ReadonlyMap<string, ProjectDetail>;

  constructor(json: Record<string, any>) {
    const {
      Link,
      Links,
      Description,
      Info,
      ...rolesOrProjects
    } = json;

    const _roles = new Map();
    const _projects = new Map();
    for (const [key, value] of Object.entries(rolesOrProjects)) {
      if (typeof value === 'string' &&
        /* "YYYY..." */
        /^\d{4}/.test(key)) {
        _roles.set(key, value);
      } else {
        const projectDetail = new ProjectDetail(value);
        _projects.set(key, projectDetail);
      }
    }
    this.Roles = _roles;
    if (_projects.size > 0) {
      this.Projects = _projects;
    }

    const links = [];
    if (Link) {
      links.push(Link);
    }
    if (Links) {
      links.push(...Links);
    }
    if (links.length > 0) {
      this.Links = links;
    }

    this.Description = Description;
    this.Info = (typeof Info === 'string') ? [Info] : Info;
  }
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
  public preferences: Preferences;
  public employment: ReadonlyMap<string, ReadonlyArray<Job>>;
  public projects: ReadonlyMap<string, Project>;
  public skills: ReadonlyArray<Skill>;
  public education: ReadonlyMap<string, string>;

  constructor(
    contactName: string,
    contact: Contact,
    summary: ReadonlyArray<string>,
    preferences: Preferences,
    employment: ReadonlyMap<string, ReadonlyArray<Job>>,
    projects: ReadonlyMap<string, Project>,
    skills: ReadonlyArray<ReadonlyArray<any>>,
    education: ReadonlyMap<string, string>,
  ) {
    this.contactName = contactName;
    this.contact = contact;
    this.summary = summary;
    this.preferences = preferences;

    const _employment = new Map();
    for (const [key, value] of Object.entries(employment)) {
      const jobArray = value.map((job: Record<string, any>) => new Job(job));
      _employment.set(key, jobArray);
    }
    this.employment = _employment;

    const _projects = new Map();
    for (const [key, value] of Object.entries(projects)) {
      const project = new Project(value);
      _projects.set(key, project);
    }
    this.projects = _projects;

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
      Preferences: preferences,
      Employment: employment,
      Projects: projects,
      Skills: skills,
      Education: education,
      ...remainder
    } = json;

    if (!preferences || typeof preferences !== 'object') {
      throw new Error('Invalid or missing Preferences');
    }
    if (!employment || typeof employment !== 'object') {
      throw new Error('Invalid or missing Employment');
    }
    if (!projects || typeof projects !== 'object') {
      throw new Error('Invalid or missing Projects');
    }
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
      preferences,
      employment,
      projects,
      skills,
      education,
    );
  }
};
