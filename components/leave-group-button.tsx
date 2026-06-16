"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Spinner } from "@/components/brand";
import { api } from "@/convex/_generated/api";

export function LeaveGroupButton({
  groupId,
  groupName,
  isCreator,
  memberCount,
}: {
  groupId: string;
  groupName: string;
  isCreator: boolean;
  memberCount: number;
}) {
  const router = useRouter();
  const leaveGroup = useMutation(api.groups.leaveGroup);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leave() {
    const warning = isCreator
      ? memberCount === 1
        ? `This will permanently delete "${groupName}" and all its bets. Are you sure?`
        : `You created "${groupName}". Open bets you created will be cancelled and refunded to everyone. Are you sure?`
      : `Leave "${groupName}"? Your open wagers will be refunded.`;

    if (!confirm(warning)) return;

    setError(null);
    setLoading(true);
    try {
      await leaveGroup({ groupId: groupId as any });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't leave group");
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="mb-2 text-sm font-semibold text-rose-600">{error}</p>
        <button onClick={leave} disabled={loading} className="text-sm font-bold text-ink-soft transition hover:text-rose-600">
          {loading ? <Spinner /> : "Try again"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={leave}
      disabled={loading}
      className="text-sm font-bold text-ink-soft transition hover:text-rose-600 disabled:opacity-50"
    >
      {loading ? <Spinner /> : `Leave ${groupName}`}
    </button>
  );
}
