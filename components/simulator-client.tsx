'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Workload = 'Chatbot' | 'Agentic' | 'RL'
type ModelId =
  | 'qwen/qwen3-14b'
  | 'meta-llama/Llama-3.1-70B'
  | 'deepseek-ai/DeepSeek-R1'
  | 'mistralai/Mixtral-8x7B'
type Accelerator = 'NVIDIA H100' | 'NVIDIA A100 80GB' | 'AMD MI300X'
type RoutingStrategy = 'Queue Depth' | 'Precise Prefix Caching' | 'KV Utilization'

interface SimConfig {
  workload: Workload
  model: ModelId
  accelerator: Accelerator
  routing: RoutingStrategy
  requestRate: number
  instances: number
}

interface InstanceMetrics {
  queueDepth: number
  batchSize: number
  kvUtilization: number
  cacheHitRate: number
  completedRequests: number
}

interface AggregateMetrics {
  ttftMean: number
  ttftP99: number
  e2eMean: number
  throughput: number
  reqPerSec: number
}

interface SavedScenario {
  id: number
  label: string
  config: SimConfig
  metrics: AggregateMetrics
}

// ─── Blank/initial values (used for SSR to prevent hydration mismatches) ──────

const BLANK_INSTANCE: InstanceMetrics = {
  queueDepth: 0,
  batchSize: 0,
  kvUtilization: 0,
  cacheHitRate: 0,
  completedRequests: 0,
}

const BLANK_AGG: AggregateMetrics = {
  ttftMean: 0,
  ttftP99: 0,
  e2eMean: 0,
  throughput: 0,
  reqPerSec: 0,
}

// ─── Mock data math (deterministic — no Math.random) ─────────────────────────

const MODEL_LATENCY_MULTIPLIER: Record<ModelId, number> = {
  'qwen/qwen3-14b': 1.0,
  'meta-llama/Llama-3.1-70B': 2.1,
  'deepseek-ai/DeepSeek-R1': 2.6,
  'mistralai/Mixtral-8x7B': 1.5,
}

const ACCELERATOR_MULTIPLIER: Record<Accelerator, number> = {
  'NVIDIA H100': 1.0,
  'NVIDIA A100 80GB': 1.35,
  'AMD MI300X': 1.15,
}

const WORKLOAD_PARAMS: Record<Workload, { queueMultiplier: number; batchMultiplier: number; latencyMultiplier: number }> = {
  Chatbot: { queueMultiplier: 1.0, batchMultiplier: 1.0, latencyMultiplier: 1.0 },
  Agentic: { queueMultiplier: 1.5, batchMultiplier: 0.8, latencyMultiplier: 1.2 },
  RL: { queueMultiplier: 1.2, batchMultiplier: 1.6, latencyMultiplier: 0.85 },
}

const ROUTING_PARAMS: Record<RoutingStrategy, {
  cacheHitBase: number; cacheHitRange: number; kvBalance: number; throughputMultiplier: number
}> = {
  'Queue Depth':           { cacheHitBase: 0.40, cacheHitRange: 0.20, kvBalance: 0.85, throughputMultiplier: 1.0 },
  'Precise Prefix Caching':{ cacheHitBase: 0.70, cacheHitRange: 0.20, kvBalance: 0.75, throughputMultiplier: 0.95 },
  'KV Utilization':        { cacheHitBase: 0.45, cacheHitRange: 0.15, kvBalance: 1.0,  throughputMultiplier: 1.1 },
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function jitter(value: number, seed: number, pct = 0.05): number {
  return value * (1 + (seededRandom(seed) * 2 - 1) * pct)
}

function computeInstanceMetrics(cfg: SimConfig, idx: number, seed: number): InstanceMetrics {
  const { requestRate, instances, routing, workload } = cfg
  const rp = ROUTING_PARAMS[routing]
  const wp = WORKLOAD_PARAMS[workload]
  const perRate = requestRate / instances
  const lf = Math.min(perRate / 10, 2.5)

  const rawQueue = lf * wp.queueMultiplier * 3.2
  const queueDepth = Math.max(0, Math.round(jitter(rawQueue, seed + idx, 0.08)))

  const rawBatch = Math.max(1, Math.round(lf * wp.batchMultiplier * 4))
  const batchSize = Math.round(jitter(rawBatch, seed + idx + 100, 0.06))

  const kvBase = Math.min(0.95, lf * 0.32 * rp.kvBalance)
  const kvSkew = routing === 'Precise Prefix Caching' && idx % 2 === 0 ? 0.12 : 0
  const kvUtilization = Math.min(0.99, jitter(kvBase + kvSkew, seed + idx + 200, 0.07))

  const cacheHitRate = Math.min(
    0.99,
    jitter(rp.cacheHitBase + seededRandom(seed + idx + 300) * rp.cacheHitRange, seed + idx + 400, 0.05),
  )

  const completedRequests = Math.round(jitter(perRate * 17, seed + idx + 500, 0.1))

  return { queueDepth, batchSize, kvUtilization, cacheHitRate, completedRequests }
}

function computeAggregateMetrics(cfg: SimConfig, seed: number): AggregateMetrics {
  const { requestRate, instances, model, accelerator, routing, workload } = cfg
  const lm = MODEL_LATENCY_MULTIPLIER[model]
  const am = ACCELERATOR_MULTIPLIER[accelerator]
  const wp = WORKLOAD_PARAMS[workload]
  const rp = ROUTING_PARAMS[routing]
  const lf = Math.min(requestRate / (instances * 10), 2.8)

  const cacheReduction = routing === 'Precise Prefix Caching' ? 0.65 : 1.0
  const baseTTFT = 30 * lm * am * wp.latencyMultiplier
  const ttftMean = jitter(baseTTFT * (1 + lf * 0.45) * cacheReduction, seed, 0.05)
  const ttftP99 = jitter(ttftMean * 1.75, seed + 1, 0.04)

  const baseE2E = 4677 * lm * am
  const e2eMean = jitter(baseE2E * (1 + lf * 0.35) * wp.latencyMultiplier, seed + 2, 0.05)

  const saturation = Math.min(1.0, lf / 2.0)
  const baseThroughput = (3148 / lm / am) * rp.throughputMultiplier * instances
  const throughput = jitter(baseThroughput * (0.3 + saturation * 0.7), seed + 3, 0.04)
  const reqPerSec = jitter(Math.min(requestRate * 0.95, throughput / 55), seed + 4, 0.03)

  return {
    ttftMean: Math.round(ttftMean * 10) / 10,
    ttftP99: Math.round(ttftP99 * 10) / 10,
    e2eMean: Math.round(e2eMean),
    throughput: Math.round(throughput),
    reqPerSec: Math.round(reqPerSec * 10) / 10,
  }
}

function varyMetrics(m: AggregateMetrics, seed: number): AggregateMetrics {
  return {
    ttftMean: Math.round(jitter(m.ttftMean, seed, 0.12) * 10) / 10,
    ttftP99: Math.round(jitter(m.ttftP99, seed + 1, 0.12) * 10) / 10,
    e2eMean: Math.round(jitter(m.e2eMean, seed + 2, 0.12)),
    throughput: Math.round(jitter(m.throughput, seed + 3, 0.12)),
    reqPerSec: Math.round(jitter(m.reqPerSec, seed + 4, 0.12) * 10) / 10,
  }
}

function baselineMetrics(m: AggregateMetrics): AggregateMetrics {
  return {
    ttftMean: Math.round(m.ttftMean * 1.4 * 10) / 10,
    ttftP99: Math.round(m.ttftP99 * 1.45 * 10) / 10,
    e2eMean: Math.round(m.e2eMean * 1.3),
    throughput: Math.round(m.throughput * 0.7),
    reqPerSec: Math.round(m.reqPerSec * 0.72 * 10) / 10,
  }
}

// ─── SLO color helpers ────────────────────────────────────────────────────────

function ttftColor(v: number) {
  if (v < 80) return 'text-green-600 dark:text-green-400'
  if (v < 150) return 'text-amber-500 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}
function e2eColor(v: number) {
  if (v < 6000) return 'text-green-600 dark:text-green-400'
  if (v < 10000) return 'text-amber-500 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}
function throughputColor(v: number) {
  if (v > 2000) return 'text-green-600 dark:text-green-400'
  if (v > 1000) return 'text-amber-500 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// ─── Top-bar sub-components ───────────────────────────────────────────────────

function Select({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-xs uppercase tracking-wide text-gray-400 font-medium whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function Slider({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-1 min-w-[160px]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs uppercase tracking-wide text-gray-400 font-medium whitespace-nowrap">{label}</span>
        <span className="text-white text-sm font-semibold tabular-nums shrink-0">{value} req/s</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #7B2D8E ${pct}%, #4B5563 ${pct}%)` }}
      />
    </div>
  )
}

function Stepper({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-gray-400 font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded text-lg leading-none transition-colors"
        >−</button>
        <span className="w-5 text-center text-white text-sm font-semibold tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded text-lg leading-none transition-colors"
        >+</button>
      </div>
    </div>
  )
}

// ─── Visualization sub-components ────────────────────────────────────────────

// Animated dots flowing downward — only rendered after mount to avoid hydration mismatch
function FlowDots({ requestRate, mounted }: { requestRate: number; mounted: boolean }) {
  const count = Math.max(2, Math.min(7, Math.floor(requestRate / 13)))
  const dur = (Math.max(0.5, 2.2 - requestRate / 55)).toFixed(2)
  if (!mounted) return <div className="h-7" />
  return (
    <div className="flex justify-center gap-2.5 h-7 items-center overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400"
          style={{
            animation: `simFlowDown ${dur}s linear ${((i / count) * parseFloat(dur)).toFixed(2)}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}

// Orthogonal tree connector between the routing layer and the instance cards (or vice-versa).
//
// Both this SVG and the instance grid below use the same equal-column math:
//   center_i = (2i + 1) / (2 * count) * 100   (in viewBox 0–100 units)
//
// Because the SVG is `w-full` and the grid uses equal columns of the same container width,
// the x-positions line up with actual card centers precisely — no measurement needed.
//
// `vectorEffect="non-scaling-stroke"` keeps lines at 1px regardless of SVG stretching.
function TreeConnector({ count, direction }: {
  count: number
  direction: 'fan' | 'gather'
}) {
  // Column centers: same formula used by the CSS grid below
  const centers = Array.from({ length: count }, (_, i) => (2 * i + 1) / (2 * count) * 100)
  const L = centers[0]
  const R = centers[count - 1]
  const busY = 12  // y of the horizontal bus line (viewBox height = 24)

  // Build all path segments as individual <line> elements
  const lines =
    direction === 'fan'
      ? [
          // 1. Center vertical drop → bus
          { x1: 50, y1: 0,    x2: 50, y2: busY },
          // 2. Horizontal bus (skip when count === 1 — the two lines would overlap)
          ...(count > 1 ? [{ x1: L, y1: busY, x2: R, y2: busY }] : []),
          // 3. Vertical drops → each card top
          ...centers.map(x => ({ x1: x, y1: busY, x2: x, y2: 24 })),
        ]
      : [
          // 1. Vertical rises from each card bottom
          ...centers.map(x => ({ x1: x, y1: 0,    x2: x, y2: busY })),
          // 2. Horizontal bus
          ...(count > 1 ? [{ x1: L, y1: busY, x2: R, y2: busY }] : []),
          // 3. Single center drop → hardware layer
          { x1: 50, y1: busY, x2: 50, y2: 24 },
        ]

  return (
    <svg
      viewBox="0 0 100 24"
      className="w-full h-6 text-gray-300 dark:text-gray-600"
      preserveAspectRatio="none"
      aria-hidden
    >
      {lines.map((seg, i) => (
        <line
          key={i}
          x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}

// Small progress bar — width is 0% on SSR, animated to real value after mount
function ProgressBar({ value, color, mounted }: { value: number; color: 'blue' | 'red'; mounted: boolean }) {
  const bg = color === 'red' ? 'bg-red-500' : 'bg-blue-500'
  const w = mounted ? `${Math.min(100, Math.round(value * 100))}%` : '0%'
  return (
    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
      <div className={`h-full ${bg} rounded-full transition-all duration-500`} style={{ width: w }} />
    </div>
  )
}

function InstanceCard({ index, metrics, accelerator, mounted }: {
  index: number
  metrics: InstanceMetrics
  accelerator: Accelerator
  mounted: boolean
}) {
  const isHot = mounted && metrics.queueDepth > 5
  const kvHigh = mounted && metrics.kvUtilization > 0.8
  const accelShort: Record<Accelerator, string> = {
    'NVIDIA H100': 'H100', 'NVIDIA A100 80GB': 'A100', 'AMD MI300X': 'MI300X',
  }
  return (
    <div className={`
      bg-white dark:bg-gray-900 rounded-lg p-3 min-w-[148px] w-[148px] flex-shrink-0
      border transition-all duration-300
      ${isHot
        ? 'border-amber-300 dark:border-amber-600 shadow-[0_0_0_3px_rgba(251,191,36,0.12)]'
        : 'border-gray-200 dark:border-gray-700'}
    `}>
      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 font-mono leading-none">
        instance_{index}
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between gap-2">
          <span className="text-gray-400 dark:text-gray-500">Queue</span>
          <span className={`font-semibold tabular-nums ${isHot ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {mounted ? metrics.queueDepth : '—'}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-400 dark:text-gray-500">Batch</span>
          <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">
            {mounted ? metrics.batchSize : '—'}
          </span>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between gap-2">
            <span className="text-gray-400 dark:text-gray-500">KV Util</span>
            <span className={`font-semibold tabular-nums ${kvHigh ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
              {mounted ? `${Math.round(metrics.kvUtilization * 100)}%` : '—'}
            </span>
          </div>
          <ProgressBar value={metrics.kvUtilization} color={kvHigh ? 'red' : 'blue'} mounted={mounted} />
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between gap-2">
            <span className="text-gray-400 dark:text-gray-500">Cache Hit</span>
            <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">
              {mounted ? `${Math.round(metrics.cacheHitRate * 100)}%` : '—'}
            </span>
          </div>
          <ProgressBar value={metrics.cacheHitRate} color="blue" mounted={mounted} />
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-400 dark:text-gray-500">Done</span>
          <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">
            {mounted ? metrics.completedRequests : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Metrics panel sub-component ─────────────────────────────────────────────

function MetricCard({ label, value, unit, colorClass, improvement, baseline }: {
  label: string; value: string; unit: string; colorClass: string
  improvement?: string; baseline?: boolean
}) {
  return (
    <div className={`
      rounded-lg p-3 text-center
      ${baseline
        ? 'bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-300 dark:border-gray-600'
        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}
    `}>
      <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">{label}</div>
      <div className={`text-xl font-semibold tabular-nums transition-all duration-300 ${baseline ? 'text-gray-500 dark:text-gray-400' : colorClass}`}>
        {value}<span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span>
      </div>
      {improvement && (
        <div className="mt-1 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-full px-1.5 py-0.5 inline-block leading-none">
          {improvement}
        </div>
      )}
    </div>
  )
}

// ─── Comparison modal ─────────────────────────────────────────────────────────

function ComparisonModal({ scenarios, onClose }: {
  scenarios: SavedScenario[]; onClose: () => void
}) {
  const rows: { key: keyof AggregateMetrics; label: string; lowerBetter: boolean; unit: string }[] = [
    { key: 'ttftMean', label: 'TTFT Mean',    lowerBetter: true,  unit: 'ms' },
    { key: 'ttftP99',  label: 'TTFT P99',     lowerBetter: true,  unit: 'ms' },
    { key: 'e2eMean',  label: 'E2E Latency',  lowerBetter: true,  unit: 'ms' },
    { key: 'throughput', label: 'Throughput', lowerBetter: false, unit: 'tok/s' },
    { key: 'reqPerSec',  label: 'Req/sec',    lowerBetter: false, unit: 'req/s' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Scenario Comparison</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-gray-500 dark:text-gray-400 font-medium pb-3 pr-4">Metric</th>
                {scenarios.map(s => (
                  <th key={s.id} className="text-left pb-3 pr-4 min-w-[160px]">
                    <div className="text-gray-900 dark:text-gray-100 font-semibold text-xs leading-tight">{s.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const vals = scenarios.map(s => s.metrics[r.key] as number)
                const best = r.lowerBetter ? Math.min(...vals) : Math.max(...vals)
                const worst = r.lowerBetter ? Math.max(...vals) : Math.min(...vals)
                return (
                  <tr key={r.key} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{r.label}</td>
                    {scenarios.map(s => {
                      const v = s.metrics[r.key] as number
                      return (
                        <td key={s.id} className={`py-2.5 pr-4 font-semibold tabular-nums ${v === best ? 'text-green-600 dark:text-green-400' : v === worst ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {v.toLocaleString()} {r.unit}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 pb-4">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded px-4 py-1.5 transition-colors">
            ← Back to Simulator
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CSS animation injected once ─────────────────────────────────────────────

const ANIM_CSS = `
@keyframes simFlowDown {
  0%   { opacity: 0; transform: translateY(-10px); }
  25%  { opacity: 0.9; }
  75%  { opacity: 0.9; }
  100% { opacity: 0; transform: translateY(10px); }
}
`

// ─── Main component ───────────────────────────────────────────────────────────

export function SimulatorClient() {
  // ── Hydration safety: all computed values start as blanks, fill in after mount ──
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [config, setConfig] = useState<SimConfig>({
    workload: 'Chatbot',
    model: 'qwen/qwen3-14b',
    accelerator: 'NVIDIA H100',
    routing: 'Queue Depth',
    requestRate: 30,
    instances: 3,
  })

  // Jitter seed ticks every 3s (client-only — starts after mount)
  const [jitterSeed, setJitterSeed] = useState(42)
  useEffect(() => {
    const id = setInterval(() => setJitterSeed(s => s + 1), 3000)
    return () => clearInterval(id)
  }, [])

  const [showBaseline, setShowBaseline] = useState(false)
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [counter, setCounter] = useState(1)

  // All metric computation happens client-side only (mounted guard)
  const instanceMetrics = useMemo<InstanceMetrics[]>(() => {
    if (!mounted) return Array.from({ length: config.instances }, () => ({ ...BLANK_INSTANCE }))
    return Array.from({ length: config.instances }, (_, i) =>
      computeInstanceMetrics(config, i, jitterSeed),
    )
  }, [config, jitterSeed, mounted])

  const aggMetrics = useMemo<AggregateMetrics>(() => {
    if (!mounted) return { ...BLANK_AGG }
    return computeAggregateMetrics(config, jitterSeed)
  }, [config, jitterSeed, mounted])

  const baselineAgg = useMemo(() => baselineMetrics(aggMetrics), [aggMetrics])

  const update = useCallback(<K extends keyof SimConfig>(key: K, val: SimConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: val }))
  }, [])

  const saveScenario = useCallback(() => {
    const short: Record<Accelerator, string> = {
      'NVIDIA H100': 'H100', 'NVIDIA A100 80GB': 'A100', 'AMD MI300X': 'MI300X',
    }
    const label = `${short[config.accelerator]} ×${config.instances} / ${config.routing} / ${config.requestRate} req/s`
    const varied = varyMetrics(aggMetrics, Date.now())
    setSavedScenarios(prev => [...prev, { id: counter, label, config: { ...config }, metrics: varied }])
    setCounter(c => c + 1)
  }, [config, aggMetrics, counter])

  const pctStr = (llmd: number, base: number, lowerBetter: boolean) => {
    const d = lowerBetter ? ((base - llmd) / base) * 100 : ((llmd - base) / base) * 100
    return `${lowerBetter ? '↓' : '↑'} ${Math.round(d)}%`
  }

  const accelLabel: Record<Accelerator, string> = {
    'NVIDIA H100': 'NVIDIA H100', 'NVIDIA A100 80GB': 'NVIDIA A100 80GB', 'AMD MI300X': 'AMD MI300X',
  }

  const fmtAgg = (v: number) => mounted ? v.toLocaleString() : '—'

  return (
    <div
      className="flex flex-col bg-gray-50 dark:bg-[#1a2332] overflow-hidden"
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      {/* Inject keyframe animation once */}
      <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />

      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <div className="bg-gray-900 border-b border-gray-700 px-5 py-3 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto flex flex-wrap items-end gap-x-6 gap-y-3">
          <Select
            label="Workload"
            value={config.workload}
            options={['Chatbot', 'Agentic', 'RL']}
            onChange={v => update('workload', v as Workload)}
          />
          <Select
            label="Model"
            value={config.model}
            options={['qwen/qwen3-14b', 'meta-llama/Llama-3.1-70B', 'deepseek-ai/DeepSeek-R1', 'mistralai/Mixtral-8x7B']}
            onChange={v => update('model', v as ModelId)}
          />
          <Select
            label="Accelerator"
            value={config.accelerator}
            options={['NVIDIA H100', 'NVIDIA A100 80GB', 'AMD MI300X']}
            onChange={v => update('accelerator', v as Accelerator)}
          />
          <Select
            label="Routing Strategy"
            value={config.routing}
            options={['Queue Depth', 'Precise Prefix Caching', 'KV Utilization']}
            onChange={v => update('routing', v as RoutingStrategy)}
          />
          <div className="flex-1 min-w-[180px] max-w-[260px]">
            <Slider label="Request Rate" value={config.requestRate} min={1} max={100} onChange={v => update('requestRate', v)} />
          </div>
          <Stepper label="Instances" value={config.instances} min={1} max={8} onChange={v => update('instances', v)} />
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-3">

          {/* ── LLM-D STACK CONTAINER ──────────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">

            {/* Container header — "llm-d" label like a fieldset legend */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">llm-d</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Kubernetes-native distributed inference</span>
            </div>

            <div className="px-5 py-4 flex flex-col gap-0">

              {/* ── LAYER 1: Incoming Requests ──────────────────────────────── */}
              <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 shrink-0" aria-hidden />
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 leading-none mb-0.5">Incoming Requests</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {config.workload} · {config.requestRate} req/s
                    </div>
                  </div>
                </div>
                <FlowDots requestRate={config.requestRate} mounted={mounted} />
              </div>

              {/* Connector: L1 → L2 */}
              <div className="mx-auto w-px h-4 bg-gray-300 dark:bg-gray-600" aria-hidden />

              {/* ── LAYER 2: Routing ──────────────────────────────────────────── */}
              <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 flex items-center gap-3">
                <div className="w-2 h-2 rounded bg-blue-400 dark:bg-blue-500 shrink-0" aria-hidden />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 leading-none mb-0.5">Routing Layer</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{config.routing}</div>
                </div>
                <div className="ml-auto text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                  Distributes to {config.instances} {config.instances === 1 ? 'instance' : 'instances'}
                </div>
              </div>

              {/* Fan connector: routing → instances (orthogonal tree) */}
              <TreeConnector count={config.instances} direction="fan" />

              {/* ── LAYER 3: Instances ──────────────────────────────────────────
                  Equal-column CSS grid — column centers match TreeConnector x-positions exactly.
                  Each cell is (100/N)% wide; card is fixed 148px, centered inside its cell.
                  Overflow-x scroll handles narrow viewports with many instances. */}
              <div className="overflow-x-auto">
                <div
                  style={{ display: 'grid', gridTemplateColumns: `repeat(${config.instances}, 1fr)` }}
                >
                  {instanceMetrics.map((m, i) => (
                    <div key={i} className="flex justify-center py-1">
                      <InstanceCard index={i} metrics={m} accelerator={config.accelerator} mounted={mounted} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gather connector: instances → hardware (orthogonal tree, mirrored) */}
              <TreeConnector count={config.instances} direction="gather" />

              {/* ── LAYER 4: Hardware ──────────────────────────────────────── */}
              <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 flex items-center gap-3">
                <div className="w-2 h-2 rounded bg-gray-400 dark:bg-gray-500 shrink-0" aria-hidden />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 leading-none mb-0.5">Hardware</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
                    {config.instances}× {accelLabel[config.accelerator]}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── METRICS PANEL ─────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4">

            {/* Panel header */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">SLO Metrics</span>
              <button
                onClick={() => setShowBaseline(v => !v)}
                className={`text-xs rounded-full px-3 py-0.5 border transition-colors ${showBaseline
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent'
                  : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-500'
                }`}
              >
                {showBaseline ? '✓ ' : ''}vs vLLM baseline
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={saveScenario}
                  className="text-xs border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Save Scenario
                </button>
                {savedScenarios.length >= 2 && (
                  <button
                    onClick={() => setShowComparison(true)}
                    className="text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded px-3 py-1 hover:bg-gray-700 transition-colors"
                  >
                    Compare
                  </button>
                )}
              </div>
            </div>

            {/* llm-d metrics row */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              <MetricCard label="TTFT Mean" value={fmtAgg(aggMetrics.ttftMean)} unit="ms"
                colorClass={ttftColor(aggMetrics.ttftMean)}
                improvement={showBaseline && mounted ? pctStr(aggMetrics.ttftMean, baselineAgg.ttftMean, true) : undefined} />
              <MetricCard label="TTFT P99" value={fmtAgg(aggMetrics.ttftP99)} unit="ms"
                colorClass={ttftColor(aggMetrics.ttftP99)}
                improvement={showBaseline && mounted ? pctStr(aggMetrics.ttftP99, baselineAgg.ttftP99, true) : undefined} />
              <MetricCard label="E2E Latency" value={fmtAgg(aggMetrics.e2eMean)} unit="ms"
                colorClass={e2eColor(aggMetrics.e2eMean)}
                improvement={showBaseline && mounted ? pctStr(aggMetrics.e2eMean, baselineAgg.e2eMean, true) : undefined} />
              <MetricCard label="Throughput" value={fmtAgg(aggMetrics.throughput)} unit="tok/s"
                colorClass={throughputColor(aggMetrics.throughput)}
                improvement={showBaseline && mounted ? pctStr(aggMetrics.throughput, baselineAgg.throughput, false) : undefined} />
              <MetricCard label="Requests/sec" value={fmtAgg(aggMetrics.reqPerSec)} unit="req/s"
                colorClass="text-green-600 dark:text-green-400"
                improvement={showBaseline && mounted ? pctStr(aggMetrics.reqPerSec, baselineAgg.reqPerSec, false) : undefined} />
            </div>

            {/* Baseline row */}
            {showBaseline && (
              <div className="mt-2">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">vLLM Baseline (Round Robin)</div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  <MetricCard label="TTFT Mean" value={fmtAgg(baselineAgg.ttftMean)} unit="ms" colorClass="" baseline />
                  <MetricCard label="TTFT P99"  value={fmtAgg(baselineAgg.ttftP99)}  unit="ms" colorClass="" baseline />
                  <MetricCard label="E2E Latency" value={fmtAgg(baselineAgg.e2eMean)} unit="ms" colorClass="" baseline />
                  <MetricCard label="Throughput" value={fmtAgg(baselineAgg.throughput)} unit="tok/s" colorClass="" baseline />
                  <MetricCard label="Requests/sec" value={fmtAgg(baselineAgg.reqPerSec)} unit="req/s" colorClass="" baseline />
                </div>
              </div>
            )}

            {/* Saved scenario chips */}
            {savedScenarios.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mr-1">Saved</span>
                {savedScenarios.map(s => (
                  <span key={s.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-2.5 py-0.5">
                    {s.label}
                    <button
                      onClick={() => setSavedScenarios(prev => prev.filter(x => x.id !== s.id))}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 leading-none ml-0.5"
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── COMPARISON MODAL ───────────────────────────────────────────────── */}
      {showComparison && (
        <ComparisonModal scenarios={savedScenarios} onClose={() => setShowComparison(false)} />
      )}
    </div>
  )
}
