import type { Metadata } from "next";
import { Geist } from "next/font/google";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "pplGraph",
  description: "A knowledge graph for people and ideas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
        <body className="h-full flex flex-col bg-[#080810] text-white">
          <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 shrink-0">
            <span className="text-white font-semibold tracking-tight text-sm">
              ppl<span className="text-indigo-400">Graph</span>
            </span>
            <div className="flex items-center gap-3">
              <Show when="signed-out">
                <SignInButton>
                  <button className="text-white/50 hover:text-white text-sm transition-colors px-3 py-1.5">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors">
                    Sign up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-7 h-7",
                    },
                  }}
                />
              </Show>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
