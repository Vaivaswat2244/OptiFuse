"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap } from 'lucide-react';

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
    const token = localStorage.getItem('github_access_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !API_URL) {
      setError("Configuration or authentication error.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/repositories/${owner}/${repoName}/file/`, {
      headers: { 'Authorization': `Bearer ${token}` }
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
      return <p>Loading file content...</p>;
    }
    if (error) {
      return <p className="text-destructive">{error}</p>;
    }
    if (fileContent) {
      return (
        <pre className="mt-4 p-4 bg-muted rounded-md overflow-x-auto">
          <code>{fileContent}</code>
        </pre>
      );
    }
    return null;
  };

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>File Content: serverless.yml</CardTitle>
          {fileContent && (
            <Link href={`/dashboard/${owner}/${repoName}/optimize`}>
              <Button className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                Optimize Configuration
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