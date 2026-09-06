"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Star, Search, AlertCircle, FolderGit2, ArrowRight, LogIn } from "lucide-react"
import CloudLoader from "@/components/ui/cloud-loader"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Repository {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  owner: {
    login: string
  }
}

export function DashboardClient() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Distinguishes "no token" from a genuine request failure, so the empty
  // state can offer a sign-in link instead of a bare error string.
  const [needsAuth, setNeedsAuth] = useState(false)

  useEffect(() => {
    const token =
      localStorage.getItem("optifuse_api_token") || localStorage.getItem("optifuse_token")
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    if (!token) {
      setNeedsAuth(true)
      setLoading(false)
      return
    }
    if (!API_URL) {
      setError("API URL is not configured.")
      setLoading(false)
      return
    }

    fetch(`${API_URL}/api/repositories/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch repositories from backend.")
        return res.json()
      })
      .then((data) => {
        setRepos(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filteredRepos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return repos
    return repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query)
    )
  }, [repos, searchQuery])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <CloudLoader label="Loading your repositories…" />
      </div>
    )
  }

  if (needsAuth) {
    return (
      <EmptyState
        icon={LogIn}
        title="You're not signed in"
        description="Sign in with GitHub to see the repositories Optifuse can analyse."
        action={
          <Button asChild>
            <Link href="/login">Sign in with GitHub</Link>
          </Button>
        }
      />
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Couldn&apos;t load your repositories</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your repositories</h1>
          <p className="mt-1.5 text-muted-foreground">
            Pick a repository with a <code className="font-mono text-sm">serverless.yml</code> to
            analyse.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Find a repository…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="bg-card pl-9"
            aria-label="Find a repository"
          />
        </div>
      </div>

      {repos.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No repositories yet"
          description="Optifuse couldn't find any repositories on your GitHub account."
        />
      ) : filteredRepos.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description={`Nothing matches "${searchQuery}". Try a different search.`}
          action={
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRepos.map((repo) => (
            <article
              key={repo.id}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-900/5"
            >
              <div className="flex-1">
                <h2 className="font-mono text-lg font-semibold tracking-tight text-foreground">
                  {repo.name}
                </h2>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{repo.full_name}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {repo.description || "No description provided."}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                  {repo.stargazers_count}
                </span>
                <Button asChild size="sm" className="group/btn">
                  <Link href={`/dashboard/${repo.owner.login}/${repo.name}`}>
                    Analyse
                    <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
