"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { parseImportFile } from "@/lib/imports/parse-file";
import { applyColumnMapping, suggestMapping } from "@/lib/imports/apply-mapping";
import {
  SUGGESTED_SOURCES,
  TARGET_FIELDS,
  TARGET_TABLE_LABELS,
  type ColumnMapping,
  type ImportBatch,
  type ImportMappingTemplate,
  type ImportTargetField,
  type ImportTargetTable,
  type MappedImportRow,
  type ParsedSheet,
} from "@/lib/imports/types";
import type { Expense } from "@/lib/data/types";
import {
  confirmFileImportAction,
  saveImportTemplateAction,
} from "@/app/(dashboard)/imports/actions";
import { formatDate } from "@/lib/labels";

type Step = "mapping" | "preview";

const ALLOWED_TARGETS: ImportTargetTable[] = [
  "expenses",
  "fines",
  "invoices",
];

export function ImportsWorkspace({
  templates,
  batches,
  expenses,
  allowedTargets,
}: {
  templates: ImportMappingTemplate[];
  batches: ImportBatch[];
  expenses: Expense[];
  allowedTargets: ImportTargetTable[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("mapping");

  const [targetTable, setTargetTable] = useState<ImportTargetTable>(
    allowedTargets[0] ?? "expenses",
  );
  const [sourceName, setSourceName] = useState("");
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [saveTemplate, setSaveTemplate] = useState(true);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  const targets = allowedTargets.length ? allowedTargets : ALLOWED_TARGETS;

  const mappedRows: MappedImportRow[] = useMemo(() => {
    if (!sheet) return [];
    return applyColumnMapping(
      sheet,
      targetTable,
      mapping,
      targetTable === "expenses" ? expenses : [],
    );
  }, [sheet, targetTable, mapping, expenses]);

  const validRows = useMemo(
    () => mappedRows.filter((r) => r.errors.length === 0),
    [mappedRows],
  );
  const dupCount = mappedRows.filter((r) => r.isDuplicate).length;
  const selectedCount = validRows.filter((r) => selected[r.rowIndex]).length;

  // When entering preview, default-check all valid rows.
  useEffect(() => {
    if (step !== "preview") return;
    const next: Record<number, boolean> = {};
    for (const r of mappedRows) {
      next[r.rowIndex] = r.errors.length === 0;
    }
    setSelected(next);
  }, [step, mappedRows]);

  const resetToUpload = () => {
    setSheet(null);
    setMapping({});
    setSelected({});
    setStep("mapping");
  };

  const onFile = async (file: File | null) => {
    setError(null);
    setInfo(null);
    setStep("mapping");
    setSelected({});
    if (!file) return;
    try {
      const parsed = await parseImportFile(file);
      if (!parsed.headers.length) {
        setError("לא נמצאו עמודות בקובץ");
        return;
      }
      setSheet(parsed);

      const template = templates.find(
        (t) =>
          t.sourceName === sourceName.trim() && t.targetTable === targetTable,
      );
      if (template) {
        const next: ColumnMapping = {};
        for (const h of parsed.headers) {
          next[h] = template.columnMapping[h] ?? "";
        }
        for (const [src, field] of Object.entries(template.columnMapping)) {
          if (field && parsed.headers.includes(src)) next[src] = field;
        }
        setMapping(next);
        setInfo(`נטענה תבנית מיפוי ל«${template.sourceName}»`);
      } else {
        setMapping(suggestMapping(parsed.headers, targetTable));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "פענוח הקובץ נכשל");
      setSheet(null);
    }
  };

  const applyTemplateByName = (name: string) => {
    setSourceName(name);
    if (!sheet || step !== "mapping") return;
    const template = templates.find(
      (t) => t.sourceName === name && t.targetTable === targetTable,
    );
    if (!template) {
      setMapping(suggestMapping(sheet.headers, targetTable));
      return;
    }
    const next: ColumnMapping = {};
    for (const h of sheet.headers) {
      next[h] = template.columnMapping[h] ?? "";
    }
    setMapping(next);
    setInfo(`נטענה תבנית מיפוי ל«${name}»`);
  };

  const setFieldMapping = (header: string, field: ImportTargetField | "") => {
    setMapping((prev) => {
      const next = { ...prev, [header]: field };
      if (field) {
        for (const [h, f] of Object.entries(next)) {
          if (h !== header && f === field) next[h] = "";
        }
      }
      return next;
    });
  };

  const onSaveTemplateOnly = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveImportTemplateAction({
        sourceName,
        targetTable,
        columnMapping: mapping,
      });
      if (result.error) setError(result.error);
      else {
        setInfo("התבנית נשמרה");
        router.refresh();
      }
    });
  };

  const goToPreview = () => {
    setError(null);
    setInfo(null);
    if (!sheet) {
      setError("יש להעלות קובץ תחילה");
      return;
    }
    if (!sourceName.trim()) {
      setError("יש להזין שם מקור");
      return;
    }
    if (!validRows.length) {
      setError("אין שורות תקינות לתצוגה מקדימה — בדקו את המיפוי");
      return;
    }
    setStep("preview");
  };

  const toggleRow = (rowIndex: number, enabled: boolean) => {
    if (!enabled) return;
    setSelected((prev) => ({ ...prev, [rowIndex]: !prev[rowIndex] }));
  };

  const toggleAllValid = (on: boolean) => {
    const next: Record<number, boolean> = { ...selected };
    for (const r of validRows) next[r.rowIndex] = on;
    setSelected(next);
  };

  const onImport = () => {
    setError(null);
    setInfo(null);
    if (!sheet) {
      setError("יש להעלות קובץ תחילה");
      return;
    }
    const rows = mappedRows.filter(
      (r) => r.errors.length === 0 && selected[r.rowIndex],
    );
    if (!rows.length) {
      setError("בחרו לפחות שורה אחת לייבוא");
      return;
    }
    startTransition(async () => {
      const result = await confirmFileImportAction({
        sourceName,
        targetTable,
        fileName: sheet.fileName,
        columnMapping: mapping,
        saveTemplate,
        rows,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setInfo(
        `יובאו ${result.imported} רשומות` +
          (result.skipped ? ` · ${result.skipped} דולגו` : ""),
      );
      resetToUpload();
      router.refresh();
    });
  };

  const fields = TARGET_FIELDS[targetTable];

  return (
    <div className="imports-layout">
      <section className="timewatch-summary">
        <h2>העלאת קובץ</h2>
        <p>
          שלב 1: מיפוי עמודות · שלב 2: תצוגה מקדימה עם בחירה · ייבוא לסטטוס
          «דורש בדיקה».
        </p>

        <div className="imports-controls">
          <label>
            טבלת יעד
            <select
              value={targetTable}
              disabled={step === "preview"}
              onChange={(e) => {
                const next = e.target.value as ImportTargetTable;
                setTargetTable(next);
                if (sheet) setMapping(suggestMapping(sheet.headers, next));
              }}
            >
              {targets.map((t) => (
                <option key={t} value={t}>
                  {TARGET_TABLE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>

          <label>
            שם מקור (תבנית)
            <input
              list="import-source-suggestions"
              value={sourceName}
              disabled={step === "preview"}
              onChange={(e) => setSourceName(e.target.value)}
              onBlur={() => {
                if (sourceName.trim()) applyTemplateByName(sourceName.trim());
              }}
              placeholder="לדוגמה: בנק לאומי"
            />
            <datalist id="import-source-suggestions">
              {[
                ...SUGGESTED_SOURCES,
                ...templates.map((t) => t.sourceName),
              ]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((s) => (
                  <option key={s} value={s} />
                ))}
            </datalist>
          </label>

          <label>
            קובץ
            <input
              type="file"
              disabled={step === "preview"}
              accept=".csv,.tsv,.xlsx,.xls,.xlsm,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {templates.length && step === "mapping" ? (
          <p className="imports-hint">
            תבניות שמורות:{" "}
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                className="text-button"
                onClick={() => {
                  setSourceName(t.sourceName);
                  setTargetTable(t.targetTable);
                  if (sheet) {
                    const next: ColumnMapping = {};
                    for (const h of sheet.headers) {
                      next[h] = t.columnMapping[h] ?? "";
                    }
                    setMapping(next);
                  }
                }}
              >
                {t.sourceName} ({TARGET_TABLE_LABELS[t.targetTable]})
              </button>
            ))}
          </p>
        ) : null}

        {error ? <p className="form-error">{error}</p> : null}
        {info ? <p className="adapter-status-message">{info}</p> : null}
      </section>

      {sheet && step === "mapping" ? (
        <section className="timewatch-summary">
          <h2>שלב 1 · מיפוי עמודות · {sheet.fileName}</h2>
          <p>
            {sheet.rows.length} שורות בקובץ · {validRows.length} תקינות לפי
            המיפוי הנוכחי
            {dupCount ? ` · ${dupCount} יסומנו כחשודות ככפילות` : ""}
          </p>
          <div className="records-table-wrap">
            <table className="records-table">
              <thead>
                <tr>
                  <th>עמודת מקור</th>
                  <th>שדה יעד</th>
                  <th>דוגמה</th>
                </tr>
              </thead>
              <tbody>
                {sheet.headers.map((h) => (
                  <tr key={h}>
                    <td dir="auto">{h}</td>
                    <td>
                      <select
                        value={mapping[h] ?? ""}
                        onChange={(e) =>
                          setFieldMapping(
                            h,
                            e.target.value as ImportTargetField | "",
                          )
                        }
                      >
                        <option value="">— דלג —</option>
                        {fields.map((f) => (
                          <option key={f.field} value={f.field}>
                            {f.label}
                            {f.required ? " *" : ""}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td dir="auto">{sheet.rows[0]?.[h] ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="form-actions">
            <label className="imports-check">
              <input
                type="checkbox"
                checked={saveTemplate}
                onChange={(e) => setSaveTemplate(e.target.checked)}
              />
              שמור מיפוי כתבנית למקור זה
            </label>
            <Button
              type="button"
              variant="outline"
              disabled={pending || !sourceName.trim()}
              onClick={onSaveTemplateOnly}
            >
              שמור תבנית בלבד
            </Button>
            <Button
              type="button"
              className="primary-action"
              disabled={pending || validRows.length === 0 || !sourceName.trim()}
              onClick={goToPreview}
            >
              המשך לתצוגה מקדימה ({validRows.length})
            </Button>
          </div>
        </section>
      ) : null}

      {sheet && step === "preview" ? (
        <section className="timewatch-summary">
          <h2>שלב 2 · תצוגה מקדימה לפני ייבוא</h2>
          <p>
            סמנו שורות לייבוא. כפילויות מסומנות אך לא חוסמות. רק השורות
            המסומנות ייובאו.
            {dupCount ? ` · ${dupCount} חשודות ככפילות` : ""}
          </p>

          <div className="form-actions" style={{ marginBottom: 12 }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("mapping")}
              disabled={pending}
            >
              ← חזרה למיפוי
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => toggleAllValid(true)}
              disabled={pending}
            >
              בחר הכל
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => toggleAllValid(false)}
              disabled={pending}
            >
              נקה בחירה
            </Button>
            <Button
              type="button"
              className="primary-action"
              disabled={pending || selectedCount === 0}
              onClick={onImport}
            >
              {pending ? "מייבא…" : `ייבא נבחרים (${selectedCount})`}
            </Button>
          </div>

          <div className="records-table-wrap">
            <table className="records-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      aria-label="בחר הכל"
                      checked={
                        validRows.length > 0 &&
                        validRows.every((r) => selected[r.rowIndex])
                      }
                      onChange={(e) => toggleAllValid(e.target.checked)}
                    />
                  </th>
                  <th>#</th>
                  <th>תאריך</th>
                  <th>סכום</th>
                  {targetTable === "expenses" ? <th>ספק</th> : null}
                  {targetTable === "expenses" ? <th>קטגוריה</th> : null}
                  {targetTable === "fines" ? <th>כותרת</th> : null}
                  {targetTable === "invoices" ? <th>לקוח</th> : null}
                  <th>תיאור</th>
                  <th>הערות</th>
                </tr>
              </thead>
              <tbody>
                {mappedRows.map((r) => {
                  const canSelect = r.errors.length === 0;
                  return (
                    <tr
                      key={r.rowIndex}
                      className={
                        r.isDuplicate || r.errors.length
                          ? "row-flagged"
                          : undefined
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          disabled={!canSelect}
                          checked={Boolean(selected[r.rowIndex])}
                          onChange={() => toggleRow(r.rowIndex, canSelect)}
                          aria-label={`בחירת שורה ${r.rowIndex + 1}`}
                        />
                      </td>
                      <td>{r.rowIndex + 1}</td>
                      <td>{r.date ?? "—"}</td>
                      <td>
                        {r.amount != null
                          ? r.amount.toLocaleString("he-IL")
                          : "—"}
                      </td>
                      {targetTable === "expenses" ? (
                        <td dir="auto">{r.vendor || "—"}</td>
                      ) : null}
                      {targetTable === "expenses" ? (
                        <td>{r.category ?? "other"}</td>
                      ) : null}
                      {targetTable === "fines" ? (
                        <td dir="auto">{r.title || "—"}</td>
                      ) : null}
                      {targetTable === "invoices" ? (
                        <td dir="auto">{r.clientName || "—"}</td>
                      ) : null}
                      <td dir="auto">{r.description || "—"}</td>
                      <td>
                        {r.errors.length ? (
                          <span className="link-state missing">
                            {r.errors.join(" · ")}
                          </span>
                        ) : r.duplicateNote ? (
                          <span className="status-badge">{r.duplicateNote}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="timewatch-summary">
        <h2>היסטוריית ייבוא</h2>
        {batches.length === 0 ? (
          <p>עדיין אין ייבואים שמורים.</p>
        ) : (
          <div className="records-table-wrap">
            <table className="records-table">
              <thead>
                <tr>
                  <th>קובץ</th>
                  <th>מקור</th>
                  <th>יעד</th>
                  <th>שורות</th>
                  <th>תאריך</th>
                  <th>ייבא</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td dir="auto">{b.fileName || "—"}</td>
                    <td dir="auto">{b.sourceName}</td>
                    <td>{TARGET_TABLE_LABELS[b.targetTable]}</td>
                    <td>{b.rowCount}</td>
                    <td>{formatDate(b.createdAt.slice(0, 10))}</td>
                    <td>
                      {b.importerName ??
                        (b.sourceName === "gmail-auto-sync"
                          ? "מערכת"
                          : "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
