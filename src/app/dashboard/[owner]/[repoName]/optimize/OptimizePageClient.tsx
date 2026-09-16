"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Scale,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CloudLoader from "@/components/ui/cloud-loader"

// One fused deployment group. Mirrors FusionGroup in proto/optimizer.proto.
// The wire format is an object per group, not an array of names.
interface FusionGroup {
  function_ids: string[]
  total_memory_mb: number
  total_runtime_ms: number
  execution_cost_usd: number
}

// Why a partition costs what it does, against deploying every function
// separately. Fusion removes platform invocations (saving the per-request
// charge) and raises every member to its block's memory (adding execution
// cost). A net figure hides which of the two won, which is the thing a reader
// needs in order to judge the trade.
interface Tradeoff {
  invocations_removed?: number
  request_delta_usd?: number
  execution_delta_usd?: number
  hops_removed?: number
}

// The Go optimizer's own row shape, before it is flattened into
// SimulationResult. Every metric is optional because a failed candidate
// comes back carrying only a name and an error_message.
interface RawSimulationResult {
  name: string
  metrics?: {
    total_cost_usd?: number
    latency_ms?: number
    feasible?: boolean
    runtime_ms?: number
  }
  groups?: FusionGroup[]
  error_message?: string
  error?: unknown
  // Set by the optimizer once it has seen every candidate: true when some other
  // option is no worse on both cost and latency and strictly better on one.
  dominated?: boolean
  dominated_by?: string
  tradeoff?: Tradeoff
}

interface SimulationResult {
  name: string
  cost: number
  latency: number
  feasible: boolean
  groups: FusionGroup[]
  runtime: number
  error?: string
  dominated: boolean
  dominatedBy?: string
  invocationsRemoved: number
  requestDelta: number
  executionDelta: number
  hopsRemoved: number
}

interface OptimizePageClientProps {
  params: {
    owner: string
    repoName: string
  }
}

/* The backend prices a single invocation, which is a fraction of a cent and
   rounds to the same "$0.000003" for every option. Multiply up to a million
   invocations, the unit AWS itself bills in, so a 6% gap reads as $2.78 against
   $2.94 rather than as two identical numbers. Deltas under a cent keep two
   significant digits instead of collapsing to $0.00. */
const PER_MILLION = 1_000_000
const formatCost = (value: number) => {
  const perM = value * PER_MILLION
  if (perM === 0 || Math.abs(perM) >= 0.01) return `$${perM.toFixed(2)}`
  return `$${perM.toPrecision(2)}`
}
const formatMs = (value: number) => `${Math.round(value).toLocaleString()} ms`

/* Deltas near zero are floating-point noise, not findings. Anything under a
   thousandth of the smallest charge we model is reported as no change. */
const isNegligible = (value: number) => Math.abs(value) < 1e-10

export function OptimizePageClient({ params }: OptimizePageClientProps) {
  const [results, setResults] = useState<SimulationResult[] | null>(null)
  // The two ends of the trade, decided by the optimizer once it has seen every
  // candidate. When they name the same option there is nothing to choose
  // between and the page says so instead of manufacturing a decision.
  const [cheapest, setCheapest] = useState<string | null>(null)
  const [fastest, setFastest] = useState<string | null>(null)
  const [unambiguous, setUnambiguous] = useState<boolean>(false)
  // Which option's grouping is on screen. Defaults to the cheapest.
  const [selected, setSelected] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { owner, repoName } = params
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("optifuse_api_token")
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    if (!token || !API_URL) {
      router.push("/login")
      return
    }

    fetch(`${API_URL}/api/simulate/live/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ owner, repoName }),
    })
      .then(async (res) => {
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.details || data.error || "Failed to run simulation.")
        }

        // The gateway wraps the plan: { results: { results: [...], recommended: {...} } }
        // so `plan` is the OptimizationPlan and `plan.results` the algorithm list.
        const plan = data.results ?? data

        let rawResults: RawSimulationResult[] = []
        if (plan && Array.isArray(plan.results)) {
          rawResults = plan.results
        } else if (Array.isArray(plan)) {
          rawResults = plan
        } else if (Array.isArray(data)) {
          rawResults = data
        }

        // `recommended` is still sent, but it is only the cheapest feasible
        // option and no longer the answer, so the page reads the frontier
        // instead: cheapest, fastest, and whether they are the same option.
        const cheapestName: string | null =
          plan?.cheapest?.name ?? plan?.recommended?.name ?? null
        const fastestName: string | null = plan?.fastest?.name ?? null
        const isUnambiguous: boolean = plan?.unambiguous === true

        // Map the nested Go backend structure to our flat React interface
        const mappedData = rawResults.map((r: RawSimulationResult) => ({
          name: r.name,
          cost: r.metrics?.total_cost_usd || 0,
          latency: r.metrics?.latency_ms || 0,
          feasible: r.metrics?.feasible || false,
          groups: r.groups || [],
          runtime: r.metrics?.runtime_ms || 0,
          // Map error_message from the backend to error in the frontend
          error: r.error_message || (r.error ? "Simulation failed" : undefined),
          dominated: r.dominated === true,
          dominatedBy: r.dominated_by || undefined,
          invocationsRemoved: r.tradeoff?.invocations_removed ?? 0,
          requestDelta: r.tradeoff?.request_delta_usd ?? 0,
          executionDelta: r.tradeoff?.execution_delta_usd ?? 0,
          hopsRemoved: r.tradeoff?.hops_removed ?? 0,
        }))

        return {
          mappedData: mappedData as SimulationResult[],
          cheapestName,
          fastestName,
          isUnambiguous,
        }
      })
      .then(({ mappedData, cheapestName, fastestName, isUnambiguous }) => {
        setResults(mappedData)
        setCheapest(cheapestName)
        setFastest(fastestName)
        setUnambiguous(isUnambiguous)
        setSelected(cheapestName)
      })
      .catch((err: Error) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [owner, repoName, router])

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-[18rem] items-center justify-center">
          <CloudLoader label="Running the simulation against live AWS data…" />
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Analysis failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (!results || results.length === 0) {
      return (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No simulation results were generated.
        </p>
      )
    }

    const feasible = results.filter((r) => r.feasible && !r.error)
    const byName = (n: string | null) => (n ? results.find((r) => r.name === n) : undefined)

    const cheapestResult =
      byName(cheapest) ??
      (feasible.length > 0 ? feasible.reduce((a, b) => (b.cost < a.cost ? b : a)) : undefined)
    const fastestResult =
      byName(fastest) ??
      (feasible.length > 0
        ? feasible.reduce((a, b) => (b.latency < a.latency ? b : a))
        : undefined)

    // Options worth considering: feasible, and not beaten outright by another
    // option on both axes. Everything else is noise on a decision page.
    const frontier = feasible.filter((r) => !r.dominated)
    const selectedResult = byName(selected) ?? cheapestResult
    const baseline = results.find((r) => r.name === "NoFusion")

    const latencyGap =
      cheapestResult && fastestResult ? cheapestResult.latency - fastestResult.latency : 0
    const costGapPct =
      cheapestResult && fastestResult && cheapestResult.cost > 0
        ? ((fastestResult.cost - cheapestResult.cost) / cheapestResult.cost) * 100
        : 0

    return (
      <div className="space-y-8">
        {!cheapestResult ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>No feasible option found</AlertTitle>
            <AlertDescription>
              None of the strategies produced a deployment that satisfies your memory and
              latency constraints.
            </AlertDescription>
          </Alert>
        ) : unambiguous ? (
          /* One option is both cheapest and fastest, so there is nothing to weigh
             up and the page should not invent a decision. */
          <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white">
            <div className="border-b border-emerald-100 px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600">
                  <Sparkles className="h-3 w-3" />
                  Clear winner
                </Badge>
                <span className="font-mono text-sm font-medium text-foreground">
                  {cheapestResult.name}
                </span>
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                Cheapest <span className="text-muted-foreground">and</span> fastest
              </p>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                This option beats every alternative on both cost and latency, so there is no
                trade to weigh up.
              </p>
            </div>
            <TradeoffTiles result={cheapestResult} baseline={baseline} />
          </section>
        ) : (
          /* Cost and latency pull in different directions. Show both ends and
             the size of the gap, and leave the choice to the reader. */
          <section className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-white">
            <div className="px-6 py-6 sm:px-8">
              <Badge variant="secondary" className="gap-1">
                <Scale className="h-3 w-3" />
                Trade-off
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                No single best option
              </h2>
              <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">
                Fusing removes platform invocations and network hops, and raises every function
                to its group&apos;s memory allocation. Here those pull in opposite directions,
                so the right answer depends on whether you are optimising the bill or the tail
                latency.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <EndPanel label="Cheapest" result={cheapestResult} baseline={baseline} />
                {fastestResult && (
                  <EndPanel label="Fastest" result={fastestResult} baseline={baseline} />
                )}
              </div>

              {latencyGap > 0 && (
                <p className="mt-5 text-sm text-foreground">
                  <span className="font-medium">{fastestResult?.name}</span> is{" "}
                  <span className="font-mono tabular-nums">{Math.round(latencyGap)} ms</span>{" "}
                  faster than <span className="font-medium">{cheapestResult.name}</span>
                  {costGapPct > 0.05 && (
                    <>
                      {" "}
                      and costs{" "}
                      <span className="font-mono tabular-nums">{costGapPct.toFixed(1)}%</span>{" "}
                      more
                    </>
                  )}
                  .
                </p>
              )}
            </div>
          </section>
        )}

        {/* The options a reader should actually choose between. Dominated
            candidates are excluded here and explained in the table below. */}
        {frontier.length > 1 && (
          <section className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold">Options worth considering</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {frontier.length} strategies where nothing else is both cheaper and faster.
                Select one to see its grouping.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {frontier.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => setSelected(r.name)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    r.name === selectedResult?.name
                      ? "border-primary bg-orange-50/70"
                      : "border-border bg-card hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{r.name}</span>
                    {r.name === cheapest && <Badge variant="secondary">cheapest</Badge>}
                    {r.name === fastest && r.name !== cheapest && (
                      <Badge variant="secondary">fastest</Badge>
                    )}
                  </div>
                  <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between gap-2">
                      <dt>Cost / 1M invocations</dt>
                      <dd className="font-mono tabular-nums text-foreground">
                        {formatCost(r.cost)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Latency</dt>
                      <dd className="font-mono tabular-nums text-foreground">
                        {formatMs(r.latency)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Deployments</dt>
                      <dd className="font-mono tabular-nums text-foreground">
                        {r.groups?.length ?? 0}
                      </dd>
                    </div>
                  </dl>
                </button>
              ))}
            </div>
          </section>
        )}

        {selectedResult && selectedResult.groups?.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Layers className="h-5 w-5 text-primary" />
                Recommended grouping
              </h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Deploy each group below as a single Lambda. Functions inside a group call each
                other in-process, so the platform never sees those invocations and never charges
                for them. That is where the saving comes from.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedResult.groups.map((group, i) => {
                const fused = group.function_ids.length > 1
                return (
                  <div
                    key={group.function_ids.join("-") || i}
                    className={`rounded-2xl border p-5 ${
                      fused ? "border-orange-200 bg-orange-50/60" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          fused ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {fused ? `Group ${i + 1}` : "Unchanged"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {group.function_ids.length} function
                        {group.function_ids.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1.5">
                      {group.function_ids.map((id) => (
                        <li
                          key={id}
                          className="rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-sm text-foreground"
                        >
                          {id}
                        </li>
                      ))}
                    </ul>

                    <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                      <div className="flex justify-between gap-2">
                        <dt>Memory</dt>
                        <dd className="font-mono tabular-nums text-foreground">
                          {group.total_memory_mb} MB
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Runtime</dt>
                        <dd className="font-mono tabular-nums text-foreground">
                          {group.total_runtime_ms} ms
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>Execution / 1M invocations</dt>
                        <dd className="font-mono tabular-nums text-foreground">
                          {formatCost(group.execution_cost_usd)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )
              })}
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Memory is the largest member&apos;s allocation, since a Lambda has one memory
              setting and it has to cover the heaviest branch. Every lighter function in the
              group therefore runs at that setting for its whole duration, which is what fusion
              costs you. Runtime assumes the members run in sequence.
            </p>
          </section>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">All algorithms compared</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Every strategy run against your workload. Dominated means another option is no
              worse on both cost and latency, and better on one, so it is never worth choosing.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[190px] px-4">Algorithm</TableHead>
                  <TableHead className="text-right">Cost / 1M</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                  <TableHead className="text-right">Groups</TableHead>
                  <TableHead className="text-right">Calls saved</TableHead>
                  <TableHead className="text-right">Hops saved</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow
                    key={result.name}
                    className={
                      result.name === selectedResult?.name
                        ? "bg-orange-50 hover:bg-orange-50"
                        : !result.feasible || result.dominated
                          ? "text-muted-foreground"
                          : undefined
                    }
                  >
                    <TableCell className="px-4 font-medium">
                      <span className="flex items-center gap-1.5">
                        {result.name}
                        {result.name === selectedResult?.name && (
                          <Sparkles className="h-3.5 w-3.5 text-primary" aria-label="Recommended" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {result.feasible && result.cost > 0 ? formatCost(result.cost) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {result.feasible && result.latency > 0 ? Math.round(result.latency) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {result.groups?.length > 0 ? result.groups.length : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {result.feasible ? Math.round(result.invocationsRemoved) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {result.feasible ? result.hopsRemoved : "-"}
                    </TableCell>
                    <TableCell className="px-4 text-xs">
                      {/* Icon plus words, so status never rests on colour alone. */}
                      {result.error ? (
                        <span className="flex items-center gap-1.5 text-destructive">
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                          {result.error}
                        </span>
                      ) : !result.feasible ? (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5" />
                          Breaks a constraint
                        </span>
                      ) : result.dominated ? (
                        <span className="text-muted-foreground">
                          Dominated by {result.dominatedBy}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Worth considering
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/dashboard/${owner}/${repoName}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to repository
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Live optimization analysis</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Your <code className="font-mono text-sm">serverless.yml</code> structure combined with
          live performance data from AWS, for{" "}
          <span className="font-mono text-foreground">
            {owner}/{repoName}
          </span>
          .
        </p>
      </div>

      {renderContent()}
    </main>
  )
}


/*
  One end of the trade: an option, its two headline figures, and what it costs
  or saves against deploying every function separately.
*/
function EndPanel({
  label,
  result,
  baseline,
}: {
  label: string
  result: SimulationResult
  baseline?: SimulationResult
}) {
  const costDelta = baseline ? result.cost - baseline.cost : 0
  const latencyDelta = baseline ? result.latency - baseline.latency : 0

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-sm font-medium">{result.name}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Cost / 1M invocations
          </p>
          <p className="font-mono text-lg font-semibold tabular-nums">
            {formatCost(result.cost)}
          </p>
          <Delta value={costDelta} format={formatCost} lowerIsBetter />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Latency</p>
          <p className="font-mono text-lg font-semibold tabular-nums">
            {formatMs(result.latency)}
          </p>
          <Delta value={latencyDelta} format={formatMs} lowerIsBetter />
        </div>
      </div>
    </div>
  )
}

/* A signed change against the no-fusion baseline. Zero is stated rather than
   hidden, because "no change" is a result and a blank cell is ambiguous. */
function Delta({
  value,
  format,
  lowerIsBetter,
}: {
  value: number
  format: (n: number) => string
  lowerIsBetter: boolean
}) {
  if (isNegligible(value)) {
    return <p className="mt-0.5 text-xs text-muted-foreground">no change</p>
  }
  const good = lowerIsBetter ? value < 0 : value > 0
  return (
    <p className={`mt-0.5 text-xs ${good ? "text-emerald-700" : "text-destructive"}`}>
      {value < 0 ? "−" : "+"}
      {format(Math.abs(value))} vs no fusion
    </p>
  )
}

/*
  The mechanism behind a partition's cost. Fusion pulls two ways at once, and
  showing only the net figure hides which side won.
*/
function TradeoffTiles({
  result,
  baseline,
}: {
  result: SimulationResult
  baseline?: SimulationResult
}) {
  const costDelta = baseline ? result.cost - baseline.cost : 0
  const latencyDelta = baseline ? result.latency - baseline.latency : 0

  return (
    <dl className="grid grid-cols-2 divide-x divide-emerald-100 border-t border-emerald-100 lg:grid-cols-4">
      <StatTile
        label="Cost / 1M invocations"
        value={formatCost(result.cost)}
        delta={
          isNegligible(costDelta)
            ? "unchanged vs no fusion"
            : `${costDelta < 0 ? "−" : "+"}${formatCost(Math.abs(costDelta))} vs no fusion`
        }
        deltaGood={isNegligible(costDelta) ? undefined : costDelta < 0}
      />
      <StatTile
        label="Latency"
        value={formatMs(result.latency)}
        delta={
          isNegligible(latencyDelta)
            ? "unchanged vs no fusion"
            : `${latencyDelta < 0 ? "−" : "+"}${formatMs(Math.abs(latencyDelta))} vs no fusion`
        }
        deltaGood={isNegligible(latencyDelta) ? undefined : latencyDelta < 0}
      />
      <StatTile
        label="Invocations removed"
        value={String(Math.round(result.invocationsRemoved))}
        delta="calls that become in-process"
      />
      <StatTile
        label="Hops removed"
        value={String(result.hopsRemoved)}
        delta="off the critical path"
      />
    </dl>
  )
}

/*
  Stat tile: label · value · optional delta. `deltaGood` decides the delta's
  colour, because "up" is good for savings and bad for latency, and direction
  alone cannot say which.
*/
function StatTile({
  label,
  value,
  delta,
  deltaGood,
}: {
  label: string
  value: string
  delta?: string
  deltaGood?: boolean
}) {
  return (
    <div className="px-6 py-5">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 font-mono text-xl font-semibold text-foreground">{value}</dd>
      {delta && (
        <p
          className={`mt-1 text-xs ${
            deltaGood === undefined
              ? "text-muted-foreground"
              : deltaGood
                ? "text-emerald-700"
                : "text-destructive"
          }`}
        >
          {delta}
        </p>
      )}
    </div>
  )
}
