export const USER_KINDS = [
  {
    id: "individual",
    userRole: "customer",
    label: "Cliente particular",
    description: "Procuro espaços ou serviços para o meu evento",
  },
  {
    id: "company",
    userRole: "customer",
    label: "Cliente empresarial",
    description: "Procuro espaços ou serviços para eventos de empresa",
  },
  {
    id: "vendor",
    userRole: "vendor",
    label: "Fornecedor",
    description: "Tenho espaços ou serviços para publicar",
  },
] as const;

export type UserKind = (typeof USER_KINDS)[number]["id"];
