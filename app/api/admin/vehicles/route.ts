import { NextResponse } from "next/server";
import { addVehicleImages, createVehicle, listVehicles } from "@/db/vehicles";
import { getAdmin } from "@/lib/admin-auth";
import { imageFiles, parseVehicleForm } from "@/lib/vehicle-form";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  return NextResponse.json({ vehicles: await listVehicles(true) });
}

export async function POST(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const form = await request.formData();
    const input = parseVehicleForm(form);
    const files = imageFiles(form);
    const id = await createVehicle(input);
    if (!id) throw new Error("Não foi possível cadastrar o veículo.");
    if (files.length) await addVehicleImages(id, files);
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível cadastrar." }, { status: 400 });
  }
}
