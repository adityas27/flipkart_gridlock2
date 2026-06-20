'use server';

import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';

export async function syncUserFromClerk() {
  try {
    const user = await currentUser();

    if (!user?.emailAddresses?.length) return null;

    const email = user.emailAddresses[0].emailAddress;
    const username = user.username ?? email.split('@')[0] ?? `user_${user.id.slice(-8)}`;

    const dbUser = await db.user.upsert({
      where: { clerkId: user.id },
      create: {
        clerkId: user.id,
        username,
        email,
        password: `clerk_${user.id}`,
        role: 'USER',
      },
      update: {
        email,
        username,
      },
    });

    return {
      success: true,
      user: dbUser,
    };
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
}
