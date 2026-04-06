import Image from 'next/image'
import Link from 'next/link'
import { VideoEmbed } from '@/components/video-embed'

// ─── Capability cards data ─────────────────────────────────────────────────────

const PRIMARY_CAPS = [
  {
    tags: 'Inference Gateway · vLLM · Kubernetes',
    title: 'Intelligent Inference Scheduling',
    description:
      'Route requests using prefix-cache affinity, GPU utilization, and predicted latency — not naive round-robin. Supports fairness, multi-tenant prioritization, and SLA-aware balancing.',
    outcome: 'Lower latency, higher throughput, same hardware.',
    href: '/docs/production-deployment/inference-scheduling',
  },
  {
    tags: 'Prefill/Decode · KV Transfer · Sidecar',
    title: 'Disaggregated Serving',
    description:
      'Split inference into prefill instances (handling prompts) and decode instances (handling generation). The scheduler decides placement; a sidecar coordinates the KV transfer.',
    outcome: 'Predictable TTFT and TPOT, especially on large models with long prompts.',
    href: '/docs/production-deployment/scheduling-pd',
  },
  {
    tags: 'LMCache · Mooncake · vLLM KVConnector',
    title: 'Distributed KV Caching',
    description:
      'Reuse cached computation across requests and instances automatically. Pluggable KV cache hierarchy including host offloading, remote storage, and systems like LMCache and Mooncake.',
    outcome: 'Up to 10x cost difference between cached and uncached tokens.',
    href: '/docs/core-concepts/tiered-kv-cache',
  },
]

const SECONDARY_CAPS = [
  {
    title: 'Autoscaling',
    description:
      'Traffic- and hardware-aware autoscaling that calculates optimal instance mix. Supports scale-to-zero.',
  },
  {
    title: 'Observability',
    description:
      'Prometheus metrics, Grafana dashboards, OpenTelemetry distributed tracing across the full stack.',
  },
  {
    title: 'Multi-Accelerator',
    description:
      'NVIDIA A100+, AMD MI250+, Google TPU v5e+, Intel GPU Max. Not locked to one vendor.',
  },
]

const BENCHMARKS = [
  {
    metric: 'X%',
    label: 'lower time-to-first-token',
    detail: 'with disaggregated serving on Llama 70B',
    config: '8x H100, prefill/decode split',
  },
  {
    metric: 'X%',
    label: 'higher throughput',
    detail: 'with prefix-cache-aware scheduling vs round-robin',
    config: '4x A100 80GB, Mixtral 8x7B',
  },
  {
    metric: 'Xx',
    label: 'cost reduction',
    detail: 'on cached vs uncached tokens',
    config: 'Tiered KV caching, production workload',
  },
]

// ─── Icon components ───────────────────────────────────────────────────────────

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function SlackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-6">

        {/* ── Section 1: Hero ── */}
        <section className="pt-24 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start lg:items-center">

          {/* Left */}
          <div className="flex-[55] min-w-0">
            <div className="max-w-xl">
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-50 leading-snug">
                The open-source orchestration layer for serving LLMs at scale on Kubernetes.
              </h1>
              <p className="mt-4 text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                llm-d adds inference-aware scheduling, prefill/decode disaggregation, and distributed
                KV caching on top of vLLM — giving platform teams a well-lit path from single-node
                serving to production-grade distributed inference.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/docs/getting-started/prerequisites"
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-purple hover:bg-purple-dark transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/simulator"
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Try the Simulator
                </Link>
              </div>
            </div>
          </div>

          {/* Right — video */}
          <div className="flex-[45] min-w-0 w-full">
            <VideoEmbed youtubeId="32MqYC3OydE" title="llm-d introduction video" />
          </div>

        </section>

        {/* ── Section 2: Capabilities ── */}
        <section className="mt-20">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              What llm-d adds to your Kubernetes inference stack
            </h2>
          </div>

          {/* Primary capability cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRIMARY_CAPS.map((cap) => (
              <div
                key={cap.title}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col hover:shadow-sm transition-shadow"
              >
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{cap.tags}</p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mt-3">{cap.title}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{cap.description}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-3">{cap.outcome}</p>
                <div className="mt-auto pt-4">
                  <Link
                    href={cap.href}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple transition-colors"
                  >
                    Deploy this →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Secondary capability cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {SECONDARY_CAPS.map((cap) => (
              <div
                key={cap.title}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{cap.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>

        </section>

        {/* ── Section 3: Architecture Diagram ── */}
        <section className="mt-20">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <Image
              src="/img/llm-d-arch.svg"
              alt="llm-d architecture diagram"
              width={1200}
              height={600}
              className="w-full h-auto"
            />
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/docs/getting-started"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple transition-colors"
            >
              Explore the full architecture →
            </Link>
          </div>
        </section>

        {/* ── Section 4: Performance ── */}
        <section className="mt-20">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-6">Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENCHMARKS.map((b) => (
              <div
                key={b.label}
                className="bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center"
              >
                <p className="text-5xl font-bold text-gray-300 dark:text-gray-200">{b.metric}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{b.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{b.detail}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{b.config}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
            Benchmarks coming soon.{' '}
            <Link
              href="/docs/benchmarking/methodology"
              className="hover:text-purple transition-colors underline underline-offset-2"
            >
              View methodology →
            </Link>
          </p>
        </section>

        {/* ── Section 5: Company Logos ── */}
        <section className="mt-20">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-10">
            {/* IBM — black bars on white rect background; invert in dark mode */}
            <img
              src="/img/logos/ibm.png"
              alt="IBM"
              className="h-7 w-auto dark:invert"
            />
            {/* Google — RGBA, colorful text on transparent; works in both modes */}
            <img
              src="/img/logos/google.png"
              alt="Google"
              className="h-7 w-auto"
            />
            {/* Red Hat — red + black on transparent; invert in dark mode */}
            <img
              src="/img/logos/redhat.png"
              alt="Red Hat"
              className="h-6 w-auto dark:invert"
            />
            {/* NVIDIA — stacked icon + text, green + black on transparent; invert in dark mode */}
            <img
              src="/img/logos/nvidia.png"
              alt="NVIDIA"
              className="h-9 w-auto dark:invert"
            />
            {/* CoreWeave — blue + black on transparent; invert in dark mode */}
            <img
              src="/img/logos/coreweave.svg"
              alt="CoreWeave"
              className="h-5 w-auto dark:invert"
            />
            {/* AMD — black only on transparent; invert in dark mode */}
            <img
              src="/img/logos/amd.svg"
              alt="AMD"
              className="h-7 w-auto dark:invert"
            />
            <span className="text-sm text-gray-400 dark:text-gray-500">+ more</span>
          </div>
        </section>

        {/* ── Section 6: Community ── */}
        <section className="mt-20 mb-20">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Built in the open</h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
              Join the community shaping the future of LLM serving.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
              <a
                href="https://github.com/llm-d/llm-d"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple transition-colors"
              >
                <GitHubIcon />
                GitHub
              </a>
              <a
                href="https://llm-d.ai/slack"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple transition-colors"
              >
                <SlackIcon />
                Slack
              </a>
              <Link
                href="/community"
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-purple transition-colors"
              >
                <UsersIcon />
                Community
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
