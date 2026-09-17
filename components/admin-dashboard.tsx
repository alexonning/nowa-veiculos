"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowLeft, BadgeDollarSign, CarFront, CheckCircle2, Edit3, Eye, EyeOff, ImagePlus, LogOut, Plus, Search, Tag, X } from "lucide-react";
import type { VehicleRecord, VehicleStatus } from "@/lib/types";

const money = (cents: number | null) => cents == null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(cents / 100);
const priceInput = (cents: number | null) => cents == null ? "" : (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const statusLabel = { active: "Ativo", inactive: "Inativo", sold: "Vendido" };

export function AdminDashboard({ initialVehicles, userName, signOutPath }: { initialVehicles: VehicleRecord[]; userName: string; signOutPath: string }) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<VehicleRecord | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => vehicles.filter((vehicle) => (status === "all" || vehicle.status === status) && `${vehicle.name} ${vehicle.version} ${vehicle.year}`.toLowerCase().includes(query.toLowerCase())), [vehicles, query, status]);
  const counts = { all: vehicles.length, active: vehicles.filter((v) => v.status === "active").length, promotion: vehicles.filter((v) => v.isPromotion && v.status === "active").length, sold: vehicles.filter((v) => v.status === "sold").length };

  async function refresh(message = "Alterações salvas.") {
    const response = await fetch("/api/admin/vehicles", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Não foi possível atualizar a lista.");
    setVehicles(data.vehicles);
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  async function submit(form: FormData) {
    setSaving(true);
    try {
      const current = editing === "new" ? null : editing;
      const response = await fetch(current ? `/api/admin/vehicles/${current.id}` : "/api/admin/vehicles", { method: current ? "PUT" : "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar.");
      setEditing(null);
      await refresh(current ? "Veículo atualizado." : "Veículo cadastrado.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível salvar."); }
    finally { setSaving(false); }
  }

  async function patch(id: number, changes: Record<string, unknown>, message: string) {
    try {
      const response = await fetch(`/api/admin/vehicles/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(changes) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível alterar.");
      await refresh(message);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível alterar."); }
  }

  return <main className="min-h-screen bg-[#f4f4f2] text-[#15161a]">
    <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-3"><Image src="/stock/logo-nowa.jpg" alt="" width={44} height={44} className="rounded-full" /><div><b className="block leading-tight">Painel Nowa</b><small className="text-zinc-500">Gestão de estoque</small></div></div>
      <div className="flex items-center gap-2"><a href="/" className="hidden items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold sm:flex"><ArrowLeft size={16} /> Ver site</a><a href={signOutPath} className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200" title="Sair"><LogOut size={17} /></a></div>
    </header>

    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm text-zinc-500">Olá, {userName}</p><h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">Gerencie seus veículos</h1></div><button onClick={() => setEditing("new")} className="flex items-center justify-center gap-2 rounded-full bg-[#ff5a2a] px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/20"><Plus size={19} /> Cadastrar veículo</button></div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<CarFront />} label="Cadastrados" value={counts.all} /><Metric icon={<CheckCircle2 />} label="Ativos no site" value={counts.active} /><Metric icon={<Tag />} label="Em promoção" value={counts.promotion} /><Metric icon={<BadgeDollarSign />} label="Vendidos" value={counts.sold} /></div>

      <section className="mt-8 overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 md:flex-row md:items-center md:justify-between md:p-5"><div className="flex gap-2 overflow-x-auto">{[["all", "Todos"], ["active", "Ativos"], ["inactive", "Inativos"], ["sold", "Vendidos"]].map(([value, label]) => <button key={value} onClick={() => setStatus(value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${status === value ? "bg-[#15161a] text-white" : "bg-zinc-100 text-zinc-600"}`}>{label}</button>)}</div><label className="flex h-11 items-center gap-2 rounded-xl border border-zinc-200 px-3 md:w-80"><Search size={17} className="text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar veículo" className="w-full outline-none" /></label></div>
        <div className="divide-y divide-zinc-100">{filtered.map((vehicle) => <VehicleRow key={vehicle.id} vehicle={vehicle} onEdit={() => setEditing(vehicle)} onStatus={(next) => patch(vehicle.id, { status: next }, next === "sold" ? "Veículo marcado como vendido." : next === "inactive" ? "Veículo desativado." : "Veículo ativado.")} onPromotion={() => patch(vehicle.id, { isPromotion: !vehicle.isPromotion, promotionalPrice: vehicle.isPromotion ? null : vehicle.promotionalPrice }, vehicle.isPromotion ? "Promoção removida." : "Veículo marcado para promoção.")} />)}</div>
        {!filtered.length && <div className="p-16 text-center text-zinc-500">Nenhum veículo encontrado.</div>}
      </section>
    </div>
    {notice && <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-[#15161a] px-5 py-3 text-sm font-semibold text-white shadow-xl">{notice}</div>}
    {editing && <VehicleForm vehicle={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSubmit={submit} saving={saving} />}
  </main>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-[#ff5a2a]">{icon}</span><div><strong className="text-2xl">{value}</strong><span className="block text-sm text-zinc-500">{label}</span></div></div>; }

function VehicleRow({ vehicle, onEdit, onStatus, onPromotion }: { vehicle: VehicleRecord; onEdit: () => void; onStatus: (status: VehicleStatus) => void; onPromotion: () => void }) {
  return <article className="grid gap-4 p-4 md:grid-cols-[110px_minmax(180px,1fr)_160px_120px_260px] md:items-center md:p-5">
    <div className="relative aspect-[1.4] overflow-hidden rounded-xl bg-zinc-100"><Image src={vehicle.images[0] || "/stock/logo-nowa.jpg"} alt="" fill className="object-cover" unoptimized={vehicle.images[0]?.startsWith("/api/")} /></div>
    <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{vehicle.name}</h2>{vehicle.isPromotion && <span className="rounded-full bg-orange-100 px-2 py-1 text-[11px] font-bold uppercase text-[#d84617]">Promoção</span>}</div><p className="mt-1 text-sm text-zinc-500">{vehicle.version} · {vehicle.year} · {new Intl.NumberFormat("pt-BR").format(vehicle.mileage)} km</p></div>
    <div><span className="block text-xs text-zinc-400">Valor</span><b>{vehicle.isPromotion && vehicle.promotionalPrice ? money(vehicle.promotionalPrice) : money(vehicle.salePrice)}</b>{vehicle.rentalEnabled && <small className="block text-zinc-500">{money(vehicle.rentalPrice)} / dia</small>}</div>
    <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${vehicle.status === "active" ? "bg-emerald-50 text-emerald-700" : vehicle.status === "sold" ? "bg-blue-50 text-blue-700" : "bg-zinc-100 text-zinc-600"}`}>{statusLabel[vehicle.status]}</span>
    <div className="flex flex-wrap gap-2 md:justify-end"><button onClick={onEdit} className="action"><Edit3 size={15} /> Editar</button><button onClick={onPromotion} className="action"><Tag size={15} /> {vehicle.isPromotion ? "Remover oferta" : "Promoção"}</button>{vehicle.status === "active" ? <><button onClick={() => onStatus("inactive")} className="icon-action" title="Desativar"><EyeOff size={16} /></button><button onClick={() => onStatus("sold")} className="icon-action" title="Marcar como vendido"><CheckCircle2 size={16} /></button></> : <button onClick={() => onStatus("active")} className="action"><Eye size={15} /> Ativar</button>}</div>
  </article>;
}

function VehicleForm({ vehicle, onClose, onSubmit, saving }: { vehicle: VehicleRecord | null; onClose: () => void; onSubmit: (form: FormData) => Promise<void>; saving: boolean }) {
  const [sale, setSale] = useState(vehicle?.saleEnabled ?? true);
  const [rental, setRental] = useState(vehicle?.rentalEnabled ?? false);
  const [promotion, setPromotion] = useState(vehicle?.isPromotion ?? false);
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="h-full w-full max-w-2xl overflow-auto bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur"><div><p className="text-xs font-bold uppercase tracking-wider text-[#ff5a2a]">Estoque</p><h2 className="text-2xl font-black">{vehicle ? "Editar veículo" : "Cadastrar veículo"}</h2></div><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100"><X /></button></div>
    <form action={onSubmit} className="space-y-7 p-5 md:p-7">
      {vehicle?.images.length ? <div><Label>Fotos atuais</Label><div className="mt-2 flex gap-2 overflow-x-auto">{vehicle.images.map((image) => <div key={image} className="relative h-20 w-28 flex-none overflow-hidden rounded-lg bg-zinc-100"><Image src={image} alt="" fill className="object-cover" unoptimized={image.startsWith("/api/")} /></div>)}</div></div> : null}
      <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-7 text-center hover:border-[#ff5a2a]"><ImagePlus className="text-[#ff5a2a]" /><span><b className="block">Adicionar fotos</b><small className="text-zinc-500">Até 8 imagens, máximo de 5 MB cada</small></span><input type="file" name="images" accept="image/*" multiple className="hidden" /></label>
      <fieldset><legend className="text-sm font-bold">Informações principais</legend><div className="mt-3 grid gap-4 sm:grid-cols-2"><Field label="Marca e modelo" name="name" defaultValue={vehicle?.name} required /><Field label="Versão" name="version" defaultValue={vehicle?.version} /><Field label="Ano" name="year" type="number" defaultValue={vehicle?.year ?? new Date().getFullYear()} required /><Field label="Quilometragem" name="mileage" type="number" defaultValue={vehicle?.mileage ?? 0} /><Select label="Categoria" name="category" value={vehicle?.category ?? "hatch"} options={[["hatch", "Hatch"], ["sedan", "Sedan"], ["suv", "SUV"], ["picape", "Picape"]]} /><Select label="Condição" name="condition" value={vehicle?.condition ?? "usado"} options={[["novo", "Novo"], ["usado", "Seminovo"], ["repasse", "Repasse"]]} /><Select label="Câmbio" name="transmission" value={vehicle?.transmission ?? "Manual"} options={[["Manual", "Manual"], ["Automático", "Automático"], ["CVT", "CVT"]]} /><Select label="Combustível" name="fuel" value={vehicle?.fuel ?? "Flex"} options={[["Flex", "Flex"], ["Gasolina", "Gasolina"], ["Diesel", "Diesel"], ["Elétrico", "Elétrico"], ["Híbrido", "Híbrido"]]} /></div></fieldset>
      <fieldset><legend className="text-sm font-bold">Modalidade e valores</legend><div className="mt-3 flex gap-3"><Toggle label="Venda" name="saleEnabled" checked={sale} onChange={setSale} /><Toggle label="Locação" name="rentalEnabled" checked={rental} onChange={setRental} /></div><div className="mt-4 grid gap-4 sm:grid-cols-2">{sale && <Field label="Preço de venda" name="salePrice" defaultValue={priceInput(vehicle?.salePrice ?? null)} placeholder="Ex.: 89.900,00" />}{rental && <Field label="Valor da diária" name="rentalPrice" defaultValue={priceInput(vehicle?.rentalPrice ?? null)} placeholder="Ex.: 189,00" />}</div></fieldset>
      <fieldset><legend className="text-sm font-bold">Promoção</legend><div className="mt-3"><Toggle label="Destacar como promoção" name="isPromotion" checked={promotion} onChange={setPromotion} /></div>{promotion && <div className="mt-4"><Field label="Preço promocional" name="promotionalPrice" defaultValue={priceInput(vehicle?.promotionalPrice ?? null)} placeholder="Ex.: 84.900,00" /></div>}</fieldset>
      <fieldset><legend className="text-sm font-bold">Apresentação</legend><div className="mt-3 space-y-4"><label className="block"><Label>Descrição</Label><textarea name="description" defaultValue={vehicle?.description} rows={4} className="field mt-1 resize-y" placeholder="Descreva o estado e os diferenciais do veículo" /></label><label className="block"><Label>Opcionais</Label><textarea name="features" defaultValue={vehicle?.features.join("\n")} rows={5} className="field mt-1 resize-y" placeholder={"Central multimídia\nCâmera de ré\nBancos em couro"} /><small className="text-zinc-500">Informe um item por linha.</small></label></div></fieldset>
      <label className="block"><Label>Status</Label><select name="status" defaultValue={vehicle?.status ?? "active"} className="field mt-1"><option value="active">Ativo no site</option><option value="inactive">Inativo / oculto</option><option value="sold">Vendido</option></select></label>
      <div className="sticky bottom-0 flex gap-3 border-t border-zinc-200 bg-white py-4"><button type="button" onClick={onClose} className="flex-1 rounded-full border border-zinc-300 px-5 py-3 font-bold">Cancelar</button><button disabled={saving} className="flex-1 rounded-full bg-[#ff5a2a] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Salvando..." : vehicle ? "Salvar alterações" : "Cadastrar veículo"}</button></div>
    </form>
  </div></div>;
}

function Label({ children }: { children: React.ReactNode }) { return <span className="text-sm font-semibold text-zinc-700">{children}</span>; }
function Field({ label, name, type = "text", defaultValue, placeholder, required }: { label: string; name: string; type?: string; defaultValue?: string | number; placeholder?: string; required?: boolean }) { return <label className="block"><Label>{label}</Label><input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} className="field mt-1" /></label>; }
function Select({ label, name, value, options }: { label: string; name: string; value: string; options: string[][] }) { return <label className="block"><Label>{label}</Label><select name={name} defaultValue={value} className="field mt-1">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>; }
function Toggle({ label, name, checked, onChange }: { label: string; name: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${checked ? "border-[#ff5a2a] bg-orange-50" : "border-zinc-200"}`}><input type="checkbox" name={name} value="true" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-[#ff5a2a]" /><b>{label}</b></label>; }
