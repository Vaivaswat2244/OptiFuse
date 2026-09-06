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
  TrendingDown,
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
}

interface SimulationResult {
  name: string
  cost: number
  latency: number
  feasible: boolean
  groups: FusionGroup[]
  runtime: number
  error?: string
}

interface OptimizePageClientProps {
  params: {
    owner: string
    repoName: string
  }
}

/* Costs here are fractions of a cent, so they keep their significant digits
   rather than being compacted the way a headline figure would be. */
const formatCost = (value: number) => `$${value.toFixed(6)}`
const formatMs = (value: number) => `${Math.round(value).toLocaleString()} ms`

export function OptimizePageClient({ params }: OptimizePageClientProps) {
  const [results, setResults] = useState<SimulationResult[] | null>(null)
  // The algorithm the backend picked. It already ranks feasible candidates by
  // total cost, so we display its choice rather than re-deriving one here.
  const [recommended, setRecommended] = useState<string | null>(null)
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

        const recommendedName: string | null = plan?.recommended?.name ?? null

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
        }))

        return { mappedData: mappedData as SimulationResult[], recommendedName }
      })
      .then(({ mappedData, recommendedName }) => {
        setResults(mappedData)
        setRecommended(recommendedName)
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

    // Prefer the backend's own recommendation. Fall back to the cheapest feasible
    // candidate only if it is missing, never to the *first* one, which is always
    // NoFusion and would announce "no fusion" even when a cheaper fusion exists.
    const feasible = results.filter((r) => r.feasible && !r.error)
    const bestResult =
      feasible.find((r) => r.name === recommended) ??
      (feasible.length > 0
        ? feasible.reduce((a, b) => (b.cost < a.cost ? b : a))
        : undefined)

    const baseline = results.find((r) => r.name === "NoFusion")
    const savingsPct =
      bestResult && baseline && baseline.cost > 0 && bestResult !== baseline
        ? ((baseline.cost - bestResult.cost) / baseline.cost) * 100
        : null

    const fusedGroups = bestResult?.groups?.filter((g) => g.function_ids.length > 1) ?? []
    const fusedFnCount = fusedGroups.reduce((sum, g) => sum + g.function_ids.length, 0)

    const costDelta =
      bestResult && baseline && bestResult !== baseline ? bestResult.cost - baseline.cost : null
    const latencyDelta =
      bestResult && baseline && bestResult !== baseline
        ? bestResult.latency - baseline.latency
        : null

    return (
      <div className="space-y-8">
        {bestResult ? (
          <section className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-white">
            <div className="border-b border-orange-100 px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Recommended
                </Badge>
                <span className="font-mono text-sm font-medium text-foreground">
                  {bestResult.name}
                </span>
              </div>

              {/* The one figure this page leads with. Proportional digits, because
                  tabular-nums is reserved for the comparison table columns. */}
              {savingsPct !== null && savingsPct > 0 ? (
                <div className="mt-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-semibold tracking-tight text-primary">
                      {savingsPct.toFixed(1)}%
                    </span>
                    <TrendingDown className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    cheaper than deploying every function separately
                  </p>
                </div>
              ) : (
                <div className="mt-5">
                  <span className="text-6xl font-semibold tracking-tight text-primary">
                    {formatCost(bestResult.cost)}
                  </span>
                  <p className="mt-2 text-muted-foreground">
                    lowest feasible cost across the algorithms tried
                  </p>
                </div>
              )}
            </div>

            <dl className="grid grid-cols-2 divide-x divide-orange-100 border-t border-orange-100 lg:grid-cols-4">
              <StatTile
                label="Execution cost"
                value={formatCost(bestResult.cost)}
                delta={
                  costDelta !== null
                    ? `${costDelta <= 0 ? "−" : "+"}${formatCost(Math.abs(costDelta))} vs no fusion`
                    : undefined
                }
                deltaGood={costDelta !== null ? costDelta <= 0 : undefined}
              />
              <StatTile
                label="Latency"
                value={formatMs(bestResult.latency)}
                delta={
                  latencyDelta !== null
                    ? `${latencyDelta <= 0 ? "−" : "+"}${formatMs(Math.abs(latencyDelta))} vs no fusion`
                    : undefined
                }
                deltaGood={latencyDelta !== null ? latencyDelta <= 0 : undefined}
              />
              <StatTile label="Deployment groups" value={String(bestResult.groups?.length ?? 0)} />
              <StatTile
                label="Functions fused"
                value={String(fusedFnCount)}
                delta={
                  fusedGroups.length > 0
                    ? `across ${fusedGroups.length} group${fusedGroups.length === 1 ? "" : "s"}`
                    : "nothing to merge"
                }
              />
            </dl>
          </section>
        ) : (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>No feasible solution found</AlertTitle>
            <AlertDescription>
              None of the algorithms could find a fusion strategy that meets your
              application&apos;s constraints.
            </AlertDescription>
          </Alert>
        )}

        {bestResult && bestResult.groups?.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Layers className="h-5 w-5 text-primary" />
                Recommended grouping
              </h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Deploy each group below as a single Lambda. Functions inside a group call each
                other in-process, so the data passed between them stops crossing the network, and that is where the saving
                comes from.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bestResult.groups.map((group, i) => {
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
                        <dt>Execution cost</dt>
                        <dd className="font-mono tabular-nums text-foreground">
                          ${group.execution_cost_usd.toFixed(8)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )
              })}
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Memory is the sum of the members&apos; allocations and runtime assumes they run
              sequentially, so these are conservative upper bounds. A real fused Lambda
              allocates roughly the largest member, not the total.
            </p>
          </section>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">All algorithms compared</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Every strategy that was run against your workload, feasible or not.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[200px] px-4">Algorithm</TableHead>
                  <TableHead>Feasible</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                  <TableHead className="text-right">Groups</TableHead>
                  <TableHead className="px-4">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow
                    key={result.name}
                    className={
                      result === bestResult
                        ? "bg-orange-50 hover:bg-orange-50"
                        : result.feasible
                          ? undefined
                          : "text-muted-foreground"
                    }
                  >
                    <TableCell className="px-4 font-medium">
                      <span className="flex items-center gap-1.5">
                        {result.name}
                        {result === bestResult && (
                          <Sparkles className="h-3.5 w-3.5 text-primary" aria-label="Recommended" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {/* Icon + word, so feasibility never rests on colour alone. */}
                      {result.feasible ? (
                        <span className="flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {result.feasible && result.cost > 0 ? result.cost.toFixed(6) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {result.feasible && result.latency > 0 ? Math.round(result.latency) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {result.groups?.length > 0 ? result.groups.length : "-"}
                    </TableCell>
                    <TableCell className="px-4 text-xs text-destructive">
                      {result.error || ""}
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
