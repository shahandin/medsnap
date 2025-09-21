import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ApplyPage() {
  const supabase = await createClient()

  if (!supabase) {
    redirect("/signin")
    return
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
    return
  }

  // Check if user has completed prescreening
  const { data: prescreening } = await supabase
    .from("prescreening_completion")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)

  if (prescreening && prescreening.length > 0) {
    redirect("/application-choice")
  } else {
    redirect("/prescreening")
  }
}
