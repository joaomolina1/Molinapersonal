import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type TestimonialSource = "manual" | "google";

export class Testimonial {
  constructor(data: any) {
    Object.assign(this, data);
  }

  id!: string;
  createdAt!: string;
  updatedAt!: string | null;

  authorName!: string;
  authorDetail!: string | null;
  text!: string;
  rating!: number | null;
  source!: TestimonialSource;
  photoURL!: string | null;
  published!: boolean;
  priority!: number;

  get initials() {
    return this.authorName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  }
}

export const usePublicTestimonials = () => {
  const fetchApi = useFetch();

  return useQuery<Testimonial[]>({
    queryKey: ["testimonials", "public"],
    queryFn: () =>
      fetchApi("public/testimonials").then((testimonials: any[]) =>
        testimonials.map((testimonial) => new Testimonial(testimonial)),
      ),
  });
};

export const useAdminTestimonials = () => {
  const fetchApi = useFetch();

  return useQuery<Testimonial[]>({
    queryKey: ["testimonials", "admin"],
    queryFn: () =>
      fetchApi("testimonials").then((testimonials: any[]) =>
        testimonials.map((testimonial) => new Testimonial(testimonial)),
      ),
  });
};

export type TestimonialBody = {
  authorName: string;
  authorDetail?: string | null;
  text: string;
  rating?: number | null;
  photoURL?: string | null;
  published: boolean;
  priority: number;
};

const useInvalidateTestimonials = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["testimonials"] });
};

export const useCreateTestimonial = () => {
  const fetchApi = useFetch();
  const invalidate = useInvalidateTestimonials();

  return useMutation<Testimonial, unknown, TestimonialBody>({
    mutationFn: (body) =>
      fetchApi("testimonials", "", { method: "POST", body }).then(
        (testimonial) => new Testimonial(testimonial),
      ),
    onSettled: invalidate,
  });
};

export const useUpdateTestimonial = () => {
  const fetchApi = useFetch();
  const invalidate = useInvalidateTestimonials();

  return useMutation<unknown, unknown, { id: string; body: TestimonialBody }>({
    mutationFn: ({ id, body }) =>
      fetchApi("testimonials", id, { method: "PUT", body }),
    onSettled: invalidate,
  });
};

export const useDeleteTestimonial = () => {
  const fetchApi = useFetch();
  const invalidate = useInvalidateTestimonials();

  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: ({ id }) =>
      fetchApi("testimonials", id, { method: "DELETE" }),
    onSettled: invalidate,
  });
};

export type GoogleImportResult = {
  placeName: string;
  imported: number;
  skipped: number;
  total: number;
};

export const useImportGoogleTestimonials = () => {
  const fetchApi = useFetch();
  const invalidate = useInvalidateTestimonials();

  return useMutation<GoogleImportResult, unknown, { input: string }>({
    mutationFn: (body) =>
      fetchApi("testimonials", "import/google", { method: "POST", body }),
    onSettled: invalidate,
  });
};

export type BulkImportResult = {
  imported: number;
  skipped: number;
  total: number;
};

export const useImportBulkTestimonials = () => {
  const fetchApi = useFetch();
  const invalidate = useInvalidateTestimonials();

  return useMutation<BulkImportResult, unknown, { items: unknown[] }>({
    mutationFn: (body) =>
      fetchApi("testimonials", "import/bulk", { method: "POST", body }),
    onSettled: invalidate,
  });
};
