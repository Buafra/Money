"use client";
import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { ParsedExpense, CATEGORIES, PERSONS, CATEGORY_LABELS, PERSON_LABELS } from "@/types";
import { format } from "date-fns";

interface Props {
  parsed: ParsedExpense;
  onSave: (expense: ParsedExpense) => Promise<void>;
  onCancel: () => void;
  imagePreview?: string | null;
}

export function ConfirmationCard({ parsed, onSave, onCancel, imagePreview }: Props) {
  const [expense, setExpense] = useState<ParsedExpense>(parsed);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const update = (field: keyof ParsedExpense, value: unknown) => {
    setExpense((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await onSave(expense);
    } catch {
      setSaveError("Failed to save. Please try again.");
      setSaving(false);
    }
  };

  const confidenceColor =
    expense.confidence >= 0.85
      ? "bg-emerald-100 text-emerald-700"
      : expense.confidence >= 0.7
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="space-y-4">
      {/* Image preview */}
      {imagePreview && (
        <div className="rounded-xl overflow-hidden border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Receipt"
            className="w-full max-h-48 object-cover"
          />
        </div>
      )}

      {/* Confidence badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Review & Confirm</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${confidenceColor}`}>
          {Math.round(expense.confidence * 100)}% confident
        </span>
      </div>

      {expense.confidence < 0.7 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700">Low confidence — please review all fields carefully.</p>
        </div>
      )}

      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
        {/* Merchant */}
        <Field label="Merchant">
          <input
            value={expense.merchant}
            onChange={(e) => update("merchant", e.target.value)}
            className="input-field"
            placeholder="Merchant name"
          />
        </Field>

        {/* Amount + Currency */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {expense.currency}
              </span>
              <input
                type="number"
                value={expense.amount}
                onChange={(e) => update("amount", parseFloat(e.target.value) || 0)}
                className="input-field pl-14"
                step="0.01"
                min="0"
              />
            </div>
          </Field>
          <Field label="Currency">
            <select
              value={expense.currency}
              onChange={(e) => update("currency", e.target.value)}
              className="input-field"
            >
              {["AED", "USD", "EUR", "GBP", "SAR", "KWD"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Date */}
        <Field label="Date">
          <input
            type="date"
            value={expense.date}
            onChange={(e) => update("date", e.target.value)}
            className="input-field"
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <select
            value={expense.category}
            onChange={(e) => update("category", e.target.value)}
            className="input-field"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </Field>

        {/* Person */}
        <Field label="Spent by">
          <div className="grid grid-cols-2 gap-2">
            {PERSONS.filter((p) => p !== "NEEDS_ATTRIBUTION").map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => update("person", p)}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  expense.person === p
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-400"
                }`}
              >
                {PERSON_LABELS[p]}
              </button>
            ))}
          </div>
        </Field>

        {/* Description */}
        <Field label="Note (optional)">
          <input
            value={expense.description || ""}
            onChange={(e) => update("description", e.target.value)}
            className="input-field"
            placeholder="Add a note..."
          />
        </Field>

        {/* Items if any */}
        {expense.items && expense.items.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Items</p>
            <div className="space-y-1">
              {expense.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-slate-600 py-0.5">
                  <span>{item.name}</span>
                  <span className="font-medium">{expense.currency} {item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {saveError && (
        <p className="text-sm text-red-600 text-center">{saveError}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-4 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-[2] bg-emerald-600 text-white py-4 rounded-xl font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
          ) : (
            <><CheckCircle2 className="h-5 w-5" /> Save Expense</>
          )}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
