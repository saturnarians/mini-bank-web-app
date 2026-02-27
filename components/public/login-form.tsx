'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginFormData } from '@/lib/schemas';
import { resolveDashboardByRole } from '@/lib/route-resolver';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/slices/auth-slice';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'john@example.com',
      password: 'password123', 
    },
  });

  async function onSubmit(values: LoginFormData) {
    try {
      const user = await dispatch(loginUser(values)).unwrap();
      const redirectTo = resolveDashboardByRole(user.role);
      router.replace(redirectTo);
    } catch (err: any) {
      if (err?.redirectTo) {
        router.push(`${err.redirectTo}?email=${encodeURIComponent(values.email)}`);
        return;
      }

      if (err?.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
        return;
      }

      console.error("Login error:", err);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-balance">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Password</FormLabel>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-primary hover:underline"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            variant="default"
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>

      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Demo Credentials</span>
        </div>
      </div> */}

      {/* <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
        <div>
          <p className="font-semibold">Admin Account:</p>
          <p className="text-muted-foreground">admin@bank.com / password123</p>
        </div>
        <div>
          <p className="font-semibold">Regular User:</p>
          <p className="text-muted-foreground">john@example.com / password123</p>
        </div>
      </div> */}
      <p className="text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
