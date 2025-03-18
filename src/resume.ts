export interface ContactLinks {
  readonly Resume: URL;
  readonly LinkedIn: URL;
  readonly GitHub: URL;
  readonly StackOverflow: URL;
}

export interface Contact {
  readonly Email: string;
  readonly Phone: string | ReadonlyArray<string>;
  readonly Address: string;
  readonly Links: ContactLinks;
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
  readonly Links?: ReadonlyArray<string>;
  readonly Description?: ReadonlyArray<string>;
  readonly Info?: ReadonlyArray<any>;
  readonly SubProjects?: ReadonlyMap<string, ProjectDetail>;

  constructor(json: any) {
    if (Array.isArray(json)) {
      this.Description = json;
    } else if (typeof json === 'object') {
      const {
        Description,
        Info,
        Link,
        ...subProjects
      } = json;
      if (Description) {
        this.Description = Description;
      }
      if (Info) {
        this.Info = Info;
      }

      if (Link) {
        const links = [];
        if (typeof Link === 'string') {
          links.push(Link);
        } else if (Array.isArray(Link)) {
          links.push(...Link);
        } else {
          throw new Error('Link must be a string or array of strings');
        }
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

    if (Link) {
      const links = [];
      if (typeof Link === 'string') {
        links.push(Link);
      } else if (Array.isArray(Link)) {
        links.push(...Link);
      } else {
        throw new Error('Link must be a string or array of strings');
      }
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

export class PatentInfo {
  readonly Title: string;
  readonly Link: string;

  constructor(json: Record<string, any>) {
    const [title, link] = Object.entries(json)[0];
    this.Title = title;
    this.Link = link;
  }
}

export class PublicationInfo {
  readonly Publisher: string;
  readonly Link: string;

  constructor(json: Record<string, any>) {
    const [publisher, link] = Object.entries(json)[0];
    this.Publisher = publisher;
    this.Link = link;
  }
}

type ResumeRawData = {
  contactName: string,
  contact: Contact,
  summary: ReadonlyArray<string>,
  preferences: Preferences,
  professionalExperience: ReadonlyMap<string, ReadonlyArray<Job>>,
  projects: ReadonlyMap<string, Project>,
  skills: ReadonlyArray<ReadonlyArray<any>>,
  patents: ReadonlyMap<string, PatentInfo>,
  publications: ReadonlyMap<string, PublicationInfo>,
  education: ReadonlyMap<string, string>,
  miscellaneous: ReadonlyArray<string>,
  hobbies: ReadonlyArray<string>,
  references: ReadonlyMap<string, any>,
};

export class ResumeData {
  public contactName: string;
  public contact: Contact;
  public summary: ReadonlyArray<string>;
  public preferences: Preferences;
  public professionalExperience: ReadonlyMap<string, ReadonlyArray<Job>>;
  public projects: ReadonlyMap<string, Project>;
  public skills: ReadonlyArray<Skill>;
  public patents: ReadonlyMap<string, PatentInfo>;
  public publications: ReadonlyMap<string, any>;
  public education: ReadonlyMap<string, string>;
  public miscellaneous: ReadonlyArray<string>;
  public hobbies: ReadonlyArray<string>;
  public references: ReadonlyMap<string, any>;

  constructor(resumeRawData: ResumeRawData) {
    const {
      contactName,
      contact,
      summary,
      preferences,
      professionalExperience,
      projects,
      skills,
      education,
    } = resumeRawData;

    this.contactName = contactName;
    this.contact = contact;
    this.summary = summary;
    this.preferences = preferences;

    const _professionalExperience = new Map();
    for (const [key, value] of Object.entries(professionalExperience)) {
      const jobArray = value.map((job: Record<string, any>) => new Job(job));
      _professionalExperience.set(key, jobArray);
    }
    this.professionalExperience = _professionalExperience;

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

    const _patents = new Map();
    for (const [key, value] of Object.entries(resumeRawData.patents)) {
      const patent = new PatentInfo(value);
      _patents.set(key, patent);
    }
    this.patents = _patents;

    const _publications = new Map();
    for (const [key, value] of Object.entries(resumeRawData.publications)) {
      const publication = new PublicationInfo(value);
      _publications.set(key, publication);
    }
    this.publications = _publications;

    const _education = new Map();
    for (const [key, value] of Object.entries(education)) {
      _education.set(key, value);
    }
    this.education = _education;

    this.miscellaneous = resumeRawData.miscellaneous;
    this.hobbies = resumeRawData.hobbies;

    const _references = new Map();
    for (const [key, value] of Object.entries(resumeRawData.references)) {
      _references.set(key, value);
    }
    this.references = _references;
  }

  static fromJSON(json: any): ResumeData {
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON input');
    }

    const {
      Summary: summary,
      Preferences: preferences,
      "Professional Experience": professionalExperience,
      Projects: projects,
      Skills: skills,
      Patents: patents,
      Publications: publications,
      Education: education,
      Miscellaneous: miscellaneous,
      Hobbies: hobbies,
      References: references,
      ...remainder
    } = json;

    if (!preferences || typeof preferences !== 'object') {
      throw new Error('Invalid or missing Preferences');
    }
    if (!professionalExperience || typeof professionalExperience !== 'object') {
      throw new Error('Invalid or missing "Professional Experience"');
    }
    if (!projects || typeof projects !== 'object') {
      throw new Error('Invalid or missing Projects');
    }
    if (!skills || !Array.isArray(skills)) {
      throw new Error('Invalid or missing Skills');
    }
    if (!patents || typeof patents !== 'object') {
      throw new Error('Invalid or missing Patents');
    }
    if (!publications || typeof publications !== 'object') {
      throw new Error('Invalid or missing Publications');
    }
    if (!education || typeof education !== 'object') {
      throw new Error('Invalid or missing Education');
    }
    if (!miscellaneous || !Array.isArray(miscellaneous)) {
      throw new Error('Invalid or missing Miscellaneous');
    }
    if (!hobbies || !Array.isArray(hobbies)) {
      throw new Error('Invalid or missing Hobbies');
    }
    if (!references || typeof references !== 'object') {
      throw new Error('Invalid or missing References');
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

    return new ResumeData({
      contactName,
      contact,
      summary,
      preferences,
      professionalExperience,
      projects,
      skills,
      patents,
      publications,
      education,
      miscellaneous,
      hobbies,
      references,
    });
  }
};
