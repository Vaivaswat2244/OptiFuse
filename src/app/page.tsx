"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef } from "react"
import {
  ArrowRight,
  Cloud,
  DollarSign,
  GitBranch,
  Layers,
  LineChart,
  Network,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SiteFooter } from "@/components/site-footer"

const FEATURES = [
  {
    icon: LineChart,
    title: "Real invocation data",
    description:
      "Reads your actual X-Ray traces and CloudWatch metrics, so the model reflects how your functions behave in production, not a guess from static code.",
  },
  {
    icon: Layers,
    title: "Several strategies, compared",
    description:
      "Runs multiple fusion algorithms over the same workload and puts their cost, latency and feasibility side by side so you can see the trade-off.",
  },
  {
    icon: DollarSign,
    title: "Costed per group",
    description:
      "Every proposed group carries its own memory, runtime and execution cost, so a recommendation is something you can check rather than take on faith.",
  },
  {
    icon: ShieldCheck,
    title: "Constraint aware",
    description:
      "Groupings that would breach your memory ceilings or latency budgets are marked infeasible instead of being quietly recommended.",
  },
  {
    icon: GitBranch,
    title: "Straight from your repo",
    description:
      "Point Optifuse at a repository and it reads the serverless.yml already there. No new config file to maintain alongside it.",
  },
  {
    icon: Network,
    title: "Names, not just numbers",
    description:
      "The result tells you exactly which functions to merge into which Lambda: a change you can go and make, not an abstract score.",
  },
]

const STEPS = [
  {
    step: "01",
    title: "Connect your repository",
    description:
      "Sign in with GitHub and pick a repo. Optifuse finds the serverless.yml and reads your function topology from it.",
  },
  {
    step: "02",
    title: "Link your AWS account",
    description:
      "Deploy a read-only IAM role from the template we generate. Optifuse can see X-Ray and CloudWatch data, nothing else.",
  },
  {
    step: "03",
    title: "Run the analysis",
    description:
      "Get the cheapest grouping that still meets your constraints, with the exact functions to fuse and what each group will cost.",
  },
]

export default function LandingPage() {
  const skyRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const frame = useRef(0)

  /*
    Parallax writes --mx / --my straight onto the DOM node inside a rAF.
    The previous version held the pointer position in useState, which made
    every mousemove re-render the whole page; here React never re-renders and
    the CSS transform does the work on the compositor.
  */
  useEffect(() => {
    const el = skyRef.current
    if (!el) return

    const onMove = (event: MouseEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      }
      if (frame.current) return
      frame.current = requestAnimationFrame(() => {
        frame.current = 0
        el.style.setProperty("--mx", pointer.current.x.toFixed(3))
        el.style.setProperty("--my", pointer.current.y.toFixed(3))
      })
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMove)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [])

  return (
    <div className="overflow-hidden">
      {/* ---------------------------------------------------------------- Hero */}
      <section ref={skyRef} className="sky relative">
        {/* Cloud layer. Each mass sets its own --depth so nearer clouds
            travel further with the pointer than distant ones. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="cloud parallax animate-drift left-[-6%] top-[8%] h-56 w-[26rem] bg-white/80"
            style={{ ["--depth" as string]: "26px" }}
          />
          <div
            className="cloud parallax animate-drift left-[58%] top-[4%] h-64 w-[32rem] bg-white/70 animation-delay-2000"
            style={{ ["--depth" as string]: "18px" }}
          />
          <div
            className="cloud parallax animate-drift left-[24%] top-[46%] h-48 w-[24rem] bg-orange-100/70 animation-delay-1000"
            style={{ ["--depth" as string]: "34px" }}
          />
          <div
            className="cloud parallax left-[76%] top-[54%] h-40 w-[20rem] bg-orange-200/40"
            style={{ ["--depth" as string]: "12px" }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-in-up">
              <Badge
                variant="secondary"
                className="mb-6 gap-1.5 border-orange-200 bg-white/70 px-3 py-1.5 text-primary backdrop-blur"
              >
                <Cloud className="h-3.5 w-3.5" />
                Serverless cost optimisation
              </Badge>
            </div>

            <h1 className="animate-fade-in-up animation-delay-200 text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Fuse your functions.
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                  Shrink your bill.
                </span>
                <span className="absolute -bottom-1 left-0 h-1 w-full origin-left animate-scale-x rounded-full bg-gradient-to-r from-orange-400 to-orange-600" />
              </span>
            </h1>

            <p className="animate-fade-in-up animation-delay-400 mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Every hop between two Lambdas costs you a cold start and a network
              round trip. Optifuse works out which of your functions are cheaper
              deployed together, and shows you exactly which ones to merge.
            </p>

            <div className="animate-fade-in-up animation-delay-600 mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="group shadow-sm shadow-orange-600/20">
                <Link href="/login">
                  Get started free
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/70 backdrop-blur">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>

            <p className="animate-fade-in-up animation-delay-800 mt-6 text-sm text-muted-foreground">
              Works with AWS Lambda, the Serverless Framework, X-Ray and CloudWatch.
            </p>
          </div>

          <div className="animate-fade-in-up animation-delay-800 mt-16">
            <FusionDiagram />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-border bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight">Three steps to a smaller bill</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Read-only throughout. Optifuse never deploys anything to your account.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-border bg-background p-7 transition-shadow hover:shadow-md hover:shadow-orange-900/5"
              >
                <span className="text-sm font-mono font-semibold text-primary">{item.step}</span>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2.5 leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight">
              Recommendations you can actually check
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Optimisation advice is only useful if you can see where it came from.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-900/5"
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-100 px-8 py-16 text-center">
            <div className="cloud animate-drift left-[-4%] top-[-20%] h-48 w-96 bg-white/70" aria-hidden />
            <div
              className="cloud animate-drift animation-delay-2000 left-[70%] top-[50%] h-40 w-80 bg-orange-200/50"
              aria-hidden
            />
            <div className="relative">
              <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-md shadow-orange-600/25">
                <Zap className="h-6 w-6 text-white" />
              </span>
              <h2 className="text-4xl font-bold tracking-tight">Ready to see the numbers?</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Connect a repository and run your first analysis. It takes a GitHub
                sign-in and a read-only IAM role.
              </p>
              <Button asChild size="lg" className="group mt-8 shadow-sm shadow-orange-600/20">
                <Link href="/login">
                  Start optimising
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

/*
  Before/after illustration of what the product does. Built from real elements
  rather than an image so the function names stay selectable and the whole
  thing reflows on small screens.
*/
function FusionDiagram() {
  return (
    <div className="mx-auto max-w-5xl rounded-3xl border border-orange-200/70 bg-white/80 p-4 shadow-xl shadow-orange-900/5 backdrop-blur sm:p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <DiagramPanel
          label="Before"
          caption="4 invocations · 3 network hops"
          tone="muted"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <FnPill name="auth" />
            <Hop />
            <FnPill name="fetch" />
            <Hop />
            <FnPill name="transform" />
            <Hop />
            <FnPill name="store" />
          </div>
        </DiagramPanel>

        <DiagramPanel
          label="After"
          caption="2 invocations · 0 network hops"
          tone="accent"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border-2 border-dashed border-orange-400 bg-orange-50 p-2">
              <FnPill name="auth" fused />
              <FnPill name="fetch" fused />
              <FnPill name="transform" fused />
            </div>
            <Hop />
            <FnPill name="store" />
          </div>
        </DiagramPanel>
      </div>
    </div>
  )
}

function DiagramPanel({
  label,
  caption,
  tone,
  children,
}: {
  label: string
  caption: string
  tone: "muted" | "accent"
  children: React.ReactNode
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        tone === "accent" ? "border-orange-200 bg-orange-50/50" : "border-border bg-muted/40"
      }`}
    >
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={`text-xs font-medium ${
            tone === "accent" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {caption}
        </span>
      </div>
      {children}
    </div>
  )
}

function FnPill({ name, fused = false }: { name: string; fused?: boolean }) {
  return (
    <span
      className={`rounded-lg border px-2.5 py-1.5 font-mono text-xs font-medium ${
        fused
          ? "border-orange-300 bg-white text-primary"
          : "border-border bg-white text-foreground shadow-sm"
      }`}
    >
      {name}
    </span>
  )
}

/* A network hop between two functions. This is what fusion removes. */
function Hop() {
  return (
    <svg width="22" height="8" viewBox="0 0 22 8" fill="none" aria-hidden className="shrink-0">
      <path
        d="M0 4h22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        className="animate-dash-flow text-orange-300"
      />
    </svg>
  )
}
