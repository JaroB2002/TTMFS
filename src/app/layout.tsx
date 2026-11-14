import type { Metadata } from "next";
import { IBM_Plex_Mono, Syne } from "next/font/google";
import { Atmosphere } from "@/components/Atmosphere";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Syne({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Talk to my future self",
  description:
    "Write or record a message for your future self. Choose when it arrives — or let chance decide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
      >
        <div className="site">
          <Atmosphere />
          <div className="shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
