"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star, Search } from "lucide-react";
import ServerLoader from "@/components/ui/server-loader";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  owner: {
    login: string;
  };
}

export function DashboardClient() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add static glow style globally
    const style = document.createElement("style");
    style.innerHTML = `
      .static-glow {
        border: 2px solid white !important;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.7);
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("optifuse_api_token");
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!token) {
      setError("Not logged in. Please go to the login page.");
      setLoading(false);
      return;
    }
    if (!API_URL) {
      setError("API URL is not configured.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/repositories/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch repositories from backend.");
        return res.json();
      })
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-center">
        <ServerLoader />
      </div>
    );

  if (error)
    return <div className="p-8 text-center text-red-500">{`Error: ${error}`}</div>;

  return (
    <div className=" min-h-screen font-sans">
      <div className="container mx-auto p-8">
        {/* Title + Search */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-[#e6edf3]">Your Repositories</h1>

          <div className="relative w-full max-w-sm md:w-80 md:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e] w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Find a repository..."
              className="w-full bg-[#161b22] text-[#e6edf3] border border-[#495057] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2d8cff] placeholder:text-[#8b949e]"
            />
          </div>
        </div>

        {/* Repo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-[#161b22] rounded-xl border p-8 flex flex-col justify-between shadow-lg hover:border-white transition-all duration-300 transform hover:-translate-y-1"
            >
              <div>
                <h2 className="text-2xl font-semibold text-[#e6edf3] font-mono">
                  {repo.name}
                </h2>
                <p className="text-base text-[#8b949e] mb-4">{repo.full_name}</p>
                <p className="text-base text-[#8b949e] mb-4">
                  {repo.description || "No description provided."}
                </p>
              </div>
              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center text-[#8b949e] text-base">
                  <Star className="text-yellow-500 mr-1 h-4 w-4" />
                  <span>{repo.stargazers_count}</span>
                </div>
                <Link
                  href={`/dashboard/${repo.owner.login}/${repo.name}`}
                  className="bg-[#2d8cff] text-white px-4 py-2 rounded-lg hover:bg-[#58a6ff] transition-colors text-base"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}