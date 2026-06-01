import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export class Contact {
  constructor(data: any) {
    Object.assign(this, data);
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
