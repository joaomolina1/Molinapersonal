import { PackServiceTypeFeature } from "@/_constants/space/serviceTypes";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import InputCheckbox from "@/_design_system/InputCheckbox";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { Space } from "@/_models/space";
import ChipList from "../_shared/ChipList";
import Alert from "@/_design_system/Alert";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";

const ServiceTypeFeatures = ({
  space,
  features = [],
  setFeatures,
  error,
}: {
  space: Space | undefined;
  features?: PackServiceTypeFeature[];
  setFeatures?: (features: PackServiceTypeFeature[]) => void;
  error?: string;
}) => {
  const serviceType = space?.serviceTypeAttribute;

  if (!serviceType) {
    return null;
  }

  const checkedCategoriesWithSpecifics = serviceType.categories.filter(
    (category) => features.includes(category.id) && !!category.specifics.length,
  );

  return (
    <>
      <Stack gap="1rem">
        <TextBlock
          subtitle="O que pode incluir este pack?"
          body="Escolha pelo menos uma categoria que o cliente pode incluir neste pack. As subcategorias não são obrigatórias mas ajudam a definir melhor o seu pack."
        />
        {error && <InputError error={error} />}
        <Alert
          icon={<IconUserInterfaceMiscellaneousTip />}
          title="Dica"
          text="Se estiver a criar, por exemplo, um pack Cocktail, selecione a sub-categoria principal (Cocktail). Não precisa de adicionar Cocktail e Bar, pois normalmente um cocktail já inclui bebidas. Na descrição vai poder detalhar a oferta e nesse campo escreve se inclui ou não bebidas."
        />
        {serviceType.categories.map((category) => (
          <ServiceTypeFeatureCategory
            key={category.id}
            category={category}
            features={features}
            setFeatures={setFeatures}
          />
        ))}
      </Stack>
      {!!checkedCategoriesWithSpecifics.length && (
        <ChipList
          subtitle="Particularidades / Regimes das categorias selecionadas"
          selected={features}
          onChange={setFeatures}
          chipLists={checkedCategoriesWithSpecifics.map((category) => ({
            label: category.label,
            chips: category.specifics,
          }))}
        />
      )}
    </>
  );
};

const ServiceTypeFeatureCategory = ({
  category,
  features,
  setFeatures,
}: {
  category: NonNullable<Space["serviceTypeAttribute"]>["categories"][number];
  features: PackServiceTypeFeature[];
  setFeatures?: (features: PackServiceTypeFeature[]) => void;
}) => {
  const checked = features.includes(category.id);

  return (
    <Stack gap="1rem">
      <InputCheckbox
        checked={checked}
        onChange={(newChecked) => {
          if (newChecked) {
            setFeatures?.([...features, category.id]);
          } else {
            setFeatures?.(
              features.filter(
                (feature) =>
                  feature !== category.id &&
                  !category.subCategories.find(
                    (subCategory) => subCategory.id === feature,
                  ) &&
                  !category.specifics.find(
                    (subCategory) => subCategory.id === feature,
                  ),
              ),
            );
          }
        }}
        label={category.label}
      />
      {checked && (
        <ChipList
          selected={features}
          onChange={setFeatures}
          chipLists={[{ chips: category.subCategories }]}
        />
      )}
    </Stack>
  );
};

export default ServiceTypeFeatures;
