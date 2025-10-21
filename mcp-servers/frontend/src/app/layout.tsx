import { Inter } from "next/font/google";
import { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "@/components/layouts/ClientLayout";
import Providers from "./Providers";
import RootClientWrapper from "@/components/RootClientWrapper";
import StyleLoader from "@/components/StyleLoader";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Music App",
  description: "AI-powered music creation and collaboration platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <StyleLoader />
        <Providers>
          <RootClientWrapper>
            <ClientLayout>{children}</ClientLayout>
          </RootClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
