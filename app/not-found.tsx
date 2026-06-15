import Link from "next/link";
import { Logo, BrandBlobs, Underline } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <BrandBlobs />
      <div className="relative z-10 max-w-md">
        <Link href="/" className="inline-block">
          <Logo size="lg" />
        </Link>
        <div className="mt-10 text-8xl font-black text-gradient tracking-[-0.06em]">
          404
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">
          That bet's <Underline>off the board.</Underline>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          The page you're after doesn't exist — or maybe it already settled.
        </p>
        <Link href="/dashboard" className="btn-primary mt-8">
          Back to safety <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
