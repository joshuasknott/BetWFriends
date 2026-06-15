import Image from "next/image";
import { cn, initials, colorFromString } from "@/lib/utils";

/** Berry underline accent used on emphasised words (matches marketing page). */
export function Underline({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block text-berry", className)}>
      {children}
      <span className="absolute -bottom-1 left-0 h-1 w-full -rotate-2 rounded-full bg-berry" />
    </span>
  );
}

export function Logo({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: { box: "h-8 w-8", text: "text-lg" },
    md: { box: "h-9 w-9", text: "text-xl" },
    lg: { box: "h-12 w-12", text: "text-2xl" },
    xl: { box: "h-16 w-16", text: "text-4xl" },
  };
  const s = sizes[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-bold", className)}>
      <span
        className={cn(
          "relative grid place-items-center",
          s.box,
        )}
      >
        <Image
          src="/brand/betwfriends-logo.png"
          alt=""
          width={1024}
          height={1024}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <span className={cn("tracking-tight", s.text)}>
        Bet<span className="text-gradient">W</span>Friends
      </span>
    </span>
  );
}

export function Avatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };
  const bg = color ?? colorFromString(name);
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-full font-bold text-white ring-2 ring-white shrink-0",
        sizes[size],
        className,
      )}
      style={{ backgroundColor: bg }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({
  people,
  max = 4,
  size = "sm",
}: {
  people: { name: string; color?: string }[];
  max?: number;
  size?: "xs" | "sm" | "md";
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  const overlap = {
    xs: "-ml-1.5",
    sm: "-ml-2",
    md: "-ml-2.5",
  }[size];
  return (
    <span className="inline-flex items-center">
      {shown.map((p, i) => (
        <span key={i} className={i === 0 ? "" : overlap}>
          <Avatar name={p.name} color={p.color} size={size} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className={`inline-grid place-items-center rounded-full bg-brand-100 font-bold text-brand-700 ring-2 ring-white ${overlap} ${
            size === "xs" ? "h-6 w-6 text-[10px]" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
          }`}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}

export function BrandBlobs({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="blob animate-float"
        style={{ top: "-8%", left: "-6%", width: "40%", height: "40%", background: "#b7a3ff" }}
      />
      <div
        className="blob animate-float"
        style={{
          top: "20%",
          right: "-10%",
          width: "38%",
          height: "38%",
          background: "#fb7185",
          animationDelay: "1.5s",
        }}
      />
      <div
        className="blob animate-float"
        style={{
          bottom: "-12%",
          left: "30%",
          width: "42%",
          height: "42%",
          background: "#7c3aed",
          animationDelay: "3s",
        }}
      />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
}
