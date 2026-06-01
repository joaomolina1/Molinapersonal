import { SPACE_CATEGORIES, SpaceCategory } from "@/_constants/space/categories";
import ChipList from "../_shared/ChipList";

const Categories = ({
  categories = [],
  setCategories,
  error,
}: {
  categories?: SpaceCategory[];
  setCategories?: (categories: SpaceCategory[]) => void;
  error?: string;
}) => {
  return (
    <ChipList
      label="Escolha até 3 categorias que melhor definem o seu espaço."
      selected={categories}
      onChange={setCategories}
      limit={3}
      chipLists={SPACE_CATEGORIES}
      error={error}
    />
  );
};

export default Categories;
