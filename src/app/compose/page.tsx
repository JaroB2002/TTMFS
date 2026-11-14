import Link from "next/link";
import { ComposeFlow } from "@/components/ComposeFlow";

export const metadata = {
  title: "Compose · Talk to my future self",
};

export default function ComposePage() {
  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="mark">TTMFS</span>
          Talk to my future self
        </Link>
        <Link href="/" className="nav-link">
          Home
        </Link>
      </header>
      <main className="compose-page">
        <ComposeFlow />
      </main>
    </>
  );
}
