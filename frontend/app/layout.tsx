import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MatrSphere | Secure Profile Management",
  description:
    "A secure, full-stack profile management system with Fernet field-level encryption for PII data. Built with FastAPI and Next.js.",
  keywords: ["profile management", "PII security", "encryption", "FastAPI", "Next.js"],
  robots: "noindex, nofollow", // Internal enterprise tool
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
