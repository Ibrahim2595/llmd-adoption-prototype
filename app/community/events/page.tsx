import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upcoming Events — llm-d Community',
  description: 'Meet the llm-d community at upcoming talks, meetups, and conferences',
}

interface Session {
  title: string
  date: string
  time: string
  location: string
  speakers?: string
  href: string
}

interface Event {
  title: string
  location: string
  dateText: string
  cost: string
  href: string
  sessions: Session[]
}

const EVENTS: { month: string; events: Event[] }[] = [
  {
    month: 'April 2026',
    events: [
      {
        title: 'PyTorch Conference Europe 2026',
        location: 'Paris, France',
        dateText: 'April 7–8, 2026',
        cost: 'Paid',
        href: 'https://events.linuxfoundation.org/pytorch-conference-europe/',
        sessions: [
          {
            title: 'Why WideEP Inference Needs Data-Parallel-Aware Scheduling',
            date: 'Tue, Apr 7, 2026',
            time: '13:35–14:00 CEST',
            location: 'Central Room',
            href: 'https://pytorchconferenceeu2026.sched.com/event/2Hind/why-wideep-inference-needs-data-parallel-aware-scheduling-nili-guy-ibm-tyler-michael-smith-red-hat',
          },
          {
            title: 'The Token Slice: Implementing Preemptive Scheduling Via Chunked Decoding',
            date: 'Tue, Apr 7, 2026',
            time: '14:05–14:30 CEST',
            location: 'Central Room',
            href: 'https://pytorchconferenceeu2026.sched.com/event/2Hins/the-token-slice-implementing-preemptive-scheduling-via-chunked-decoding-etai-lev-ran-ibm-kellen-swain-google',
          },
          {
            title: 'Birds of A Feather: Disaggregated Tokenization',
            date: 'Wed, Apr 8, 2026',
            time: '10:10–10:35 CEST',
            location: 'TBA',
            href: 'https://pytorchconferenceeu2026.sched.com/event/2Hiow/birds-of-a-feather-disaggregated-tokenization-building-toward-tokens-in-tokens-out-llm-inference-maroon-ayoub-ibm-research-hang-yin-xi-ning-wang-alibaba-cloud-nili-guy-ibm-hyunkyun-moon-moreh',
          },
          {
            title: 'Lightning Talk: Beyond Generic Spans — Distributed Tracing for Actionable LLM Observability',
            date: 'Tue, Apr 7, 2026',
            time: '15:45–15:55 CEST',
            location: 'Master Stage',
            href: 'https://pytorchconferenceeu2026.sched.com/event/2HioV/lightning-talk-beyond-generic-spans-distributed-tracing-for-actionable-llm-observability-sally-omalley-greg-pereira-red-hat',
          },
          {
            title: 'Lightning Talk: KV-Cache Centric Inference',
            date: 'Wed, Apr 8, 2026',
            time: '11:10–11:20 CEST',
            location: 'Founders Cafe',
            href: 'https://pytorchconferenceeu2026.sched.com/event/2HipK/lightning-talk-kv-cache-centric-inference-building-a-state-aware-serving-platform-with-llm-d-and-vllm-maroon-ayoub-ibm-research',
          },
          {
            title: 'Lightning Talk: Not All Tokens Are Equal — Semantic KV-Cache for Agentic LLM Serving',
            date: 'Wed, Apr 8, 2026',
            time: '11:25–11:35 CEST',
            location: 'Founders Cafe',
            href: 'https://pytorchconferenceeu2026.sched.com/event/2HipQ/lightning-talk-not-all-tokens-are-equal-semantic-kv-cache-for-agentic-llm-serving-maroon-ayoub-ibm-research-hyunkyun-moon-moreh',
          },
          {
            title: "Lightning Talk: Inside vLLM's KV Offloading Connector",
            date: 'Wed, Apr 8, 2026',
            time: '14:20–14:30 CEST',
            location: 'Central Room',
            href: 'https://pytorchconferenceeu2026.sched.com/event/2HiqO/lightning-talk-inside-vllms-kv-offloading-connector-async-memory-transfers-for-higher-inference-throughput-or-ozeri-ibm-nicolo-lucchesi-red-hat',
          },
        ],
      },
      {
        title: 'Google Cloud Next 2026',
        location: 'Las Vegas, NV',
        dateText: 'April 22–24, 2026',
        cost: 'Paid',
        href: 'https://www.googlecloudevents.com/next-vegas/',
        sessions: [
          {
            title: 'Achieve state-of-the-art inference: High performance on TPUs and GPUs with llm-d',
            date: 'Apr 22–24, 2026',
            time: 'TBA',
            location: 'TBA',
            speakers: 'Sean Horgan (Google Cloud), Greg Pereira (Red Hat), Alex Zakonov (Google Cloud)',
            href: 'https://www.googlecloudevents.com/next-vegas/session/3912927/achieve-state-of-the-art-inference-high-performance-on-tpus-and-gpus-with-llm-d',
          },
        ],
      },
    ],
  },
]

export default function EventsPage() {
  return (
    <article className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-50 mb-2">Upcoming Events</h1>
      <p className="text-gray-500 dark:text-gray-400 text-base mb-8">
        Meet the llm-d community at meetups, conferences, and workshops. All meetings are open to
        the public unless noted otherwise.
      </p>

      {/* Regular Meetings */}
      <h2 id="regular-meetings" className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
        Regular Meetings
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4">
        All meetings are open to the public. Join to participate, ask questions, or just listen and
        learn. All times are Eastern Time (ET).
      </p>
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800">
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-50">Weekly Standup</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Every Wednesday at 12:30 PM ET</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Project updates and open discussion. All community members welcome.</p>
          </div>
        </div>
        <div className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800">
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-50">SIG Meetings</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Various times throughout the week</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              See{' '}
              <a
                href="/community/sigs"
                className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors"
              >
                Special Interest Groups
              </a>{' '}
              for individual SIG meeting schedules.
            </p>
          </div>
        </div>
      </div>

      {/* Public Meeting Calendar */}
      <h2 id="public-meeting-calendar" className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-10 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
        Public Meeting Calendar
      </h2>
      <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4">
        Stay up-to-date with all llm-d community events, SIG meetings, and contributor standups. All
        times are shown in Eastern Time (ET).{' '}
        <a
          href="https://calendar.google.com/calendar/u/0?cid=NzA4ZWNlZDY0NDBjYjBkYzA3NjdlZTNhZTk2NWQ2ZTc1Y2U5NTZlMzA5MzhmYTAyZmQ3ZmU1MDJjMDBhNTRiNEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 dark:text-gray-300 underline underline-offset-2 hover:text-purple transition-colors"
        >
          Add to Google Calendar
        </a>{' '}
        to never miss an event.
      </p>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-10">
        <iframe
          src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=America%2FNew_York&title=llm-d%20Public%20Meetings&showPrint=0&mode=AGENDA&showCalendars=0&showTabs=0&src=NzA4ZWNlZDY0NDBjYjBkYzA3NjdlZTNhZTk2NWQ2ZTc1Y2U5NTZlMzA5MzhmYTAyZmQ3ZmU1MDJjMDBhNTRiNEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23f09300"
          style={{ borderWidth: 0, width: '100%', height: '500px', minWidth: '320px' }}
          frameBorder={0}
          scrolling="no"
        />
      </div>

      {/* Upcoming Conferences */}
      <h2 id="upcoming-conferences" className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mt-10 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
        Upcoming Conferences
      </h2>

      {EVENTS.map((group) => (
        <div key={group.month}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mt-8 mb-4">{group.month}</h3>
          <div className="flex flex-col gap-6">
            {group.events.map((event) => (
              <div key={event.title} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-50">{event.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {event.location} &middot; {event.dateText} &middot; {event.cost}
                    </p>
                  </div>
                  <a
                    href={event.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5 hover:border-gray-300 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-800"
                  >
                    Register
                  </a>
                </div>
                {event.sessions.length > 0 && (
                  <div className="p-4 dark:bg-gray-900">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                      Sessions
                    </p>
                    <ul className="flex flex-col gap-3">
                      {event.sessions.map((session) => (
                        <li
                          key={session.href}
                          className="flex items-start justify-between gap-4 py-3 px-3 border border-gray-100 dark:border-gray-700 border-l-2 border-l-gray-300 dark:border-l-gray-600 rounded"
                        >
                          <div className="min-w-0">
                            <a
                              href={session.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-gray-900 dark:text-gray-50 hover:text-purple transition-colors"
                            >
                              {session.title}
                            </a>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {session.date} &middot; {session.time} &middot; {session.location}
                            </p>
                            {session.speakers && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{session.speakers}</p>
                            )}
                          </div>
                          <a
                            href={session.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-xs text-gray-500 dark:text-gray-400 hover:text-purple transition-colors whitespace-nowrap"
                          >
                            View details
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </article>
  )
}
