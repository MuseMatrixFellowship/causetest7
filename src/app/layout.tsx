import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
// import { Web3AuthProvider } from "@/hooks/Web3AuthContext";
import { headers } from "next/headers";
import WagmiAuthProvider from "@/hooks/WagmiAuth.context";
import { hidden } from "colorette";

export const metadata: Metadata = {
  title: 'Causality.network',
  description: 'Record and Analyze your brain waves.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get('cookie')
  return (
    <html lang="en">
      <body className="bg-customDark" style={{height: "100vh", overflowY: "hidden"}}>
          <WagmiAuthProvider cookies={cookies}>
          <Navbar />
          {children}
          </WagmiAuthProvider>
      </body>
    </html>
  );
}
