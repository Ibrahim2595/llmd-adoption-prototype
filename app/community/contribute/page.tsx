import type { Metadata } from 'next'
import { Callout } from '@/components/callout'
import { CodeBlock } from '@/components/code-block'

export const metadata: Metadata = {
  title: 'Contributing — llm-d Community',
  description: 'Guidelines for contributing to the llm-d project',
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

function H4({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-50 mt-6 mb-2">{children}</h4>
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

export default function ContributePage() {
  return (
    <article className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-50 mb-2">Contributing to llm-d</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        Source:{' '}
        <A href="https://github.com/llm-d/llm-d/blob/main/CONTRIBUTING.md">
          github.com/llm-d/llm-d/CONTRIBUTING.md
        </A>
      </p>

      <P>
        Thank you for your interest in contributing to llm-d. Community involvement is highly valued
        and crucial for the project's growth and success. The llm-d project accepts contributions via
        GitHub pull requests. This outlines the process to help get your contribution accepted.
      </P>
      <P>
        To ensure a clear direction and cohesive vision for the project, the project leads have the
        final decision on all contributions. However, these guidelines outline how you can contribute
        effectively to llm-d.
      </P>

      <H2 id="how-you-can-contribute">How You Can Contribute</H2>
      <UL>
        <li><strong>Reporting Issues</strong> — help us identify and fix bugs by reporting them clearly and concisely.</li>
        <li><strong>Suggesting Features</strong> — share your ideas for new features or improvements.</li>
        <li><strong>Improving Documentation</strong> — help make the project more accessible by enhancing the documentation.</li>
        <li><strong>Submitting Code</strong> — code contributions that align with the project's vision are always welcome. Project leads maintain final say.</li>
      </UL>

      <H2 id="community-and-communication">Community and Communication</H2>
      <UL>
        <li>
          <strong>Developer Slack:</strong>{' '}
          <A href="https://llm-d.ai/slack">Join our developer Slack workspace</A> to connect with
          core maintainers and other contributors, ask questions, and participate in discussions.
        </li>
        <li>
          <strong>Weekly Meetings:</strong> Project updates and Q&A every Wednesday at 12:30 PM ET.{' '}
          <A href="https://red.ht/llm-d-public-calendar">Add the shared calendar</A> or{' '}
          <A href="https://groups.google.com/g/llm-d-contributors">join our Google Group</A> for
          access to shared diagrams and other content. Meeting recordings and notes are on the{' '}
          <A href="https://drive.google.com/drive/folders/1Y9ahJ9BhhDuwnPK6QHmKTi8uoz1FTqvA">
            llm-d Public Google Drive
          </A>.
        </li>
        <li>
          <strong>SIGs:</strong> Join one of our{' '}
          <A href="/community/sigs">Special Interest Groups</A> to contribute to specific areas and
          collaborate with domain experts. SIG documentation is on the{' '}
          <A href="https://drive.google.com/drive/folders/13PVmYoIJitt5iZyaFTZiAgp_o66qAS8t">
            Public SIG Documentation Google Drive
          </A>.
        </li>
        <li>
          <strong>Code:</strong> Hosted in the{' '}
          <A href="https://github.com/llm-d">llm-d GitHub organization</A>.
        </li>
        <li>
          <strong>Issues:</strong> Project-scoped bugs or issues should be reported in{' '}
          <A href="https://github.com/llm-d/llm-d">llm-d/llm-d</A>.
        </li>
        <li>
          <strong>Mailing List:</strong>{' '}
          <A href="mailto:llm-d-contributors@googlegroups.com">llm-d-contributors@googlegroups.com</A>{' '}
          for document sharing and collaboration.
        </li>
      </UL>

      <H2 id="contributing-process">Contributing Process</H2>
      <P>
        We follow a <strong>lazy consensus</strong> approach: changes proposed by people with
        responsibility for a problem, without disagreement from others, within a bounded time window
        of review by their peers, should be accepted.
      </P>

      <H3 id="types-of-contributions">Types of Contributions</H3>

      <H4>1. Features with Public APIs or New Components</H4>
      <P>
        All features involving public APIs, behavior between core components, or new core
        repositories/subsystems must be accompanied by an <strong>approved project proposal</strong>.
      </P>
      <OL>
        <li>
          Create a pull request adding a markdown file under <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">./docs/proposals</code> with a descriptive name
          (e.g., <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">docs/proposals/disaggregated_serving.md</code>)
        </li>
        <li>
          Use the template at <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">./docs/proposals/PROPOSAL_TEMPLATE.md</code> with sections: Summary, Motivation,
          Proposal, Design Details, and Alternatives.
        </li>
        <li>Get review from impacted component maintainers.</li>
        <li>Get approval from project maintainers.</li>
      </OL>

      <H4>2. Fixes, Issues, and Bugs</H4>
      <UL>
        <li>All bugs and commits must have a clear description, reproduction steps, and explanation of the fix.</li>
        <li>Changes can be proposed in a pull request or as a GitHub issue; a maintainer must approve.</li>
        <li>For moderate changes, create an RFC issue in GitHub and engage in Slack to bring attention.</li>
        <li>Within components, use project proposals when the scope is large or impact to users is high.</li>
      </UL>

      <H2 id="feature-testing">Feature Testing</H2>
      <P>
        The first step is to identify which layer of the stack you are testing.
      </P>

      <H3 id="deployment-related-changes">Deployment Related Changes</H3>
      <UL>
        <li>
          Swapping GIE helm chart version and <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">inference-scheduler</code> image upgrades — check{' '}
          <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">inference-scheduler</code> container logs and verify your{' '}
          <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">InferencePool</code> exists.
        </li>
        <li>
          Upgrading the Infra helmchart — check the <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">gateway</code> object status for an address and programmed message, verify the <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">parametersRef</code>, and check <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">httpRoute</code> status conditions.
        </li>
        <li>
          Modelservice helm chart upgrades — ensure vLLM pods are up and <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">prefill</code> / <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">decode</code> podmonitors are deployed if metrics are enabled.
        </li>
      </UL>

      <H3 id="container-image-changes">Container Image Build Changes and Upgrades</H3>
      <UL>
        <li>
          Kernel upgrades (<code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">deepep</code>, <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">deepgemm</code>) — use the proper vLLM backend via{' '}
          <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">--all2all-backend</code>. For single-node testing without extra dependencies use{' '}
          <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">allgather_reducescatter</code>.
        </li>
        <li>UCX + NIXL version bumps — test in <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">pd-disaggregation</code> or <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">wide-ep-lws</code>.</li>
        <li>vLLM version bumps — by default built with precompiled binaries from upstream vLLM wheels index; can be tested in any example.</li>
        <li>
          EFA — to test the libfabric plugin inside a container built with EFA support:
        </li>
      </UL>

      <CodeBlock language="bash" code={`export NIXL_LOG_LEVEL=debug
python3 - <<'EOF'
from nixl._api import nixl_agent, nixl_agent_config
agent_config = nixl_agent_config(backends=["LIBFABRIC"])
nixl_agent1 = nixl_agent("target", agent_config)
EOF`} />

      <P>To test actual inference over EFA in AWS with P5+ instances, ensure <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">UCX_TLS</code> includes an EFA option and that containers request the EFA resource:</P>

      <CodeBlock language="yaml" code={`# env var
- name: UCX_TLS
  value: "efa,sockcm,sm,self,cuda_copy,cuda_ipc"

# resource request
requests:
  vpc.amazonaws.com/efa: 1`} />

      <H3 id="container-image-checklist">Container Image Checklist</H3>
      <ul className="text-gray-700 dark:text-gray-300 list-none pl-0 mb-4 flex flex-col gap-1.5">
        {[
          'inference-scheduler guide',
          'precise-kv-cache-aware example',
          'pd-disaggregation example (also covers deepseek kernels)',
          'wide-ep-lws example (also covers deepseek kernels)',
          'a guidellm benchmark to do a load test for performance regressions (any example)',
          'run pd-disaggregation or wide-ep-lws with deepseek kernels',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 w-4 h-4 shrink-0 border border-gray-300 dark:border-gray-600 rounded-sm" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <H2 id="code-review-requirements">Code Review Requirements</H2>
      <UL>
        <li><strong>All code changes</strong> must be submitted as pull requests (no direct pushes).</li>
        <li><strong>All changes</strong> must be reviewed and approved by a maintainer other than the author.</li>
        <li><strong>All repositories</strong> must gate merges on compilation and passing tests.</li>
        <li><strong>All experimental features</strong> must be off by default and require explicit opt-in.</li>
      </UL>

      <H2 id="commit-and-pr-style">Commit and Pull Request Style</H2>
      <UL>
        <li>Pull requests should describe the problem succinctly.</li>
        <li>Rebase and squash before merging.</li>
        <li>Use minimal commits and break large changes into distinct commits.</li>
        <li>
          Commit messages should have: a short descriptive title, a description of why the change was
          needed, and enough detail for someone reviewing git history to understand the scope.
        </li>
        <li>
          <strong>DCO Sign-off:</strong> All commits must include a valid DCO sign-off line
          (<code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">Signed-off-by: Name &lt;email@domain.com&gt;</code>).
          Add automatically with <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">git commit -s</code>. See{' '}
          <A href="https://github.com/llm-d/llm-d/blob/main/PR_SIGNOFF.md">PR_SIGNOFF.md</A> and the{' '}
          <A href="https://developercertificate.org/">Developer Certificate of Origin</A>.
        </li>
      </UL>

      <H2 id="code-organization">Code Organization and Ownership</H2>
      <UL>
        <li><strong>Components</strong> are the primary unit of code organization (repo scope or directory/package/module within a repo).</li>
        <li><strong>Maintainers</strong> own components and approve changes.</li>
        <li><strong>Contributors</strong> can become maintainers through sufficient evidence of contribution.</li>
        <li>Code ownership is reflected in <A href="https://go.k8s.io/owners">OWNERS files</A>, consistent with Kubernetes project conventions.</li>
      </UL>

      <H3 id="core-vs-incubating">Core vs Incubating Components</H3>
      <UL>
        <li><strong>Core components</strong>: Supported by the project with strong lifecycle controls and forward compatibility.</li>
        <li><strong>Incubating components</strong>: Rapidly iterating, not yet ready for production use, allowing greater freedom for testing ideas.</li>
      </UL>

      <H2 id="experimental-features">Experimental Features and Incubation</H2>
      <P>We encourage fast iteration and exploration with these constraints:</P>
      <OL>
        <li><strong>Clear identification</strong> as experimental in code and documentation.</li>
        <li><strong>Default to off</strong> and require explicit enablement.</li>
        <li><strong>Best effort support</strong> only.</li>
        <li><strong>Removal if unmaintained</strong> with no one to move it forward.</li>
        <li><strong>No stigma</strong> to experimental or incubating status.</li>
      </OL>

      <Callout type="info">
        Experimental flags must include <code>experimental</code> in the name (e.g.,{' '}
        <code>--experimental-disaggregation-v2=true</code>).
      </Callout>

      <H3 id="incubating-process">Incubating Components Process</H3>
      <OL>
        <li>Create repositories in <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">llm-d-incubation</code> GitHub org with maintainers and clear goals.</li>
        <li>Define timeframe for experimentation.</li>
        <li>Iterate and test with initial users.</li>
        <li>For well-lit path components: create a project proposal covering integration and define graduation success criteria.</li>
        <li>For standalone components: create a project proposal with graduation criteria; component can be used with experimental label.</li>
        <li><strong>Graduation</strong>: Move to core <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">llm-d</code> org and follow core process.</li>
        <li><strong>If not graduating</strong>: Archive for 3+ months before removal.</li>
      </OL>

      <H2 id="api-changes">API Changes and Deprecation</H2>
      <UL>
        <li><strong>No breaking changes</strong> once an API/protocol is in GA release (non-experimental).</li>
        <li>Includes all protocols, API endpoints, internal APIs, and command line flags.</li>
        <li><strong>Versioning</strong>: All protocols and APIs should be versionable with clear forward and backward compatibility requirements.</li>
        <li><strong>Documentation</strong>: All APIs must have documented specs describing expected behavior.</li>
      </UL>

      <H2 id="testing-requirements">Testing Requirements</H2>
      <P>We use three tiers of testing:</P>
      <OL>
        <li>
          <strong>Unit tests</strong> — fast verification of code parts, testing different arguments.
          Best for fast verification of parts of code; does not cover interactions between components.
        </li>
        <li>
          <strong>Integration tests</strong> — testing protocols between components and built artifacts.
          Best for testing protocols and agreements between components.
        </li>
        <li>
          <strong>End-to-end (e2e) tests</strong> — whole system testing including benchmarking.
          Best for preventing regression and verifying overall correctness. Execution can be slow.
        </li>
      </OL>
      <P>
        Strong e2e coverage is required for deployed systems to prevent performance regression.
        Appropriate test coverage is an important part of code review.
      </P>

      <H2 id="project-structure">Project Structure</H2>
      <H3 id="core-organization">Core Organization (llm-d)</H3>
      <UL>
        <li>Production-ready code on well-lit path.</li>
        <li>Follows API Changes and Deprecation process.</li>
        <li>All major changes require project proposals.</li>
      </UL>
      <H3 id="incubation-organization">Incubation Organization (llm-d-incubation)</H3>
      <UL>
        <li>Experimental components not yet fully supported.</li>
        <li>Bias towards accepting experimentation with clear goals.</li>
        <li>Each repo must have a README describing purpose and goal.</li>
        <li>Graduated components move to the <code className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-sm px-1.5 py-0.5 rounded">llm-d</code> org.</li>
      </UL>
    </article>
  )
}
