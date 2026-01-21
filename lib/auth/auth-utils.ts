// put this in the controllers
//assertAdmin(session)


export function assertAdmin(session: any) {
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
    // In Next.js, throwing an error or redirecting here is common
    throw new Error("Unauthorized: Admin access required");
  }
}
