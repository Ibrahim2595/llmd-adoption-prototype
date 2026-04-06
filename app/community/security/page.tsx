import type { Metadata } from 'next'
import { Callout } from '@/components/callout'

export const metadata: Metadata = {
  title: 'Security Policy — llm-d Community',
  description: 'Security vulnerability reporting and disclosure policy for llm-d',
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-10 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
      {children}
    </h2>
  )
}

function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-lg font-semibold text-gray-900 dark:text-gray-50 mt-8 mb-3">
      {children}
    </h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4">{children}</p>
}

function UL({ children }: { children: React.ReactNode }) {
  return <ul className="text-gray-700 dark:text-gray-300 list-disc pl-5 mb-4 flex flex-col gap-1.5">{children}</ul>
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http') || href.startsWith('mailto')
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors"
    >
      {children}
    </a>
  )
}

export default function SecurityPage() {
  return (
    <article className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-50 mb-2">Security Policy</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        Source:{' '}
        <A href="https://github.com/llm-d/llm-d/blob/main/SECURITY.md">
          github.com/llm-d/llm-d/SECURITY.md
        </A>
      </p>

      <H2 id="security-announcements">Security Announcements</H2>
      <P>
        Join the{' '}
        <A href="https://groups.google.com/u/1/g/llm-d-security-announce">
          llm-d-security-announce
        </A>{' '}
        group for emails about security and major API announcements.
      </P>

      <H2 id="report-a-vulnerability">Report a Vulnerability</H2>
      <P>
        We are extremely grateful for security researchers and users that report vulnerabilities to
        the llm-d Open Source Community. All reports are thoroughly investigated by a set of community
        volunteers.
      </P>

      <Callout type="warning">
        Email the private{' '}
        <a
          href="mailto:llm-d-security-reporting@googlegroups.com"
          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          llm-d-security-reporting@googlegroups.com
        </a>{' '}
        list with security details. Do not open public GitHub issues for security vulnerabilities.
      </Callout>

      <H3 id="when-to-report">When Should I Report a Vulnerability?</H3>
      <UL>
        <li>You think you discovered a potential security vulnerability in llm-d.</li>
        <li>You are unsure how a vulnerability affects llm-d.</li>
        <li>
          You think you discovered a vulnerability in another project that llm-d depends on. (For
          projects with their own vulnerability reporting process, please report directly there.)
        </li>
      </UL>

      <H3 id="when-not-to-report">When Should I NOT Report a Vulnerability?</H3>
      <UL>
        <li>You need help tuning llm-d components for security.</li>
        <li>You need help applying security related updates.</li>
        <li>Your issue is not security related.</li>
      </UL>

      <H2 id="vulnerability-response">Security Vulnerability Response</H2>
      <P>
        Each report is acknowledged and analyzed by the maintainers of llm-d within 3 working days.
      </P>
      <P>
        Any vulnerability information shared with the Security Response Committee stays within the
        llm-d project and will not be disseminated to other projects unless it is necessary to get
        the issue fixed.
      </P>
      <P>
        As the security issue moves from triage, to identified fix, to release planning, we will keep
        the reporter updated.
      </P>

      <H2 id="public-disclosure-timing">Public Disclosure Timing</H2>
      <P>
        A public disclosure date is negotiated by the llm-d Security Response Committee and the bug
        submitter. We prefer to fully disclose the bug as soon as possible once a user mitigation is
        available.
      </P>
      <P>
        It is reasonable to delay disclosure when the bug or the fix is not yet fully understood, the
        solution is not well-tested, or for vendor coordination. The timeframe for disclosure is from
        immediate (especially if already publicly known) to a few weeks. For a vulnerability with a
        straightforward mitigation, we expect report date to disclosure date to be on the order of 7
        days.
      </P>
      <P>The llm-d maintainers hold the final say when setting a disclosure date.</P>
    </article>
  )
}
