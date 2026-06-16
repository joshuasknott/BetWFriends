import { Spinner } from "@/components/brand";

export default function Loading() {
  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="mt-3 text-sm font-semibold text-ink-soft">Loading…</p>
      </div>
    </div>
  );
}
