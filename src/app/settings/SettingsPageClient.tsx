"use client";

import { useEffect, useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, Check, ExternalLink, CheckCircle, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define the shape of the data from the /api/profile/settings/ endpoint
interface ProfileData {
  username: string;
  subscription: string;
  aws_role_arn: string | null;
  aws_external_id: string;
}

const CLOUDFORMATION_TEMPLATE = `
AWSTemplateFormatVersion: '2010-09-09'
Description: >
  This template creates a read-only IAM Role for Optifuse to securely access
  AWS X-Ray and CloudWatch Logs data for performance analysis.

Parameters:
  OptifuseAWSAccountId:
    Type: String
    Description: The AWS Account ID provided by the Optifuse application.
    Default: 616860869053 # The Optifuse Service Account ID

  OptifuseExternalId:
    Type: String
    Description: The unique External ID provided on your Optifuse settings page. This ensures only you can access this role.

Resources:
  OptifuseUserAccessRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: Optifuse-User-Access-Role
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              # Escaped for JavaScript template literal
              AWS: !Sub "arn:aws:iam::\${OptifuseAWSAccountId}:root"
            Action: sts:AssumeRole
            Condition:
              StringEquals:
                sts:ExternalId: !Ref OptifuseExternalId
      Policies:
        - PolicyName: OptifuseReadOnlyPerformanceDataPolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  # Permissions for AWS X-Ray (for dependency graph)
                  - "xray:GetTraceSummaries"
                  - "xray:BatchGetTraces"
                  - "xray:ListResourcePolicies"
                  # Permissions for AWS CloudWatch Logs (for performance metrics)
                  - "logs:DescribeLogGroups"
                  - "logs:StartQuery"
                  - "logs:StopQuery"
                  - "logs:GetQueryResults"
                  - "logs:FilterLogEvents"
                Resource: "*"

Outputs:
  RoleArn:
    Description: The ARN of the created IAM Role. Copy this value into your Optifuse settings page.
    Value: !GetAtt OptifuseUserAccessRole.Arn
`.trim();

// Client Component
export function SettingsPageClient() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [arnInput, setArnInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExtIdCopied, setIsExtIdCopied] = useState(false);
  const [isTemplateCopied, setIsTemplateCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('optifuse_api_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !API_URL) {
      router.push('/login');
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
  }, [router]);

  const handleCopy = (text: string, type: 'extId' | 'template') => {
    navigator.clipboard.writeText(text);
    if (type === 'extId') {
      setIsExtIdCopied(true);
      setTimeout(() => setIsExtIdCopied(false), 2000);
    } else {
      setIsTemplateCopied(true);
      setTimeout(() => setIsTemplateCopied(false), 2000);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CLOUDFORMATION_TEMPLATE], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optifuse-template.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const token = localStorage.getItem('optifuse_api_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${API_URL}/api/profile/settings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
      body: JSON.stringify({ aws_role_arn: arnInput })
    })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        setMessage({ type: 'success', text: data.message });
        setProfile(prev => prev ? { ...prev, aws_role_arn: arnInput } : null);
      } else {
        throw new Error(data.error || 'An unknown error occurred.');
      }
    })
    .catch(err => setMessage({ type: 'error', text: err.message }));
  };

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }
  
  const YOUR_OPTIFUSE_AWS_ACCOUNT_ID = "616860869053"; 

  return (
    <main className="container mx-auto p-4 sm:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">AWS Integration Settings</h1>
      
      {profile?.aws_role_arn && (
        <Alert variant="default" className="mb-6 bg-green-950/50 border-green-800 text-green-300">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertTitle>AWS Account Connected</AlertTitle>
          <AlertDescription>
            Optifuse is connected to your AWS account. You can now run live analyses.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Connect Your AWS Account</CardTitle>
          <CardDescription>
            Follow these steps to securely grant Optifuse read-only access to your AWS data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Step 1: Get Your Connection Details</h3>
            <p className="text-sm text-muted-foreground">You will need these two values to create the secure connection in AWS.</p>
            <div className="space-y-2 pt-2">
              <Label>Optifuse AWS Account ID</Label>
              <Input readOnly value={YOUR_OPTIFUSE_AWS_ACCOUNT_ID} className="font-mono bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label>Your Unique External ID</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={profile?.aws_external_id || 'Loading...'} className="font-mono bg-secondary" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(profile!.aws_external_id, 'extId')}>
                  {isExtIdCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Step 2: Create and Deploy the IAM Role in AWS</h3>
            <p className="text-sm text-muted-foreground">Save the template below as a file (e.g., `optifuse-template.yml`), then upload it in the AWS CloudFormation console.</p>
            <div className="relative">
              <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs max-h-40 whitespace-pre-wrap">
                <code>{CLOUDFORMATION_TEMPLATE}</code>
              </pre>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleCopy(CLOUDFORMATION_TEMPLATE, 'template')}>
                {isTemplateCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template (.yml)
              </Button>
              <Button asChild variant="secondary">
                <a href="https://console.aws.amazon.com/cloudformation/home#/stacks/create/template" target="_blank" rel="noopener noreferrer">
                  Launch Stack in AWS <ExternalLink className="ml-2 h-4 w-4"/>
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Step 3: Save Your New Role ARN</h3>
            <p className="text-sm text-muted-foreground">After the stack is created, find the `RoleArn` in the Outputs tab, paste it here, and save.</p>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="arn">AWS Role ARN</Label>
                <Input id="arn" value={arnInput} onChange={(e) => setArnInput(e.target.value)} placeholder="arn:aws:iam::..." className="font-mono" />
              </div>
              <Button type="submit">Save Settings</Button>
            </form>
          </div>
        </CardContent>
        <CardFooter>
          {message && <Alert variant={message.type === 'error' ? 'destructive' : 'default'}><AlertDescription>{message.text}</AlertDescription></Alert>}
        </CardFooter>
      </Card>
    </main>
  );
}

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
          <div className="space-y-3 p-4 border rounded-lg">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full mt-2" />
          </div>
          <div className="space-y-3 p-4 border rounded-lg">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-48 mt-2" />
          </div>
          <div className="space-y-3 p-4 border rounded-lg">
             <Skeleton className="h-6 w-1/3 mb-2" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-32 mt-4" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}