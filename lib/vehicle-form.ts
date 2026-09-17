import type { VehicleInput } from "./types";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const bool = (form: FormData, key: string) => form.get(key) === "true";
const cents = (value: string) => {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) : null;
};

export function parseVehicleForm(form: FormData): VehicleInput {
  const name = text(form, "name");
  const year = Number(text(form, "year"));
  if (!name || !Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 1) {
    throw new Error("Informe um modelo e um ano válidos.");
  }

  const saleEnabled = bool(form, "saleEnabled");
  const rentalEnabled = bool(form, "rentalEnabled");
  if (!saleEnabled && !rentalEnabled) throw new Error("Selecione venda, locação ou ambos.");

  const features = text(form, "features").split(/\n|,/).map((item) => item.trim()).filter(Boolean).slice(0, 20);
  const condition = text(form, "condition");
  const status = text(form, "status");

  return {
    name,
    version: text(form, "version"),
    year,
    mileage: Math.max(0, Number(text(form, "mileage")) || 0),
    transmission: text(form, "transmission") || "Manual",
    fuel: text(form, "fuel") || "Flex",
    category: text(form, "category") || "hatch",
    condition: (["novo", "usado", "repasse"].includes(condition) ? condition : "usado") as VehicleInput["condition"],
    saleEnabled,
    rentalEnabled,
    salePrice: saleEnabled ? cents(text(form, "salePrice")) : null,
    rentalPrice: rentalEnabled ? cents(text(form, "rentalPrice")) : null,
    description: text(form, "description"),
    features,
    status: (["active", "inactive", "sold"].includes(status) ? status : "active") as VehicleInput["status"],
    isPromotion: bool(form, "isPromotion"),
    promotionalPrice: bool(form, "isPromotion") ? cents(text(form, "promotionalPrice")) : null,
  };
}

export function imageFiles(form: FormData) {
  const files = form.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > 8) throw new Error("Envie no máximo 8 fotos por vez.");
  for (const file of files) {
    if (!file.type.startsWith("image/")) throw new Error("Envie apenas arquivos de imagem.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Cada foto deve ter no máximo 5 MB.");
  }
  return files;
}
