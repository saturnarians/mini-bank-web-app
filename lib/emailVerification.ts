import { NextResponse } from "next/server";
import { Resend } from 'resend';
import {
  clearEmailOtpCookie,
  generateEmailOtpCode,
  generateEmailOtpToken,
  setEmailOtpCookie,
  verifyEmailOtpToken,
} from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_OTP_EXPIRY_SECONDS = 10 * 60;

function getFromEmail() {
  return process.env.EMAIL_FROM || "onboarding@resend.dev";
}

function createOtpEmailHtml(userName: string, code: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Email Verification</h2>
      <p>Hello ${userName},</p>
      <p>Your Mini Bank verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If this was not you, ignore this email.</p>
    </div>
  `;
}

export async function sendVerificationOtpAndSetCookie(args: {
  response: NextResponse;
  email: string;
  name: string;
}) {
  const code = generateEmailOtpCode();
  const token = await generateEmailOtpToken({
    email: args.email,
    code,
    expiresIn: EMAIL_OTP_EXPIRY_SECONDS,
  });

  setEmailOtpCookie(args.response, token, EMAIL_OTP_EXPIRY_SECONDS);

  await resend.emails.send({
    from: getFromEmail(),
    to: args.email,
    subject: "Your Mini Bank verification code",
    html: createOtpEmailHtml(args.name, code),
  });
}

export async function verifyOtpFromRequest(args: {
  cookieToken?: string;
  code: string;
  email?: string;
}) {
  if (!args.cookieToken) return null;

  const payload = await verifyEmailOtpToken(args.cookieToken);
  if (!payload) return null;
  if (payload.code !== args.code) return null;
  if (args.email && payload.email.toLowerCase() !== args.email.toLowerCase()) return null;

  return payload.email;
}

export function clearVerificationCookie(response: NextResponse) {
  clearEmailOtpCookie(response);
}
