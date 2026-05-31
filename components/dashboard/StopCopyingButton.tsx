"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  copyId: string;
  userId: string;
  traderName: string;
}

export default function StopCopyingButton({ copyId, userId, traderName }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStop = async () => {
    setLoading(true);
    const supabase = createClient();

    await supabase.rpc("decrement_followers", { p_trader_name: traderName });

    await supabase
      .from("user_copy_trading")
      .update({ is_copying: false })
      .eq("id", copyId)
      .eq("user_id", userId);

    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleStop}
      disabled={loading}
      className="w-full py-2.5 rounded-lg text-sm font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Stopping…" : "Stop copying"}
    </button>
  );
}
