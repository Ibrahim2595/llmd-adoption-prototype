import type { Metadata } from 'next'
import { NavCards, NavCard } from '@/components/nav-card'
import { StepGuide, Step } from '@/components/step-guide'

export const metadata: Metadata = {
  title: 'Community — llm-d',
  description:
    "Join the llm-d community — everyone is welcome, whether you're a developer, researcher, student, or simply curious about LLM infrastructure.",
}

export default function CommunityPage() {
  return (
    <article className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-50 mb-6">
        Welcome to the llm-d Community
      </h1>

      <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4">
        <strong>Everyone is welcome.</strong> The llm-d community is open to all — whether you are a
        seasoned developer, just getting started, a researcher, student, or simply curious about LLM
        infrastructure. We believe diverse perspectives make our project stronger.
      </p>
      <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4">
        This page is your gateway to everything you need to know about participating in the llm-d
        community. Whether you want to contribute code, join discussions, or just learn more, we have
        got you covered.
      </p>

      {/* Quick Start Guide */}
      <h2 id="quick-start-guide" className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-10 mb-4">
        Quick Start Guide
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-7 mb-6">New to llm-d? Here is how to get started:</p>

      <StepGuide>
        <Step number={1} title="Join our Slack">
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            Get your invite and visit the{' '}
            <a
              href="https://llm-d.slack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors"
            >
              llm-d Slack workspace
            </a>{' '}
            to introduce yourself and ask questions in real time.
          </p>
        </Step>
        <Step number={2} title="Explore the code">
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            Browse the{' '}
            <a
              href="https://github.com/llm-d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors"
            >
              GitHub Organization
            </a>{' '}
            to find repositories, open issues, and understand how the project is structured.
          </p>
        </Step>
        <Step number={3} title="Join a meeting">
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            All community meetings are open to the public. Visit{' '}
            <a
              href="/community/events"
              className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors"
            >
              Upcoming Events
            </a>{' '}
            to see the schedule and add the calendar.
          </p>
        </Step>
        <Step number={4} title="Pick your area">
          <p className="text-gray-700 dark:text-gray-300 leading-7">
            Browse{' '}
            <a
              href="/community/sigs"
              className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors"
            >
              Special Interest Groups
            </a>{' '}
            to find a focused team aligned with your interests and expertise.
          </p>
        </Step>
      </StepGuide>

      {/* Get Involved */}
      <h2 id="get-involved" className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-10 mb-4">
        Get Involved
      </h2>
      <NavCards columns={2}>
        <NavCard
          title="Contributing Guidelines"
          description="Complete guide to contributing code, docs, and ideas"
          href="/community/contribute"
          icon="book"
        />
        <NavCard
          title="Upcoming Events"
          description="Meetups, talks, and conferences with the llm-d community"
          href="/community/events"
          icon="zap"
        />
        <NavCard
          title="Special Interest Groups"
          description="Join focused teams working on specific areas of llm-d"
          href="/community/sigs"
          icon="settings"
        />
        <NavCard
          title="Code of Conduct"
          description="Our community standards and values"
          href="/community/code-of-conduct"
          icon="check"
        />
        <NavCard
          title="Security Policy"
          description="How to report vulnerabilities and security issues"
          href="/community/security"
          icon="server"
        />
        <NavCard
          title="Slack Workspace"
          description="Daily conversations, Q&A, and real-time collaboration"
          href="https://llm-d.slack.com"
          icon="terminal"
        />
      </NavCards>

      {/* Communication Channels */}
      <h2 id="communication-channels" className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-10 mb-4">
        Communication Channels
      </h2>
      <ul className="flex flex-col gap-4">
        {[
          {
            name: 'Slack',
            href: 'https://llm-d.slack.com',
            label: 'llm-d Workspace',
            description: 'Daily conversations, Q&A, and real-time collaboration',
          },
          {
            name: 'GitHub',
            href: 'https://github.com/llm-d',
            label: 'llm-d Organization',
            description: 'Code, issues, pull requests, and project discussions',
          },
          {
            name: 'Google Groups',
            href: 'https://groups.google.com/g/llm-d-contributors',
            label: 'llm-d Contributors',
            description: 'Architecture discussions, document sharing, and broader updates',
          },
          {
            name: 'Google Drive',
            href: 'https://drive.google.com/drive/folders/1cN2YQiAZFJD_cb1ivlyukuNwecnin6lZ',
            label: 'Public Documentation',
            description: 'Meeting recordings, design docs, and project materials',
          },
        ].map((ch) => (
          <li key={ch.name} className="flex gap-3">
            <span className="font-medium text-gray-900 dark:text-gray-50 w-28 shrink-0">{ch.name}</span>
            <span className="text-gray-700 dark:text-gray-300">
              <a
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors"
              >
                {ch.label}
              </a>{' '}
              — <span className="text-gray-500 dark:text-gray-400">{ch.description}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* Connect With Us */}
      <h2 id="connect-with-us" className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-10 mb-4">
        Connect With Us
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-7 mb-6">
        Follow llm-d across social platforms for updates, discussions, and community highlights.
      </p>
      <div className="flex flex-wrap gap-6">
        {[
          { name: 'LinkedIn', href: 'https://linkedin.com/company/llm-d' },
          { name: 'Bluesky', href: 'https://bsky.app/profile/llm-d.ai' },
          { name: 'X (Twitter)', href: 'https://x.com/_llm_d_' },
          { name: 'Reddit', href: 'https://www.reddit.com/r/llm_d/' },
          { name: 'YouTube', href: 'https://www.youtube.com/@llm-d-project' },
        ].map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-purple transition-colors"
          >
            {s.name}
          </a>
        ))}
      </div>
    </article>
  )
}
