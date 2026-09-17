import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nowa Veículos | Compra, venda, troca e aluguel",
  description: "Estoque de veículos novos, seminovos e para aluguel da Nowa Veículos em Capanema, Paraná.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
