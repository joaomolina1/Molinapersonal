"use client";

import { useEffect, useRef, useState } from "react";
import { createDirectFeedAction } from "@/app/actions/feeds";
import Icon, { type IconName } from "./Icon";

type BreastSide = "LEFT" | "RIGHT" | "BOTH" | "UNKNOWN";

interface Props {
  childId: string;
  childName: string;
}

const SIDES: { value: BreastSide; label: string; icon: IconName }[] = [
  { value: "LEFT", label: "Esq", icon: "left" },
  { value: "RIGHT", label: "Dir", icon: "right" },
  { value: "BOTH", label: "Ambos", icon: "both" },
  { value: "UNKNOWN", label: "—", icon: "dash" },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function FeedTimer({ childId, childName }: Props) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [side, setSide] = useState<BreastSide>("UNKNOWN");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const startRef = useRef<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    startRef.current = new Date();
    setElapsed(0);
    setSaved(false);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
    setNotes("");
    setSide("UNKNOWN");
    startRef.current = null;
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  async function save() {
    if (!startRef.current || elapsed === 0) return;
    setPending(true);
    const endAt = new Date();
    const formData = new FormData();
    formData.set("childId", childId);
    formData.set("startAt", startRef.current.toISOString());
    formData.set("endAt", endAt.toISOString());
    formData.set("durationSeconds", elapsed.toString());
    formData.set("breastSide", side);
    formData.set("isManual", "false");
    formData.set("notes", notes);
    await createDirectFeedAction(formData);
    setPending(false);
    setSaved(true);
    setElapsed(0);
    startRef.current = null;
    setNotes("");
    setSide("UNKNOWN");
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)] font-semibold">
        Bebé · <span className="text-[var(--foreground)]">{childName}</span>
      </p>

      {/* Timer dial */}
      <div className="relative">
        <div
          className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-full grid place-items-center ${
            running
              ? "bg-gradient-to-br from-[#fde7ec] via-[#fff] to-[#efeaff] timer-pulse"
              : "bg-gradient-to-br from-[#fef1ee] via-white to-[#fbf6f4]"
          }`}
        >
          <div className="absolute inset-3 rounded-full border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_30px_-12px_rgba(233,78,119,0.3)]" />
          <div className="text-center">
            <p className="font-mono text-5xl sm:text-6xl font-bold tabular-nums text-[var(--primary)] tracking-tight">
              {formatTime(elapsed)}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] font-semibold">
              {running ? "A medir…" : elapsed > 0 ? "Parado" : "Pronto"}
            </p>
          </div>
        </div>
      </div>

      {/* Side selector */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
        {SIDES.map((s) => {
          const active = side === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => setSide(s.value)}
              className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-2xl border text-xs font-semibold transition ${
                active
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                  : "bg-white/70 text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon name={s.icon} size={18} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-3 w-full max-w-sm">
        {!running ? (
          <button
            type="button"
            onClick={start}
            className="btn btn-success flex-1 py-3.5 text-base"
          >
            <Icon name="play" size={18} /> {elapsed > 0 ? "Continuar" : "Iniciar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="btn btn-danger flex-1 py-3.5 text-base"
          >
            <Icon name="stop" size={18} /> Parar
          </button>
        )}
        {elapsed > 0 && !running ? (
          <button
            type="button"
            onClick={reset}
            className="btn btn-ghost"
            aria-label="Reiniciar"
            title="Reiniciar"
          >
            <Icon name="close" size={18} />
          </button>
        ) : null}
      </div>

      {/* Notes + save — only after stopping */}
      {!running && elapsed > 0 && !saved ? (
        <div className="w-full flex flex-col gap-3 max-w-sm fade-up">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas (opcional)"
            rows={2}
            className="input resize-none"
          />
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="btn btn-primary w-full py-3.5 disabled:opacity-60"
          >
            <Icon name="save" size={18} />
            {pending ? "A guardar…" : "Guardar mamada"}
          </button>
        </div>
      ) : null}

      {saved ? (
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 fade-up">
          <span className="grid place-items-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
            <Icon name="check" size={14} />
          </span>
          Mamada guardada
        </p>
      ) : null}
    </div>
  );
}
