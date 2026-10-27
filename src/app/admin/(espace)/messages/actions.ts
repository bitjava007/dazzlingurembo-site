"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { dbMessage, errorMessage, failure, success, uuid, type ActionState } from "@/lib/admin/form";

export async function toggleHandled(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const id = uuid(form.get("id"));
    const handled = form.get("handled") === "true";
    const { error } = await supabase.from("contact_messages").update({ handled_at: handled ? new Date().toISOString() : null }).eq("id", id);
    if (error) return failure(dbMessage(error, "toggleHandled"));
    revalidatePath("/admin/messages");
    return success(handled ? "Message marqué comme traité." : "Message remis à traiter.");
  } catch (e) {
    return failure(errorMessage(e, "toggleHandled"));
  }
}

export async function deleteMessage(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  try {
    const { error } = await supabase.from("contact_messages").delete().eq("id", uuid(form.get("id")));
    if (error) return failure(dbMessage(error, "deleteMessage"));
    revalidatePath("/admin/messages");
    return success("Message supprimé.");
  } catch (e) {
    return failure(errorMessage(e, "deleteMessage"));
  }
}
