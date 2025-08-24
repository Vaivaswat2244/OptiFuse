import { RepositoryDetailPageClient } from "./RepositoryDetailPageClient";

interface PageProps {
  params: Promise<{
    owner: string;
    repoName: string;
  }>;
}

export default async function RepositoryDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  return <RepositoryDetailPageClient params={resolvedParams} />;
}