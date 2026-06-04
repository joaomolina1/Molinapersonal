import { Quote } from "@/_models/quote";
import { Contact } from "@/_models/contact";
import type { AssociatePackLeadContext } from "./AssociatePackModal";

export const buildQuoteLeadPackContext = (quote: Quote): AssociatePackLeadContext => ({
  type: "quote",
  id: quote.id,
  canPrice: !!(
    quote.event_date &&
    quote.start_at &&
    quote.end_at &&
    quote.num_people
  ),
  eventHours:
    quote.start_at && quote.end_at
      ? quote.end_at.number - quote.start_at.number
      : 0,
  eventPax: quote.num_people ?? 0,
});

export const buildContactLeadPackContext = (
  contact: Contact,
): AssociatePackLeadContext => ({
  type: "contact",
  id: contact.id,
  canPrice: false,
  eventHours: 0,
  eventPax: 0,
});
