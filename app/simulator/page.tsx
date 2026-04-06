import type { Metadata } from 'next'
import { SimulatorClient } from '@/components/simulator-client'

export const metadata: Metadata = {
  title: 'Inference Simulator — llm-d',
  description:
    'Configure your workload to estimate inference performance and generate deployment configs for llm-d.',
}

export default function SimulatorPage() {
  return <SimulatorClient />
}
