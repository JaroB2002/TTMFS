import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Talk to my future self",
  description:
    "Schrijf of spreek een boodschap in voor je toekomstige ik. Kies wanneer die aankomt — of laat het lot beslissen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <div className="site">
          <div className="atmosphere" aria-hidden />
          <div className="shell">{children}</div>
        </div>
      </body>
    </html>
  );
}
