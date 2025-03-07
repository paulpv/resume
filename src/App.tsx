import React, { useEffect, useLayoutEffect, useState } from 'react'
import { ResumeData, Contact, ProjectDetail } from './resume'

declare const APP_MODIFIED_TIMESTAMP: string
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

function renderLineOrLines(lineOrLines: string | readonly string[]): React.ReactNode {
  const lines = typeof lineOrLines === 'string' ? [lineOrLines] : lineOrLines;
  return (
    <>
      {lines.map((line, index) => (
        <React.Fragment key={`desc-${index}`}>
          {renderPossibleLink(line)}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

function renderDescription(description: string | readonly string[], showHeader?: boolean) {
  if (showHeader === undefined) {
    showHeader = true;
  }
  const lines = typeof description === 'string' ? [description] : description;
  return (
    <>
      {showHeader && <div className="font-bold">Description:</div>}
      <div className="ml-6 italic">{renderLineOrLines(lines)}</div>
    </>
  );
}

function ProjectInfo(infoItems: ReadonlyArray<any>) {
  return (
    <ul className="ml-4 list-disc list-inside">
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
            <ul key={idx} className="ml-2 list-disc list-inside">
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
    <div className="ml-0">
      {projectDetails.Description && renderDescription(projectDetails.Description, false)}
      {projectDetails.Info && ProjectInfo(projectDetails.Info)}
      {projectDetails.Links && projectDetails.Links.length > 1 && (
        <ul className="ml-4 list-disc list-inside">
          {projectDetails.Links.slice(1).map((url, idx) => (
            <li key={idx}>{renderPossibleLink(url)}</li>
          ))}
        </ul>
      )}
      {projectDetails.SubProjects && (
        <ul className="ml-4 list-disc list-inside space-y-1">
          {Array.from(projectDetails.SubProjects.entries()).map(([subProjectName, subProjectDetails], idx) => (
            <li key={idx}>
              <span className="font-bold italic">{renderPossibleLink(subProjectName)}:</span>
              {subProjectDetails.Links && (
                <span>
                  &nbsp;{renderPossibleLink(subProjectDetails.Links[0])}
                </span>
              )}
              <div className="ml-0">
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
  const [employmentHeaderElement, setEmploymentHeaderElement] = useState<HTMLDivElement | null>(null)
  const [employmentHeaderHeight, setEmploymentHeaderHeight] = useState(0)
  const [projectsHeaderElement, setProjectsHeaderElement] = useState<HTMLDivElement | null>(null)
  const [projectsHeaderHeight, setProjectsHeaderHeight] = useState(0)
  useLayoutEffect(() => {
    const updateEmploymentHeaderHeight = () => {
      if (employmentHeaderElement) {
        const { height } = employmentHeaderElement.getBoundingClientRect()
        setEmploymentHeaderHeight(height)
      }
    }
    const updateProjectsHeaderHeight = () => {
      if (projectsHeaderElement) {
        const { height } = projectsHeaderElement.getBoundingClientRect()
        setProjectsHeaderHeight(height)
      }
    }
    updateEmploymentHeaderHeight()
    updateProjectsHeaderHeight()
    window.addEventListener('resize', updateEmploymentHeaderHeight)
    window.addEventListener('resize', updateProjectsHeaderHeight)
    return () => {
      window.removeEventListener('resize', updateEmploymentHeaderHeight)
      window.removeEventListener('resize', updateProjectsHeaderHeight)
    }
  }, [employmentHeaderElement, projectsHeaderElement])

  const [resumeData, setResumeData] = useState<ResumeData | null>(null)

  // Fetch resume JSON on component mount
  useEffect(() => {
    fetch('./resume.json')
      .then(response => response.json())
      .then(data => {
        const resumeData = ResumeData.fromJSON(data)
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
    employment,
    projects,
    skills,
    patents,
    publications,
    education,
    miscellaneous,
    hobbies,
    references,
  } = resumeData

  return (
    <div className="layout">

      <header className="header sticky-bg mx-2 mb-0 p-0">

        <div className="sticky-bg flex flex-row justify-between py-1 text-[55%] items-center">
          <div className="flex-1">
            <a href="https://github.com/paulpv/resume/blob/main/src/App.tsx">App</a> v{appModifiedTimestampString}
          </div>
          <div className="mr-4">
            <a href="./resume.json">resume.json</a> v{resumeModifiedTimestampString}
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
        </div>

        <div className="flex flex-col m-0 p-0">
          <RenderContact contactName={contactName} contact={contact} summary={summary} />
        </div>

      </header>

      <div className="content mx-2">

        {/* Preferences Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2">
            <h4>Preferences</h4>
          </div>
        </div>
        <div className="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-0 text-[80%]">
          <div className="text-right font-bold">Title:</div>
          <div className="text-left">{preferences.Title}</div>

          <div className="text-right font-bold">Emphasis:</div>
          <div className="text-left">{preferences.Emphasis}</div>

          <div className="text-right font-bold">Technologies:</div>
          <div className="text-left">{preferences.Technologies}</div>

          <div className="text-right font-bold">Locations:</div>
          <div className="text-left">{preferences.Locations.join(", ")} areas</div>
        </div>
        <div className="pb-2" />

        {/* Employment Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div ref={setEmploymentHeaderElement} className="py-2">
            <h4>Employment</h4>
          </div>
        </div>
        {Array.from(employment.entries()).map(([keyDateCompany, jobs], idxDateCompany) => (
          <div key={idxDateCompany} className="text-[80%] ml-4 mb-2 last:mb-0">
            {idxDateCompany > 0 && <hr className="my-2" />}
            <div className="font-bold pb-1 sticky-bg sticky z-9" style={{ top: employmentHeaderHeight + (isMobile ? 2 : 0) }}>
              {keyDateCompany}
            </div>
            {jobs.map((job, idxJob) => (
              <div key={idxJob} className="ml-4">
                {idxJob > 0 && <hr className="my-2" />}
                {job.Roles && Array.from(job.Roles.entries()).map(([roleDate, role], idxRole) => (
                  <div key={idxRole}>
                    {roleDate}: <span className="font-bold">{role}</span>
                  </div>
                ))}
                {job.Team && (
                  <div>
                    <span className="font-bold">Team:</span> {job.Team}
                  </div>
                )}
                {!job.Team && job.Description && renderDescription(job.Description)}
                {job.MajorContributions && (
                  <div>
                    <span className="font-bold">Major Contributions:</span>
                    <ul className="ml-0 list-disc list-inside">
                      {job.MajorContributions.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {job.Products && (
                  <div>
                    <span className="font-bold">Products:</span>
                    <ul className="ml-0 list-disc list-inside">
                      {Array.from(job.Products.entries()).map(([productName, productValue], idxProduct) => (
                        <li key={idxProduct}>
                          <span className="whitespace-nowrap">{productName}</span>:&nbsp;
                          {typeof productValue === "string" ? (
                            renderPossibleLink(productValue)
                          ) : (
                            <ul className="ml-0 list-disc list-inside">
                              {Object.entries(productValue as Record<string, string>).map(([key, value], idxValue) => (
                                <li key={idxValue}>
                                  {key}: <a href={value.toString()}>{value.toString()}</a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {job.Team && job.Description && renderDescription(job.Description)}
                {job.Info && (
                  <div>
                    <span className="font-bold">Info:</span>
                    <ul className="ml-0 list-disc list-inside">
                      {job.Info.map((infoLink, idxInfo) => (
                        <li key={idxInfo}><a href={infoLink.toString()}>{infoLink.toString()}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Projects Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div ref={setProjectsHeaderElement} className="py-2">
            <h4>Projects</h4>
          </div>
        </div>
        {Array.from(projects.entries()).map(([keyDateProject, project], idxProject) => (
          <div key={idxProject} className="text-[80%] ml-4 mb-2 last:mb-0">
            {idxProject > 0 && <hr className="my-2" />}
            <div className="font-bold pb-1 sticky-bg sticky z-9" style={{ top: projectsHeaderHeight + (isMobile ? 2 : 0) }}>
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
              {project.Description && renderDescription(project.Description, false)}
              {project.Links && project.Links.length > 1 && (
                <ul className="ml-4 list-disc list-inside">
                  {project.Links.slice(1).map((url, idx) => (
                    <li key={idx}>{renderPossibleLink(url)}</li>
                  ))}
                </ul>
              )}
              {project.Info && ProjectInfo(project.Info)}
              {project.Projects && (
                <>
                  <div className="my-1 font-bold">Projects:</div>
                  <ul className="ml-4 list-disc list-inside space-y-1">
                  {Array.from(project.Projects.entries()).map(([projectName, projectDetails], idxProject) => (
                    <li key={idxProject}>
                      <span className="font-bold italic">{projectName}</span>
                      {projectDetails.Links && (
                        <span>
                          &nbsp;-&nbsp;{renderPossibleLink(projectDetails.Links[0])}
                        </span>
                      )}
                      <div className="ml-0">
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

        {/* Skills Section */}
        {(() => {
          const [header, ...rest] = skills
          return (
            <>
              <div className="sticky-bg sticky top-0 z-10">
                <hr className="m-0 p-0" />
                <div className="mr-2 grid grid-cols-[1fr_1fr_auto_auto] gap-x-4 font-bold items-center">
                  <div className="my-2">{header.Skill}s</div>
                  <div className="mx-2 text-right">{header.Level}</div>
                  <div className="text-right">{header.From}</div>
                  <div className="text-right">{header.Last}</div>
                </div>
              </div>
              <div className="mr-2 grid grid-cols-[1fr_auto_auto_auto] gap-x-4 text-[80%]">
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

        {/* Patents Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2">
            <h4>Patents</h4>
          </div>
        </div>
        {Array.from(patents.entries()).map(([patentNumber, patent], idx) => (
          <div key={idx} className="ml-4 text-[80%]">
            {patentNumber} - {patent.Title}
            <div className="ml-4 italic">{renderPossibleLink(patent.Link)}</div>
          </div>
        ))}
        <div className="pb-2" />

        {/* Publications Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2">
            <h4>Publications</h4>
          </div>
        </div>
        {Array.from(publications.entries()).map(([title, publication], idx) => (
          <div key={idx} className="ml-4 text-[80%]">
            <span className="italic">{title}</span>
            <div className="ml-4">{publication.Publisher}<br/>{renderPossibleLink(publication.Link)}</div>
          </div>
        ))}
        <div className="pb-2" />

        {/* Education Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2">
            <h4>Education</h4>
          </div>
        </div>
        {Array.from(education.entries()).map(([where, what], idx) => (
          <div key={idx} className="ml-4 text-[80%]">
            <div className="font-bold">{where}</div>
            <div className="italic">{what.toString()}</div>
          </div>
        ))}
        <div className="pb-2" />

        {/* Miscellaneous Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2">
            <h4>Miscellaneous</h4>
          </div>
        </div>
        <div className="ml-4 text-[80%]">
          {renderLineOrLines(miscellaneous)}
        </div>
        <div className="pb-2" />

        {/* Hobbies Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2">
            <h4>Hobbies</h4>
          </div>
        </div>
        <div className="ml-4 text-[80%]">
          {hobbies.join(", ")}
        </div>
        <div className="pb-2" />

        {/* References Section */}
        <div className="m-0 p-0 sticky-bg sticky top-0 z-10">
          <hr className="m-0 p-0" />
          <div className="py-2">
            <h4>References</h4>
          </div>
        </div>
        {Array.from(references.entries()).map(([referenceName, reference], idx) => (
          <div key={idx} className="ml-4 text-[80%]">
            <div className="font-bold">{referenceName}</div>
            <div className="ml-4 italic">
              {renderLineOrLines(reference)}
            </div>
          </div>
        ))}
        <div className="pb-2" />

      </div>
      <div className="pb-2" />

    </div>
  )
}

export default App
