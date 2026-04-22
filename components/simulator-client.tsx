'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Workload = 'Chatbot' | 'Agentic' | 'RL'
type ModelId =
  | 'qwen/qwen3-14b'
  | 'meta-llama/Llama-3.1-70B'
  | 'deepseek-ai/DeepSeek-R1'
  | 'mistralai/Mixtral-8x7B'
type Accelerator = 'NVIDIA H100' | 'NVIDIA A100 80GB' | 'AMD MI300X'
type RoutingMode = 'Round Robin' | 'Weighted'

interface WeightConfig { pc: number; qd: number; kv: number }

interface SloTargets { ttftMean: number; ttftP99: number; e2eMean: number; throughput: number }

interface SimConfig {
  workload: Workload
  model: ModelId
  accelerator: Accelerator
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
}

interface LlmdRow {
  id: number
  label: string
  weights: WeightConfig
  metrics: AggregateMetrics
}

interface SavedScenario {
  id: number
  label: string
  metrics: AggregateMetrics
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SLOS: Record<Workload, SloTargets> = {
  Chatbot: { ttftMean: 100,  ttftP99: 200,  e2eMean: 5000,  throughput: 5000  },
  Agentic: { ttftMean: 150,  ttftP99: 300,  e2eMean: 8000,  throughput: 4000  },
  RL:      { ttftMean: 500,  ttftP99: 1000, e2eMean: 30000, throughput: 10000 },
}

const METRIC_COLS = [
  { key: 'ttftMean'  as const, label: 'TTFT Mean',    unit: 'ms',    lowerBetter: true  },
  { key: 'ttftP99'   as const, label: 'TTFT P99',     unit: 'ms',    lowerBetter: true  },
  { key: 'e2eMean'   as const, label: 'E2E Latency',  unit: 'ms',    lowerBetter: true  },
  { key: 'throughput'as const, label: 'Throughput',   unit: 'tok/s', lowerBetter: false },
]

const MODEL_MULT: Record<ModelId, number> = {
  'qwen/qwen3-14b':              1.0,
  'meta-llama/Llama-3.1-70B':    2.1,
  'deepseek-ai/DeepSeek-R1':     2.6,
  'mistralai/Mixtral-8x7B':      1.5,
}

const ACCEL_MULT: Record<Accelerator, number> = {
  'NVIDIA H100':      1.0,
  'NVIDIA A100 80GB': 1.35,
  'AMD MI300X':       1.15,
}

const WORKLOAD_PARAMS: Record<Workload, { latencyMult: number; queueMult: number; batchMult: number }> = {
  Chatbot: { latencyMult: 1.0,  queueMult: 1.0, batchMult: 1.0 },
  Agentic: { latencyMult: 1.2,  queueMult: 1.5, batchMult: 0.8 },
  RL:      { latencyMult: 0.85, queueMult: 1.2, batchMult: 1.6 },
}

// ─── Mock math ────────────────────────────────────────────────────────────────

function seededRng(seed: number) { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x) }
function jitter(v: number, seed: number, pct = 0.05) { return v * (1 + (seededRng(seed) * 2 - 1) * pct) }

// Load factor: 1.0 = nominal load (2000 req/s across 8 instances at 250/ea)
function loadFactor(cfg: SimConfig) { return Math.min(cfg.requestRate / (cfg.instances * 250), 3.0) }

function rrMetrics(cfg: SimConfig, seed: number): AggregateMetrics {
  const lm = MODEL_MULT[cfg.model]
  const am = ACCEL_MULT[cfg.accelerator]
  const wp = WORKLOAD_PARAMS[cfg.workload]
  const lf = loadFactor(cfg)

  // At lf=1 (default): 30*4.5=135ms > 100ms SLO → red
  const ttftMean = jitter(30 * lm * am * wp.latencyMult * (1 + lf * 3.5), seed, 0.05)
  // P99 ratio 2.3× → 310ms > 200ms SLO → red
  const ttftP99  = jitter(ttftMean * 2.3, seed + 1, 0.04)
  // At lf=1: 4677*1.25=5846ms > 5000ms SLO → red
  const e2eMean  = jitter(4677 * lm * am * wp.latencyMult * (1 + lf * 0.25), seed + 2, 0.05)
  // Throughput: easily meets 5000 tok/s SLO → green (creates tension on latency metrics only)
  const sat = Math.min(1.0, lf / 2.0)
  const throughput = jitter((3148 / lm / am) * cfg.instances * (0.4 + sat * 0.6), seed + 3, 0.04)

  return {
    ttftMean:  Math.round(ttftMean * 10) / 10,
    ttftP99:   Math.round(ttftP99  * 10) / 10,
    e2eMean:   Math.round(e2eMean),
    throughput: Math.round(throughput),
  }
}

function weightedMetrics(cfg: SimConfig, w: WeightConfig, seed: number): AggregateMetrics {
  const base = rrMetrics(cfg, seed)
  const total = w.pc + w.qd + w.kv || 1
  const pcW = w.pc / total
  const qdW = w.qd / total
  const kvW = w.kv / total

  // Default (2/1/1): ttft_reduction=0.2825 → ttftMean=135*0.7175=96.9ms < 100ms ✓
  const ttftMean  = jitter(base.ttftMean * (1 - pcW * 0.50 - qdW * 0.08 - kvW * 0.05), seed + 10, 0.04)
  // P99 ratio improves 2.3→1.9 with better routing → 96.9*1.9=184ms < 200ms ✓
  const ttftP99   = jitter(ttftMean * 1.9, seed + 11, 0.04)
  // e2e_reduction default: 0.15 → 5846*0.85=4969ms < 5000ms ✓
  const e2eMean   = jitter(base.e2eMean * (1 - qdW * 0.30 - kvW * 0.18 - pcW * 0.06), seed + 12, 0.04)
  const throughput = jitter(base.throughput * (1 + kvW * 0.30 + qdW * 0.15 + pcW * 0.10), seed + 13, 0.04)

  return {
    ttftMean:  Math.round(ttftMean  * 10) / 10,
    ttftP99:   Math.round(ttftP99   * 10) / 10,
    e2eMean:   Math.round(e2eMean),
    throughput: Math.round(throughput),
  }
}

function instanceMetrics(cfg: SimConfig, mode: RoutingMode, w: WeightConfig, idx: number, seed: number): InstanceMetrics {
  const lf = loadFactor(cfg)
  const wp = WORKLOAD_PARAMS[cfg.workload]

  let cacheBase: number, kvBal: number, hotVariance: number
  if (mode === 'Round Robin') {
    cacheBase = 0.35; kvBal = 0.85; hotVariance = 0.35
  } else {
    const total = w.pc + w.qd + w.kv || 1
    cacheBase = 0.35 + (w.pc / total) * 0.55
    kvBal     = 0.85 + (w.kv / total) * 0.15
    hotVariance = Math.max(0.05, 0.35 - (w.qd / total) * 0.30)
  }

  // Round Robin creates hot-spots via deterministic position bias
  const hotBias = mode === 'Round Robin' ? seededRng(idx * 17 + 3) * 0.5 : 0

  const queueDepth       = Math.max(0, Math.round(jitter(lf * wp.queueMult * 3.5 * (1 + hotBias * hotVariance * 3), seed + idx, 0.08)))
  const batchSize        = Math.round(jitter(Math.max(1, lf * wp.batchMult * 4), seed + idx + 100, 0.06))
  const kvUtilization    = Math.min(0.99, jitter(Math.min(0.95, lf * 0.32 * kvBal * (1 + hotBias * (1 - kvBal) * 2)), seed + idx + 200, 0.07))
  const cacheHitRate     = Math.min(0.99, jitter(cacheBase + seededRng(seed + idx + 300) * 0.15, seed + idx + 400, 0.05))
  const completedRequests = Math.round(jitter((cfg.requestRate / cfg.instances) * 17, seed + idx + 500, 0.1))

  return { queueDepth, batchSize, kvUtilization, cacheHitRate, completedRequests }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function meetsTarget(value: number, target: number, lowerBetter: boolean) {
  return lowerBetter ? value <= target : value >= target
}
function pctDiff(value: number, baseline: number, lowerBetter: boolean) {
  const d = lowerBetter ? ((baseline - value) / baseline) * 100 : ((value - baseline) / baseline) * 100
  return `${lowerBetter ? '↓' : '↑'} ${Math.round(d)}%`
}

// ─── Top-bar primitives ───────────────────────────────────────────────────────

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
    <div className="flex flex-col gap-1 min-w-[200px]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs uppercase tracking-wide text-gray-400 font-medium whitespace-nowrap">{label}</span>
        <span className="text-white text-sm font-semibold tabular-nums shrink-0">{value.toLocaleString()} req/s</span>
      </div>
      <input
        type="range" min={min} max={max} step={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right,#7B2D8E ${pct}%,#4B5563 ${pct}%)` }}
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
        <button onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded text-lg leading-none transition-colors">−</button>
        <span className="w-6 text-center text-white text-sm font-semibold tabular-nums">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded text-lg leading-none transition-colors">+</button>
      </div>
    </div>
  )
}

// ─── Visualization primitives ─────────────────────────────────────────────────

function FlowDots({ requestRate, mounted }: { requestRate: number; mounted: boolean }) {
  const count = Math.max(2, Math.min(8, Math.floor(requestRate / 600)))
  const dur   = Math.max(0.4, 2.5 - requestRate / 2400).toFixed(2)
  if (!mounted) return <div className="h-7" />
  return (
    <div className="flex justify-center gap-2.5 h-7 items-center overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400"
          style={{ animation: `simFlowDown ${dur}s linear ${((i / count) * +dur).toFixed(2)}s infinite`, opacity: 0 }} />
      ))}
    </div>
  )
}

function TreeConnector({ count, direction }: { count: number; direction: 'fan' | 'gather' }) {
  const cx = Array.from({ length: count }, (_, i) => (2 * i + 1) / (2 * count) * 100)
  const [L, R, busY] = [cx[0], cx[count - 1], 12]
  const lines = direction === 'fan'
    ? [{ x1: 50, y1: 0, x2: 50, y2: busY }, ...(count > 1 ? [{ x1: L, y1: busY, x2: R, y2: busY }] : []), ...cx.map(x => ({ x1: x, y1: busY, x2: x, y2: 24 }))]
    : [...cx.map(x => ({ x1: x, y1: 0, x2: x, y2: busY })), ...(count > 1 ? [{ x1: L, y1: busY, x2: R, y2: busY }] : []), { x1: 50, y1: busY, x2: 50, y2: 24 }]
  return (
    <svg viewBox="0 0 100 24" className="w-full h-6 text-gray-300 dark:text-gray-600" preserveAspectRatio="none" aria-hidden>
      {lines.map((s, i) => <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
    </svg>
  )
}

function ProgressBar({ value, variant, mounted }: { value: number; variant: 'blue' | 'red' | 'green'; mounted: boolean }) {
  const bg = variant === 'red' ? 'bg-red-500' : variant === 'green' ? 'bg-green-500' : 'bg-blue-500'
  return (
    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
      <div className={`h-full ${bg} rounded-full transition-all duration-500`} style={{ width: mounted ? `${Math.min(100, Math.round(value * 100))}%` : '0%' }} />
    </div>
  )
}

function InstanceCard({ index, metrics: m, accelerator, mounted, isLlmd }: {
  index: number; metrics: InstanceMetrics; accelerator: Accelerator; mounted: boolean; isLlmd: boolean
}) {
  const isHot = mounted && m.queueDepth > 5
  const kvHigh = mounted && m.kvUtilization > 0.8
  const accelShort: Record<Accelerator, string> = { 'NVIDIA H100': 'H100', 'NVIDIA A100 80GB': 'A100', 'AMD MI300X': 'MI300X' }
  return (
    <div className={[
      'bg-white dark:bg-gray-900 rounded-lg p-3 min-w-[148px] w-[148px] flex-shrink-0 border transition-all duration-500',
      isLlmd ? 'border-purple-200 dark:border-purple-800' :
      isHot  ? 'border-amber-300 dark:border-amber-600 shadow-[0_0_0_3px_rgba(251,191,36,0.12)]' :
               'border-gray-200 dark:border-gray-700',
    ].join(' ')}>
      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2 font-mono leading-none">instance_{index}</div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between gap-2">
          <span className="text-gray-400 dark:text-gray-500">Queue</span>
          <span className={`font-semibold tabular-nums ${isHot && !isLlmd ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {mounted ? m.queueDepth : '—'}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-400 dark:text-gray-500">Batch</span>
          <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">{mounted ? m.batchSize : '—'}</span>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between gap-2">
            <span className="text-gray-400 dark:text-gray-500">KV Util</span>
            <span className={`font-semibold tabular-nums ${kvHigh && !isLlmd ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
              {mounted ? `${Math.round(m.kvUtilization * 100)}%` : '—'}
            </span>
          </div>
          <ProgressBar value={m.kvUtilization} variant={kvHigh && !isLlmd ? 'red' : 'blue'} mounted={mounted} />
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between gap-2">
            <span className="text-gray-400 dark:text-gray-500">Cache Hit</span>
            <span className={`font-semibold tabular-nums ${isLlmd ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
              {mounted ? `${Math.round(m.cacheHitRate * 100)}%` : '—'}
            </span>
          </div>
          <ProgressBar value={m.cacheHitRate} variant={isLlmd ? 'green' : 'blue'} mounted={mounted} />
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-gray-400 dark:text-gray-500">Done</span>
          <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">{mounted ? m.completedRequests : '—'}</span>
        </div>
      </div>
      <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500 font-mono text-right">
        {accelShort[accelerator]}
      </div>
    </div>
  )
}

// ─── Comparison modal ─────────────────────────────────────────────────────────

function ComparisonModal({ scenarios, onClose }: { scenarios: SavedScenario[]; onClose: () => void }) {
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
                <th className="text-left text-gray-500 dark:text-gray-400 font-medium pb-3 pr-6">Metric</th>
                {scenarios.map(s => (
                  <th key={s.id} className="text-left pb-3 pr-6 min-w-[160px]">
                    <div className="text-gray-900 dark:text-gray-100 font-semibold text-xs leading-tight">{s.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRIC_COLS.map(c => {
                const vals = scenarios.map(s => s.metrics[c.key])
                const best  = c.lowerBetter ? Math.min(...vals) : Math.max(...vals)
                const worst = c.lowerBetter ? Math.max(...vals) : Math.min(...vals)
                return (
                  <tr key={c.key} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-2.5 pr-6 text-gray-500 dark:text-gray-400 whitespace-nowrap">{c.label}</td>
                    {scenarios.map(s => {
                      const v = s.metrics[c.key]
                      return (
                        <td key={s.id} className={`py-2.5 pr-6 font-semibold tabular-nums ${v === best ? 'text-green-600 dark:text-green-400' : v === worst ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {v.toLocaleString()} {c.unit}
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
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CSS animations ───────────────────────────────────────────────────────────

const ANIM_CSS = `
@keyframes simFlowDown {
  0%   { opacity:0; transform:translateY(-10px); }
  25%  { opacity:0.9; }
  75%  { opacity:0.9; }
  100% { opacity:0; transform:translateY(10px); }
}
@keyframes simDotPulse {
  0%,100% { transform:scale(1); opacity:1; }
  50%     { transform:scale(1.2); opacity:0.8; }
}
`

// ─── Main component ───────────────────────────────────────────────────────────

export function SimulatorClient() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [config, setConfig] = useState<SimConfig>({
    workload: 'Chatbot',
    model: 'qwen/qwen3-14b',
    accelerator: 'NVIDIA H100',
    requestRate: 2000,
    instances: 8,
  })

  const [routing, setRouting]           = useState<RoutingMode>('Round Robin')
  const [weights, setWeights]           = useState<WeightConfig>({ pc: 2, qd: 1, kv: 1 })
  const [simulationRun, setSimRun]      = useState(false)
  const [llmdRows, setLlmdRows]         = useState<LlmdRow[]>([])
  const [rowId, setRowId]               = useState(1)
  const [sloTargets, setSloTargets]     = useState<SloTargets>(DEFAULT_SLOS.Chatbot)
  const [savedScenarios, setSaved]      = useState<SavedScenario[]>([])
  const [savedId, setSavedId]           = useState(1)
  const [showComparison, setShowCmp]    = useState(false)
  const [jitterSeed, setJitterSeed]     = useState(42)

  useEffect(() => {
    const id = setInterval(() => setJitterSeed(s => s + 1), 3000)
    return () => clearInterval(id)
  }, [])

  // Reset SLO targets when workload changes
  useEffect(() => { setSloTargets(DEFAULT_SLOS[config.workload]) }, [config.workload])

  const isLlmdActive = routing === 'Weighted' && simulationRun

  const baseline = useMemo<AggregateMetrics>(() => {
    if (!mounted) return { ttftMean: 0, ttftP99: 0, e2eMean: 0, throughput: 0 }
    return rrMetrics(config, jitterSeed)
  }, [config, jitterSeed, mounted])

  const rrInstances = useMemo<InstanceMetrics[]>(() => {
    if (!mounted) return Array.from({ length: config.instances }, () => ({ queueDepth: 0, batchSize: 0, kvUtilization: 0, cacheHitRate: 0, completedRequests: 0 }))
    return Array.from({ length: config.instances }, (_, i) => instanceMetrics(config, 'Round Robin', weights, i, jitterSeed))
  }, [config, weights, jitterSeed, mounted])

  const wInstances = useMemo<InstanceMetrics[]>(() => {
    if (!mounted) return Array.from({ length: config.instances }, () => ({ queueDepth: 0, batchSize: 0, kvUtilization: 0, cacheHitRate: 0, completedRequests: 0 }))
    return Array.from({ length: config.instances }, (_, i) => instanceMetrics(config, 'Weighted', weights, i, jitterSeed))
  }, [config, weights, jitterSeed, mounted])

  const displayInstances = isLlmdActive ? wInstances : rrInstances

  const missedCount = useMemo(() => {
    if (!mounted) return 0
    return METRIC_COLS.filter(c => !meetsTarget(baseline[c.key], sloTargets[c.key], c.lowerBetter)).length
  }, [baseline, sloTargets, mounted])

  const showBanner = routing === 'Round Robin' && missedCount >= 2

  const updateConfig = useCallback(<K extends keyof SimConfig>(key: K, val: SimConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: val }))
    setSimRun(false)
    setLlmdRows([])
  }, [])

  const switchRouting = useCallback((mode: RoutingMode) => {
    setRouting(mode)
    if (mode === 'Round Robin') setSimRun(false)
  }, [])

  const runSimulation = useCallback(() => {
    const seed = Date.now() % 100000
    const m = weightedMetrics(config, weights, seed)
    const label = `PC=${weights.pc}, QD=${weights.qd}, KV=${weights.kv}`
    setLlmdRows(prev => [...prev, { id: rowId, label, weights: { ...weights }, metrics: m }])
    setRowId(n => n + 1)
    setSimRun(true)
  }, [config, weights, rowId])

  const saveScenario = useCallback((label: string, metrics: AggregateMetrics) => {
    setSaved(prev => [...prev, { id: savedId, label, metrics }])
    setSavedId(n => n + 1)
  }, [savedId])

  const accelFull: Record<Accelerator, string> = {
    'NVIDIA H100': 'NVIDIA H100', 'NVIDIA A100 80GB': 'NVIDIA A100 80GB', 'AMD MI300X': 'AMD MI300X',
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-[#1a2332] overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />

      {/* ── TOP BAR ── */}
      <div className="bg-gray-900 border-b border-gray-700 px-5 py-3 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto flex flex-wrap items-end gap-x-6 gap-y-3">
          <Select label="Workload" value={config.workload}
            options={['Chatbot', 'Agentic', 'RL']}
            onChange={v => updateConfig('workload', v as Workload)} />
          <Select label="Model" value={config.model}
            options={['qwen/qwen3-14b','meta-llama/Llama-3.1-70B','deepseek-ai/DeepSeek-R1','mistralai/Mixtral-8x7B']}
            onChange={v => updateConfig('model', v as ModelId)} />
          <Select label="Accelerator" value={config.accelerator}
            options={['NVIDIA H100','NVIDIA A100 80GB','AMD MI300X']}
            onChange={v => updateConfig('accelerator', v as Accelerator)} />
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase tracking-wide text-gray-400 font-medium whitespace-nowrap">Routing Strategy</span>
              {showBanner && (
                <>
                  <span
                    className="w-2 h-2 rounded-full bg-[#7B2D8E] flex-shrink-0"
                    style={{ animation: 'simDotPulse 2s ease-in-out infinite' }}
                  />
                  <span className="text-xs text-[#7B2D8E] font-medium whitespace-nowrap">Try llm-d</span>
                </>
              )}
            </div>
            <select
              value={routing === 'Round Robin' ? 'Round Robin (vLLM baseline)' : 'Weighted (llm-d)'}
              onChange={e => switchRouting(e.target.value.startsWith('Weighted') ? 'Weighted' : 'Round Robin')}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option>Round Robin (vLLM baseline)</option>
              <option>Weighted (llm-d)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px] max-w-[280px]">
            <Slider label="Request Rate" value={config.requestRate} min={1000} max={6000}
              onChange={v => updateConfig('requestRate', v)} />
          </div>
          <Stepper label="Instances" value={config.instances} min={4} max={16}
            onChange={v => updateConfig('instances', v)} />
        </div>
      </div>

      {/* ── WEIGHTED CONFIG PANEL ── */}
      {routing === 'Weighted' && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 py-3 flex-shrink-0">
          <div className="max-w-screen-xl mx-auto flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">llm-d Weighted Routing Configuration</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">Higher values give that signal more weight in routing decisions</span>
            </div>
            <div className="flex flex-wrap gap-5 items-end">
              {([
                { key: 'pc' as const, label: 'Precise-Prefix-Cache' },
                { key: 'qd' as const, label: 'Queue-Depth' },
                { key: 'kv' as const, label: 'KV-Utilization' },
              ]).map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{label}</label>
                  <input
                    type="number" min={0} max={10} value={weights[key]}
                    onChange={e => setWeights(prev => ({ ...prev, [key]: Math.max(0, Number(e.target.value)) }))}
                    className="w-16 text-sm font-semibold text-center text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 focus:outline-none focus:border-purple-400 tabular-nums"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={runSimulation}
              className="ml-auto px-5 py-2 bg-[#7B2D8E] hover:bg-[#5B1D6E] text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
            >
              Run Simulation
            </button>
          </div>
        </div>
      )}

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-3">

          {/* ── VISUALIZATION ── */}
          <div className={[
            'bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border transition-all duration-500',
            isLlmdActive ? 'border-purple-300 dark:border-purple-700' : 'border-gray-200 dark:border-gray-700',
          ].join(' ')}>
            {/* Container header */}
            <div className={[
              'flex items-center gap-3 px-5 py-2.5 border-b transition-all duration-500',
              isLlmdActive
                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                : 'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-700',
            ].join(' ')}>
              {isLlmdActive ? (
                <>
                  <span className="text-sm font-semibold text-purple-900 dark:text-purple-200 tracking-tight">llm-d</span>
                  <span className="text-xs text-purple-400">·</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400">Kubernetes-native distributed inference</span>
                  <span className="ml-auto text-[10px] font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-800/40 rounded-full px-2 py-0.5">
                    Intelligent Routing
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">vLLM</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Basic load balancer</span>
                </>
              )}
            </div>

            <div className="px-5 py-4 flex flex-col gap-0">
              {/* Layer 1: Incoming Requests */}
              <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 shrink-0" aria-hidden />
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 leading-none mb-0.5">Incoming Requests</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {config.workload} · {config.requestRate.toLocaleString()} req/s
                    </div>
                  </div>
                </div>
                <FlowDots requestRate={config.requestRate} mounted={mounted} />
              </div>

              <div className="mx-auto w-px h-4 bg-gray-300 dark:bg-gray-600" aria-hidden />

              {/* Layer 2: Routing */}
              <div className={[
                'border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-500',
                isLlmdActive
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                  : 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700',
              ].join(' ')}>
                <div className={['w-2 h-2 rounded shrink-0 transition-colors duration-500', isLlmdActive ? 'bg-purple-500' : 'bg-blue-400 dark:bg-blue-500'].join(' ')} aria-hidden />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 leading-none mb-0.5">Routing Layer</div>
                  <div className={['text-sm font-semibold transition-colors duration-500', isLlmdActive ? 'text-purple-900 dark:text-purple-200' : 'text-gray-900 dark:text-gray-100'].join(' ')}>
                    {isLlmdActive ? `Weighted: PC=${weights.pc}, QD=${weights.qd}, KV=${weights.kv}` : 'Round Robin'}
                  </div>
                </div>
                <div className="ml-auto text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                  Distributes to {config.instances} {config.instances === 1 ? 'instance' : 'instances'}
                </div>
              </div>

              <TreeConnector count={config.instances} direction="fan" />

              {/* Layer 3: Instances */}
              <div className="overflow-x-auto">
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${config.instances}, 1fr)` }}>
                  {displayInstances.map((m, i) => (
                    <div key={i} className="flex justify-center py-1">
                      <InstanceCard index={i} metrics={m} accelerator={config.accelerator} mounted={mounted} isLlmd={isLlmdActive} />
                    </div>
                  ))}
                </div>
              </div>

              <TreeConnector count={config.instances} direction="gather" />

              {/* Layer 4: Hardware */}
              <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 flex items-center gap-3">
                <div className="w-2 h-2 rounded bg-gray-400 dark:bg-gray-500 shrink-0" aria-hidden />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 leading-none mb-0.5">Hardware</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">{config.instances}× {accelFull[config.accelerator]}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SLO METRICS TABLE ── */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">SLO Metrics</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => saveScenario('vLLM Baseline (Round Robin)', baseline)}
                  className="text-xs border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Save Baseline
                </button>
                {llmdRows.length > 0 && (
                  <button
                    onClick={() => {
                      const last = llmdRows[llmdRows.length - 1]
                      saveScenario(`llm-d (${last.label})`, last.metrics)
                    }}
                    className="text-xs border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded px-3 py-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    Save llm-d
                  </button>
                )}
                {savedScenarios.length >= 2 && (
                  <button
                    onClick={() => setShowCmp(true)}
                    className="text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded px-3 py-1 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                  >
                    Compare
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-5 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 w-44 min-w-[160px]">Configuration</th>
                    {METRIC_COLS.map(c => (
                      <th key={c.key} className="text-left px-4 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 min-w-[140px]">
                        {c.label} <span className="text-gray-300 dark:text-gray-600">({c.unit})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: SLO Targets */}
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">SLO Targets</span>
                    </td>
                    {METRIC_COLS.map(c => (
                      <td key={c.key} className="px-4 py-2">
                        <div className="flex flex-col gap-0.5">
                          <input
                            type="number"
                            value={sloTargets[c.key]}
                            onChange={e => setSloTargets(prev => ({ ...prev, [c.key]: Number(e.target.value) }))}
                            className="w-24 text-sm font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-0.5 focus:outline-none focus:border-purple-400 tabular-nums"
                          />
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">Target</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: vLLM Baseline */}
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">vLLM Baseline</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">Round Robin</span>
                      </div>
                    </td>
                    {METRIC_COLS.map(c => {
                      const v  = baseline[c.key]
                      const ok = mounted && meetsTarget(v, sloTargets[c.key], c.lowerBetter)
                      return (
                        <td key={c.key} className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {mounted && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ok ? 'bg-green-500' : 'bg-red-500'}`} />}
                            <span className={`text-sm font-semibold tabular-nums ${mounted ? (ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-gray-400'}`}>
                              {mounted ? v.toLocaleString() : '—'}
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>

                  {/* Rows 3+: llm-d runs */}
                  {llmdRows.map(row => (
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700" style={{ background: 'rgba(123,45,142,0.03)' }}>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">llm-d</span>
                          </div>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{row.label}</span>
                        </div>
                      </td>
                      {METRIC_COLS.map(c => {
                        const v  = row.metrics[c.key]
                        const ok = mounted && meetsTarget(v, sloTargets[c.key], c.lowerBetter)
                        const diff = mounted ? pctDiff(v, baseline[c.key], c.lowerBetter) : ''
                        return (
                          <td key={c.key} className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                {mounted && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ok ? 'bg-green-500' : 'bg-red-500'}`} />}
                                <span className={`text-sm font-semibold tabular-nums ${mounted ? (ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-gray-400'}`}>
                                  {mounted ? v.toLocaleString() : '—'}
                                </span>
                              </div>
                              {mounted && diff && (
                                <span className="text-[10px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-full px-1.5 py-0.5 inline-block leading-none w-fit">
                                  {diff}
                                </span>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Saved chips */}
            {savedScenarios.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 mr-1">Saved</span>
                {savedScenarios.map(s => (
                  <span key={s.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-2.5 py-0.5">
                    {s.label}
                    <button
                      onClick={() => setSaved(prev => prev.filter(x => x.id !== s.id))}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 leading-none ml-0.5"
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {showComparison && <ComparisonModal scenarios={savedScenarios} onClose={() => setShowCmp(false)} />}
    </div>
  )
}
