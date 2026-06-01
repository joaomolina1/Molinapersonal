import Card from "@/_design_system/Card";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { ReactNode } from "react";

export type CheckboxCardListProps<T extends string> = {
  subtitle?: string;
  body?: string;
  selected?: T[];
  onChange?: (selected: T[]) => void;
  cards: readonly {
    id: T;
    icon: ReactNode;
    text: string;
    microcopy: string;
  }[];
};

function CheckboxCardList<T extends string>({
  subtitle,
  body,
  selected = [],
  onChange,
  cards,
}: CheckboxCardListProps<T>) {
  const handleCardClick = (id: T) => {
    if (selected.includes(id)) {
      onChange?.(selected.filter((item) => item !== id));
    } else {
      onChange?.([...selected, id]);
    }
  };

  return (
    <Stack gap="16px" alignItems="flex-start" ariaLabel={subtitle}>
      <TextBlock subtitle={subtitle} body={body} />
      <div className="card-group">
        {cards.map((card) => (
          <Card
            key={card.id}
            type="checkbox"
            checked={selected.includes(card.id)}
            onChange={() => handleCardClick(card.id)}
            size="default"
            icon={card.icon}
            text={card.text}
            microcopy={card.microcopy}
          />
        ))}
      </div>
    </Stack>
  );
}

export default CheckboxCardList;
