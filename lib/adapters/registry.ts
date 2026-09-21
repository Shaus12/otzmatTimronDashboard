import type { SourceAdapter } from "./types";
import { andromedaAdapter } from "./sources/andromeda";
import { bankLeumiAdapter } from "./sources/bank_leumi";
import { bdiAdapter } from "./sources/bdi";
import { gmailAdapter } from "./sources/gmail";
import { govIlAdapter } from "./sources/gov_il";
import { masavAdapter } from "./sources/masav";
import { officeMailAdapter } from "./sources/office_mail";
import { pazomatAdapter } from "./sources/pazomat";
import { payrollAdapter } from "./sources/payroll";
import { priorityAdapter } from "./sources/priority";
import { rivhitAdapter } from "./sources/rivhit";
import { road6Adapter } from "./sources/road6";
import { taxAuthorityAdapter } from "./sources/tax_authority";
import { timewatchAdapter } from "./sources/timewatch";
import { whatsappAdapter } from "./sources/whatsapp";

const adapters: SourceAdapter[] = [
  gmailAdapter,
  officeMailAdapter,
  whatsappAdapter,
  bankLeumiAdapter,
  rivhitAdapter,
  priorityAdapter,
  taxAuthorityAdapter,
  masavAdapter,
  pazomatAdapter,
  bdiAdapter,
  govIlAdapter,
  road6Adapter,
  timewatchAdapter,
  payrollAdapter,
  andromedaAdapter,
];

/** Canonical adapter id → instance */
const byId = new Map(adapters.map((a) => [a.id, a]));

/**
 * Legacy systems-table / catalog row ids → adapter ids.
 * Prefer `adapter_key` when present.
 */
const SYSTEM_ID_ALIASES: Record<string, string> = {
  gmail: "gmail",
  office: "office_mail",
  office_mail: "office_mail",
  whatsapp: "whatsapp",
  leumi: "bank_leumi",
  bank_leumi: "bank_leumi",
  rivhit: "rivhit",
  priority: "priority",
  tax: "tax_authority",
  tax_authority: "tax_authority",
  masav: "masav",
  pazomat: "pazomat",
  bdi: "bdi",
  gov: "gov_il",
  gov_il: "gov_il",
  road6: "road6",
  timewatch: "timewatch",
  salary: "payroll",
  payroll: "payroll",
  andromeda: "andromeda",
};

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

const SYSTEM_NAME_ALIASES: Record<string, string> = {
  gmail: "gmail",
  "office mail": "office_mail",
  whatsapp: "whatsapp",
  "בנק לאומי": "bank_leumi",
  ריווחית: "rivhit",
  priority: "priority",
  "רשות המסים": "tax_authority",
  'מס"ב': "masav",
  "מס״ב": "masav",
  פזומט: "pazomat",
  bdi: "bdi",
  "האזור האישי הממשלתי": "gov_il",
  "כביש 6": "road6",
  timewatch: "timewatch",
  "שכר עובדים": "payroll",
  אנדרומדה: "andromeda",
};

export type AdapterLookupRef = {
  id: string;
  name?: string | null;
  adapterKey?: string | null;
};

/**
 * Resolve order:
 * 1. systems.adapter_key (stable)
 * 2. legacy row id / slug aliases
 * 3. display name (fallback only)
 */
export function resolveAdapterId(ref: AdapterLookupRef): string | null {
  const key = ref.adapterKey?.trim().toLowerCase();
  if (key && byId.has(key)) return key;

  const id = ref.id.trim().toLowerCase();
  if (SYSTEM_ID_ALIASES[id]) return SYSTEM_ID_ALIASES[id];
  if (byId.has(id)) return id;

  if (ref.name) {
    const byName = SYSTEM_NAME_ALIASES[normalizeName(ref.name)];
    if (byName) return byName;
    for (const adapter of adapters) {
      if (normalizeName(adapter.name) === normalizeName(ref.name)) {
        return adapter.id;
      }
    }
  }

  return null;
}

export function getAdapter(ref: AdapterLookupRef): SourceAdapter | null {
  const adapterId = resolveAdapterId(ref);
  if (!adapterId) return null;
  return byId.get(adapterId) ?? null;
}

/** @deprecated Prefer getAdapter({ id, name, adapterKey }) */
export function getAdapterById(
  systemId: string,
  systemName?: string | null,
): SourceAdapter | null {
  return getAdapter({ id: systemId, name: systemName });
}

export function listAdapters(): SourceAdapter[] {
  return [...adapters];
}

export function getAdapterRegistry(): ReadonlyMap<string, SourceAdapter> {
  return byId;
}
