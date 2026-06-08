import { LeadQualityScore } from "@/_constants/lead/qualityScore";
import { QuoteStatus } from "@/_constants/quote/statuses";
import { Contact } from "@/_models/contact";
import { Quote } from "@/_models/quote";

export type BoardLead =
  | { kind: "quote"; data: Quote }
  | { kind: "contact"; data: Contact };

export type BoardLeadDrag = {
  kind: "quote" | "contact";
  id: string;
  fromStatus: QuoteStatus;
};

export type BoardLeadSummary = {
  kind: BoardLead["kind"];
  id: string;
  status: QuoteStatus;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  qualityScore: LeadQualityScore | null;
  subtitle: string;
};

export const boardLeadSummary = (lead: BoardLead): BoardLeadSummary => {
  if (lead.kind === "quote") {
    const q = lead.data;
    const datePart = q.event_date?.toString() ?? "";
    const timePart =
      q.start_at && q.end_at
        ? `${q.start_at.timeLabel} – ${q.end_at.timeLabel}`
        : "";
    return {
      kind: "quote",
      id: q.id,
      status: q.status,
      createdAt: q.created_at,
      name: q.name || "—",
      phone:
        q.phone_extension && q.phone_number
          ? `+${q.phone_extension}${q.phone_number}`
          : "—",
      email: q.email || "—",
      qualityScore: q.qualityScore,
      subtitle: [
        datePart,
        timePart,
        q.num_people ? `${q.num_people} pax` : "",
        q.company_name || "",
      ]
        .filter(Boolean)
        .join(" · "),
    };
  }

  const c = lead.data;
  return {
    kind: "contact",
    id: c.id,
    status: c.status,
    createdAt: c.created_at,
    name: c.name || "—",
    phone:
      c.phone_extension && c.phone_number
        ? `+${c.phone_extension}${c.phone_number}`
        : "—",
    email: c.email || "—",
    qualityScore: c.qualityScore,
    subtitle: c.message
      ? c.message.length > 60
        ? `${c.message.slice(0, 60)}…`
        : c.message
      : "—",
  };
};
