"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function VerifyEmailPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const initialEmail = params.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && code.trim().length === 6,
    [email, code]
  );

  const verifyOtp = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Verification failed");
        return;
      }
      setMessage(data?.message || "Verified successfully.");
      router.push("/dashboard");
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.redirectTo) {
          router.push(`${data.redirectTo}?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(data?.error || "Failed to resend OTP");
        return;
      }
      setMessage(data?.message || "OTP resent");
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Verify Email</CardTitle>
        <CardDescription>Enter the 6-digit OTP sent to your email.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit OTP"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          disabled={loading}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Button className="w-full" onClick={verifyOtp} disabled={loading || !canSubmit}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
        <Button variant="outline" className="w-full" onClick={resendOtp} disabled={loading || !email}>
          Resend OTP
        </Button>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto mt-8">Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
