import { getChatGPTUser, requireChatGPTUser } from "@/app/chatgpt-auth";

const ADMIN_EMAILS = new Set(["abattialex1999@gmail.com"]);

export async function requireAdmin(returnTo = "/admin") {
  const user = await requireChatGPTUser(returnTo);
  if (!ADMIN_EMAILS.has(user.email.toLowerCase())) return null;
  return user;
}

export async function getAdmin() {
  const user = await getChatGPTUser();
  if (!user || !ADMIN_EMAILS.has(user.email.toLowerCase())) return null;
  return user;
}
