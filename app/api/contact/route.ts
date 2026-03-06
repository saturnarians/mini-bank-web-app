import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid contact form data' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, message } = parsed.data;
    const recipient = process.env.REPLY_TO;

    if (!recipient) {
      return NextResponse.json(
        { error: 'Contact email receiver is not configured' },
        { status: 500 }
      );
    }

    const subject = `New contact message from ${firstName} ${lastName}`;
    const html = `
      <h2>New Contact Form Message</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br />')}</p>
    `;

    const result = await sendEmail({
      to: recipient,
      subject,
      html,
      replyTo: email,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send contact message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
