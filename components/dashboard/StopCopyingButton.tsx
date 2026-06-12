"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, StopCircle } from "lucide-react";

interface Props {
  copyId: string;
  userId: string;
  traderName: string;
}

export default function StopCopyingButton({ copyId, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStop = async () => {
    setLoading(true);
    const supabase = createClient();
    // Follower count is decremented server-side by the sync_trader_followers trigger.
    await supabase.from("user_copy_trading").update({ is_copying: false }).eq("id", copyId).eq("user_id", userId);
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleStop}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 active:bg-red-500/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" strokeWidth={1.5} />}
      {loading ? "Stopping…" : "Stop Copying"}
    </button>
  );
}
