import "./globals.css";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { dark } from '@clerk/ui/themes';
import { syncUserFromClerk } from "@/actions/user";
import { ThemeScript } from "@/components/shared/theme-script";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const metadata = {
  title: "Gridlock 2.0",
  description: "Traffic operations control center for event-driven congestion planning.",
};

export default async function RootLayout({ children }) {
  const syncedUser = await syncUserFromClerk();
  const dbUser = syncedUser?.success ? syncedUser.user : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeScript />
        <ClerkProvider appearance={{ theme: dark }}>
          <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-3 border-b border-[#343A40] bg-[#16181B] px-4">
            <Show when="signed-out">
              <ThemeToggle />
              <SignInButton mode='modal'>
                <button className="h-10 rounded-xl border border-[#343A40] bg-[#1C1F23] px-4 text-sm font-medium text-[#F3F4F6] transition hover:bg-[#22262B]">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode='modal'>
                <button className="h-10 cursor-pointer rounded-xl border border-[#4B5563] bg-[#262A30] px-4 text-sm font-medium text-[#F3F4F6] transition hover:bg-[#2D3238] sm:h-10 sm:px-5 sm:text-sm">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <ThemeToggle />
              {dbUser ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <p className="text-[#D1D5DB]">{dbUser.username}</p>
                    <p className="text-xs font-semibold text-[#F59E0B]">{dbUser.role}</p>
                  </div>
                </div>
              ) : null}
              <UserButton />
            </Show>
          </header>
          <div className="relative min-h-[calc(100vh-4rem)] bg-[#111315]">
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
