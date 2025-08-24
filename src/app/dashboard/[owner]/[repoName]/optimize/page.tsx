import { OptimizePageClient } from "./OptimizePageClient";

interface PageProps {
  params: Promise<{
    owner: string;
    repoName: string;
  }>;
}

export default async function OptimizePage({ params }: PageProps) {
  const resolvedParams = await params;
  
  return <OptimizePageClient params={resolvedParams} />;
}