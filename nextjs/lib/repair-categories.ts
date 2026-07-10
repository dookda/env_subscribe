import type { TKeys } from "@/lib/i18n";

// Single source of truth for repair issue categories: used by the form
// checkboxes, the list page, and the detail page chips.
export const ISSUE_CATEGORIES = [
    { value: "POWER_FAIL", labelKey: "catPower" },
    { value: "SENSOR", labelKey: "catSensor" },
    { value: "DISPLAY", labelKey: "catDisplay" },
    { value: "CONNECTIVITY", labelKey: "catConnect" },
    { value: "OTHER", labelKey: "catOther" },
] as const satisfies readonly { value: string; labelKey: TKeys }[];

export function categoryLabel(value: string, t: Record<TKeys, string>): string {
    const entry = ISSUE_CATEGORIES.find(c => c.value === value);
    return entry ? t[entry.labelKey] : value;
}
