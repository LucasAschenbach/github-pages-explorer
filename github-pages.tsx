"use client"

import { ExternalLink, Github, Globe } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  has_pages: boolean
  language: string | null
  stargazers_count: number
  updated_at: string
}

export default function GitHubPagesGrid() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [username, setUsername] = useState("octocat") // Default username for demo

  useEffect(() => {
    fetchGitHubPages()
  }, [])

  useEffect(() => {
    const filtered = repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredRepos(filtered)
  }, [repos, searchTerm])

  const fetchGitHubPages = async () => {
    if (!username.trim()) return

    setLoading(true)
    setError(null)

    try {
      const headers: HeadersInit = {}
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN

      if (token && token.trim()) {
        headers["Authorization"] = `token ${token.trim()}`
      } else {
        console.warn("NEXT_PUBLIC_GITHUB_TOKEN not found. Making unauthenticated request.")
      }

      const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers })

      if (!response.ok) {
        if (response.status === 403) {
          if (token && token.trim()) {
            throw new Error(
              `Failed to fetch repositories: ${response.status}. This might be due to an invalid or expired GitHub token, or insufficient permissions. Please check your NEXT_PUBLIC_GITHUB_TOKEN.`,
            )
          } else {
            throw new Error(
              `Failed to fetch repositories: ${response.status}. This is likely due to rate limiting. Please set NEXT_PUBLIC_GITHUB_TOKEN in your .env.local file to increase the rate limit.`,
            )
          }
        }
        throw new Error(`Failed to fetch repositories: ${response.status}`)
      }

      const allRepos: GitHubRepo[] = await response.json()

      // Filter for repositories with GitHub Pages enabled
      const pagesRepos = allRepos.filter((repo) => repo.has_pages)

      setRepos(pagesRepos)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const truncateDescription = (description: string | null, maxLength = 120) => {
    if (!description) return "No description available"
    return description.length > maxLength ? `${description.substring(0, maxLength)}...` : description
  }

  const getPageUrl = (repo: GitHubRepo) => {
    // If homepage is set, use it; otherwise construct the GitHub Pages URL
    if (repo.homepage && repo.homepage.startsWith("http")) {
      return repo.homepage
    }
    return `https://${username}.github.io/${repo.name}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">GitHub Pages</h1>
          <p className="text-muted-foreground mb-6">Browse all your hosted GitHub Pages repositories</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchGitHubPages()
                }
              }}
              className="sm:max-w-xs"
            />
            <Button onClick={fetchGitHubPages} disabled={loading}>
              {loading ? "Loading..." : "Fetch Repositories"}
            </Button>
          </div>

          {repos.length > 0 && (
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive font-medium">Error: {error}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Make sure the username is correct and the profile is public. If you are seeing persistent 403 errors, ensure your <code>NEXT_PUBLIC_GITHUB_TOKEN</code> is correctly set in a <code>.env.local</code> file and your development server has been restarted.
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRepos.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Found {filteredRepos.length} GitHub Pages {filteredRepos.length === 1 ? "repository" : "repositories"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepos.map((repo) => (
                <Card key={repo.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">{repo.name}</CardTitle>
                        <CardDescription className="mt-2">{truncateDescription(repo.description)}</CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {repo.language && (
                        <Badge variant="secondary" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>★ {repo.stargazers_count}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={getPageUrl(repo)} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4 mr-2" />
                            View Site
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>

                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            Repository
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground">Updated {formatDate(repo.updated_at)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : !loading && repos.length === 0 && username ? (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No GitHub Pages Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No repositories with GitHub Pages were found for user "{username}". Make sure you have repositories with
              GitHub Pages enabled.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
