import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Github } from 'lucide-react'; 

export default function LoginPage() {
  const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

  if (!GITHUB_CLIENT_ID) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-[380px]">
          <CardHeader>
            <CardTitle className="text-destructive">Configuration Error</CardTitle>
            <CardDescription>
              GitHub Client ID is not configured. Please contact support.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }
  
  const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user,repo`;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-[380px]">
        <CardHeader className="text-center">
          <CardTitle>Login to Optifuse</CardTitle>
          <CardDescription>
            Authorize with your GitHub account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={GITHUB_AUTH_URL}>
            <Button className="w-full">
              <Github className="mr-2 h-4 w-4" /> 
              Login with GitHub
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}