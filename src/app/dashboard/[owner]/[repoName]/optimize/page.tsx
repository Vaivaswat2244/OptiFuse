"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SimulationResult {
  name: string;
  cost: number;
  latency: number;
  feasible: boolean;
  groups: string[][];
  runtime: number;
  error?: string;
}

interface PageProps {
  params: {
    owner: string;
    repoName: string;
  };
}

export default function OptimizePage({ params }: PageProps) {
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { owner, repoName } = params;
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('optifuse_api_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !API_URL) {
      router.push('/login');
      return;
    }

    fetch(`${API_URL}/api/simulate/live/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ owner, repoName }),
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to run simulation.');
      }
      return data as SimulationResult[];
    })
    .then(data => {
      setResults(data);
    })
    .catch((err: Error) => {
      setError(err.message);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [owner, repoName, router]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="m-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!results || results.length === 0) {
      return <p className="p-6 text-muted-foreground">No simulation results were generated.</p>;
    }

    const bestResult = results.find(r => r.feasible);

    return (
      <div className="p-6 space-y-6">
        {bestResult ? (
          <Alert variant="default" className="bg-green-950 border-green-800">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertTitle className="text-green-300">Best Option Found: {bestResult.name}</AlertTitle>
            <AlertDescription className="text-green-400">
              The '{bestResult.name}' algorithm provided the most cost-effective feasible solution.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Feasible Solution Found</AlertTitle>
            <AlertDescription>None of the algorithms could find a fusion strategy that meets your application's constraints.</AlertDescription>
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Algorithm</TableHead>
              <TableHead>Feasible</TableHead>
              <TableHead className="text-right">Cost ($)</TableHead>
              <TableHead className="text-right">Latency (ms)</TableHead>
              <TableHead className="text-right">Groups</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.name} className={result.feasible ? 'bg-secondary' : 'text-muted-foreground'}>
                <TableCell className="font-medium">{result.name}</TableCell>
                <TableCell>{result.feasible ? '✓ Yes' : '✗ No'}</TableCell>
                <TableCell className="text-right font-mono">{result.cost.toFixed(8)}</TableCell>
                <TableCell className="text-right font-mono">{result.latency.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">{result.groups?.length || 'N/A'}</TableCell>
                <TableCell className="text-xs">{result.error || ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <Link 
          href={`/dashboard/${owner}/${repoName}`} 
          className="text-sm text-muted-foreground hover:underline flex items-center space-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Repository View</span>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live Optimization Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyzing your `serverless.yml` structure combined with live performance data from AWS.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simulation Results</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[200px]">
          {renderContent()}
        </CardContent>
      </Card>
    </main>
  );
}