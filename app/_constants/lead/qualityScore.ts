export const LEAD_QUALITY_SCORE_OPTIONS = [
  { id: "", text: "Sem score" },
  { id: "0", text: "0" },
  { id: "1", text: "1" },
  { id: "2", text: "2" },
  { id: "3", text: "3" },
  { id: "4", text: "4" },
  { id: "5", text: "5" },
] as const;

export type LeadQualityScore = 0 | 1 | 2 | 3 | 4 | 5;

export function parseLeadQualityScore(
  value: unknown,
): LeadQualityScore | null | undefined {
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 5) return undefined;
  return n as LeadQualityScore;
}

export function formatLeadQualityScore(score: number | null | undefined): string {
  if (score == null) return "Sem score";
  return String(score);
}
