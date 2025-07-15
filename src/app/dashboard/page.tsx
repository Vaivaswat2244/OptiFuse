"use client";

import { useEffect, useState } from 'react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
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
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch repositories from backend.');
      }
      return res.json() as Promise<Repository[]>;
    })
    .then(data => {
      setRepos(data);
      setLoading(false);
    })
    .catch((err: Error) => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading your repositories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Your Repositories</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {repos.map(repo => (
          <li key={repo.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '5px' }}>
            <h3>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                {repo.full_name}
              </a>
            </h3>
            <p>{repo.description || 'No description provided.'}</p>
            <span>⭐ {repo.stargazers_count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}