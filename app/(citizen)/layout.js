import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export default async function CitizenLayout({
  children,
}) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen">
        Please sign in.
      </div>
    );
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== "USER") {
    return (
      <div className="min-h-screen">
        Access denied.
      </div>
    );
  }

  return children;
}