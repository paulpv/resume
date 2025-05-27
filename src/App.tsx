import React, { useEffect, useLayoutEffect, useState } from 'react'
import { ResumeData, Contact, ProjectDetail } from './resume'
import yaml from 'js-yaml'

declare const APP_URL: string
declare const APP_MODIFIED_TIMESTAMP: string
declare const APP_DATA: string
declare const RESUME_MODIFIED_TIMESTAMP: string

const MOBILE_BREAKPOINT = 821 // iPad Air is 820x1180

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mediaQueryList.matches)
    mediaQueryList.addEventListener('change', listener)
    return () => {
      mediaQueryList.removeEventListener('change', listener)
    }
  }, [query])
  return matches
}

function isMobileWidth() {
  return useMediaQuery(`only screen and (max-width: ${MOBILE_BREAKPOINT}px)`)
}

function timeToYYYYMMDDHHMM(time: Date): string {
  const pad = (num: number) => num.toString().padStart(2, '0')
  return `${time.getFullYear()}/${pad(time.getMonth() + 1)}/${pad(time.getDate())} ${pad(time.getHours())}:${pad(time.getMinutes())}`
}

const appModifiedTimestampString = timeToYYYYMMDDHHMM(new Date(APP_MODIFIED_TIMESTAMP))
const resumeModifiedTimestampString = timeToYYYYMMDDHHMM(new Date(RESUME_MODIFIED_TIMESTAMP))

function renderPossibleLink(value: string): React.ReactNode {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(value)) !== null) {
      const urlWithExtra = match[0];
      const start = match.index;

      // Add any text before the URL
      if (start > lastIndex) {
          segments.push(<span key={lastIndex}>{value.slice(lastIndex, start)}</span>);
      }

      // Remove trailing punctuation if present
      let trimmedUrl = urlWithExtra;
      let trailingPunctuation = "";
      while (/[.,;:!?]$/.test(trimmedUrl)) {
          trailingPunctuation = trimmedUrl.slice(-1) + trailingPunctuation;
          trimmedUrl = trimmedUrl.slice(0, -1);
      }

      segments.push(
          <React.Fragment key={start}>
              <a href={trimmedUrl} target="_blank" rel="noopener noreferrer">
                  {trimmedUrl}
              </a>
              {trailingPunctuation}
          </React.Fragment>
      );

      lastIndex = start + urlWithExtra.length;
  }

  // Append any remaining text after the last URL
  if (lastIndex < value.length) {
      segments.push(<span key={lastIndex}>{value.slice(lastIndex)}</span>);
  }

  return <>{segments}</>;
}

function renderLineOrLines(lineOrLines: string | readonly string[], lineCount?: number | null): React.ReactNode {
  const lines = typeof lineOrLines === 'string' ? [lineOrLines] : lineOrLines;
  const maxCount = lineCount == null ? lines.length : lineCount;
  const limitedLines = lines.slice(0, maxCount);
  return (
    <>
      {limitedLines.map((line, index) => (
        <React.Fragment key={`desc-${index}`}>
          {renderPossibleLink(line)}
          {index < limitedLines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

function renderDescription(description: string | readonly string[], showHeader: boolean, indent: boolean) {
  const lines = typeof description === 'string' ? [description] : description;
  return (
    <>
      {showHeader && <div className="font-bold">Description:</div>}
      <div className={`${indent ? "ml-6" : ""} italic`}>{renderLineOrLines(lines)}</div>
    </>
  );
}

function ProjectInfo(infoItems: ReadonlyArray<any>) {
  return (
    <ul className={`ml-0`}>
      {infoItems.map((infoItem, idx) => {
        if (typeof infoItem === 'string') {
          return (
            <li key={idx}>{renderPossibleLink(infoItem)}</li>
          )
        } else if (Array.isArray(infoItem)) {
          return (
            <li key={idx}>
              {infoItem.map((item, index) => (
                <React.Fragment key={index}>
                  {renderPossibleLink(item)}
                  {index < infoItem.length - 1 && ", "}
                </React.Fragment>
              ))}
            </li>
          )
        } else if (typeof infoItem === 'object' && infoItem !== null) {
          return (
            <ul key={idx} className={`ml-0`}>
              {Object.entries(infoItem as Record<string, string>).map(([key, value]) => (
                <li key={key}>
                  {key}: {renderPossibleLink(value)}
                </li>
              ))}
            </ul>
          )
        }
      })}
    </ul>
  )
}

function ProjectDetails(projectDetails: ProjectDetail) {
  return (
    <div>
      {projectDetails.Description && renderDescription(projectDetails.Description, false, false)}
      {projectDetails.Info && ProjectInfo(projectDetails.Info)}
      {projectDetails.Links && projectDetails.Links.length > 1 && (
        <ul className={`ml-0`}>
          {projectDetails.Links.slice(1).map((url, idx) => (
            <li key={idx}>{renderPossibleLink(url)}</li>
          ))}
        </ul>
      )}
      {projectDetails.SubProjects && (
        <ul className={`ml-0 space-y-1`}>
          {Array.from(projectDetails.SubProjects.entries()).map(([subProjectName, subProjectDetails], idx) => (
            <li key={idx}>
              <span className="font-bold italic">{renderPossibleLink(subProjectName)}:</span>
              {subProjectDetails.Links && (
                <span>
                  {subProjectName.length > 32 ? <br/> : <>&nbsp;</>}
                  {renderPossibleLink(subProjectDetails.Links[0])}
                </span>
              )}
              <div>
                {ProjectDetails(subProjectDetails)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type RenderContactProps = {
  contactName: string;
  contact: Contact;
  summary: ReadonlyArray<string>;
}

function RenderContact({ contactName, contact, summary }: RenderContactProps) {

  const isMobile = isMobileWidth()

  const email = contact.Email
  const linkEmail = <a href={`mailto:${email}`}>{email}</a>
  const address = contact.Address
  const phone = contact.Phone[0]
  const phone2 = contact.Phone[1]
  const resume = contact.Links.Resume.toString()
  const linkResume = <a href={resume}>{resume}</a>
  const linkedIn = contact.Links.LinkedIn.toString()
  const linkLinkedIn = <a href={linkedIn}>{linkedIn}</a>
  const gitHub = contact.Links.GitHub.toString()
  const linkGitHub = <a href={gitHub}>{gitHub}</a>
  const stackOverflow = contact.Links.StackOverflow.toString()
  const linkStackOverflow = <a href={stackOverflow}>{stackOverflow}</a>

  if (isMobile) {
    return (
      <>
        <div className="flex-1 grid grid-cols-[min-content_1fr] gap-x-4 items-center">
          <div className="text-[130%] font-bold whitespace-nowrap">{contactName}</div>
          <div className="text-[90%] text-right">{linkEmail}</div>
          <div className="text-[90%] whitespace-nowrap">{address}</div>
          <div className="text-[90%] text-right" title={phone2}>{phone}</div>
        </div>
        <div className="text-[60%] grid grid-cols-[min-content_1fr_min-content_1fr] gap-x-1">
          <div className="text-right font-bold">Resume:</div>
          <div className="text-left">{linkResume}</div>
          <div className="text-right font-bold">LinkedIn:</div>
          <div className="text-left">{linkLinkedIn}</div>
          <div className="text-right font-bold">GitHub:</div>
          <div className="text-left">{linkGitHub}</div>
          <div className="text-right font-bold">StackOverflow:</div>
          <div className="text-left">{linkStackOverflow}</div>
        </div>
        {summary && (
          <div className="mx-0 my-1 p-0">
            <div className="text-[94%] font-bold">Summary:</div>
            {summary.map((line, idx) => (
              <div key={idx} className="text-[86%] pl-2">{line}</div>
            ))}
          </div>
        )}
      </>
    )
  } else {
    return (
      <>
        <div className="flex flex-row gap-4">
          <div className="flex-1 grid grid-cols-[min-content_1fr] gap-x-4 items-center">
            <div className="text-[140%] font-bold whitespace-nowrap">{contactName}</div>
            <div className="text-[95%] text-right">{linkEmail}</div>
            <div className="text-[95%] whitespace-nowrap">{address}</div>
            <div className="text-[95%] text-right" title={phone2}>{phone}</div>
          </div>
          <div className="flex-none text-[60%] mt-0 pl-4 border-l grid grid-cols-[auto_auto] gap-x-2">
            <div className="text-right font-bold">Resume:</div>
            <div className="text-left">{linkResume}</div>
            <div className="text-right font-bold">LinkedIn:</div>
            <div className="text-left">{linkLinkedIn}</div>
            <div className="text-right font-bold">GitHub:</div>
            <div className="text-left">{linkGitHub}</div>
            <div className="text-right font-bold">StackOverflow:</div>
            <div className="text-left">{linkStackOverflow}</div>
          </div>
        </div>
        {summary && (
          <div className="mb-2 p-0">
            <span className="text-[86%] font-bold">Summary:</span>
            <span className="text-[68%] pl-2">{summary.join(' ')}</span>
          </div>
        )}
      </>
    )
  }
}

function App() {
  const defaultMode = "modeEverything";
  const [expandedExperience, setExpandedExperience] = useState<Record<number,boolean>>({});
  const toggleExperience = (idx: number) =>
    setExpandedExperience(e => ({ ...e, [idx]: !e[idx] }));
  const [mode, setMode] = useState<string>(defaultMode)
  useEffect(() => {
    if (mode === "modeRecruiter") {
      setExpandedExperience({})
    }
  }, [mode])
  const isNotRecruiter = mode !== "modeRecruiter"

  // Initialize theme from localStorage if present, otherwise use system preference
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme")
    return stored ? stored : (darkMediaQuery.matches ? "dark" : "light")
  });

  // Tracks if the user has manually set a theme
  const [userSetTheme, setUserSetTheme] = useState(() => localStorage.getItem("theme") !== null);

  // Listen for system theme changes only if the user hasn't manually chosen a theme.
  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => {
      if (!userSetTheme) {
        setTheme(e.matches ? "dark" : "light")
      }
    }
    darkMediaQuery.addEventListener('change', handler)
    return () => darkMediaQuery.removeEventListener('change', handler)
  }, [darkMediaQuery, userSetTheme])

  // Update the document class whenever theme changes.
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => {
      const newTheme = prev === "dark" ? "light" : "dark"
      localStorage.setItem("theme", newTheme)
      return newTheme
    })
    setUserSetTheme(true)
  }

  const isMobile = isMobileWidth()
  const [professionalExperienceHeaderElement, setProfessionalExperienceHeaderElement] = useState<HTMLDivElement | null>(null)
  const [professionalExperienceHeaderHeight, setProfessionalExperienceHeaderHeight] = useState(0)
  const [professionalExperienceItemsElement, setProfessionalExperienceItemsElement] = useState<HTMLDivElement | null>(null)
  const [isProfessionalExperienceSticky, setIsProfessionalExperienceSticky] = useState(false)
  const [projectsHeaderElement, setProjectsHeaderElement] = useState<HTMLDivElement | null>(null)
  const [projectsHeaderHeight, setProjectsHeaderHeight] = useState(0)
  const [projectsItemsElement, setProjectsItemsElement] = useState<HTMLDivElement | null>(null)
  const [isProjectsSticky, setIsProjectsSticky] = useState(false)
  const [skillsHeaderElement, setSkillsHeaderElement] = useState<HTMLDivElement | null>(null)
  const [skillsHeaderHeight, setSkillsHeaderHeight] = useState(0)
  const [skillsItemsElement, setSkillsItemsElement] = useState<HTMLDivElement | null>(null)
  const [isSkillsSticky, setIsSkillsSticky] = useState(false)
  useLayoutEffect(() => {
    const updateProfessionalExperienceHeaderHeight = () => {
      if (professionalExperienceHeaderElement) {
        const { height } = professionalExperienceHeaderElement.getBoundingClientRect()
        setProfessionalExperienceHeaderHeight(height)
      }
    }
    const updateProjectsHeaderHeight = () => {
      if (projectsHeaderElement) {
        const { height } = projectsHeaderElement.getBoundingClientRect()
        setProjectsHeaderHeight(height)
      }
    }
    const updateSkillsHeaderHeight = () => {
      if (skillsHeaderElement) {
        const { height } = skillsHeaderElement.getBoundingClientRect()
        setSkillsHeaderHeight(height)
      }
    }
    const handleResize = () => {
      updateProfessionalExperienceHeaderHeight()
      updateProjectsHeaderHeight()
      updateSkillsHeaderHeight()
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [professionalExperienceHeaderElement, projectsHeaderElement, skillsHeaderElement])
  useEffect(() => {
    const updateIsProfessionalSticky = () => {
      if (professionalExperienceHeaderElement && professionalExperienceItemsElement) {
        const { top: headerTop } = professionalExperienceHeaderElement.getBoundingClientRect()
        const { top: itemsTop } = professionalExperienceItemsElement.getBoundingClientRect()
        const isProfessionalExperienceSticky = itemsTop < headerTop + professionalExperienceHeaderHeight
        //console.log("isProfessionalExperienceSticky", isProfessionalExperienceSticky)
        setIsProfessionalExperienceSticky(isProfessionalExperienceSticky)
      }
    }
    const updateIsProjectsSticky = () => {
      if (projectsHeaderElement && projectsItemsElement) {
        const { top: headerTop } = projectsHeaderElement.getBoundingClientRect()
        const { top: itemsTop } = projectsItemsElement.getBoundingClientRect()
        const isProjectsSticky = itemsTop < headerTop + projectsHeaderHeight
        //console.log("isProjectsSticky", isProjectsSticky)
        setIsProjectsSticky(isProjectsSticky)
      }
    }
    const updateIsSkillsSticky = () => {
      if (skillsHeaderElement && skillsItemsElement) {
        const { top: headerTop } = skillsHeaderElement.getBoundingClientRect()
        const { top: itemsTop } = skillsItemsElement.getBoundingClientRect()
        const isSkillsSticky = itemsTop < headerTop + skillsHeaderHeight
        //console.log("isSkillsSticky", isSkillsSticky)
        setIsSkillsSticky(isSkillsSticky)
      }
    }
    const handleScroll = () => {
      updateIsProfessionalSticky()
      updateIsProjectsSticky()
      updateIsSkillsSticky()
    }
    handleScroll()
    const contentElement = document.querySelector('.content')
    contentElement?.addEventListener("scroll", handleScroll)
    return () => {
      contentElement?.removeEventListener("scroll", handleScroll)
    }
  }, [
    professionalExperienceHeaderElement, professionalExperienceHeaderHeight, 
    projectsHeaderElement, projectsHeaderHeight,
    skillsHeaderElement, skillsHeaderHeight,
  ])

  const [resumeData, setResumeData] = useState<ResumeData | null>(null)

  // Fetch resume JSON on component mount
  useEffect(() => {
    fetch('./resume.yaml')
      .then(response => response.text())
      .then(text => {
        const data = yaml.load(text)
        //console.log("resume.yaml", data)

        const resumeData = ResumeData.fromJSON(data)
        //console.log("resumeDataYaml", resumeData)

        /*
        fetch('./resume.json')
          .then(response => response.json())
          .then(json => {
            console.log("resume.json", json)
            const resumeData2 = ResumeData.fromJSON(json)
            console.log("resumeDataJson", resumeData2)
          })
        */

        setResumeData(resumeData)
      })
      .catch(error => console.error('Error loading resume data:', error))
  }, [])

  // Show loading state until data is fetched
  if (!resumeData) {
    return <div className="text-center mt-10">Loading...</div>
  }

  const {
    contactName,
    contact,
    summary,
    preferences,
    professionalExperience,
    projects,
    skills,
    patents,
    publications,
    miscellaneous,
    hobbies,
    references,
    citizenship,
  } = resumeData

  const education = isNotRecruiter
    ? resumeData.education
    : (() => {
        const first = Array.from(resumeData.education.entries())[0];
        return first ? new Map([[ first[0], first[1] ]]) : new Map();
      })();

  return (
    <div className="layout">

      <header className="header sticky-bg mb-0 p-0">

        {/* Controls */}
        <div className="p-1 border-1 print:border-0 border-grey rounded sticky-bg flex flex-row gap-x-2 justify-between text-[55%] items-center">
          <div className="flex-1 border-0 border-grey">
            <a target="_blank" rel="noopener noreferrer" href={APP_URL}>{APP_URL}</a> v{appModifiedTimestampString}
          </div>
          <div className="flex-1 flex justify-center items-center no-print">
            Mode:&nbsp;
            <span className="no-print">
              <select
                className="px-1 border rounded"
                value={mode}
                onChange={e => setMode(e.currentTarget.value)}
              >
                <option value="modeRecruiter">Recruiter</option>
                <option value="modeEverything">Everything</option>
              </select>
            </span>
            <span className="print-mode">
              {mode === "modeRecruiter" ? "Recruiter" : "Everything"}
            </span>
          </div>
          <div>
            <a target="_blank" rel="noopener noreferrer" href="./resume.yaml">{APP_DATA}</a> v{resumeModifiedTimestampString}
          </div>
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "Light Mode" : "Dark Mode"}`}
            className={`flex items-center justify-center h-6 p-1 border border-gray-300 rounded no-print ${theme === "light" ? "bg-gray-800 text-white" : "bg-gray-200 text-black"}`}
          >
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg"
                className="lucide lucide-moon"
                width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg"
                className="lucide lucide-sun"
                width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              window.print()
            }}
            title="Print"
            className={`flex items-center justify-center h-6 p-1 border border-gray-300 rounded no-print ${theme === "light" ? "bg-gray-800 text-white" : "bg-gray-200 text-black"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg"
              className="lucide lucide-printer"
              width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M6 9V2h12v7"></path>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <path d="M6 14h12v8H6z"></path>
              <path d="M6 14h12v8H6z"></path>
              <path d="M6 14h12v8H6z"></path>
            </svg>
          </button>
        </div>

        <div className="flex flex-col mx-2 p-0">
          <RenderContact contactName={contactName} contact={contact} summary={summary} />
        </div>

      </header>

      <div className="content mx-2">

        {/* Preferences Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2 print:py-1">
            <h4>Preferences</h4>
          </div>
        </div>
        <div className="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-0 text-[80%]">
          <div className="text-right font-bold">Title:</div>
          <div className="text-left">{preferences.Title}</div>

          <div className="text-right font-bold">Salary:</div>
          <div className="text-left">{preferences.Salary}</div>

          <div className="text-right font-bold">Emphasis:</div>
          <div className="text-left">{preferences.Emphasis.join("/")}</div>

          <div className="text-right font-bold">Technologies:</div>
          <div className="text-left">{preferences.Technologies.join(", ")}</div>

          <div className="text-right font-bold">Locations:</div>
          <div className="text-left">{preferences.Locations.join(", ")} areas</div>
        </div>
        <div className="pb-2" />

        {/* Professional Experience Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div ref={setProfessionalExperienceHeaderElement} className="py-2">
            <h4>Professional Experience</h4>
          </div>
        </div>
        <div ref={setProfessionalExperienceItemsElement}>
          {Array.from(professionalExperience.entries()).map(([keyDateCompany, jobs], idxDateCompany) => {
            const isExpanded = expandedExperience[idxDateCompany] || isNotRecruiter;
            return (
              <div key={idxDateCompany} className="text-[80%] ml-4 mb-2 print:mb-1 last:mb-0">
                {idxDateCompany > 0 && <hr className="my-2 print:my-0" />}
                <div
                  className={`font-bold pb-1 sticky-bg sticky z-9 border-b-4 print:border-b-0 ${isProfessionalExperienceSticky ? (theme === "dark" ? "border-black" : "border-white") : "border-transparent"}`}
                  style={{
                    // fine tuning to:
                    // 1) prevent clipping top of next line of text
                    // 2) prevent text scrolling under from showing through gap
                    top: professionalExperienceHeaderHeight + (isMobile ? 1 : 0),
                  }}>
                  {keyDateCompany}
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className={`lucide inline ml-2 no-print cursor-pointer`}
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                    }}
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    onClick={() => {
                      //console.log("toggleExperience", idxDateCompany, isExpanded)
                      toggleExperience(idxDateCompany)
                    }}
                    >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {jobs.map((job, idxJob) => (
                  <div key={idxJob} className="ml-4">
                    {isExpanded && idxJob > 0 && <hr className="my-2" />}
                    {job.Roles && Array.from(job.Roles.entries()).map(([roleDate, role], idxRole) => (
                      <div key={idxRole}>
                        {roleDate}: <span className="font-bold">{role}</span>
                      </div>
                    ))}
                    {isExpanded &&
                    <>
                      {job.Team && (
                        <div>
                          <span className="font-bold">Team:</span> {job.Team}
                        </div>
                      )}
                      {!job.Team && job.Description && renderDescription(job.Description, true, true)}
                      {job.MajorContributions && (
                        <div>
                          <span className="font-bold">Major Contributions:</span>
                          <ul>
                            {job.MajorContributions.map((detail, i) => (
                              <li key={i}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {job.Products && (
                        <div>
                          <span className="font-bold">Products:</span>
                          <ul>
                            {Array.from(job.Products.entries()).map(([productName, productValue], idxProduct) => (
                              <li key={idxProduct}>
                                <span className="whitespace-nowrap">{productName}</span>:&nbsp;
                                {typeof productValue === "string" ? (
                                  renderPossibleLink(productValue)
                                ) : (
                                  <ul>
                                    {Object.entries(productValue as Record<string, string>).map(([key, value], idxValue) => (
                                      <li key={idxValue}>{key}: {renderPossibleLink(value)}</li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {job.Team && job.Description && renderDescription(job.Description, true, true)}
                      {job.Info && (
                        <div>
                          <span className="font-bold">Info:</span>
                          <ul>
                            {job.Info.map((infoLink, idxInfo) => (
                              <li key={idxInfo}><a href={infoLink.toString()}>{infoLink.toString()}</a></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Projects Section */}
        {isNotRecruiter && (
          <>
            <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
              <hr className="m-0 p-0" />
              <div ref={setProjectsHeaderElement} className="py-2 print:py-1">
                <h4>Projects</h4>
              </div>
            </div>
            <div ref={setProjectsItemsElement}>
              {Array.from(projects.entries()).map(([keyDateProject, project], idxProject) => (
                <div key={idxProject} className="text-[80%] ml-4 mb-2 last:mb-0">
                  {idxProject > 0 && <hr className="my-2 print:my-1" />}
                  <div 
                    className={`font-bold pb-1 sticky-bg sticky z-9 border-b-4 print:border-b-0 ${isProjectsSticky ? (theme === "dark" ? "border-black" : "border-white") : "border-transparent"}`}
                    style={{
                      // fine tuning to:
                      // 1) prevent clipping top of next line of text
                      // 2) prevent text scrolling under from showing through gap
                      top: projectsHeaderHeight + (isMobile ? 1 : 0),
                    }}>
                    <span>{keyDateProject}</span>
                    {project.Links && (
                      <span>
                        &nbsp;-&nbsp;{renderPossibleLink(project.Links[0])}
                      </span>
                    )}
                  </div>
                  <div>
                    {project.Roles && Array.from(project.Roles.entries()).map(([roleDate, role], idxRole) => (
                      <div key={idxRole}>
                        {roleDate}: <span className="font-bold">{role}</span>
                      </div>
                    ))}
                    {project.Description && renderDescription(project.Description, false, true)}
                    {project.Links && project.Links.length > 1 && (
                      <ul>
                        {project.Links.slice(1).map((url, idx) => (
                          <li key={idx}>{renderPossibleLink(url)}</li>
                        ))}
                      </ul>
                    )}
                    {project.Info && ProjectInfo(project.Info)}
                    {project.Projects && (
                      <>
                        <div className="my-1 font-bold">Projects:</div>
                        <ul className="ml-0 space-y-1">
                        {Array.from(project.Projects.entries()).map(([projectName, projectDetails], idxProject) => (
                          <li key={idxProject}>
                            <span className="font-bold italic">{projectName}</span>
                            {projectDetails.Links && (
                              <span>
                                &nbsp;-&nbsp;{renderPossibleLink(projectDetails.Links[0])}
                              </span>
                            )}
                            <div>
                              {ProjectDetails(projectDetails)}
                            </div>
                          </li>
                        ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && isNotRecruiter && (
          <>
            {(() => {
              const [header, ...rest] = skills
              return (
                <>
                  <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
                    <hr className="m-0 p-0" />
                    <div ref={setSkillsHeaderElement} className="py-2 print:py-1">
                      <div 
                        className={`mr-2 grid grid-cols-[1fr_1fr_auto_auto] gap-x-4 font-bold items-center border-b-4 print:border-b-0 ${isSkillsSticky ? (theme === "dark" ? "border-black" : "border-white") : "border-transparent"}`}
                        >
                        <div className="my-2">{header.Skill}s</div>
                        <div className="mx-2 text-right">{header.Level}</div>
                        <div className="text-right">{header.From}</div>
                        <div className="text-right">{header.Last}</div>
                      </div>
                    </div>
                  </div>
                  <div ref={setSkillsItemsElement}
                    className="mr-2 grid grid-cols-[1fr_auto_auto_auto] gap-x-4 text-[80%]"
                    >
                    {rest.map((skill, idx) => (
                      <React.Fragment key={idx}>
                        <div className="ml-4">• {skill.Skill}</div>
                        <div className="mx-1 italic text-right">{skill.Level}</div>
                        <div className="mx-1 italic text-right">{skill.From}</div>
                        <div className="mx-1 italic text-right">{skill.Last}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </>
              )
            })()}
            <div className="pb-2" />
          </>
        )}

        {/* Patents Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2 print:py-1">
            <h4>Patents</h4>
          </div>
        </div>
        {Array.from(patents.entries()).map(([_, patent], idx) => (
          <div key={idx} className="ml-4 text-[80%]">
            {renderPossibleLink(patent.Link)} - <span className="italic">{patent.Title}</span>
          </div>
        ))}
        <div className="pb-2" />

        {/* Publications Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2 print:py-1">
            <h4>Publications</h4>
          </div>
        </div>
        {Array.from(publications.entries()).map(([title, publication], idx) => (
          <div key={idx} className="ml-4 text-[80%]">
            {renderPossibleLink(publication.Link)} - <span className="italic">{title}</span>
            <div className="ml-4">{publication.Publisher}</div>
          </div>
        ))}
        <div className="pb-2" />

        {/* Education Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2 print:py-1">
            <h4>Education</h4>
          </div>
        </div>
        {Array.from(education.entries()).map(([where, what], idx) => (
          <div key={idx} className="ml-4 text-[80%]">
            <span className="font-bold">{where}</span> - <span className="italic">{what.toString()}</span>
          </div>
        ))}
        <div className="pb-2" />

        {/* Miscellaneous Section */}
        {miscellaneous && isNotRecruiter && (
          <>
            <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
              <hr className="m-0 p-0" />
              <div className="py-2 print:py-1">
                <h4>Miscellaneous</h4>
              </div>
            </div>
            <div className="ml-4 text-[80%]">
              {renderLineOrLines(miscellaneous)}
            </div>
            <div className="pb-2" />
          </>
        )}

        {/* Hobbies Section */}
        {isNotRecruiter && (
          <>
          <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
            <hr className="m-0 p-0" />
            <div className="py-2 print:py-1">
              <h4>Hobbies</h4>
            </div>
          </div>
          <div className="ml-4 text-[80%]">
            {hobbies.join(", ")}
          </div>
          <div className="pb-2" />
          </>
        )}

        {/* References Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2 print:py-1">
            <h4>References</h4>
          </div>
        </div>
        {Array.from(references.entries()).map(([referenceName, reference], idx) => (
          <div key={idx} className="ml-4 text-[80%]">
            <span className="font-bold">{referenceName}</span> - <span className="italic">{renderLineOrLines(reference, isNotRecruiter ? null : 1)}</span>
          </div>
        ))}
        <div className="pb-2" />

        {/* Citizenship Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2 print:py-1">
            <h4>Citizenship</h4>
          </div>
        </div>
        <div className="ml-4 text-[80%]">
          {citizenship}
        </div>
        <div className="pb-2" />

      </div>
      <div className="pb-2" />

    </div>
  )
}

export default App
