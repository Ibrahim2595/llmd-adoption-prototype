import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Code of Conduct — llm-d Community',
  description: 'Code of Conduct and community guidelines for the llm-d project',
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-10 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4">{children}</p>
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="text-gray-700 dark:text-gray-300 list-disc pl-5 mb-4 flex flex-col gap-1.5">{children}</ul>
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors"
    >
      {children}
    </a>
  )
}

export default function CodeOfConductPage() {
  return (
    <article className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-50 mb-2">Code of Conduct</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        Source:{' '}
        <A href="https://github.com/llm-d/llm-d/blob/main/CODE_OF_CONDUCT.md">
          github.com/llm-d/llm-d/CODE_OF_CONDUCT.md
        </A>
      </p>

      <H2 id="our-pledge">Our Pledge</H2>
      <P>
        In the interest of fostering an open and welcoming environment, we as contributors and
        maintainers pledge to making participation in our project and our community a
        harassment-free experience for everyone, regardless of age, body size, disability,
        ethnicity, sex characteristics, gender identity and expression, level of experience,
        education, socio-economic status, nationality, personal appearance, race, religion, or
        sexual identity and orientation.
      </P>

      <H2 id="our-standards">Our Standards</H2>
      <P>Examples of behavior that contributes to creating a positive environment include:</P>
      <UL>
        <li>Using welcoming and inclusive language</li>
        <li>Being respectful of differing viewpoints and experiences</li>
        <li>Gracefully accepting constructive criticism</li>
        <li>Focusing on what is best for the community</li>
        <li>Showing empathy towards other community members</li>
      </UL>

      <P>Examples of unacceptable behavior by participants include:</P>
      <UL>
        <li>The use of sexualized language or imagery and unwelcome sexual attention or advances</li>
        <li>Trolling, insulting/derogatory comments, and personal or political attacks</li>
        <li>Public or private harassment</li>
        <li>
          Publishing others' private information, such as a physical or electronic address, without
          explicit permission
        </li>
        <li>Other conduct which could reasonably be considered inappropriate in a professional setting</li>
      </UL>

      <H2 id="our-responsibilities">Our Responsibilities</H2>
      <P>
        Project maintainers have the right and responsibility to remove, edit, or reject comments,
        commits, code, wiki edits, issues, and other contributions that are not aligned to this Code
        of Conduct, or to ban temporarily or permanently any contributor for other behaviors that
        they deem inappropriate, threatening, offensive, or harmful.
      </P>

      <H2 id="scope">Scope</H2>
      <P>
        This Code of Conduct applies both within project spaces and in public spaces when an
        individual is representing the project or its community. Examples of representing a project
        or community include using an official project e-mail address, posting via an official social
        media account, or acting as an appointed representative at an online or offline event.
        Representation of a project may be further defined and clarified by project maintainers.
      </P>

      <H2 id="attribution">Attribution</H2>
      <P>
        This Code of Conduct is adapted from the{' '}
        <A href="https://www.contributor-covenant.org/version/1/4/code-of-conduct.html">
          Contributor Covenant, version 1.4
        </A>
        . For answers to common questions about this code of conduct, see the{' '}
        <A href="https://www.contributor-covenant.org/faq">Contributor Covenant FAQ</A>.
      </P>
    </article>
  )
}
