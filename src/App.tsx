import { useEffect, useLayoutEffect, useState } from 'react'
import { ResumeData, Contact } from './resume'

declare const APP_MODIFIED_TIMESTAMP: string
declare const RESUME_MODIFIED_TIMESTAMP: string

const MOBILE_BREAKPOINT = 821 // iPad Air is 820x1180

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mediaQueryList.matches)
    try {
      mediaQueryList.addEventListener('change', listener)
    } catch {
      mediaQueryList.addListener(listener)
    }
    return () => {
      try {
        mediaQueryList.removeEventListener('change', listener)
      } catch {
        mediaQueryList.removeListener(listener)
      }
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

function isUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

function RenderPossibleLink(value: string) {
  if (isUrl(value)) {
    return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>;
  } else {
    return <span>{value}</span>;
  }
}

function RenderDescription(lines: readonly string[]): React.ReactNode {
  return (
    <>
      {lines.flatMap((line, index) => {
        const element = isUrl(line) ? (
          <a key={`link-${index}`} href={line} target="_blank" rel="noopener noreferrer">
            {line}
          </a>
        ) : (
          <span key={`text-${index}`}>{line}</span>
        );
        const br = index < lines.length - 1 ? [<br key={`br-${index}`} />] : [];
        return [element, ...br];
      })}
    </>
  );
}

function Description(description: ReadonlyArray<string>) {
  return (
    <div className="ml-4">
      <div className="font-semibold">Description:</div>
      <div className="ml-4 italic">{RenderDescription(description)}</div>
    </div>
  );
}

type RenderContactProps = {
  contactName: string;
  contact: Contact;
  summary: string;
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
          <div className="text-right font-semibold">Resume:</div>
          <div className="text-left">{linkResume}</div>
          <div className="text-right font-semibold">LinkedIn:</div>
          <div className="text-left">{linkLinkedIn}</div>
          <div className="text-right font-semibold">GitHub:</div>
          <div className="text-left">{linkGitHub}</div>
          <div className="text-right font-semibold">StackOverflow:</div>
          <div className="text-left">{linkStackOverflow}</div>
        </div>
        {summary && (
          <div className="mx-0 my-1 p-0">
            <div className="text-[94%] font-semibold">Summary:</div>
            <div className="text-[86%] text-pretty">{summary}</div>
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
            <div className="text-right font-semibold">Resume:</div>
            <div className="text-left">{linkResume}</div>
            <div className="text-right font-semibold">LinkedIn:</div>
            <div className="text-left">{linkLinkedIn}</div>
            <div className="text-right font-semibold">GitHub:</div>
            <div className="text-left">{linkGitHub}</div>
            <div className="text-right font-semibold">StackOverflow:</div>
            <div className="text-left">{linkStackOverflow}</div>
          </div>
        </div>
        {summary && (
          <div className="mb-2 p-0">
            <span className="text-[86%] font-semibold">Summary:</span>
            <span className="text-[68%] pl-2">{summary}</span>
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

  const [employmentHeaderElement, setEmploymentHeaderElement] = useState<HTMLDivElement | null>(null)
  const [employmentHeaderHeight, setEmploymentHeaderHeight] = useState(0)
  const isMobile = isMobileWidth()
  useLayoutEffect(() => {
    if (employmentHeaderElement) {
      const updateHeight = () => {
        const { height } = employmentHeaderElement.getBoundingClientRect()
        setEmploymentHeaderHeight(height)
      }
      updateHeight()
      window.addEventListener('resize', updateHeight)
      return () => window.removeEventListener('resize', updateHeight)
    }
  }, [employmentHeaderElement])

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
    objective,
    employment,
    //projects,
    //skills,
    education,
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

      <div className="content mx-2 pb-2">

        {/* Objective Section */}
        <div className="m-0 p-0 sticky top-0 z-10 sticky-bg">
          <hr className="m-0 p-0" />
          <div className="py-2">
            <h4>Objective</h4>
          </div>
        </div>
        <div className="pb-2 grid grid-cols-[max-content_1fr] gap-x-2 gap-y-0 text-[80%]">
          <div className="text-right font-semibold">Preferred Title:</div>
          <div className="text-left">{objective.Title}</div>

          <div className="text-right font-semibold">Preferred Emphasis:</div>
          <div className="text-left">{objective.Emphasis}</div>

          <div className="text-right font-semibold">Preferred Technologies:</div>
          <div className="text-left">{objective.Technologies}</div>

          <div className="text-right font-semibold">Preferred Locations:</div>
          <div className="text-left">{objective.Locations.join(", ")} areas</div>
        </div>

        {/* Employment Section */}
        <div className="m-0 p-0 sticky top-0 z-10 sticky-bg">
          <hr className="m-0 p-0" />
          <div ref={setEmploymentHeaderElement} className="py-2">
            <h4>Employment</h4>
          </div>
        </div>
        {employment && Array.from(employment.entries()).map(([keyDateCompany, jobs], idxDateCompany) => (
          <div key={idxDateCompany}>
            {idxDateCompany > 0 && <hr className="ml-4 mr-8 my-2" />}
            <div className="text-[80%] mb-4 last:mb-0">
              <div className="pl-4">
                <div className="font-bold pb-1 sticky z-9 sticky-bg" style={{ top: employmentHeaderHeight + (isMobile ? 2 : 0) }}>
                  {keyDateCompany}
                </div>
                {jobs.map((job, idxJob) => (
                  <div key={idxJob}>
                    {idxJob > 0 && <hr className="ml-4 mr-8 my-2" />}
                    <div className="mb-4 last:mb-0">
                      {job.Roles && Array.from(job.Roles.entries()).map(([roleDate, role], idxRole) => (
                        <div key={idxRole} className="ml-4">{roleDate}: <span className="font-semibold">{role}</span></div>
                      ))}
                      {job.Team && (
                        <div className="ml-4">
                          <span className="font-semibold">Team:</span> {job.Team}
                        </div>
                      )}
                      {!job.Team && job.Description && Description(job.Description)}
                      {job.MajorContributions && (
                        <div className="ml-4">
                          <span className="font-semibold">Major Contributions:</span>
                          <ul className="list-disc list-inside">
                            {job.MajorContributions.map((detail, i) => (
                              <li key={i}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {job.Products && (
                        <div className="ml-4">
                          <span className="font-semibold">Products:</span>
                          <ul className="list-disc list-inside">
                            {Array.from(job.Products.entries()).map(([productName, productValue], idxProduct) => (
                              <li key={idxProduct}>
                                <span className="whitespace-nowrap">{productName}</span>:&nbsp;
                                {typeof productValue === "string" ? (
                                  RenderPossibleLink(productValue)
                                ) : (
                                  <ul className="list-disc list-inside ml-4">
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
                      {job.Team && job.Description && Description(job.Description)}
                      {job.Info && (
                        <div className="ml-4">
                          <span className="font-semibold">Info:</span>
                          <ul className="list-disc list-inside">
                            {job.Info.map((infoLink, idxInfo) => (
                              <li key={idxInfo}><a href={infoLink.toString()}>{infoLink.toString()}</a></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <hr />

        {/* Projects Section * /}
        {projects && (
          <section className="mb-6">
            <h2 className="text-2xl font-semibold border-b border-gray-300 pb-1 mb-4">Projects</h2>
            {projects.map((job, idx) => (
              <div className="mb-4" key={idx}>
                <h3 className="text-xl font-medium">{job.position} – {job.company}</h3>
                <p className="text-gray-600">{job.duration}</p>
                <ul className="list-disc list-inside ml-5 text-gray-700">
                  {job.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
        */}

        {/* Skills Section * /}
        {false && skills && (
          <section>
            <h2 className="text-2xl font-semibold border-b border-gray-300 pb-1 mb-2">Skills</h2>
            <p className="text-gray-800">{skills.join(', ')}</p>
          </section>
        )*/}


        {/* Education Section */}
        {education && (
          <section>
            <h4>Education</h4>
            <div className="space-y-1">
              {education.map((job, idx) => (
                <div key={idx} className="ml-4 text-[80%]">
                  <div className="font-bold">{job.Institution}</div>
                  <div className="italic">{job.Study}</div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

    </div>
  )
}

export default App
