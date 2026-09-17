import Image from "next/image";
import { listVehicles } from "@/db/vehicles";
import { Showroom } from "@/components/showroom";

export const dynamic = "force-dynamic";

export default async function Home() {
  const vehicles = await listVehicles();
  return (
    <main className="min-h-screen bg-[#0b0c0f] text-white">
      <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-white/10 bg-[#0b0c0f]/90 px-5 backdrop-blur-xl md:px-12">
        <a href="#inicio" className="flex items-center gap-3" aria-label="Nowa Veículos">
          <Image src="/stock/logo-nowa.jpg" alt="" width={46} height={46} className="rounded-full" priority />
          <span className="brand-word hidden text-xl font-black tracking-[.13em] sm:block">NOWA <b className="text-[#ff5a2a]">VEÍCULOS</b></span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex"><a href="#estoque">Estoque</a><a href="#servicos">Serviços</a><a href="#contato">Contato</a></nav>
        <a className="rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white hover:text-black" href="https://wa.me/5546999194348?text=Olá%2C%20vim%20pelo%20site%20da%20Nowa%20Veículos." target="_blank" rel="noreferrer">WhatsApp</a>
      </header>

      <section id="inicio" className="relative isolate min-h-[680px] overflow-hidden">
        <Image src="/stock/onix-main.jpg" alt="Chevrolet Onix em destaque" fill priority className="-z-20 object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0b0c0f_5%,rgba(11,12,15,.9)_35%,rgba(11,12,15,.08)_78%),linear-gradient(0deg,#0b0c0f_0%,transparent_48%)]" />
        <div className="mx-auto flex min-h-[680px] max-w-[1500px] items-end px-5 pb-16 md:px-12 md:pb-24"><div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.24em] text-[#ff5a2a]">Capanema · Paraná</p>
          <h1 className="display-title text-[clamp(4.5rem,11vw,9rem)] font-black uppercase leading-[.82] tracking-[-.04em]">Seu próximo<br /><span className="text-outline">carro.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-zinc-300 md:text-lg">Compra, venda, troca e aluguel com veículos selecionados e atendimento direto.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="#estoque" className="rounded-full bg-[#ff5a2a] px-6 py-3.5 font-bold hover:bg-[#ff7145]">Ver veículos</a><a href="https://wa.me/5546999194348?text=Olá%2C%20quero%20avaliar%20meu%20carro%20para%20troca." className="rounded-full border border-white/20 bg-black/30 px-6 py-3.5 font-bold backdrop-blur hover:bg-white hover:text-black" target="_blank" rel="noreferrer">Avaliar meu carro</a></div>
        </div></div>
      </section>

      <Showroom vehicles={vehicles} />

      <section id="servicos" className="mx-auto grid max-w-[1500px] gap-14 px-5 py-24 md:grid-cols-[.8fr_1.2fr] md:px-12 md:py-32">
        <div><p className="text-xs font-bold uppercase tracking-[.24em] text-[#ff5a2a]">Muito além da venda</p><h2 className="display-title mt-4 text-6xl font-black uppercase leading-[.9] md:text-8xl">Negócio simples.<br />Decisão segura.</h2></div>
        <div className="divide-y divide-white/10 border-y border-white/10">{[["01", "Compra e troca", "Avaliamos seu veículo e ajudamos você a chegar na melhor negociação."], ["02", "Aluguel flexível", "Opções por diária, semana ou mês para uso pessoal ou profissional."], ["03", "Financiamento", "Simule as condições e escolha parcelas que façam sentido para você."]].map(([number, title, copy]) => <article key={number} className="grid grid-cols-[52px_1fr] gap-5 py-8"><span className="text-[#ff5a2a]">{number}</span><div><h3 className="font-bold">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">{copy}</p></div></article>)}</div>
      </section>

      <section id="contato" className="mx-4 mb-16 grid min-h-[420px] items-end gap-12 rounded-[28px] bg-[#efefec] p-8 text-[#111216] md:mx-12 md:grid-cols-[1.2fr_.8fr] md:p-20">
        <div><p className="text-xs font-bold uppercase tracking-[.24em] text-[#ff5a2a]">Vamos conversar?</p><h2 className="display-title mt-4 text-6xl font-black uppercase leading-[.9] md:text-8xl">Encontrou o carro<br />certo para você?</h2></div>
        <div className="max-w-md md:justify-self-end"><p className="leading-7 text-zinc-600">Receba mais fotos, simule uma proposta ou agende uma visita.</p><a className="mt-5 flex justify-center rounded-full bg-[#ff5a2a] px-6 py-3.5 font-bold text-white" href="https://wa.me/5546999194348?text=Olá%2C%20vi%20o%20estoque%20no%20site%20e%20quero%20mais%20informações." target="_blank" rel="noreferrer">Chamar no WhatsApp</a></div>
      </section>

      <footer className="flex flex-col items-center justify-between gap-5 border-t border-white/10 px-5 py-10 text-sm text-zinc-500 md:flex-row md:px-12"><span>© {new Date().getFullYear()} Nowa Veículos · Capanema — PR</span><div className="flex gap-6"><a href="https://instagram.com/nowaveiculos" target="_blank" rel="noreferrer">@nowaveiculos</a><a href="/admin" className="hover:text-white">Área administrativa</a></div></footer>
    </main>
  );
}
