'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { CodeBlock } from '@/components/code-block'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Config {
  model: string
  gpu: string
  instances: number
  routingPolicy: string
  requestRate: number
  numRequests: number
  workloadType: string
  totalKvBlocks: string
  disaggregated: boolean
  prefixCaching: boolean
}

interface Metrics {
  ttft: { mean: number; p90: number; p95: number; p99: number }
  e2e: { mean: number; p90: number; p95: number; p99: number }
  itl: { mean: number; p90: number; p95: number; p99: number }
  schedDelayP99: number
  throughput: number
  reqPerSec: number
  duration: number
  completed: number
  injected: number
  queued: number
  running: number
  timedOut: number
  dropped: number
  lengthCapped: number
  preemptions: number
  promptTokens: number
  outputTokens: number
}

interface SavedSim {
  id: number
  label: string
  config: Config
  metrics: Metrics
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_METRICS: Metrics = {
  ttft: { mean: 30.17, p90: 44.76, p95: 49.20, p99: 53.16 },
  e2e: { mean: 4677.15, p90: 7370.21, p95: 8079.38, p99: 10499.43 },
  itl: { mean: 8.67, p90: 9.60, p95: 9.75, p99: 9.88 },
  schedDelayP99: 7.72,
  throughput: 3148.8,
  reqPerSec: 5.83,
  duration: 17.15,
  completed: 100,
  injected: 100,
  queued: 0,
  running: 0,
  timedOut: 0,
  dropped: 0,
  lengthCapped: 0,
  preemptions: 0,
  promptTokens: 54508,
  outputTokens: 54017,
}

const DEFAULT_CONFIG: Config = {
  model: 'qwen/qwen3-14b',
  gpu: 'NVIDIA H100',
  instances: 1,
  routingPolicy: 'Round Robin',
  requestRate: 10,
  numRequests: 100,
  workloadType: 'Distribution (CLI default)',
  totalKvBlocks: '',
  disaggregated: false,
  prefixCaching: false,
}

const PRESETS: Record<string, Partial<Config>> = {
  'Small Model / Single GPU': {
    model: 'qwen/qwen3-14b',
    gpu: 'NVIDIA H100',
    instances: 1,
    routingPolicy: 'Round Robin',
    requestRate: 10,
    numRequests: 100,
    disaggregated: false,
    prefixCaching: false,
  },
  'Large MoE / Multi-GPU': {
    model: 'deepseek-ai/DeepSeek-R1',
    gpu: 'NVIDIA H100',
    instances: 8,
    routingPolicy: 'Prefix Cache Aware',
    requestRate: 50,
    numRequests: 500,
    disaggregated: true,
    prefixCaching: false,
  },
  'High Throughput Batch': {
    model: 'meta-llama/Llama-3.1-70B',
    gpu: 'NVIDIA A100 80GB',
    instances: 4,
    routingPolicy: 'Round Robin',
    requestRate: 100,
    numRequests: 1000,
    disaggregated: false,
    prefixCaching: false,
  },
  'Low Latency Interactive': {
    model: 'qwen/qwen3-14b',
    gpu: 'NVIDIA H100',
    instances: 2,
    routingPolicy: 'Predicted Latency',
    requestRate: 5,
    numRequests: 50,
    disaggregated: false,
    prefixCaching: true,
  },
}

function varyMetrics(base: Metrics): Metrics {
  const v = (n: number) => parseFloat((n * (0.9 + Math.random() * 0.2)).toFixed(2))
  return {
    ttft: { mean: v(base.ttft.mean), p90: v(base.ttft.p90), p95: v(base.ttft.p95), p99: v(base.ttft.p99) },
    e2e: { mean: v(base.e2e.mean), p90: v(base.e2e.p90), p95: v(base.e2e.p95), p99: v(base.e2e.p99) },
    itl: { mean: v(base.itl.mean), p90: v(base.itl.p90), p95: v(base.itl.p95), p99: v(base.itl.p99) },
    schedDelayP99: v(base.schedDelayP99),
    throughput: v(base.throughput),
    reqPerSec: v(base.reqPerSec),
    duration: v(base.duration),
    completed: base.completed,
    injected: base.injected,
    queued: 0, running: 0, timedOut: 0, dropped: 0, lengthCapped: 0, preemptions: 0,
    promptTokens: base.promptTokens,
    outputTokens: base.outputTokens,
  }
}

function configLabel(c: Config) {
  return `${c.gpu.replace('NVIDIA ', '')} × ${c.instances} / ${c.routingPolicy}`
}

// ─── Small UI primitives ──────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-1 dark:focus:ring-offset-gray-900 ${
        checked ? 'bg-purple' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-150 mt-0.5 ${
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{children}</p>
  )
}

function FieldHelper({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{children}</p>
}

function inputCls() {
  return 'w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-opacity-50 focus:border-purple dark:placeholder-gray-500'
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 pl-4 border-l border-gray-200 dark:border-gray-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50 mb-4">{title}</h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string
  value: string | number
  unit?: string
  highlight?: 'better' | 'worse' | null
}) {
  const valueColor =
    highlight === 'better'
      ? 'text-green-700'
      : highlight === 'worse'
      ? 'text-red-600'
      : 'text-gray-900 dark:text-gray-50'
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-semibold mt-0.5 ${valueColor}`}>{value}</p>
      {unit && <p className="text-xs text-gray-500 dark:text-gray-400">{unit}</p>}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="text-base font-semibold text-gray-900 dark:text-gray-50 mb-3">{children}</p>
}

// ─── Deployment config generators ────────────────────────────────────────────

function routingPolicyKey(p: string) {
  if (p === 'Prefix Cache Aware') return 'prefix-cache-aware'
  if (p === 'Predicted Latency') return 'predicted-latency'
  return 'round-robin'
}

function gpuKey(g: string) {
  if (g === 'NVIDIA A100 80GB') return 'nvidia-a100'
  if (g === 'AMD MI300X') return 'amd-mi300x'
  return 'nvidia-h100'
}

function generateValuesYaml(c: Config): string {
  return `# llm-d Helm values
# Generated by llm-d Inference Simulator

modelservice:
  # Model to serve
  model: "${c.model}"
  # Number of inference replicas
  replicas: ${c.instances}

  hardware:
    # Accelerator type
    gpu: ${gpuKey(c.gpu)}

  serving:
    engine: vllm
    maxConcurrentRequests: ${Math.max(c.requestRate * 2, 20)}
${
  c.totalKvBlocks
    ? `    totalKvBlocks: ${c.totalKvBlocks}\n`
    : ''
}
  routing:
    # Routing policy for request distribution
    policy: ${routingPolicyKey(c.routingPolicy)}
    # Enable prefix/KV cache reuse across requests
    prefixCaching: ${c.prefixCaching}
    # Separate prefill and decode phases across instances
    disaggregated: ${c.disaggregated}

  workload:
    # Target request rate (requests per second)
    requestRate: ${c.requestRate}

gateway:
  enabled: true
  replicas: 1

monitoring:
  enabled: true
  prometheusPort: 9090
`
}

function generateKubectlManifest(c: Config): string {
  return `# Deploy llm-d with Helm
helm upgrade --install llm-d llm-d/llm-d \\
  --namespace llm-d \\
  --create-namespace \\
  -f values.yaml

# ---
# Or apply core resources directly with kubectl:

kubectl apply -f - <<'EOF'
apiVersion: inference.networking.k8s.io/v1alpha2
kind: InferencePool
metadata:
  name: llm-d-pool
  namespace: llm-d
spec:
  selector:
    matchLabels:
      app: llm-d
  targetPortNumber: 8000
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: llm-d-config
  namespace: llm-d
data:
  model: "${c.model}"
  instances: "${c.instances}"
  routing-policy: "${routingPolicyKey(c.routingPolicy)}"
  prefix-caching: "${c.prefixCaching}"
  disaggregated: "${c.disaggregated}"
EOF`
}

// ─── Recommended docs ─────────────────────────────────────────────────────────

function RecommendedDocs({ config }: { config: Config }) {
  const links: { label: string; href: string }[] = []

  if (config.routingPolicy === 'Prefix Cache Aware') {
    links.push({ label: 'Prefix Cache Aware Scheduling', href: '/docs/production-deployment/inference-scheduling/prefix-cache-scheduling' })
  }
  if (config.routingPolicy === 'Predicted Latency') {
    links.push({ label: 'Predicted Latency Scheduling', href: '/docs/production-deployment/inference-scheduling/predicted-latency-scheduling' })
  }
  if (config.disaggregated) {
    links.push({ label: 'Disaggregated Serving Guide', href: '/docs/production-deployment/scheduling-pd' })
  }
  if (config.prefixCaching) {
    links.push({ label: 'Tiered KV Cache Offloading', href: '/docs/core-concepts/tiered-kv-cache' })
  }
  links.push({ label: 'Getting Started', href: '/docs/getting-started/prerequisites' })

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">
        Recommended guides for your configuration
      </p>
      <ul className="flex flex-col gap-1.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple transition-colors inline-flex items-center gap-1"
            >
              {l.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Results panel ────────────────────────────────────────────────────────────

function ResultsPanel({
  config,
  metrics,
  onSave,
  onReset,
  saveLabel,
}: {
  config: Config
  metrics: Metrics
  onSave: () => void
  onReset: () => void
  saveLabel: string
}) {
  const [activeTab, setActiveTab] = useState<'yaml' | 'kubectl'>('yaml')
  const [copied, setCopied] = useState(false)
  const [savedConfirm, setSavedConfirm] = useState(false)

  const codeContent = activeTab === 'yaml' ? generateValuesYaml(config) : generateKubectlManifest(config)

  function handleCopy() {
    navigator.clipboard.writeText(codeContent).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleSave() {
    onSave()
    setSavedConfirm(true)
    setTimeout(() => setSavedConfirm(false), 2000)
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400">
          Completed
        </span>
        <button
          onClick={handleSave}
          className="text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-800"
        >
          {savedConfirm ? 'Saved!' : saveLabel}
        </button>
      </div>

      {/* Recommended docs */}
      <RecommendedDocs config={config} />

      {/* Latency */}
      <div className="mt-6">
        <SectionHeading>Latency</SectionHeading>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="TTFT MEAN" value={metrics.ttft.mean} unit="ms" />
            <MetricCard label="TTFT P90" value={metrics.ttft.p90} unit="ms" />
            <MetricCard label="TTFT P95" value={metrics.ttft.p95} unit="ms" />
            <MetricCard label="TTFT P99" value={metrics.ttft.p99} unit="ms" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="E2E MEAN" value={metrics.e2e.mean} unit="ms" />
            <MetricCard label="E2E P90" value={metrics.e2e.p90} unit="ms" />
            <MetricCard label="E2E P95" value={metrics.e2e.p95} unit="ms" />
            <MetricCard label="E2E P99" value={metrics.e2e.p99} unit="ms" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="ITL MEAN" value={metrics.itl.mean} unit="ms" />
            <MetricCard label="ITL P90" value={metrics.itl.p90} unit="ms" />
            <MetricCard label="ITL P95" value={metrics.itl.p95} unit="ms" />
            <MetricCard label="ITL P99" value={metrics.itl.p99} unit="ms" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="SCHED DELAY P99" value={metrics.schedDelayP99} unit="ms" />
          </div>
        </div>
      </div>

      {/* Throughput */}
      <div className="mt-6">
        <SectionHeading>Throughput</SectionHeading>
        <div className="grid grid-cols-3 gap-2">
          <MetricCard label="THROUGHPUT" value={metrics.throughput} unit="tok/s" />
          <MetricCard label="REQUESTS/SEC" value={metrics.reqPerSec} unit="req/s" />
          <MetricCard label="EST. DURATION" value={metrics.duration} unit="seconds" />
        </div>
      </div>

      {/* Request Statistics */}
      <div className="mt-6">
        <SectionHeading>Request Statistics</SectionHeading>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="COMPLETED" value={metrics.completed} />
            <MetricCard label="INJECTED" value={metrics.injected} />
            <MetricCard label="STILL QUEUED" value={metrics.queued} />
            <MetricCard label="STILL RUNNING" value={metrics.running} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="TIMED OUT" value={metrics.timedOut} />
            <MetricCard label="DROPPED" value={metrics.dropped} />
            <MetricCard label="LENGTH CAPPED" value={metrics.lengthCapped} />
            <MetricCard label="PREEMPTIONS" value={metrics.preemptions} />
          </div>
        </div>
      </div>

      {/* Token Statistics */}
      <div className="mt-6">
        <SectionHeading>Token Statistics</SectionHeading>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="PROMPT TOKENS" value={metrics.promptTokens.toLocaleString()} unit="total" />
          <MetricCard label="OUTPUT TOKENS" value={metrics.outputTokens.toLocaleString()} unit="total" />
        </div>
      </div>

      {/* Deployment Config */}
      <div className="mt-8">
        <p className="text-base font-semibold text-gray-900 dark:text-gray-50">Deployment Configuration</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 mb-4">Copy these files to deploy this configuration</p>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-0">
          {(['yaml', 'kubectl'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab
                  ? 'border-gray-900 dark:border-gray-50 text-gray-900 dark:text-gray-50'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
              ].join(' ')}
            >
              {tab === 'yaml' ? 'values.yaml' : 'kubectl apply'}
            </button>
          ))}
        </div>

        <CodeBlock
          code={codeContent}
          language={activeTab === 'yaml' ? 'yaml' : 'bash'}
        />
      </div>

      {/* Bottom buttons — Copy Config, Export JSON, Reset all on one row */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleCopy}
          className="text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-800"
        >
          {copied ? 'Copied!' : 'Copy Config'}
        </button>
        <button
          onClick={() => {
            const data = { config, metrics }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'llm-d-simulation.json'
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-800"
        >
          Export JSON
        </button>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-800"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

// ─── Comparison panel ─────────────────────────────────────────────────────────

function ComparePanel({ sims, onBack }: { sims: SavedSim[]; onBack: () => void }) {
  const [a, b] = sims.slice(0, 2)

  type MetricKey = keyof Pick<Metrics, 'ttft' | 'e2e' | 'itl' | 'throughput' | 'reqPerSec'>

  function cmp(
    aVal: number,
    bVal: number,
    lowerIsBetter: boolean,
    which: 'a' | 'b',
  ): 'better' | 'worse' | null {
    const aBetter = lowerIsBetter ? aVal < bVal : aVal > bVal
    if (aVal === bVal) return null
    if (which === 'a') return aBetter ? 'better' : 'worse'
    return aBetter ? 'worse' : 'better'
  }

  function LatRow({
    label,
    aVal,
    bVal,
    unit,
    lower,
  }: {
    label: string
    aVal: number
    bVal: number
    unit?: string
    lower?: boolean
  }) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label={label}
          value={aVal}
          unit={unit}
          highlight={cmp(aVal, bVal, lower ?? true, 'a')}
        />
        <MetricCard
          label={label}
          value={bVal}
          unit={unit}
          highlight={cmp(aVal, bVal, lower ?? true, 'b')}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-base font-semibold text-gray-900 dark:text-gray-50">Comparison</p>
        <button
          onClick={onBack}
          className="text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-800"
        >
          ← Back to Simulator
        </button>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[a, b].map((sim) => (
          <div key={sim.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Simulation {sim.id}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mt-1">{sim.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sim.config.model}</p>
          </div>
        ))}
      </div>

      <SectionHeading>TTFT (Time to First Token)</SectionHeading>
      <div className="flex flex-col gap-2 mb-6">
        <LatRow label="MEAN" aVal={a.metrics.ttft.mean} bVal={b.metrics.ttft.mean} unit="ms" />
        <LatRow label="P90" aVal={a.metrics.ttft.p90} bVal={b.metrics.ttft.p90} unit="ms" />
        <LatRow label="P99" aVal={a.metrics.ttft.p99} bVal={b.metrics.ttft.p99} unit="ms" />
      </div>

      <SectionHeading>E2E Latency</SectionHeading>
      <div className="flex flex-col gap-2 mb-6">
        <LatRow label="MEAN" aVal={a.metrics.e2e.mean} bVal={b.metrics.e2e.mean} unit="ms" />
        <LatRow label="P90" aVal={a.metrics.e2e.p90} bVal={b.metrics.e2e.p90} unit="ms" />
        <LatRow label="P99" aVal={a.metrics.e2e.p99} bVal={b.metrics.e2e.p99} unit="ms" />
      </div>

      <SectionHeading>Throughput</SectionHeading>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="THROUGHPUT"
            value={a.metrics.throughput}
            unit="tok/s"
            highlight={cmp(a.metrics.throughput, b.metrics.throughput, false, 'a')}
          />
          <MetricCard
            label="THROUGHPUT"
            value={b.metrics.throughput}
            unit="tok/s"
            highlight={cmp(a.metrics.throughput, b.metrics.throughput, false, 'b')}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="REQUESTS/SEC"
            value={a.metrics.reqPerSec}
            unit="req/s"
            highlight={cmp(a.metrics.reqPerSec, b.metrics.reqPerSec, false, 'a')}
          />
          <MetricCard
            label="REQUESTS/SEC"
            value={b.metrics.reqPerSec}
            unit="req/s"
            highlight={cmp(a.metrics.reqPerSec, b.metrics.reqPerSec, false, 'b')}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-100 border border-green-300" />
          Better
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-50 border border-red-200" />
          Worse
        </span>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-24">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-300 dark:text-gray-600 mb-4"
        aria-hidden
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8h4M7 12h8" />
      </svg>
      <p className="text-gray-400 dark:text-gray-500 text-base">Configure your workload and click Run Simulation</p>
      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Results will appear here</p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SimulatorClient() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [selectedPreset, setSelectedPreset] = useState('')
  const [hasResults, setHasResults] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [savedSims, setSavedSims] = useState<SavedSim[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [simCounter, setSimCounter] = useState(0)

  const set = useCallback(<K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  function applyPreset(name: string) {
    const preset = PRESETS[name]
    if (preset) setConfig((prev) => ({ ...prev, ...preset }))
  }

  function handleRun() {
    setHasResults(true)
    setShowComparison(false)
  }

  function handleReset() {
    setConfig(DEFAULT_CONFIG)
    setSelectedPreset('')
    setHasResults(false)
    setShowComparison(false)
  }

  function handleSave() {
    const next = simCounter + 1
    setSimCounter(next)
    setSavedSims((prev) => [
      ...prev,
      {
        id: next,
        label: configLabel(config),
        config: { ...config },
        metrics: varyMetrics(BASE_METRICS),
      },
    ])
  }

  function removeSim(id: number) {
    setSavedSims((prev) => {
      const next = prev.filter((s) => s.id !== id)
      if (next.length < 2) setShowComparison(false)
      return next
    })
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-[#1a2332] flex flex-col">
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* ── Left panel: Configuration ── */}
        <div className="lg:w-[40%] lg:max-w-[480px] flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-8 flex flex-col flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Inference Simulator</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
              Configure your workload to estimate performance and generate deployment configs
            </p>

            {/* Preset dropdown */}
            <div>
              <SectionLabel>Load Preset</SectionLabel>
              <select
                className={inputCls()}
                value={selectedPreset}
                onChange={(e) => { setSelectedPreset(e.target.value); if (e.target.value) applyPreset(e.target.value) }}
              >
                <option value="">-- Select a preset --</option>
                {Object.keys(PRESETS).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Model & Hardware */}
            <FormSection title="Model & Hardware">
              <div>
                <SectionLabel>Model</SectionLabel>
                <input
                  type="text"
                  className={inputCls()}
                  placeholder="qwen/qwen3-14b"
                  value={config.model}
                  onChange={(e) => set('model', e.target.value)}
                />
                <FieldHelper>HuggingFace model identifier</FieldHelper>
              </div>
              <div>
                <SectionLabel>GPU</SectionLabel>
                <select
                  className={inputCls()}
                  value={config.gpu}
                  onChange={(e) => set('gpu', e.target.value)}
                >
                  <option>NVIDIA H100</option>
                  <option>NVIDIA A100 80GB</option>
                  <option>AMD MI300X</option>
                </select>
              </div>
            </FormSection>

            {/* Cluster Configuration */}
            <FormSection title="Cluster Configuration">
              <div>
                <SectionLabel>Number of Instances</SectionLabel>
                <input
                  type="number"
                  className={inputCls()}
                  min={1}
                  value={config.instances}
                  onChange={(e) => set('instances', parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <SectionLabel>Routing Policy</SectionLabel>
                <select
                  className={inputCls()}
                  value={config.routingPolicy}
                  onChange={(e) => set('routingPolicy', e.target.value)}
                >
                  <option>Round Robin</option>
                  <option>Prefix Cache Aware</option>
                  <option>Predicted Latency</option>
                </select>
              </div>
            </FormSection>

            {/* Workload */}
            <FormSection title="Workload">
              <div>
                <SectionLabel>Request Rate (req/sec)</SectionLabel>
                <input
                  type="number"
                  className={inputCls()}
                  min={1}
                  value={config.requestRate}
                  onChange={(e) => set('requestRate', parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <SectionLabel>Number of Requests</SectionLabel>
                <input
                  type="number"
                  className={inputCls()}
                  min={1}
                  value={config.numRequests}
                  onChange={(e) => set('numRequests', parseInt(e.target.value) || 1)}
                />
              </div>
            </FormSection>

            {/* Advanced Settings */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-50 w-full text-left"
              >
                Advanced Settings
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {advancedOpen && (
                <div className="mt-4 pl-4 border-l border-gray-200 dark:border-gray-700 flex flex-col gap-4">
                  <div>
                    <SectionLabel>Workload Type</SectionLabel>
                    <select
                      className={inputCls()}
                      value={config.workloadType}
                      onChange={(e) => set('workloadType', e.target.value)}
                    >
                      <option>Distribution (CLI default)</option>
                      <option>Uniform</option>
                      <option>Custom</option>
                    </select>
                    <FieldHelper>
                      Distribution uses CLI defaults: prompt=512±256, output=512±256 tokens
                    </FieldHelper>
                  </div>
                  <div>
                    <SectionLabel>Total KV Blocks</SectionLabel>
                    <input
                      type="number"
                      className={inputCls()}
                      placeholder="Leave blank for auto"
                      value={config.totalKvBlocks}
                      onChange={(e) => set('totalKvBlocks', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <SectionLabel>Enable Disaggregated Serving</SectionLabel>
                      <FieldHelper>Separate prefill and decode across instances</FieldHelper>
                    </div>
                    <Toggle
                      checked={config.disaggregated}
                      onChange={(v) => set('disaggregated', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <SectionLabel>Enable Prefix Caching</SectionLabel>
                      <FieldHelper>Reuse KV cache across requests with shared prefixes</FieldHelper>
                    </div>
                    <Toggle
                      checked={config.prefixCaching}
                      onChange={(v) => set('prefixCaching', v)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Run button */}
            <button
              onClick={handleRun}
              className="mt-8 w-full py-3 bg-[#7B2D8E] hover:bg-[#5B1D6E] text-white font-medium rounded-lg transition-colors"
            >
              Run Simulation
            </button>

            {/* Saved simulations */}
            {savedSims.length > 0 && (
              <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Saved Simulations{' '}
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                      {savedSims.length}
                    </span>
                  </p>
                  {savedSims.length >= 2 && (
                    <button
                      onClick={() => setShowComparison(true)}
                      className="text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1 hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-800"
                    >
                      Compare
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedSims.map((sim) => (
                    <span
                      key={sim.id}
                      className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full px-3 py-1"
                    >
                      {sim.label}
                      <button
                        onClick={() => removeSim(sim.id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors leading-none"
                        aria-label={`Remove ${sim.label}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: Results ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {showComparison && savedSims.length >= 2 ? (
              <ComparePanel sims={savedSims} onBack={() => setShowComparison(false)} />
            ) : hasResults ? (
              <ResultsPanel
                config={config}
                metrics={BASE_METRICS}
                onSave={handleSave}
                onReset={handleReset}
                saveLabel="Save to Compare"
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
