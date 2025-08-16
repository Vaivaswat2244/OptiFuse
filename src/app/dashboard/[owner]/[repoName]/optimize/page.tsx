"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Zap, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface PageProps {
  params: {
    owner: string;
    repoName: string;
  };
}

interface OptimizationResult {
  success: boolean;
  optimization_result: {
    summary: {
      total_changes: number;
      optimization_score: number;
      cost_savings_percentage: number;
      performance_improvement_percentage: number;
    };
    changes: string[];
    recommendations: string[];
    original_config: any;
    optimized_config: any;
  };
  optimized_yaml: string;
}

export default function OptimizePage({ params }: PageProps) {
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { owner, repoName } = params;

  useEffect(() => {
    fetchOriginalContent();
  }, [owner, repoName]);

  const fetchOriginalContent = async () => {
    const token = localStorage.getItem('github_access_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !API_URL) {
      setError("Configuration or authentication error.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/repositories/${owner}/${repoName}/file/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 404) {
        throw new Error("serverless.yml not found in this repository.");
      }
      if (!response.ok) {
        throw new Error("Failed to fetch file content.");
      }

      const data = await response.json();
      setOriginalContent(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!originalContent) return;

    setOptimizing(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      const response = await fetch(`${API_URL}/api/optimize/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yaml_content: originalContent
        })
      });

      if (!response.ok) {
        throw new Error("Failed to optimize configuration");
      }

      const result = await response.json();
      setOptimizationResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOptimizing(false);
    }
  };

  const renderOptimizationResults = () => {
    if (!optimizationResult) return null;

    const { summary, changes, recommendations } = optimizationResult.optimization_result;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Optimization Score</p>
                  <p className="text-2xl font-bold">{summary.optimization_score.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Cost Savings</p>
                  <p className="text-2xl font-bold">{summary.cost_savings_percentage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Performance</p>
                  <p className="text-2xl font-bold">{summary.performance_improvement_percentage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Changes Made</p>
                  <p className="text-2xl font-bold">{summary.total_changes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Changes Made */}
        {changes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Changes Made</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {changes.map((change, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{change}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Optimized YAML */}
        <Card>
          <CardHeader>
            <CardTitle>Optimized Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="mt-4 p-4 bg-muted rounded-md overflow-x-auto text-sm">
              <code>{optimizationResult.optimized_yaml}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <p>Loading file content...</p>;
    }
    if (error) {
      return <p className="text-destructive">{error}</p>;
    }
    if (!originalContent) {
      return <p>No content to optimize.</p>;
    }
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Original Configuration</h3>
          <Button 
            onClick={handleOptimize} 
            disabled={optimizing}
            className="flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            {optimizing ? 'Optimizing...' : 'Optimize Configuration'}
          </Button>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
          <code>{originalContent}</code>
        </pre>
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
          <span>Back to Repository</span>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Optimize Serverless Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Optimize your serverless.yml file for better performance and cost efficiency
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>

        {optimizationResult && renderOptimizationResults()}
      </div>
    </main>
  );
} 