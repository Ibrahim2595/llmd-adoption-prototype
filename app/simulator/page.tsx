import type { Metadata } from 'next'
import { SimulatorClient } from '@/components/simulator-client'

export const metadata: Metadata = {
  title: 'Inference Simulator — llm-d',
  description:
    'Interactive llm-d inference simulator — adjust workload, model, routing strategy, and instance count to see live performance metrics.',
}

export default function SimulatorPage() {
  return <SimulatorClient />
}
