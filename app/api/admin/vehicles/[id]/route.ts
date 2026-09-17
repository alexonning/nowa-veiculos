import { NextResponse } from "next/server";
import { addVehicleImages, getVehicle, updateVehicle } from "@/db/vehicles";
import { getAdmin } from "@/lib/admin-auth";
import { imageFiles, parseVehicleForm } from "@/lib/vehicle-form";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const id = Number((await context.params).id);
    if (!Number.isInteger(id) || !(await getVehicle(id))) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
    const form = await request.formData();
    await updateVehicle(id, parseVehicleForm(form));
    const files = imageFiles(form);
    if (files.length) await addVehicleImages(id, files);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível salvar." }, { status: 400 });
  }
}

export async function PATCH(request: Request, context: Context) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const id = Number((await context.params).id);
  const body = await request.json() as { status?: string; isPromotion?: boolean; promotionalPrice?: number | null };
  if (!Number.isInteger(id) || !(await getVehicle(id))) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  const changes: Record<string, unknown> = {};
  if (body.status && ["active", "inactive", "sold"].includes(body.status)) changes.status = body.status;
  if (typeof body.isPromotion === "boolean") changes.isPromotion = body.isPromotion;
  if (body.promotionalPrice === null || typeof body.promotionalPrice === "number") changes.promotionalPrice = body.promotionalPrice;
  await updateVehicle(id, changes);
  return NextResponse.json({ ok: true });
}
