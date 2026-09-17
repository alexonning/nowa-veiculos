import { env } from "cloudflare:workers";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "./index";
import { vehicleImages, vehicles } from "./schema";
import type { VehicleInput, VehicleRecord } from "@/lib/types";

const seedVehicles: Array<VehicleInput & { images: string[] }> = [
  { name: "Chevrolet Onix", version: "Premier 2 Turbo Automático", year: 2023, mileage: 18900, transmission: "Automático", fuel: "Flex", category: "hatch", condition: "usado", saleEnabled: true, rentalEnabled: false, salePrice: 9290000, rentalPrice: null, description: "Versão topo de linha, muito conservada, com lataria sem repintura e pneus novos.", features: ["Central multimídia", "Câmera de ré", "Chave presencial", "Bancos em couro"], status: "active", isPromotion: true, promotionalPrice: 8990000, images: ["/stock/onix-main.jpg", "/stock/onix-front.jpg", "/stock/onix-wheel.jpg"] },
  { name: "Chevrolet Cruze HB", version: "1.4 Turbo LT", year: 2017, mileage: 89000, transmission: "Automático", fuel: "Flex", category: "hatch", condition: "usado", saleEnabled: true, rentalEnabled: false, salePrice: 7690000, rentalPrice: null, description: "Hatch turbo confortável e completo, com ótimo acabamento e histórico de manutenção.", features: ["Motor turbo", "Piloto automático", "Multimídia", "Controle de estabilidade"], status: "active", isPromotion: false, promotionalPrice: null, images: ["/stock/cruze.jpg"] },
  { name: "Chevrolet Onix", version: "LTZ 1.4 Automático", year: 2018, mileage: 72400, transmission: "Automático", fuel: "Flex", category: "hatch", condition: "usado", saleEnabled: true, rentalEnabled: true, salePrice: 6690000, rentalPrice: 16900, description: "Uma opção prática, econômica e completa para cidade ou estrada.", features: ["Direção elétrica", "Ar-condicionado", "MyLink", "Vidros elétricos"], status: "active", isPromotion: false, promotionalPrice: null, images: ["/stock/polo.jpg"] },
  { name: "Fiat Strada", version: "Freedom Cabine Dupla", year: 2022, mileage: 48000, transmission: "Manual", fuel: "Flex", category: "picape", condition: "usado", saleEnabled: true, rentalEnabled: true, salePrice: 9790000, rentalPrice: 23900, description: "Picape versátil para trabalho e lazer, com cabine dupla e excelente espaço de caçamba.", features: ["Cabine dupla", "Controle de tração", "Capota marítima", "Central multimídia"], status: "active", isPromotion: false, promotionalPrice: null, images: ["/stock/tracker.jpg"] },
  { name: "Fiat Strada", version: "1.4 Hard Working", year: 2020, mileage: 91500, transmission: "Manual", fuel: "Flex", category: "picape", condition: "repasse", saleEnabled: true, rentalEnabled: false, salePrice: 5990000, rentalPrice: null, description: "Veículo de repasse para quem procura robustez e bom custo-benefício no trabalho.", features: ["Direção hidráulica", "Ar-condicionado", "Protetor de caçamba", "Revisada"], status: "active", isPromotion: false, promotionalPrice: null, images: ["/stock/strada.jpg"] },
  { name: "Honda HR-V", version: "EXL 1.8 CVT", year: 2016, mileage: 104000, transmission: "Automático", fuel: "Flex", category: "suv", condition: "usado", saleEnabled: true, rentalEnabled: false, salePrice: 8590000, rentalPrice: null, description: "SUV completo, espaçoso e reconhecido pela confiabilidade mecânica e conforto.", features: ["Bancos em couro", "Câmera de ré", "Ar digital", "Controle de estabilidade"], status: "active", isPromotion: false, promotionalPrice: null, images: ["/stock/hrv.jpg"] },
  { name: "Volkswagen T-Cross", version: "TSI Automático", year: 2025, mileage: 4800, transmission: "Automático", fuel: "Flex", category: "suv", condition: "novo", saleEnabled: true, rentalEnabled: true, salePrice: 11990000, rentalPrice: 28900, description: "SUV praticamente novo, com baixa quilometragem, desempenho turbo e tecnologia atual.", features: ["Motor TSI", "Painel digital", "Multimídia", "6 airbags"], status: "active", isPromotion: true, promotionalPrice: 11690000, images: ["/stock/tcross.jpg"] },
  { name: "Volkswagen Fox", version: "1.6 Plus", year: 2008, mileage: 158000, transmission: "Manual", fuel: "Flex", category: "hatch", condition: "repasse", saleEnabled: true, rentalEnabled: false, salePrice: 3590000, rentalPrice: null, description: "Veículo compacto, econômico e com manutenção acessível. Opção de repasse.", features: ["Ar-condicionado", "Direção hidráulica", "Vidros elétricos", "Som"], status: "active", isPromotion: false, promotionalPrice: null, images: ["/stock/fox.jpg"] },
  { name: "Volkswagen Fox", version: "Prime 1.6", year: 2013, mileage: 119000, transmission: "Manual", fuel: "Flex", category: "hatch", condition: "usado", saleEnabled: true, rentalEnabled: true, salePrice: 4990000, rentalPrice: 13900, description: "Versão completa, bem cuidada e ideal para quem busca praticidade no dia a dia.", features: ["Ar-condicionado", "Direção hidráulica", "Rodas de liga", "Computador de bordo"], status: "active", isPromotion: false, promotionalPrice: null, images: ["/stock/fox-prime.jpg"] },
  { name: "Ford EcoSport", version: "Freestyle 1.6", year: 2014, mileage: 128000, transmission: "Manual", fuel: "Flex", category: "suv", condition: "usado", saleEnabled: true, rentalEnabled: true, salePrice: 6290000, rentalPrice: 17900, description: "SUV compacto com posição elevada de dirigir e bom espaço interno para a família.", features: ["Controle de estabilidade", "Assistente de partida", "Multimídia", "Sensor de estacionamento"], status: "active", isPromotion: false, promotionalPrice: null, images: ["/stock/ecosport.jpg"] },
];

function imageSrc(row: typeof vehicleImages.$inferSelect) {
  return row.imageUrl ?? (row.objectKey ? `/api/images/${encodeURIComponent(row.objectKey)}` : "");
}

function toRecord(row: typeof vehicles.$inferSelect, images: string[]): VehicleRecord {
  return {
    ...row,
    condition: row.condition as VehicleRecord["condition"],
    status: row.status as VehicleRecord["status"],
    features: JSON.parse(row.features || "[]"),
    images,
  };
}

export async function ensureSeedVehicles() {
  const db = getDb();
  const existing = await db.select({ id: vehicles.id }).from(vehicles).limit(1);
  if (existing.length) return;
  for (const item of seedVehicles) {
    const { images, ...vehicle } = item;
    const inserted = await db.insert(vehicles).values({ ...vehicle, features: JSON.stringify(vehicle.features) }).returning({ id: vehicles.id });
    if (inserted[0]) {
      await db.insert(vehicleImages).values(images.map((imageUrl, sortOrder) => ({ vehicleId: inserted[0].id, imageUrl, sortOrder })));
    }
  }
}

export async function listVehicles(includeInactive = false): Promise<VehicleRecord[]> {
  await ensureSeedVehicles();
  const db = getDb();
  const rows = includeInactive
    ? await db.select().from(vehicles).orderBy(desc(vehicles.createdAt))
    : await db.select().from(vehicles).where(inArray(vehicles.status, ["active", "sold"])).orderBy(desc(vehicles.isPromotion), desc(vehicles.createdAt));
  const ids = rows.map((row) => row.id);
  const imageRows = ids.length ? await db.select().from(vehicleImages).where(inArray(vehicleImages.vehicleId, ids)).orderBy(asc(vehicleImages.sortOrder)) : [];
  return rows.map((row) => toRecord(row, imageRows.filter((image) => image.vehicleId === row.id).map(imageSrc).filter(Boolean)));
}

export async function getVehicle(id: number) {
  const db = getDb();
  const rows = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  if (!rows[0]) return null;
  const images = await db.select().from(vehicleImages).where(eq(vehicleImages.vehicleId, id)).orderBy(asc(vehicleImages.sortOrder));
  return toRecord(rows[0], images.map(imageSrc).filter(Boolean));
}

export async function createVehicle(input: VehicleInput) {
  const db = getDb();
  const result = await db.insert(vehicles).values({ ...input, features: JSON.stringify(input.features) }).returning({ id: vehicles.id });
  return result[0]?.id;
}

export async function updateVehicle(id: number, input: Partial<VehicleInput>) {
  const db = getDb();
  await db.update(vehicles).set({ ...input, ...(input.features ? { features: JSON.stringify(input.features) } : {}), updatedAt: new Date().toISOString() }).where(eq(vehicles.id, id));
}

export async function addVehicleImages(vehicleId: number, files: File[]) {
  if (!env.BUCKET) throw new Error("O armazenamento de imagens está indisponível.");
  const db = getDb();
  const existing = await db.select().from(vehicleImages).where(eq(vehicleImages.vehicleId, vehicleId));
  const start = existing.length;
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const key = `vehicles/${vehicleId}/${crypto.randomUUID()}.${extension}`;
    await env.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || "image/jpeg" } });
    await db.insert(vehicleImages).values({ vehicleId, objectKey: key, sortOrder: start + index });
  }
}

export async function deleteVehicleImage(vehicleId: number, imageId: number) {
  const db = getDb();
  const rows = await db.select().from(vehicleImages).where(eq(vehicleImages.id, imageId)).limit(1);
  const image = rows[0];
  if (!image || image.vehicleId !== vehicleId) return false;
  if (image.objectKey && env.BUCKET) await env.BUCKET.delete(image.objectKey);
  await db.delete(vehicleImages).where(eq(vehicleImages.id, imageId));
  return true;
}
