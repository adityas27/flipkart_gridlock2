import { Sidebar } from "@/components/shared/sidebar";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export default async function WorkspaceLayout({ children }) {
  const { userId } = await auth();

  if (!userId) {
    return <div className="min-h-[calc(100vh-4rem)]" />;
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== "OFFICER") {
    return <div className="min-h-[calc(100vh-4rem)]" />;
  }

  return <Sidebar>{children}</Sidebar>;
}
