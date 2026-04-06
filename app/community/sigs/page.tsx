import type { Metadata } from 'next'
import { NavCards, NavCard } from '@/components/nav-card'
import { Callout } from '@/components/callout'

export const metadata: Metadata = {
  title: 'Special Interest Groups — llm-d Community',
  description: 'Information about Special Interest Groups in the llm-d project',
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

function OL({ children }: { children: React.ReactNode }) {
  return <ol className="text-gray-700 dark:text-gray-300 list-decimal pl-5 mb-4 flex flex-col gap-1.5">{children}</ol>
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors"
    >
      {children}
    </a>
  )
}

const SIGS = [
  {
    id: 'sig-inference-scheduler',
    name: 'Inference Scheduler',
    focus: 'Intelligent request routing, load balancing, and traffic management',
    leadership: 'Nili Guy, Abdullah Gharaibeh, Vita Bortnikov',
    slack: '#sig-inference-scheduler',
    docsHref: 'https://drive.google.com/drive/folders/1aKTJru43krjHP2ORayEEp4JP-N7dJL8S',
    repoHref: 'https://github.com/llm-d/llm-d-inference-scheduler/',
    repoLabel: 'llm-d-inference-scheduler',
    charter: 'Develop and maintain intelligent request routing and load balancing systems that optimize for latency, throughput, and resource utilization across distributed inference workloads.',
    areas: [
      'vLLM-optimized inference scheduling algorithms',
      'KV-cache aware routing and load balancing',
      'Integration with Kubernetes Gateway API and Inference Gateway Extension',
      'Flow control and traffic shaping',
      'SLA-aware request prioritization',
    ],
  },
  {
    id: 'sig-benchmarking',
    name: 'Benchmarking',
    focus: 'Performance testing, benchmarking frameworks, and optimization',
    leadership: 'Marcio A L Silva, Ashok Chandrasekar',
    slack: '#sig-benchmarking',
    docsHref: 'https://drive.google.com/drive/folders/1Hd-rCRLDbucl-LD0RlQwOCLqERWF-obT',
    repoHref: 'https://github.com/llm-d/llm-d-benchmark',
    repoLabel: 'llm-d-benchmark',
    charter: 'Establish comprehensive performance testing and benchmarking frameworks to ensure llm-d delivers optimal performance across diverse workloads and hardware configurations.',
    areas: [
      'Benchmarking frameworks and methodologies',
      'Performance regression testing',
      'Workload simulation and synthetic data generation',
      'Hardware-specific optimization',
      'Performance analysis and profiling tools',
    ],
  },
  {
    id: 'sig-pd-disaggregation',
    name: 'PD-Disaggregation',
    focus: 'Prefill/decode separation, distributed serving, and workload disaggregation',
    leadership: 'Robert Shaw, Tyler Michael Smith',
    slack: '#sig-pd-disaggregation',
    docsHref: 'https://drive.google.com/drive/folders/1jk7wtojsWNbYQVf7BY8BEvIg8FMRZV0q',
    repoHref: 'https://github.com/llm-d/llm-d-routing-sidecar',
    repoLabel: 'llm-d-routing-sidecar',
    charter: 'Design and implement prefill/decode disaggregation patterns that enable efficient separation of inference workloads across heterogeneous hardware and scaling requirements.',
    areas: [
      'Prefill/decode workload separation',
      'Disaggregated serving architecture',
      'Cross-instance communication protocols',
      'Heterogeneous hardware optimization',
      'Dynamic workload balancing between Prefill and Decode instances',
    ],
  },
  {
    id: 'sig-kv-disaggregation',
    name: 'KV-Disaggregation',
    focus: 'KV caching, prefix caching, and distributed storage systems',
    leadership: 'Maroon Ayoub, Danny Harnik',
    slack: '#sig-kv-disaggregation',
    docsHref: 'https://drive.google.com/drive/folders/1mFbzwEWL2-LvD21owgxlKRcQD0eSmcz6',
    repoHref: 'https://github.com/llm-d/llm-d-kv-cache',
    repoLabel: 'llm-d-kv-cache',
    charter: 'Design and implement distributed KV caching solutions that improve inference performance through intelligent cache management, prefix sharing, and disaggregated storage.',
    areas: [
      'Distributed KV cache architecture',
      'Prefix cache hierarchies (local, remote, shared)',
      'Cache-aware scheduling and routing',
      'Storage optimization for inference workloads',
      "Integration with vLLM's KVConnector",
    ],
  },
  {
    id: 'sig-installation',
    name: 'Installation',
    focus: 'Kubernetes integration, deployment tooling, and platform operations',
    leadership: 'Brent Salisbury, Greg Pereira',
    slack: '#sig-installation',
    docsHref: 'https://drive.google.com/drive/folders/1H-0Y8fXepzrYpcaUOBfuphn1Cl-gU0xr',
    repoHref: 'https://github.com/llm-d-incubation/llm-d-modelservice',
    repoLabel: 'llm-d-modelservice',
    charter: 'Ensure llm-d integrates seamlessly with Kubernetes and provides robust deployment, scaling, and operational capabilities for production environments.',
    areas: [
      'Kubernetes-native deployment patterns',
      'Helm charts and operators',
      'Installation and configuration management',
      'Multi-node orchestration with LeaderWorkerSet',
      'Platform integration and operational best practices',
    ],
  },
  {
    id: 'sig-autoscaling',
    name: 'Autoscaling',
    focus: 'Traffic-aware autoscaling, resource management, and capacity planning',
    leadership: 'Tamar Eilam, Abhishek Malvankar',
    slack: '#sig-autoscaling',
    docsHref: 'https://drive.google.com/drive/folders/1iDlTgpFPOrSQn7dWR3uCQLtqhz86HTAi',
    repoHref: 'https://github.com/llm-d-incubation/workload-variant-autoscaler',
    repoLabel: 'workload-variant-autoscaler',
    charter: 'Develop intelligent autoscaling solutions that automatically adjust llm-d deployments based on traffic patterns, workload characteristics, and hardware utilization.',
    areas: [
      'Traffic-aware autoscaling algorithms',
      'Hardware-specific scaling policies',
      'Workload-based capacity planning',
      'Integration with Kubernetes HPA/VPA',
      'Cost-optimized scaling strategies',
    ],
  },
  {
    id: 'sig-observability',
    name: 'Observability',
    focus: 'Monitoring, logging, metrics, and operational visibility',
    leadership: "Sally O'Malley, Roy Nissim, Benedikt Bongartz",
    slack: '#sig-observability',
    docsHref: 'https://drive.google.com/drive/folders/1H-TVTCKYVxUn4fER7xuTPmscNttZCutN',
    repoHref: 'https://github.com/llm-d/llm-d/tree/main/docs/monitoring',
    repoLabel: 'llm-d Observability Docs',
    charter: 'Provide comprehensive monitoring, logging, and observability capabilities that enable operators to understand system behavior, diagnose issues, and optimize performance.',
    areas: [
      'Metrics collection and visualization',
      'Distributed tracing and logging',
      'Performance monitoring and alerting',
      'Operational dashboards and reporting',
      'Integration with monitoring ecosystems (Prometheus, Grafana, etc.)',
    ],
  },
  {
    id: 'sig-rl',
    name: 'SIG RL',
    focus: 'Improve SOTA performance for RL workloads',
    leadership: 'Bogdan Berce, Robert Shaw',
    slack: '#sig-rl',
    docsHref: null,
    repoHref: null,
    repoLabel: null,
    charter: 'Assist RL teams in achieving SOTA performance for RL workloads.',
    areas: [
      'Metrics collection and visualization',
      'Distributed tracing and logging',
      'Performance monitoring and alerting',
      'Integration with monitoring ecosystems',
    ],
  },
]

export default function SIGsPage() {
  return (
    <article className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-50 mb-2">Special Interest Groups (SIGs)</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        Source:{' '}
        <A href="https://github.com/llm-d/llm-d/blob/main/SIGS.md">
          github.com/llm-d/llm-d/SIGS.md
        </A>
      </p>

      <P>
        Special Interest Groups (SIGs) are the primary organizational units for coordinating work
        across the llm-d project. Each SIG focuses on a specific area of the technology stack and is
        responsible for driving design, implementation, and maintenance of their respective components.
      </P>
      <P>SIGs provide a mechanism for focused expertise, coordinated development, community building, and clear accountability for specific project areas.</P>

      {/* Overview cards */}
      <H2 id="sig-overview">SIG Overview</H2>
      <NavCards columns={3}>
        {SIGS.map((sig) => (
          <NavCard
            key={sig.id}
            title={sig.name}
            description={sig.focus}
            href={`#${sig.id}`}
            icon="zap"
          />
        ))}
      </NavCards>

      {/* Active SIGs table */}
      <H2 id="active-sigs">Active Special Interest Groups</H2>
      <Callout type="info">
        For up-to-date meeting times, see the{' '}
        <a href="/community/events" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
          Public Meeting Calendar
        </a>.
      </Callout>
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-50 font-semibold border border-gray-200 dark:border-gray-700 py-2 px-3 text-left">SIG</th>
              <th className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-50 font-semibold border border-gray-200 dark:border-gray-700 py-2 px-3 text-left">Focus Area</th>
              <th className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-50 font-semibold border border-gray-200 dark:border-gray-700 py-2 px-3 text-left">Documentation</th>
            </tr>
          </thead>
          <tbody>
            {SIGS.map((sig) => (
              <tr key={sig.id}>
                <td className="text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-2 px-3 align-top">
                  <a
                    href={`#${sig.id}`}
                    className="font-medium text-purple hover:underline"
                  >
                    {sig.name}
                  </a>
                </td>
                <td className="text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-2 px-3 align-top">
                  {sig.focus}
                </td>
                <td className="text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-2 px-3 align-top">
                  <div className="flex flex-col gap-1">
                    {sig.docsHref && (
                      <A href={sig.docsHref}>Meeting Recordings and Docs</A>
                    )}
                    {sig.repoHref && sig.repoLabel && (
                      <A href={sig.repoHref}>{sig.repoLabel} Repository</A>
                    )}
                    {!sig.docsHref && !sig.repoHref && (
                      <span className="text-gray-400 dark:text-gray-500">Coming soon</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed SIG descriptions */}
      <H2 id="sig-details">SIG Details</H2>
      {SIGS.map((sig) => (
        <div key={sig.id} className="mb-10">
          <H3 id={sig.id}>{sig.name}</H3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            <strong className="text-gray-700 dark:text-gray-300">Leadership:</strong> {sig.leadership}
          </p>
          <P>{sig.charter}</P>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Areas</p>
          <UL>
            {sig.areas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </UL>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Communication</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Slack:{' '}
              <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-xs px-1.5 py-0.5 rounded">
                {sig.slack}
              </code>
            </span>
            {sig.docsHref && (
              <A href={sig.docsHref}>Meeting Recordings and Docs</A>
            )}
            {sig.repoHref && sig.repoLabel && (
              <A href={sig.repoHref}>{sig.repoLabel}</A>
            )}
          </div>
        </div>
      ))}

      {/* Getting Involved */}
      <H2 id="getting-involved">Getting Involved</H2>

      <H3 id="joining-a-sig">Joining a SIG</H3>
      <OL>
        <li><strong>Attend a meeting</strong> — check the <A href="/community/events">project calendar</A> for SIG meeting times.</li>
        <li><strong>Join the conversation</strong> — participate in SIG-specific channels on Slack.</li>
        <li><strong>Review documentation</strong> — read the SIG's charter and current initiatives.</li>
        <li><strong>Start contributing</strong> — look for "good first issues" labeled with the SIG's area.</li>
      </OL>

      <H3 id="sig-communication">SIG Communication Channels</H3>
      <UL>
        <li><strong>Slack</strong>: Each SIG has dedicated channels in the <A href="https://llm-d.slack.com">llm-d Slack workspace</A>.</li>
        <li><strong>Google Groups</strong>: Join <A href="https://groups.google.com/g/llm-d-contributors">llm-d-contributors</A> for comment access to SIG documents.</li>
        <li><strong>GitHub</strong>: Issues and discussions are labeled by SIG area.</li>
        <li><strong>Calendar</strong>: All SIG meetings are on the shared project calendar.</li>
      </UL>

      {/* SIG Formation */}
      <H2 id="sig-formation">SIG Formation and Evolution</H2>

      <H3 id="creating-a-sig">Creating a New SIG</H3>
      <OL>
        <li><strong>Identify need</strong> — demonstrate community interest and technical necessity.</li>
        <li><strong>Draft charter</strong> — define scope, goals, and initial leadership.</li>
        <li><strong>Proposal process</strong> — submit a proposal following project contribution guidelines.</li>
        <li><strong>Community review</strong> — present at the weekly project standup and gather feedback.</li>
        <li><strong>Approval</strong> — obtain approval from project maintainers.</li>
      </OL>

      <H3 id="sig-lifecycle">SIG Lifecycle</H3>
      <UL>
        <li><strong>Active</strong>: Regular meetings, active development, engaged community.</li>
        <li><strong>Maintenance</strong>: Limited active development, focus on stability and bug fixes.</li>
        <li><strong>Archived</strong>: No longer active, historical reference only.</li>
      </UL>
    </article>
  )
}
