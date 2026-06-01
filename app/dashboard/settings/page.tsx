import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: kyc }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
    supabase
      .from("kyc_submissions")
      .select("status, created_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <SettingsClient
      profile={profile}
      kyc={kyc}
      userId={user.id}
      email={user.email ?? profile?.email ?? ""}
    />
  );
}
