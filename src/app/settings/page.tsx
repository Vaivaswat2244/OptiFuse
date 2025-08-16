// optifuse/client/app/settings/page.tsx
"use client";

import { useEffect, useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // For messages
import { Copy, Check } from 'lucide-react';

// Define the shape of the data we expect from the /api/profile/settings/ endpoint
interface ProfileData {
  username: string;
  subscription: string;
  aws_role_arn: string | null;
  aws_external_id: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [arnInput, setArnInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch profile data when the component mounts
  useEffect(() => {
    const token = localStorage.getItem('optifuse_api_token'); // Use the correct token key
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !API_URL) {
      setMessage({ type: 'error', text: 'Configuration error or not logged in.' });
      setIsLoading(false);
      return;
    }

    fetch(`${API_URL}/api/profile/settings/`, {
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch profile data.');
      return res.json();
    })
    .then((data: ProfileData) => {
      setProfile(data);
      setArnInput(data.aws_role_arn || '');
    })
    .catch(err => setMessage({ type: 'error', text: err.message }))
    .finally(() => setIsLoading(false));
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const token = localStorage.getItem('optifuse_api_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${API_URL}/api/profile/settings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ aws_role_arn: arnInput })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save settings.');
      return res.json();
    })
    .then(data => {
      if (data.message) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'An unknown error occurred.' });
      }
    })
    .catch(err => setMessage({ type: 'error', text: err.message }));
  };

  if (isLoading) {
    return <SettingsPageSkeleton />; // Show a loading skeleton
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{message?.text || 'Could not load your profile. Please try logging in again.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const YOUR_OPTIFUSE_AWS_ACCOUNT_ID = "123456789012"; // IMPORTANT: Replace with your actual AWS Account ID

  return (
    <main className="container mx-auto p-4 sm:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>AWS Integration</CardTitle>
          <CardDescription>
            Securely grant Optifuse read-only access to your AWS X-Ray data for live performance analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Step 1 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Step 1: Provide these values in AWS</h3>
            <p className="text-sm text-muted-foreground">
              When deploying our CloudFormation stack in your AWS account, you will be prompted for the following parameters.
            </p>
            <div className="space-y-2">
              <Label>Your Optifuse AWS Account ID</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={YOUR_OPTIFUSE_AWS_ACCOUNT_ID} className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Your Unique External ID</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={profile.aws_external_id} className="font-mono" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(profile.aws_external_id)}>
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
             <h3 className="font-semibold text-lg">Step 2: Launch the AWS CloudFormation Stack</h3>
            <p className="text-sm text-muted-foreground">
              Click the button below to go to the AWS CloudFormation console. You will need to provide the template we've supplied in our documentation.
            </p>
            <Button asChild>
              <a href="https://console.aws.amazon.com/cloudformation/home#/stacks/create/template" target="_blank" rel="noopener noreferrer">
                Launch Stack in AWS
              </a>
            </Button>
          </div>

          {/* Step 3 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Step 3: Save your new Role ARN</h3>
            <p className="text-sm text-muted-foreground">
              After the stack is created, find the `RoleArn` in the "Outputs" tab, paste it here, and save.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="arn">AWS Role ARN</Label>
                <Input
                  id="arn"
                  value={arnInput}
                  onChange={(e) => setArnInput(e.target.value)}
                  placeholder="arn:aws:iam::ACCOUNT_ID:role/Optifuse-User-Access-Role"
                  className="font-mono"
                />
              </div>
              <Button type="submit">Save Settings</Button>
            </form>
          </div>
        </CardContent>
        <CardFooter>
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}

// A simple skeleton component for a better loading experience
function SettingsPageSkeleton() {
  return (
    <main className="container mx-auto p-4 sm:p-8 max-w-4xl">
      <Skeleton className="h-10 w-1/3 mb-8" />
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full mt-2" />
            <Skeleton className="h-10 w-full mt-2" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-48 mt-2" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}