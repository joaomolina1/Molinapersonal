import { useShowToast } from "@/_design_system/Toast";

export const useTallyFormModal = (id: string, fields?: Record<string, any>) => {
  const showToast = useShowToast();

  const openForm = () => {
    if (window.Tally) {
      window.Tally.openPopup(id, {
        layout: "modal",
        width: 680,
        autoClose: 0,
        onSubmit: () => {
          showToast({ text: "Formulário enviado com sucesso" });
        },
        hiddenFields: fields,
      });
    }
  };

  return openForm;
};
