"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { equipmentSchema } from "@/lib/validation/schemas";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Create uploads dir once; cache the promise so concurrent calls don't race.
let _dirReady: Promise<void> | null = null;
function ensureUploadsDir() {
  return (_dirReady ??= fs.mkdir(UPLOADS_DIR, { recursive: true }).then(() => {}));
}

async function saveImage(file: File): Promise<string> {
  await ensureUploadsDir();
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;
  await fs.writeFile(path.join(UPLOADS_DIR, filename), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${filename}`;
}

function deleteImageFile(imageUrl: string) {
  if (!imageUrl.startsWith("/api/uploads/")) return;
  const filename = imageUrl.slice("/api/uploads/".length);
  // Fire-and-forget; ignore missing files.
  fs.unlink(path.join(UPLOADS_DIR, filename)).catch(() => {});
}

function parseFormData(formData: FormData) {
  return {
    equipmentName: formData.get("equipmentName"),
    model:         formData.get("model"),
    customerName:  formData.get("customerName") || undefined,
    location:      formData.get("location")     || undefined,
    inUse:         formData.get("inUse")        || undefined,
    installedAt:   formData.get("installedAt")  || undefined,
    expiredAt:     formData.get("expiredAt")    || undefined,
    latitude:      formData.get("latitude")     || undefined,
    longitude:     formData.get("longitude")    || undefined,
  };
}

export async function createEquipment(formData: FormData) {
  const result = equipmentSchema.safeParse(parseFormData(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const imageFile = formData.get("image") as File | null;
  const image = imageFile && imageFile.size > 0 ? await saveImage(imageFile) : undefined;

  await prisma.equipmentItem.create({
    data: { ...result.data, ...(image ? { image } : {}) },
  });

  revalidatePath("/rent");
  return { success: true };
}

export async function updateEquipment(id: string, formData: FormData) {
  const result = equipmentSchema.safeParse(parseFormData(formData));
  if (!result.success) return { error: result.error.flatten().fieldErrors };

  const imageFile = formData.get("image") as File | null;
  const hasNewImage = !!imageFile && imageFile.size > 0;

  // Fetch old image path and save new image file in parallel.
  const [oldItem, image] = await Promise.all([
    hasNewImage
      ? prisma.equipmentItem.findFirst({ where: { id }, select: { image: true } })
      : Promise.resolve(null),
    hasNewImage ? saveImage(imageFile!) : Promise.resolve(undefined),
  ]);

  try {
    await prisma.equipmentItem.update({
      where: { id },
      data:  { ...result.data, ...(image ? { image } : {}) },
    });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2025")
      return { error: { _form: ["Equipment not found"] } };
    throw e;
  }

  if (oldItem?.image) deleteImageFile(oldItem.image);

  revalidatePath("/rent");
  revalidatePath(`/equipment/${id}`);
  return { success: true };
}

export async function deleteEquipment(id: string) {
  const item = await prisma.equipmentItem.findFirst({
    where:  { id },
    select: { image: true },
  });
  if (!item) return { error: { _form: ["Equipment not found"] } };

  await prisma.equipmentItem.delete({ where: { id } });

  if (item.image) deleteImageFile(item.image);

  revalidatePath("/rent");
  return { success: true };
}
