"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser } from "@/store/slices/auth-slice";
import { registerSchema, type RegisterFormData } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // 1. Initialize the form
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      transactionPin: "",
    },
  });

  // 2. Define the submit handler
  const onSubmit = async (values: RegisterFormData) => {
    try {
      const result = await dispatch(registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        transactionPin: values.transactionPin || undefined,
        accountType: values.accountType,
      })).unwrap();
      if (result?.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
        return;
      }
      router.push("/login");
    } catch (err: any) {
      if (err?.redirectTo) {
        router.push(`${err.redirectTo}?email=${encodeURIComponent(values.email)}`);
        return;
      }
      // Errors are handled by the Redux state 'error'
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="min-w-40 max-w-110 md:min-w-110 md:max-w-full lg:w-full mb-8 mx-auto p-6 shadow rounded">
      <h2 className="text-2xl mb-4 font-bold">Register</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 backdrop-blur-md bg-white">
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transactionPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction PIN (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="4-digit PIN"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}
