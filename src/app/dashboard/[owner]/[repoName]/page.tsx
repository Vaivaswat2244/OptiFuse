"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // For a better loading state

interface PageProps {
  params: {
    owner: string;
    repoName: string;
  };
}

interface FileResponse {
  filename: string;
  content: string;
}

export default function RepositoryDetailPage({ params }: PageProps) {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { owner, repoName } = params;

  useEffect(() => {
    // --- FIX #1: Get the correct token ---
    const token = localStorage.getItem('optifuse_api_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !API_URL) {
      setError("Configuration error or not logged in.");
      setLoading(false);
      return;
    }

    // --- FIX #2: Use the correct Authorization header format ---
    fetch(`${API_URL}/api/repositories/${owner}/${repoName}/file/`, {
      headers: { 
        'Authorization': `Token ${token}` // Use "Token", not "Bearer"
      }
    })
    .then(res => {
      if (res.status === 404) {
        throw new Error("serverless.yml not found in this repository.");
      }
      if (!res.ok) {
        throw new Error("Failed to fetch file content.");
      }
      return res.json() as Promise<FileResponse>;
    })
    .then(data => {
      setFileContent(data.content);
    })
    .catch((err: Error) => {
      setError(err.message);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [owner, repoName]); 
  
  const renderContent = () => {
    if (loading) {
      // Use skeletons for a better loading experience
      return (
        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    }
    if (error) {
      return <p className="text-destructive mt-4">{error}</p>;
    }
    if (fileContent) {
      return (
        <pre className="mt-4 p-4 bg-muted rounded-md overflow-x-auto text-sm">
          <code>{fileContent}</code>
        </pre>
      );
    }
    // Handle case where file is found but content is empty
    return <p className="text-muted-foreground mt-4">File found, but it is empty.</p>;
  };

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>{repoName}</CardTitle>
            <p className="text-sm text-muted-foreground">File: serverless.yml</p>
          </div>
          {/* Only show the button if the file was fetched successfully */}
          {fileContent && !error && (
            <Link href={`/dashboard/${owner}/${repoName}/optimize`}>
              <Button>
                <Zap className="mr-2 h-4 w-4" />
                Run Live Analysis
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </main>
  );
}