"use server";
// Owner: Viral-W. Server action for the partner portal's live nonprofit check (ProPublica, cached 10 min).
import { verifyLive, type LiveVerification } from "@/components/partner/verification-live";

export async function checkVerification(partnerId: string): Promise<LiveVerification> {
  if (typeof partnerId !== "string" || !/^[a-z0-9-]{1,40}$/.test(partnerId)) {
    throw new Error("Invalid partner id");
  }
  return verifyLive(partnerId);
}
