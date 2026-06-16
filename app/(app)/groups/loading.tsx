import { Spinner } from "@/components/brand";

export default function Loading() {
  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center">
      <Spinner />
    </div>
  );
}
