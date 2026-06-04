"use client";

import InputSelect from "@/_design_system/InputSelect";
import {
  LEAD_QUALITY_SCORE_OPTIONS,
  LeadQualityScore,
} from "@/_constants/lead/qualityScore";

const LeadQualityScoreSelect = ({
  value,
  onChange,
  disabled,
}: {
  value: LeadQualityScore | null | undefined;
  onChange: (score: LeadQualityScore | null) => void;
  disabled?: boolean;
}) => (
  <InputSelect
    label="Score de qualidade (0–5)"
    value={value == null ? "" : String(value)}
    onChange={(v) => {
      if (!v) {
        onChange(null);
        return;
      }
      const n = Number(v);
      if (n >= 0 && n <= 5) onChange(n as LeadQualityScore);
    }}
    options={[...LEAD_QUALITY_SCORE_OPTIONS]}
    disabled={disabled}
  />
);

export default LeadQualityScoreSelect;
