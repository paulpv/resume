import { useEffect, useState } from 'react'
import { ResumeData } from './resume'

declare const APP_MODIFIED_TIMESTAMP: string
declare const RESUME_MODIFIED_TIMESTAMP: string

function timeToYYYYMMDDHHMM(time: Date): string {
  const pad = (num: number) => num.toString().padStart(2, '0')
  return `${time.getFullYear()}/${pad(time.getMonth() + 1)}/${pad(time.getDate())} ${pad(time.getHours())}:${pad(time.getMinutes())}`
}

const appModifiedTimestampString = timeToYYYYMMDDHHMM(new Date(APP_MODIFIED_TIMESTAMP))
const resumeModifiedTimestampString = timeToYYYYMMDDHHMM(new Date(RESUME_MODIFIED_TIMESTAMP))

function App() {
  // Initialize theme from localStorage if present, otherwise use system preference
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme")
    return stored ? stored : (darkMediaQuery.matches ? "dark" : "light")
  });

  // Tracks if the user has manually set a theme
  const [userSetTheme, setUserSetTheme] = useState(() => {
    return localStorage.getItem("theme") !== null
  });

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

  const [resumeData, setResumeData] = useState<ResumeData | null>(null)

  // Fetch resume JSON on component mount
  useEffect(() => {
    fetch('./resume.json')
      .then(response => response.json())
      .then(data => setResumeData(data))
      .catch(error => console.error('Error loading resume data:', error))
  }, [])

  // Show loading state until data is fetched
  if (!resumeData) {
    return <div className="text-center mt-10">Loading...</div>
  }

  const name = Object.keys(resumeData)[0]
  const contact = resumeData[name]
  //const summary = resumeData.Summary
  const objective = resumeData.Objective
  const employment = resumeData.Employment
  //const projects = resumeData.Projects
  //const skills = resumeData.Skills
  //const education = resumeData.Education

  return (
    <div className="m-2 relative">

      <button
        onClick={toggleTheme}
        className="absolute top-0 right-0 h-5 p-1 border border-gray-300 rounded"
      >
        {theme === "light" ? (
          <svg xmlns="http://www.w3.org/2000/svg"
            className="lucide lucide-moon"
            width="12" height="12" viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg"
            className="lucide lucide-sun"
            width="12" height="12" viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
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

      {/* Contact */}
      <table className="w-full border-collapse" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td valign="middle">
              <div className="text-[140%] whitespace-nowrap font-bold">{name}</div>
              <div className="text-[120%]"><a href={contact.Links.Resume.toString()}>{contact.Links.Resume.toString()}</a></div>
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

      <hr/>

      {/* Objective */}
      <table className="w-full border-collapse" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td colSpan={2}>
              <div><h3>Objective:</h3></div>
              <div className="py-1 pl-4 text-[80%]"><i>{objective.Emphasis}</i></div>
            </td>
          </tr>
          <tr>
            <td className="pr-2 text-right whitespace-nowrap text-[80%]">
              <div>Preferred Job Category:</div>
              <div>Preferred Locations:</div>
            </td>
            <td className="whitespace-nowrap text-[80%]">
              <div>{objective.Title}</div>
              <div>{objective.Locations.join(", ")} areas</div>
            </td>
          </tr>
        </tbody>
      </table>

      <hr/>

      {/* Employment */}
      <table className="w-full border-collapse" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td colSpan={2}>
              <div><h3>Employment:</h3></div>
              {employment ? employment.map((job, idx) => (
                <div key={idx}>
                  <div className="py-1 pl-4 text-[100%]">
                    <div className="font-bold pt-1">{job.Company}</div>
                    <div className="italic">{job.Duration} : {job.Position}</div>
                    <ul className="list-disc list-inside pl-0">
                      {job.Details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )) :
                <div className="py-1 pl-4 text-[80%]">No employment history</div>
              }
            </td>
          </tr>
        </tbody>
      </table>

      <hr/>

      {/* Summary Section * /}
      {summary && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold border-b border-gray-300 pb-1 mb-2">Summary</h2>
          <p className="text-gray-800">{summary}</p>
        </section>
      )}
      */}

      {/* Employment Section * /}
      {employment && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold border-b border-gray-300 pb-1 mb-4">Employment</h2>
          {employment.map((job, idx) => (
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
      {skills && (
        <section>
          <h2 className="text-2xl font-semibold border-b border-gray-300 pb-1 mb-2">Skills</h2>
          <p className="text-gray-800">{skills.join(', ')}</p>
        </section>
      )}
      */}

      {/* Education Section * /}
      {education && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold border-b border-gray-300 pb-1 mb-2">Education</h2>
          {education.map((edu, idx) => (
            <div className="mb-2" key={idx}>
              <h3 className="text-xl font-medium">{edu.degree}, {edu.institution}</h3>
              <p className="text-gray-600">Class of {edu.graduationYear}</p>
            </div>
          ))}
        </section>
      )}
      */}
      
      <footer className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 p-2">
        <table className="w-full border-collapse" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td className="text-left text-[60%]">
                <a href="./resume.json">resume.json</a> v{resumeModifiedTimestampString}
              </td>
              <td className="text-right text-[60%]">
                <a href="https://github.com/paulpv/resume/blob/main/src/App.tsx">App</a> v{appModifiedTimestampString}
              </td>
            </tr>
          </tbody>
        </table>
      </footer>

    </div>
  )
}

export default App
