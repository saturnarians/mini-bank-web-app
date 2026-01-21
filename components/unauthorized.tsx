'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Unauthorized() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="max-w-md w-full text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don’t have permission to view this page.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake, please contact an administrator or
            return to a page you’re authorized to access.
          </p>

          <div className="flex justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="default">Go to Dashboard</Button>
            </Link>

            <Link href="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
