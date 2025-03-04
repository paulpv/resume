import { useEffect, useLayoutEffect, useState } from 'react'
import { ResumeData } from './resume'

declare const APP_MODIFIED_TIMESTAMP: string
declare const RESUME_MODIFIED_TIMESTAMP: string

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

        <button
          onClick={toggleTheme}
          className={`absolute top-0 right-0 flex items-center justify-center h-6 p-1 border border-gray-300 rounded no-print ${
            theme === "light" ? "bg-gray-800 text-white" : "bg-gray-200 text-black"
          }`}
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

        <div className="flex flex-col m-0 p-0">

          {/* Contact */}
          <table className="w-full border-collapse" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td valign="middle">
                  <div className="text-[140%] whitespace-nowrap font-bold">{contactName}</div>
                  <div className="text-[110%]"><a href={contact.Links.Resume.toString()}>{contact.Links.Resume.toString()}</a></div>
                </td>
                <td valign="middle" className="text-[80%] text-right px-2 border-r border-black whitespace-nowrap">
                  {(() => {
                    const [first, ...rest] = contact.Address.split(',');
                    return (
                      <>
                        <div>{first.trim()}</div>
                        {rest.length > 0 && <div>{rest.join(',').trim()}</div>}
                      </>
                    );
                  })()}
                  <div>{contact.Phone[0]}</div>
                </td>
                <td valign="middle" className="text-[60%] text-right pl-2">
                  <div>Email:</div>
                  <div>LinkedIn:</div>
                  <div>GitHub:</div>
                  <div>StackOverflow:</div>
                </td>
                <td valign="middle" className="text-[60%] pl-1 pr-2">
                  <div><a href={`mailto:${contact.Email}`}>{contact.Email}</a></div>
                  <div><a href={contact.Links.LinkedIn.toString()}>{contact.Links.LinkedIn.toString()}</a></div>
                  <div><a href={contact.Links.GitHub.toString()}>{contact.Links.GitHub.toString()}</a></div>
                  <div><a href={contact.Links.StackOverflow.toString()}>{contact.Links.StackOverflow.toString()}</a></div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Summary */}
          {summary && (
            <div className="mb-2 p-0">
              <span className="text-[86%] font-semibold">Summary:</span>
              <span className="text-[68%] pl-2">{summary}</span>
            </div>
          )}

        </div>

      </header>

      <div className="content mx-2 pb-2">

        {/* Objective */}
        <div className="m-0 p-0 sticky top-0 z-10 sticky-bg">
          <hr className="m-0 p-0"/>
          <div className="py-2">
            <h4>Objective</h4>
          </div>
        </div>
        <div className="pb-2">
          <table className="w-full border-collapse" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td className="pr-2 text-right whitespace-nowrap text-[80%] font-semibold">
                  Preferred Title:
                </td>
                <td className="whitespace-nowrap text-[80%]">
                  {objective.Title}
                </td>
              </tr>
              <tr>
                <td className="pr-2 text-right whitespace-nowrap text-[80%] font-semibold">
                  Preferred Emphasis:
                </td>
                <td className="whitespace-nowrap text-[80%]">
                  {objective.Emphasis}
                </td>
              </tr>
              <tr>
                <td className="pr-2 text-right whitespace-nowrap text-[80%] font-semibold">
                  Preferred Technologies:
                </td>
                <td className="whitespace-nowrap text-[80%]">
                  {objective.Technologies}
                </td>
              </tr>
              <tr>
                <td className="pr-2 text-right whitespace-nowrap text-[80%] font-semibold">
                  Preferred Locations:
                </td>
                <td className="whitespace-nowrap text-[80%]">
                  {objective.Locations.join(", ")} areas
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Employment */}
        <div className="m-0 p-0 sticky top-0 z-10 sticky-bg">
          <hr className="m-0 p-0"/>
          <div ref={setEmploymentHeaderElement} className="py-2">
            <h4>Employment</h4>
          </div>
        </div>
        <table className="w-full border-collapse" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td colSpan={2}>
                <div>
                  {employment && Array.from(employment.entries()).map(([keyDateCompany, jobs], idxDateCompany) => (
                    <div key={idxDateCompany}>
                      {idxDateCompany > 0 && <hr className="ml-4 mr-8 my-2" />}
                      <div className="text-[80%] mb-4 last:mb-0">
                        <div className="pl-4">
                          <div
                            className="font-bold pb-1 sticky z-9 sticky-bg"
                            style={{ top: employmentHeaderHeight }}
                            >
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
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <hr/>

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

        {/* Education */}
        {education && (
        <table className="w-full border-collapse" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td colSpan={2}>
                <div><h4>Education</h4></div>
                {education.map((job, idx) => (
                  <div key={idx} className="text-[80%]">
                    <div className="pl-4">
                      <div className="font-bold pt-1">{job.Institution}</div>
                      <div className="italic">{job.Study}</div>
                    </div>
                  </div>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
        )}

      </div>

      <footer className="footer sticky-bg flex w-full justify-between items-center py-1 text-[70%]">
        <span className='pl-2'>
          <a href="./resume.json">resume.json</a> v{resumeModifiedTimestampString}
        </span>
        <span className='pr-2'>
          <a href="https://github.com/paulpv/resume/blob/main/src/App.tsx">App</a> v{appModifiedTimestampString}
        </span>
      </footer>

    </div>
  )
}

export default App
