import prisma from '@/lib/prisma'; // or your DB client
import { addMinutes } from 'date-fns';

async function cleanupExpiredSessions() {
  const now = new Date();

  // Delete all sessions that expired 20 mins ago (example)
  await prisma.session.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  console.log('Expired sessions cleaned up at', now);
}

export default cleanupExpiredSessions;


// Schedule this in Vercel cron or AWS Lambda / CloudWatch every 5–10 minutes.

// Optional: Update expiresAt whenever you refresh the JWT for sliding sessions.