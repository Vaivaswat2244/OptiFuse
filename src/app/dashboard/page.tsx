"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

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

export default function Dashboard() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('github_access_token');
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
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch repositories from backend.');
        return res.json() as Promise<Repository[]>;
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

  if (loading) return <div className="p-8 text-center">Loading your repositories...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{`Error: ${error}`}</div>;

  return (
    <div className="relative min-h-screen bg-[#111827] text-white font-inter">
      {/* Stable gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 via-red-900/30 to-yellow-700/20 blur-3xl"></div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Repositories</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-[#1F2937] rounded-xl shadow-md overflow-hidden p-6 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <h2 className="text-xl font-semibold truncate">{repo.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{repo.full_name}</p>
              <p className="text-gray-400 mb-6 text-sm">
                {repo.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-400">
                  <Star className="text-yellow-500 mr-1 h-4 w-4" />
                  <span>{repo.stargazers_count}</span>
                </div>
                <Link
                  href={`/dashboard/${repo.owner.login}/${repo.name}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
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
