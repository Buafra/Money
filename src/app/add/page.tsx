"use client";
import { useState, useRef } from "react";
import {
  Camera,
  MessageSquare,
  Type,
  Upload,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { ParsedExpense } from "@/types";
import { ConfirmationCard } from "@/components/intake/ConfirmationCard";

type Tab = "receipt" | "sms" | "manual";

export default function AddPage() {
  const [tab, setTab] = useState<Tab>("receipt");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedExpense | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setParsed(null);
    setSaved(false);
    setError("");
    setText("");
    setImagePreview(null);
  };

  const handleImageFile = async (file: File) => {
    setError("");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setLoading(true);
      try {
        const res = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "image", content: base64, mediaType: file.type }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data: ParsedExpense = await res.json();
        setParsed(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse receipt");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTextSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", content: text }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: ParsedExpense = await res.json();
      setParsed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse expense");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (expense: ParsedExpense) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...expense,
        sourceType: tab === "receipt" ? "RECEIPT_IMAGE" : tab === "sms" ? "SMS" : "MANUAL",
        rawInput: tab === "receipt" ? undefined : text,
        needsReview: expense.confidence < 0.7,
      }),
    });
    if (!res.ok) throw new Error("Failed to save");
    setSaved(true);
    setTimeout(reset, 2000);
  };

  const tabs: { id: Tab; icon: typeof Camera; label: string }[] = [
    { id: "receipt", icon: Camera, label: "Receipt" },
    { id: "sms", icon: MessageSquare, label: "SMS / Bank" },
    { id: "manual", icon: Type, label: "Manual" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white">Add Expense</h1>
        <p className="text-emerald-100 text-sm mt-1">
          Family CFO — Personal Finance Tracker
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 mx-4 mt-4 rounded-xl p-1 gap-1">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { setTab(id); reset(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {/* Success State */}
        {saved && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
            <p className="text-xl font-semibold text-slate-800">Expense Saved!</p>
            <p className="text-slate-500 text-sm mt-1">Adding a new expense...</p>
          </div>
        )}

        {/* Confirmation Card */}
        {!saved && parsed && (
          <ConfirmationCard
            parsed={parsed}
            onSave={handleSave}
            onCancel={reset}
            imagePreview={imagePreview}
          />
        )}

        {/* Input area — only show when no parsed result */}
        {!saved && !parsed && (
          <>
            {/* Receipt Tab */}
            {tab === "receipt" && (
              <div className="space-y-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                />

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
                    <p className="text-slate-600 font-medium">Reading receipt...</p>
                    <p className="text-slate-400 text-sm mt-1">AI is extracting expense details</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full h-52 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
                    >
                      <Camera className="h-14 w-14" />
                      <div className="text-center">
                        <p className="font-semibold text-lg">Take Photo</p>
                        <p className="text-sm text-slate-400">or tap to choose from gallery</p>
                      </div>
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-sm text-slate-400">or drop file</span>
                      </div>
                    </div>

                    <label className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">Upload Receipt Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFile(file);
                        }}
                      />
                    </label>
                  </>
                )}
              </div>
            )}

            {/* SMS / Bank Tab */}
            {tab === "sms" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Paste your bank SMS or notification
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={7}
                    placeholder={`Example:\nYour Emirates NBD account XXXX has been debited AED 250.00 at CARREFOUR on 22/06/2026\n\nor:\nAED 45.50 spent at McDonald's on your card ending 1234`}
                    className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  />
                </div>
                <button
                  onClick={handleTextSubmit}
                  disabled={!text.trim() || loading}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    "Extract Expense"
                  )}
                </button>
              </div>
            )}

            {/* Manual Tab */}
            {tab === "manual" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Describe the expense
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    placeholder={`Examples:\n• Paid 120 AED at Starbucks for coffee\n• Grocery 450 AED Carrefour\n• School fee 3,000 AED\n• Fuel 200 AED ADNOC`}
                    className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  />
                </div>
                <button
                  onClick={handleTextSubmit}
                  disabled={!text.trim() || loading}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    "Add Expense"
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
