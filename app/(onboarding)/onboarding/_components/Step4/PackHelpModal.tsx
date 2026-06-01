import IconUserInterfaceActionsMoveRight from "@/_design_system/_icons/UserInterface/Actions/MoveRight.svg";
import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import Button from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import Image from "next/image";
import { useState } from "react";

const { block, element } = createBEMClasses("pack-help-modal");

const PackHelpModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label={
          <>
            <span className={element("button__label")}>
              Dúvidas sobre os packs?
            </span>
            <span>Veja como funcionam</span>
          </>
        }
        rightIcon={<IconUserInterfaceNavigationArrowRight />}
        type="link"
        className={element("button")}
        onClick={() => setIsOpen(true)}
      />
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        width="large"
        ariaLabel="Como funcionam os packs"
      >
        <Stack gap="2rem" className={block()}>
          <TextBlock
            title="Como funcionam os packs"
            body="Veja os nossos exemplos de packs para diferentes tipos de espaços"
            style={{ textAlign: "center" }}
          />
          {EXAMPLES.map((example) => (
            <div className={element("example")} key={example.id}>
              <div className={element("example__image")}>
                <Image
                  src={`/pack-examples/${example.id}.webp`}
                  alt={`Imagem de ${example.title}`}
                  fill
                />
              </div>
              <div className={element("example__content")}>
                <h5>{example.title}</h5>
                <p>{example.text}</p>
                <Button
                  href={`https://rinu.pt/space/${example.spaceID}`}
                  target="_blank"
                  label="Ver exemplo"
                  rightIcon={<IconUserInterfaceActionsMoveRight />}
                  type="link"
                />
              </div>
            </div>
          ))}
        </Stack>
      </Modal>
    </>
  );
};

const EXAMPLES = [
  {
    id: "restaurant",
    spaceID: "4a49d7ae-1f55-423a-8797-5ce00bc517ed",
    title: "Restaurante",
    text: "Os packs para restaurante devem especificar inequivocamente o que está incluído, mas sem detalhar mais do que o necessário. Por exemplo, indique que o seu pack inclui prato de carne ou peixe e uma bebida, mas não especifique exatamente qual a carne ou o peixe a menos q queira fazer packs diferentes para carnes ou peixes diferentes.",
  },
  {
    id: "corporate",
    spaceID: "a2daed18-7a3b-4f7e-a46c-523a4bc31203",
    title: "Espaço corporativo",
    text: "No caso dos espaços para eventos corporativos, os packs podem ir desde apenas o aluguer do espaço até ao espaço com vários add-ons como por exemplo águas e snacks, jantar/almoço e até dormida (caso o espaço o permita claro). Nos casos em que o pack inclui refeições, especifique o que incluem, mas com o mesmo nível descrito no exemplo em cima de restaurantes.",
  },
  {
    id: "studio",
    spaceID: "53509cd9-be50-4d17-9e67-3d4b45bb7e04",
    title: "Estúdio",
    text: 'Se o seu espaço fôr um estúdio para dança, yoga ou para shooting então os seus packs podem ir de "aluguer do espaço" até aos add-ons ou até eventos (ex: aula de yoga) que considerar úteis.',
  },
];

export default PackHelpModal;
