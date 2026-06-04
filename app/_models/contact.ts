import { LeadQualityScore } from "@/_constants/lead/qualityScore";
import {
  QUOTE_STATUSES,
  QuoteStatus,
} from "@/_constants/quote/statuses";
import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { LeadPackExtraParam } from "@/_models/quote";

export type ContactPackAssociation = {
  id: string;
  contactID: string;
  packID: string;
  createdAt: string | null;
  createdBy: string | null;
  status: string;
  extraIDs: string[];
  extraParams: LeadPackExtraParam[];
  packName: string;
  packReference: string;
  spaceID: string;
  spaceName: string;
  venueID: string;
  venueName: string;
};

export class Contact {
  constructor(data: any) {
    Object.assign(this, data);
    this.status = data.status ?? "new";
    this.qualityScore =
      data.qualityScore != null
        ? (data.qualityScore as LeadQualityScore)
        : data.quality_score != null
          ? (data.quality_score as LeadQualityScore)
          : null;
  }

  id!: string;
  created_at!: string;
  user_id!: string;
  name!: string;
  email!: string;
  phone_extension!: number;
  phone_number!: number;
  kind!: string;
  venue_id?: string;
  space_id?: string;
  pack_id?: string;
  venue_name?: string;
  space_name?: string;
  pack_name?: string;
  message!: string;
  status!: QuoteStatus;
  qualityScore!: LeadQualityScore | null;

  get statusWording() {
    return QUOTE_STATUSES.find((s) => s.id === this.status);
  }
}

export const useContacts = () => {
  const fetchApi = useFetch();

  return useQuery<Contact[]>({
    queryKey: ["contact"],
    queryFn: () =>
      fetchApi("contact").then((contacts: any[]) =>
        contacts.map((contact) => new Contact(contact)),
      ),
  });
};

export const useContactPacks = (contactId?: string) => {
  const fetchApi = useFetch();

  return useQuery<ContactPackAssociation[]>({
    queryKey: ["contact-packs", contactId],
    queryFn: () => fetchApi("contact", `${contactId}/packs`),
    enabled: !!contactId,
  });
};

export const useAssociateContactPack = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    ContactPackAssociation,
    unknown,
    {
      contactId: string;
      packID: string;
      extraIDs?: string[];
      extraParams?: LeadPackExtraParam[];
    }
  >({
    mutationFn: ({ contactId, packID, extraIDs, extraParams }) =>
      fetchApi("contact", `${contactId}/packs`, {
        method: "POST",
        body: { packID, extraIDs, extraParams },
      }),
    onSettled: (_data, _err, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ["contact-packs", contactId] });
    },
  });
};

export const useRemoveContactPack = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { contactId: string; packId: string }>({
    mutationFn: ({ contactId, packId }) =>
      fetchApi("contact", `${contactId}/packs/${packId}`, { method: "DELETE" }),
    onSettled: (_data, _err, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ["contact-packs", contactId] });
    },
  });
};

export const useUpdateContactPackStatus = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    ContactPackAssociation,
    unknown,
    {
      contactId: string;
      packId: string;
      status?: "suggested" | "won";
      extraIDs?: string[];
      extraParams?: LeadPackExtraParam[];
    }
  >({
    mutationFn: ({ contactId, packId, status, extraIDs, extraParams }) =>
      fetchApi("contact", `${contactId}/packs/${packId}`, {
        method: "PATCH",
        body: {
          ...(status !== undefined ? { status } : {}),
          ...(extraIDs !== undefined ? { extraIDs } : {}),
          ...(extraParams !== undefined ? { extraParams } : {}),
        },
      }),
    onSettled: (_data, _err, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ["contact-packs", contactId] });
    },
  });
};

export const useUpdateContactLead = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    unknown,
    {
      contactId: string;
      status?: QuoteStatus;
      qualityScore?: LeadQualityScore | null;
    }
  >({
    mutationFn: ({ contactId, status, qualityScore }) =>
      fetchApi("contact", contactId, {
        method: "PATCH",
        body: {
          ...(status !== undefined ? { status } : {}),
          ...(qualityScore !== undefined ? { qualityScore } : {}),
        },
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["contact"] });
    },
  });
};

type CreateContactBody = Partial<
  Pick<
    Contact,
    | "user_id"
    | "name"
    | "email"
    | "phone_extension"
    | "phone_number"
    | "kind"
    | "venue_id"
    | "space_id"
    | "pack_id"
    | "message"
  >
>;

export const useCreateContact = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, CreateContactBody>({
    mutationFn: (body) => fetchApi("contact", "", { method: "POST", body }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["contact"] });
    },
  });
};
