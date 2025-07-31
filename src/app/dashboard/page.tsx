"use client";
import Link from 'next/link'; 
import { Button } from '@/components/ui/button'; 
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Star } from 'lucide-react'; 

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  owner : {
    login: string;
  }
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
      if (!res.ok) throw new Error('Failed to fetch repositories from backend.');
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

  if (loading) return <div className="p-8 text-center">Loading your repositories...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{`Error: ${error}`}</div>;

  if (repos){
        return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Your Repositories</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {repos.map(repo => (
          <Card key={repo.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="truncate">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {repo.name}
                </a>
              </CardTitle>
              <CardDescription className="truncate">{repo.full_name}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {repo.description || 'No description provided.'}
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center text-sm">
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                <span>{repo.stargazers_count}</span>
              </div>
              <Link href={`/dashboard/${repo.owner.login}/${repo.name}`}>
                <Button variant="secondary" size="sm">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
  }
  else {
    <h1>
        No Api url present...
    </h1>
  }

  
}