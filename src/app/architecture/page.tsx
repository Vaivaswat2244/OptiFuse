import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  Cloud,
  Github,
  Server,
  Boxes,
  KeyRound,
  ArrowRight,
  Database,
  Info,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Architecture - Optifuse",
  description: "How the Optifuse client, gateway, optimizer and AWS integration fit together",
}

/*
  Everything on this page is derived from what the client actually calls and
  from the contracts referenced in its own comments. Where a detail is an
  inference rather than something the frontend proves, it is labelled as one
  in the "What is inferred" section at the bottom.
*/

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/auth/github/",
    body: "{ code }",
    returns: "{ username, token }",
    calledBy: "auth/callback",
  },
  {
    method: "GET",
    path: "/api/repositories/",
    body: "-",
    returns: "Repository[]",
    calledBy: "dashboard",
  },
  {
    method: "GET",
    path: "/api/repositories/{owner}/{repo}/file/",
    body: "-",
    returns: "{ filename, content }",
    calledBy: "repo detail",
  },
  {
    method: "GET",
    path: "/api/profile/settings/",
    body: "-",
    returns: "{ username, subscription, aws_role_arn, aws_external_id }",
    calledBy: "settings",
  },
  {
    method: "POST",
    path: "/api/profile/settings/",
    body: "{ aws_role_arn }",
    returns: "{ message } | { error }",
    calledBy: "settings",
  },
  {
    method: "POST",
    path: "/api/simulate/live/",
    body: "{ owner, repoName }",
    returns: "OptimizationPlan",
    calledBy: "optimize",
  },
]

const AWS_PERMISSIONS = [
  { service: "X-Ray", actions: ["GetTraceSummaries", "BatchGetTraces", "ListResourcePolicies"], purpose: "Builds the call graph between functions" },
  { service: "CloudWatch Logs", actions: ["DescribeLogGroups", "StartQuery", "StopQuery", "GetQueryResults", "FilterLogEvents"], purpose: "Supplies duration and memory metrics" },
]

export default function ArchitecturePage() {
  return (
    <div>
      <section className="sky relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="cloud animate-drift left-[-6%] top-[10%] h-44 w-[24rem] bg-white/80" />
          <div className="cloud animate-drift animation-delay-2000 left-[64%] top-[6%] h-52 w-[28rem] bg-orange-100/60" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-5 gap-1.5 border-orange-200 bg-white/70 px-3 py-1.5 text-primary backdrop-blur">
            <Boxes className="h-3.5 w-3.5" />
            System overview
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Architecture</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            How the browser client, the gateway API, the optimizer service and your AWS
            account fit together, and what crosses each boundary.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        {/* ------------------------------------------------------- The tiers */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">The pieces</h2>
          <p className="mt-2 text-muted-foreground">
            Three services Optifuse runs, plus two external systems it reads from.
          </p>

          <div className="mt-7 space-y-3">
            <TierRow
              icon={Cloud}
              name="Client"
              tech="Next.js 15, React 19, Tailwind 4"
              tone="primary"
              points={[
                "App Router, mostly client components because every screen is driven by a token held in the browser",
                "Holds the session token in localStorage under optifuse_api_token",
                "Talks only to the gateway. It never reaches GitHub or AWS directly",
              ]}
            />
            <TierRow
              icon={Server}
              name="Gateway API"
              tech="Django REST Framework"
              tone="default"
              points={[
                "Exchanges the GitHub OAuth code for a session token",
                "Proxies repository listing and file reads through the user GitHub grant",
                "Assumes the customer IAM role and pulls X-Ray and CloudWatch data",
                "Calls the optimizer and wraps its reply for the browser",
              ]}
            />
            <TierRow
              icon={Boxes}
              name="Optimizer"
              tech="Go service, gRPC contract in proto/optimizer.proto"
              tone="default"
              points={[
                "Receives the function topology plus live metrics",
                "Runs several fusion strategies over the same workload",
                "Returns an OptimizationPlan: every candidate, plus its own recommendation",
              ]}
            />
            <TierRow
              icon={Github}
              name="GitHub"
              tech="External, OAuth scopes read:user and repo"
              tone="muted"
              points={[
                "Identity provider for sign in",
                "Source of the serverless.yml that defines the function topology",
              ]}
            />
            <TierRow
              icon={KeyRound}
              name="Your AWS account"
              tech="External, cross account IAM role"
              tone="muted"
              points={[
                "Read only. X-Ray traces for the call graph, CloudWatch Logs for metrics",
                "Reached by role assumption, never by stored access keys",
              ]}
            />
          </div>
        </section>

        {/* ------------------------------------------------------ Auth flow */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">Sign in flow</h2>
          <div className="mt-6 space-y-3">
            <FlowStep n={1} from="Client" to="GitHub">
              <code className="font-mono text-xs">/login</code> sends the browser to
              GitHub with the client id and the scopes{" "}
              <code className="font-mono text-xs">read:user,repo</code>.
            </FlowStep>
            <FlowStep n={2} from="GitHub" to="Client">
              GitHub redirects back to{" "}
              <code className="font-mono text-xs">/auth/callback</code> with a
              short lived <code className="font-mono text-xs">code</code> in the query string.
            </FlowStep>
            <FlowStep n={3} from="Client" to="Gateway">
              The callback POSTs that code to{" "}
              <code className="font-mono text-xs">/api/auth/github/</code>. The gateway
              trades it with GitHub for an access token it keeps server side.
            </FlowStep>
            <FlowStep n={4} from="Gateway" to="Client">
              The gateway returns its own session token. The client writes it to
              localStorage and every later request carries{" "}
              <code className="font-mono text-xs">Authorization: Token &lt;token&gt;</code>.
            </FlowStep>
          </div>
        </section>

        {/* -------------------------------------------------- Analysis flow */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">Analysis flow</h2>
          <p className="mt-2 text-muted-foreground">
            What happens when you press Run live analysis. This is the path that needs
            both integrations connected.
          </p>
          <div className="mt-6 space-y-3">
            <FlowStep n={1} from="Client" to="Gateway">
              POST <code className="font-mono text-xs">/api/simulate/live/</code> with{" "}
              <code className="font-mono text-xs">{"{ owner, repoName }"}</code>. That is the
              whole request body. Everything else is resolved server side from the token.
            </FlowStep>
            <FlowStep n={2} from="Gateway" to="GitHub">
              Reads <code className="font-mono text-xs">serverless.yml</code> from the repo
              to recover the declared functions and their wiring.
            </FlowStep>
            <FlowStep n={3} from="Gateway" to="AWS">
              Assumes your IAM role using the external id, then queries X-Ray for the call
              graph and CloudWatch Logs for duration and memory.
            </FlowStep>
            <FlowStep n={4} from="Gateway" to="Optimizer">
              Hands the merged topology and metrics to the Go service, which runs each
              fusion strategy.
            </FlowStep>
            <FlowStep n={5} from="Optimizer" to="Client">
              The plan comes back wrapped as{" "}
              <code className="font-mono text-xs">{"{ results: { results: [...], recommended: {...} } }"}</code>{" "}
              and the optimize page flattens it for display.
            </FlowStep>
          </div>
        </section>

        {/* ------------------------------------------------------ API table */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">API surface</h2>
          <p className="mt-2 text-muted-foreground">
            Every gateway endpoint this client calls. All except the first require the
            session token.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left">
                    <th className="px-4 py-2.5 font-medium">Method</th>
                    <th className="px-4 py-2.5 font-medium">Path</th>
                    <th className="px-4 py-2.5 font-medium">Body</th>
                    <th className="px-4 py-2.5 font-medium">Returns</th>
                    <th className="px-4 py-2.5 font-medium">Screen</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((e) => (
                    <tr key={`${e.method}-${e.path}`} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-md px-1.5 py-0.5 font-mono text-xs font-medium ${
                            e.method === "GET"
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {e.method}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs">{e.path}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {e.body}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {e.returns}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">
                        {e.calledBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- Data shape */}
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Database className="h-5 w-5 text-primary" />
            The result shape
          </h2>
          <p className="mt-2 text-muted-foreground">
            What <code className="font-mono text-sm">/api/simulate/live/</code> returns, and
            the part the UI reads.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            <div className="border-b border-border bg-muted/60 px-4 py-2">
              <span className="font-mono text-xs text-muted-foreground">OptimizationPlan</span>
            </div>
            <pre className="overflow-x-auto bg-muted/30 p-4 text-xs leading-relaxed">
              <code className="font-mono">{`{
  results: {
    results: [                      // one entry per algorithm
      {
        name: "NoFusion",           // always present, the baseline
        metrics: {
          total_cost_usd: number,
          latency_ms: number,
          runtime_ms: number,       // the solver's own time
          feasible: boolean         // false if constraints are breached
        },
        groups: [                   // FusionGroup, see optimizer.proto
          {
            function_ids: string[], // >1 id means these merge
            total_memory_mb: number,
            total_runtime_ms: number,
            execution_cost_usd: number
          }
        ],
        error_message?: string
      }
    ],
    recommended: { name: string }   // the backend's own pick
  }
}`}</code>
            </pre>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Two details matter when reading this. The UI trusts{" "}
            <code className="font-mono text-xs">recommended.name</code> rather than picking
            a winner itself, because falling back to the first entry would always report
            NoFusion. And <code className="font-mono text-xs">total_memory_mb</code> is the
            sum of the members, which is an upper bound: a real fused Lambda allocates
            roughly its largest member, not the total.
          </p>
        </section>

        {/* ----------------------------------------------------- AWS trust */}
        <section className="mt-14">
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <KeyRound className="h-5 w-5 text-primary" />
            AWS trust model
          </h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Optifuse never holds AWS keys. You deploy a CloudFormation role that trusts the
            Optifuse service account, guarded by an external id unique to you, so a leaked
            account id alone is not enough to assume it.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {AWS_PERMISSIONS.map((p) => (
              <div key={p.service} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold">{p.service}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.purpose}</p>
                <ul className="mt-3 space-y-1">
                  {p.actions.map((a) => (
                    <li key={a} className="font-mono text-xs text-muted-foreground">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Every action above is a read. Nothing in the policy can create, modify or
            delete a resource in your account.
          </p>
        </section>

        {/* -------------------------------------------------- Honesty note */}
        <section className="mt-14">
          <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Info className="h-5 w-5 text-primary" />
              What is observed, and what is inferred
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This page is written from the client side of the system, so it is worth being
              precise about the difference.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Observed in this repo</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li>Every endpoint, request body and response shape listed above</li>
                  <li>The OAuth scopes and the token storage key</li>
                  <li>The full IAM policy, from the CloudFormation template on the settings page</li>
                  <li>The wrapped plan shape, and that NoFusion is the baseline</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Inferred</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li>
                    Django REST Framework, from the{" "}
                    <code className="font-mono text-xs">Token</code> auth scheme
                  </li>
                  <li>
                    A Go service over gRPC, from the reference to{" "}
                    <code className="font-mono text-xs">proto/optimizer.proto</code>
                  </li>
                  <li>That the gateway is what reads GitHub and AWS, rather than the optimizer</li>
                  <li>Which algorithms exist, since their names arrive at runtime</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Go to the dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function TierRow({
  icon: Icon,
  name,
  tech,
  points,
  tone,
}: {
  icon: React.ElementType
  name: string
  tech: string
  points: string[]
  tone: "primary" | "default" | "muted"
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        tone === "primary"
          ? "border-orange-200 bg-orange-50/60"
          : tone === "muted"
            ? "border-dashed border-border bg-muted/30"
            : "border-border bg-card"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            tone === "muted" ? "bg-muted text-muted-foreground" : "bg-secondary text-primary"
          }`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h3 className="text-lg font-semibold">{name}</h3>
        <span className="text-xs text-muted-foreground">{tech}</span>
      </div>
      <ul className="mt-3 space-y-1.5 pl-1">
        {points.map((p) => (
          <li key={p} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-400" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FlowStep({
  n,
  from,
  to,
  children,
}: {
  n: number
  from: string
  to: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {n}
      </span>
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">{from}</span>
          <ArrowRight className="h-3 w-3" />
          <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">{to}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground">{children}</p>
      </div>
    </div>
  )
}
