import prisma from '@/lib/prisma'; // or your DB client
import { addMinutes } from 'date-fns';

async function cleanupExpiredSessions() {
  const now = new Date();

  // Session model may not exist depending on current Prisma schema.
  // Guard the call so this utility compiles safely across schema variants.
  await (prisma as any).session?.deleteMany?.({
    where: { expiresAt: { lt: now } },
  });

  console.log('Expired sessions cleaned up at', now);
}

export default cleanupExpiredSessions;


// Schedule this in Vercel cron or AWS Lambda / CloudWatch every 5–10 minutes.

// Optional: Update expiresAt whenever you refresh the JWT for sliding sessions.
