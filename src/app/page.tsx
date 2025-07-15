import Link from 'next/link';
import { Button } from '@/components/ui/button'; 

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Welcome to Optifuse
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The best way to manage your GitHub projects.
        </p>
      </div>
      <Link href="/login">
        <Button size="lg">Get Started</Button>
      </Link>
    </main>
  );
}