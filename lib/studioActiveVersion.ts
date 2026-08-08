/**
 * Studio / Demo — active history tab ↔ displayed plan ↔ export filename.
 * Shared by Desktop + Mobile, RO / EN / ES.
 */

import { UI_STRINGS } from "@/lib/uiStrings";
import { formatVersionTabTitle, type VersionLocale } from "@/lib/versionStack";

export type ResolvedStudioPlan = {
  versions: Record<string, any>;
  activeVersionId: string;
  /** Plan body for UI + download (matches active tab — not the Firestore wrapper doc). */
  displayResult: Record<string, any>;
};

function stripNestedVersionsMap(plan: Record<string, any>): Record<string, any> {
  if (!plan || typeof plan !== "object") return plan;
  const { versions: _omitVersions, activeVersionId: _omitActive, ...rest } = plan;
  return rest;
}

/**
 * After Firestore / handoff load: pick the active tab's plan body.
 * Restores persisted `activeVersionId` when present and valid.
 */
export function resolveLoadedStudioPlan(raw: Record<string, any> | null | undefined): ResolvedStudioPlan {
  const data = raw && typeof raw === "object" ? { ...(raw as Record<string, any>) } : {};
  const nested = data.versions;

  let versions: Record<string, any>;
  let activeVersionId: string;

  if (
    nested &&
    typeof nested === "object" &&
    !Array.isArray(nested) &&
    Object.keys(nested).length > 0
  ) {
    versions = { ...nested };
    if (!versions.original) {
      const topLevel = stripNestedVersionsMap(data);
      if (topLevel && Object.keys(topLevel).length > 0) {
        versions.original = topLevel;
      }
    }
    const saved =
      typeof data.activeVersionId === "string" && versions[data.activeVersionId]
        ? data.activeVersionId
        : null;
    activeVersionId = saved || (versions.original ? "original" : Object.keys(versions)[0]);
  } else {
    const topLevel = stripNestedVersionsMap(data);
    versions = { original: topLevel && Object.keys(topLevel).length > 0 ? topLevel : data };
    activeVersionId = "original";
  }

  const picked = versions[activeVersionId] || versions.original || data;
  const displayResult = stripNestedVersionsMap(
    picked && typeof picked === "object" ? { ...picked } : data
  );

  return { versions, activeVersionId, displayResult };
}

/** Filename-safe suffix from the active history tab label (empty for original). */
export function buildExportVersionFileSuffix(
  activeVersionId: string | null | undefined,
  plan: any,
  locale: VersionLocale
): string {
  if (!activeVersionId || activeVersionId === "original") return "";

  const ui = UI_STRINGS[locale] || UI_STRINGS.ro;
  const title = formatVersionTabTitle(activeVersionId, plan, locale, ui);

  const cleaned = String(title || activeVersionId)
    // strip emoji / symbols commonly used in tab titles
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[^\p{L}\p{N}\s\-_]+/gu, "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);

  if (cleaned) return `_${cleaned}`;

  const fallback = activeVersionId.replace(/[^\w\-]+/g, "_").slice(0, 40);
  return fallback ? `_${fallback}` : "";
}
