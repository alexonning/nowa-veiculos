import Image from "next/image";
import { listVehicles } from "@/db/vehicles";
import { requireAdmin } from "@/lib/admin-auth";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdmin("/admin");
  if (!user) return <main className="grid min-h-screen place-items-center bg-[#0b0c0f] p-6 text-white"><div className="max-w-md text-center"><Image src="/stock/logo-nowa.jpg" alt="Nowa Veículos" width={76} height={76} className="mx-auto rounded-full" /><p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-[#ff5a2a]">Acesso restrito</p><h1 className="mt-3 text-3xl font-black">Esta conta não possui acesso administrativo.</h1><p className="mt-3 text-zinc-400">Entre com a conta autorizada do proprietário da Nowa Veículos.</p><a href={chatGPTSignOutPath("/admin")} className="mt-7 inline-flex rounded-full bg-[#ff5a2a] px-6 py-3 font-bold">Trocar de conta</a></div></main>;
  const vehicles = await listVehicles(true);
  return <AdminDashboard initialVehicles={vehicles} userName={user.fullName ?? user.email} signOutPath={chatGPTSignOutPath("/")} />;
}
