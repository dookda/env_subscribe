"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createRepairRequest } from "@/lib/db/repair-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/LangProvider";
import { ISSUE_CATEGORIES } from "@/lib/repair-categories";

export default function RepairForm() {
    const { t } = useLang();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [equipmentName, setEquipmentName] = useState("");
    const [model, setModel] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [issueNote, setIssueNote] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [reporterName, setReporterName] = useState("");
    const [reporterPhone, setReporterPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fileRef = useRef<HTMLInputElement>(null);

    function toggleCategory(val: string) {
        setCategories(prev =>
            prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val],
        );
    }

    function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setImages(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        e.target.value = "";
    }

    function removeImage(i: number) {
        URL.revokeObjectURL(previews[i]);
        setImages(prev => prev.filter((_, idx) => idx !== i));
        setPreviews(prev => prev.filter((_, idx) => idx !== i));
    }

    async function handleSubmit() {
        if (!reporterName.trim()) {
            setError(`${t.repairName} ${t.fieldRequired}`);
            return;
        }
        setLoading(true);
        setError("");

        try {
            const fd = new FormData();
            fd.append("equipmentName", equipmentName.trim());
            if (model.trim()) fd.append("model", model.trim());
            fd.append("reporterName", reporterName.trim());
            if (reporterPhone.trim()) fd.append("reporterPhone", reporterPhone.trim());
            categories.forEach(c => fd.append("issueCategories", c));
            if (issueNote.trim()) fd.append("issueNote", issueNote.trim());
            images.forEach(img => fd.append("images", img));

            const result = await createRepairRequest(fd);

            if (result?.error) {
                setError(typeof result.error === "string" ? result.error : t.genericError);
                return;
            }

            router.push("/repair");
            router.refresh();
        } catch {
            setError(t.genericError);
        } finally {
            setLoading(false);
        }
    }

    // ─── Step indicator ────────────────────────────────────────────────────────
    const STEPS = [t.stepEquip, t.stepIssue, t.stepReporter];

    return (
        <div className="rounded-2xl border border-border bg-surface">
            {/* Step indicator */}
            <div className="flex border-b border-border">
                {STEPS.map((label, i) => {
                    const n = i + 1;
                    const active = step === n;
                    const done = step > n;
                    return (
                        <div
                            key={n}
                            className={cn(
                                "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors",
                                active ? "text-brand border-b-2 border-brand"
                                    : done ? "text-success" : "text-text-muted",
                            )}
                        >
                            <span className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                active ? "bg-brand text-white"
                                    : done ? "bg-success text-white" : "bg-surface-sunken text-text-muted",
                            )}>
                                {done ? <Icon name="check" size={14} /> : n}
                            </span>
                            {label}
                        </div>
                    );
                })}
            </div>

            <div className="p-4">
                {/* ─── Step 1: Equipment brought in for repair ──────────────────── */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-text-primary">
                                {t.repairEquipName} <span className="text-danger">*</span>
                            </label>
                            <Input
                                placeholder={t.repairEquipName}
                                value={equipmentName}
                                onChange={e => setEquipmentName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-text-primary">
                                {t.fieldModel}
                            </label>
                            <Input
                                placeholder={t.fieldModel}
                                value={model}
                                onChange={e => setModel(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full"
                            disabled={!equipmentName.trim()}
                            onClick={() => setStep(2)}
                        >
                            {t.repairNext}
                        </Button>
                    </div>
                )}

                {/* ─── Step 2: Issue + images ───────────────────────────────────── */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <p className="mb-2 text-sm font-medium text-text-primary">{t.repairIssue}</p>
                            <div className="grid grid-cols-2 gap-2">
                                {ISSUE_CATEGORIES.map(({ value, labelKey }) => {
                                    const checked = categories.includes(value);
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => toggleCategory(value)}
                                            className={cn(
                                                "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                                                checked
                                                    ? "border-brand bg-brand/5 text-brand"
                                                    : "border-border text-text-secondary hover:border-brand/40",
                                            )}
                                        >
                                            <div className={cn(
                                                "h-4 w-4 rounded border-2 flex items-center justify-center shrink-0",
                                                checked ? "bg-brand border-brand" : "border-text-muted",
                                            )}>
                                                {checked && <Icon name="check" size={11} className="text-white" />}
                                            </div>
                                            {t[labelKey]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-text-primary">{t.repairNote}</p>
                            <textarea
                                className="w-full rounded-input border border-border bg-surface-sunken px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                                placeholder={t.repairNotePlaceholder}
                                rows={3}
                                value={issueNote}
                                onChange={e => setIssueNote(e.target.value)}
                            />
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-text-primary">{t.repairImages}</p>
                            {previews.length > 0 && (
                                <div className="mb-2 grid grid-cols-3 gap-2">
                                    {previews.map((src, i) => (
                                        <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-surface-sunken">
                                            <Image src={src} alt={`preview-${i}`} fill className="object-cover" unoptimized />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                                            >
                                                <Icon name="close" size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full border border-dashed border-border text-text-muted hover:border-brand hover:text-brand"
                                onClick={() => fileRef.current?.click()}
                            >
                                <Icon name="add_photo_alternate" size={18} className="mr-1" />
                                {t.addPhoto}
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>
                                {t.repairBack}
                            </Button>
                            <Button className="flex-1" onClick={() => setStep(3)}>
                                {t.repairNext}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Reporter info ────────────────────────────────────── */}
                {step === 3 && (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-sunken px-3 py-2.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-text-muted">
                                <Icon name="sensors" size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-text-primary">{equipmentName}</p>
                                {model && <p className="truncate text-xs text-text-muted">{model}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-text-primary">
                                {t.repairName} <span className="text-danger">*</span>
                            </label>
                            <Input
                                placeholder={t.repairName}
                                value={reporterName}
                                onChange={e => setReporterName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-text-primary">
                                {t.repairPhone}
                            </label>
                            <Input
                                type="tel"
                                placeholder="08x-xxx-xxxx"
                                value={reporterPhone}
                                onChange={e => setReporterPhone(e.target.value)}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-danger">{error}</p>
                        )}

                        <div className="flex gap-2">
                            <Button variant="ghost" className="flex-1" onClick={() => setStep(2)}>
                                {t.repairBack}
                            </Button>
                            <Button
                                className="flex-1"
                                disabled={loading}
                                onClick={handleSubmit}
                            >
                                {loading ? t.submitting : t.repairSubmit}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
