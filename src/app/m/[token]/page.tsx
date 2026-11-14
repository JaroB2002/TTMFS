import Link from "next/link";
import { RevealClient } from "@/components/RevealClient";

type Props = { params: Promise<{ token: string }> };

export const metadata = {
  title: "Capsule · Talk to my future self",
  robots: { index: false, follow: false },
};

export default async function MessagePage({ params }: Props) {
  const { token } = await params;
  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="mark">TTMFS</span>
          Talk to my future self
        </Link>
        <Link href="/compose" className="nav-link">
          New message
        </Link>
      </header>
      <main className="reveal-page">
        <RevealClient token={token} />
      </main>
    </>
  );
}
