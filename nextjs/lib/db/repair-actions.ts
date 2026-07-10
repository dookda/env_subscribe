"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { RepairStatus } from "@prisma/client";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

let _dirReady: Promise<void> | null = null;
function ensureUploadsDir() {
    return (_dirReady ??= fs.mkdir(UPLOADS_DIR, { recursive: true }).then(() => { }));
}

async function saveImage(file: File): Promise<string> {
    await ensureUploadsDir();
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const filename = `${crypto.randomUUID()}${ext}`;
    await fs.writeFile(
        path.join(UPLOADS_DIR, filename),
        Buffer.from(await file.arrayBuffer()),
    );
    return `/api/uploads/${filename}`;
}

export async function createRepairRequest(formData: FormData) {
    const equipmentName = (formData.get("equipmentName") as string | null)?.trim();
    const model = (formData.get("model") as string | null)?.trim() || undefined;
    const reporterName = (formData.get("reporterName") as string | null)?.trim();
    const reporterPhone = (formData.get("reporterPhone") as string | null)?.trim() || undefined;
    const issueNote = (formData.get("issueNote") as string | null)?.trim() || undefined;
    const issueCategories = formData.getAll("issueCategories").map(String).filter(Boolean);

    if (!equipmentName || !reporterName) {
        return { error: "ข้อมูลไม่ครบถ้วน" };
    }

    const imageFiles = formData.getAll("images") as File[];
    const savedImages = await Promise.all(
        imageFiles.filter((f): f is File => f instanceof File && f.size > 0).map(saveImage),
    );

    await prisma.repairRequest.create({
        data: {
            equipmentName,
            model,
            reporterName,
            reporterPhone,
            issueCategories,
            issueNote,
            images: savedImages,
        },
    });

    revalidatePath("/repair");
    return { success: true };
}

// Guarded transitions: the `status` filter makes each update a no-op when the
// request already moved on (e.g. a stale tab), instead of overwriting state.
export async function checkInRepair(id: string) {
    await prisma.repairRequest.updateMany({
        where: { id, status: RepairStatus.PENDING },
        data: {
            status: RepairStatus.IN_REPAIR,
            checkInAt: new Date(),
        },
    });
    revalidatePath(`/repair/${id}`);
    revalidatePath("/repair");
}

export async function checkOutRepair(id: string, techNote?: string) {
    await prisma.repairRequest.updateMany({
        where: { id, status: RepairStatus.IN_REPAIR },
        data: {
            status: RepairStatus.DONE,
            checkOutAt: new Date(),
            ...(techNote?.trim() ? { techNote: techNote.trim() } : {}),
        },
    });
    revalidatePath(`/repair/${id}`);
    revalidatePath("/repair");
}

export async function cancelRepair(id: string) {
    await prisma.repairRequest.updateMany({
        where: { id, status: { in: [RepairStatus.PENDING, RepairStatus.IN_REPAIR] } },
        data: { status: RepairStatus.CANCELLED },
    });
    revalidatePath(`/repair/${id}`);
    revalidatePath("/repair");
}
