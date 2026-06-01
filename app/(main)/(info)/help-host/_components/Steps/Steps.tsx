import Stack from "@/_design_system/Stack";
import IllustrationHelpHostStep1 from "@/_design_system/_illustrations/HelpHost/Step1.svg";
import IllustrationHelpHostStep2 from "@/_design_system/_illustrations/HelpHost/Step2.svg";
import IllustrationHelpHostStep3 from "@/_design_system/_illustrations/HelpHost/Step3.svg";
import IllustrationHelpHostStep4 from "@/_design_system/_illustrations/HelpHost/Step4.svg";
import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("help-host-steps");

const Steps = () => {
  return (
    <Stack gap="3.75rem" className={block()}>
      <Stack gap="1rem">
        <h1>Como funciona?</h1>
        <h2>
          Na RINU, tornar-se um parceiro é simples e rápido. Criámos um processo
          intuitivo para que possa maximizar a rentabilidade do seu espaço sem
          complicações. Veja como é fácil!
        </h2>
      </Stack>
      <div className={element("steps")}>
        {STEPS.map((step, index) => (
          <Stack className={element("step")} key={index} gap="2.5rem">
            {step.icon}
            <Stack gap="1rem">
              <p className={element("step__title")}>
                {index + 1}. {step.title}
              </p>
              <p className={element("step__text")}>{step.text}</p>
            </Stack>
          </Stack>
        ))}
      </div>
    </Stack>
  );
};

export default Steps;

const STEPS = [
  {
    title: "Registe-se na plataforma",
    text: "Crie o seu perfil e adicione os seus espaços em poucos passos.",
    icon: <IllustrationHelpHostStep1 />,
  },
  {
    title: "Defina preços e disponibilidade",
    text: "Tenha controlo total sobre a disponibilidade e tipos de eventos permitidos no seu espaço.",
    icon: <IllustrationHelpHostStep2 />,
  },
  {
    title: "Receba reservas e avaliações",
    text: "Faça a gestão das reservas facilmente e receba feedback valioso dos clientes.",
    icon: <IllustrationHelpHostStep3 />,
  },
  {
    title: "Aceda a estatísticas e insights",
    text: "Utilize dados e insights para melhorar continuamente o seu negócio.",
    icon: <IllustrationHelpHostStep4 />,
  },
];
