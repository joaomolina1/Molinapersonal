import Stack from "@/_design_system/Stack";
import IllustrationHelpCustomerStep1 from "@/_design_system/_illustrations/HelpCustomer/Step1.svg";
import IllustrationHelpCustomerStep2 from "@/_design_system/_illustrations/HelpCustomer/Step2.svg";
import IllustrationHelpCustomerStep3 from "@/_design_system/_illustrations/HelpCustomer/Step3.svg";
import IllustrationHelpCustomerStep4 from "@/_design_system/_illustrations/HelpCustomer/Step4.svg";
import { createBEMClasses } from "@/_utils/classname";

const { element } = createBEMClasses("help-customer-page");

const Steps = () => (
  <Stack gap="3.75rem" className={element("steps")}>
    <Stack gap="1rem">
      <h1>Como funciona?</h1>
      <h2>
        Pesquise, registe-se e procure o melhor espaço para o seu evento!
        <br />
        Fácil, simples e em minutos!
      </h2>
      <h6>
        Organizar o seu evento perfeito nunca foi tão fácil. Na RINU, oferecemos
        uma experiência simples e intuitiva para que encontre e reserve o espaço
        ideal para qualquer ocasião. Desde pequenas reuniões a grandes
        celebrações, o nosso processo eficiente garante que tenha tudo o que
        precisa ao seu alcance. Siga os passos e veja como é fácil transformar
        as suas ideias em realidade.
      </h6>
    </Stack>
    <Stack gap="5rem">
      <div className={element("step")}>
        <IllustrationHelpCustomerStep1 />
        <Stack gap="1rem">
          <h3>1. Explore</h3>
          <h5>Descubra espaços incríveis</h5>
          <h6>
            Navegue pela nossa vasta rede de parceiros que inclui hotéis,
            restaurantes, quintas, espaços para eventos, estúdios e muito mais.
            Utilize os nossos filtros avançados para encontrar exatamente o que
            procura, seja para uma festa privada, um evento corporativo, uma
            reunião ou uma sessão fotográfica. Aproveite as ofertas exclusivas
            que maximizam o seu orçamento.
          </h6>
        </Stack>
      </div>
      <div className={element("step")}>
        <IllustrationHelpCustomerStep2 />
        <Stack gap="1rem">
          <h3>2. Sonhe</h3>
          <h5>Planeie cada detalhe</h5>
          <h6>
            Na nossa página de pesquisa, pode personalizar a sua pesquisa
            utilizando filtros de eventos ou de características dos espaços.
            Quer um espaço com um jardim encantador ou uma sala de conferências
            moderna? Temos tudo o que precisa para que o seu evento seja
            exatamente como imaginou.
          </h6>
        </Stack>
      </div>
      <div className={element("step")}>
        <IllustrationHelpCustomerStep3 />
        <Stack gap="1rem">
          <h3>3. Partilhe</h3>
          <h5>Envolva amigos ou colegas</h5>
          <h6>
            Na dúvida sobre o espaço perfeito? Partilhe facilmente as opções com
            familiares, amigos ou colegas. Envie os detalhes por e-mail ou
            através das redes sociais para que todos possam colaborar na escolha
            do local ideal.
          </h6>
        </Stack>
      </div>
      <div className={element("step")}>
        <IllustrationHelpCustomerStep4 />
        <Stack gap="1rem">
          <h3>4. Reserve</h3>
          <h5>Todo o processo em poucos minutos</h5>
          <h6>
            Escolha o espaço, verifique a disponibilidade e reserve de forma
            segura diretamente na nossa plataforma. O processo é simples e
            rápido, garantindo que pode focar-se nos outros detalhes do seu
            evento.
          </h6>
        </Stack>
      </div>
    </Stack>
  </Stack>
);

export default Steps;
