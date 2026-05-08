"use client";

import { useState, useTransition } from "react";
import { createBottleFeedAction } from "@/app/actions/bottle";
import Icon, { type IconName } from "./Icon";

const ML_PRESETS = [30, 60, 90, 120, 150, 180, 210, 240];

const MILK_TYPES: {
  value: "BREAST_MILK" | "SUPPLEMENT" | "AR";
  label: string;
  short: string;
  icon: IconName;
}[] = [
  { value: "BREAST_MILK", label: "Leite materno", short: "Materno", icon: "drop" },
  { value: "SUPPLEMENT", label: "Suplemento", short: "Suplem.", icon: "bottle" },
  { value: "AR", label: "AR", short: "AR", icon: "sparkle" },
];

const TIME_PRESETS: { label: string; minutes: number }[] = [
  { label: "Agora", minutes: 0 },
  { label: "-15m", minutes: 15 },
  { label: "-30m", minutes: 30 },
  { label: "-1h", minutes: 60 },
  { label: "-2h", minutes: 120 },
];

function toLocalDatetimeInput(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  childId: string;
  childName: string;
}

export default function BottleForm({ childId, childName }: Props) {
  const [amount, setAmount] = useState("");
  const [milk, setMilk] = useState<"BREAST_MILK" | "SUPPLEMENT" | "AR">(
    "BREAST_MILK",
  );
  const [presetMinutes, setPresetMinutes] = useState<number | "manual">(0);
  const [manualDate, setManualDate] = useState(toLocalDatetimeInput(new Date()));
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function bumpAmount(delta: number) {
    const current = parseInt(amount, 10) || 0;
    const next = Math.max(0, Math.min(500, current + delta));
    setAmount(next ? String(next) : "");
  }

  function submit(formData: FormData) {
    setError(null);
    if (!amount || parseInt(amount, 10) <= 0) {
      setError("Indica o volume.");
      return;
    }
    formData.set("childId", childId);
    formData.set("amountMl", amount);
    formData.set("milkType", milk);
    formData.set("notes", notes);
    if (presetMinutes === "manual") {
      formData.set("fedAt", new Date(manualDate).toISOString());
    } else if (presetMinutes === 0) {
      formData.set("fedAt", "");
    } else {
      const d = new Date(Date.now() - presetMinutes * 60_000);
      formData.set("fedAt", d.toISOString());
    }

    startTransition(async () => {
      try {
        await createBottleFeedAction(formData);
        setSaved(true);
        setAmount("");
        setNotes("");
        setPresetMinutes(0);
        setTimeout(() => setSaved(false), 2200);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao guardar.");
      }
    });
  }

  return (
    <form action={submit} className="flex flex-col gap-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)] font-semibold">
        Bebé · <span className="text-[var(--foreground)]">{childName}</span>
      </p>

      {/* Volume */}
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Volume
        </span>
        <div className="flex items-stretch gap-2">
          <button
            type="button"
            onClick={() => bumpAmount(-10)}
            className="btn btn-ghost px-3"
            aria-label="−10 ml"
          >
            <Icon name="dash" size={16} />
          </button>
          <div className="flex-1 relative">
            <input
              type="number"
              min={1}
              max={500}
              required
              inputMode="numeric"
              placeholder="120"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              className="input text-center text-2xl font-bold tabular-nums pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--muted)]">
              ml
            </span>
          </div>
          <button
            type="button"
            onClick={() => bumpAmount(10)}
            className="btn btn-ghost px-3"
            aria-label="+10 ml"
          >
            <Icon name="plus" size={16} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {ML_PRESETS.map((v) => {
            const active = parseInt(amount, 10) === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition tabular-nums ${
                  active
                    ? "bg-[var(--bottle)] text-white border-[var(--bottle)] shadow-sm"
                    : "bg-white/70 text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)] hover:bg-white"
                }`}
              >
                {v} ml
              </button>
            );
          })}
        </div>
      </div>

      {/* Milk type buttons */}
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Tipo de leite
        </span>
        <div className="grid grid-cols-3 gap-2">
          {MILK_TYPES.map((m) => {
            const active = milk === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMilk(m.value)}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-2xl border text-xs font-semibold transition ${
                  active
                    ? "bg-[var(--bottle-soft)] text-[var(--bottle)] border-[var(--bottle)] shadow-sm"
                    : "bg-white/70 text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon name={m.icon} size={18} />
                <span className="hidden sm:block">{m.label}</span>
                <span className="sm:hidden">{m.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* When */}
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Quando
        </span>
        <div className="flex flex-wrap gap-2">
          {TIME_PRESETS.map((p) => {
            const active = presetMinutes === p.minutes;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setPresetMinutes(p.minutes)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition ${
                  active
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                    : "bg-white/70 text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)] hover:bg-white"
                }`}
              >
                {p.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPresetMinutes("manual")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition ${
              presetMinutes === "manual"
                ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                : "bg-white/70 text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)] hover:bg-white"
            }`}
          >
            Outra…
          </button>
        </div>
        {presetMinutes === "manual" ? (
          <input
            type="datetime-local"
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            className="input mt-2"
          />
        ) : null}
      </div>

      {/* Notes */}
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Notas (opcional)
        </span>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ex: dormiu durante"
          className="input resize-none"
        />
      </div>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800 border border-rose-200/60">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-bottle w-full py-3.5 disabled:opacity-60"
      >
        <Icon name="save" size={18} />
        {pending ? "A guardar…" : "Guardar biberão"}
      </button>

      {saved ? (
        <p className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 fade-up">
          <span className="grid place-items-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
            <Icon name="check" size={14} />
          </span>
          Biberão guardado
        </p>
      ) : null}
    </form>
  );
}
