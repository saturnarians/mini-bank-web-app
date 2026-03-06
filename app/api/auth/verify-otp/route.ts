import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { EMAIL_OTP_COOKIE, setTokenCookie, signToken } from "@/lib/auth";
import { clearVerificationCookie, verifyOtpFromRequest } from "@/lib/emailVerification";

export const dynamic = "force-dynamic";

const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  email: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = verifyOtpSchema.parse(await request.json());
    const cookieToken = request.cookies.get(EMAIL_OTP_COOKIE)?.value;

    const email = await verifyOtpFromRequest({
      cookieToken,
      code: body.code,
      email: body.email,
    });

    if (!email) {
      return NextResponse.json(
        { error: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const verifiedUser = await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        transactionPinHash: true,
      },
    });

    const accessToken = await signToken({
      id: verifiedUser.id,
      name: verifiedUser.name,
      email: verifiedUser.email,
      role: verifiedUser.role as "user" | "admin" | "superadmin",
      emailVerified: true,
    });

    const response = NextResponse.json({
      message: "Email verified successfully.",
      user: {
        id: verifiedUser.id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        role: verifiedUser.role,
        emailVerified: verifiedUser.emailVerified,
        hasTransactionPin: !!verifiedUser.transactionPinHash,
      },
    });
    setTokenCookie(response, accessToken, 20 * 60);
    clearVerificationCookie(response);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
