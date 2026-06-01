"use client";

import { useQuoteRequestContext } from "@/(main)/_components/QuoteRequest";
import HelpFaqCta from "@/_components/HelpFaqCta";
import Button from "@/_design_system/Button";
import IconUserInterfaceActionsSearch from "@/_design_system/_icons/UserInterface/Actions/Search.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";

const { element } = createBEMClasses("help-customer-page");

const HelpFaq = () => {
  const isMobile = useMediaQuery("large");
  const { setQuoteRequestModalData } = useQuoteRequestContext();

  return (
    <div className={element("faq-cta")}>
      <div className={element("faq-cta__content")}>
        <HelpFaqCta
          faqs={[
            {
              question:
                "Como posso encontrar o espaço perfeito para o meu evento?",
              answer: (
                <>
                  O RINU é um Marketplace onde você dá asas à sua imaginação.
                  Através do motor de pesquisa na home page, será redirecionado
                  para a página de filtros, onde poderá customizar, através de
                  filtros, os serviços ou as características de espaço que quer
                  para o seu evento. Nessa mesma página serão sugeridos espaços
                  que correspondam às suas expectativas.
                  <br />
                  <br />
                  Escolhendo o espaço e o pack mais adequado, será reencaminhado
                  para um checkout onde fará o pagamento para tornar a reserva
                  real. Nesse momento enviaremos a confirmação da reserva com
                  todas as informações por email.
                  <br />A ideia é sermos um simplificador para que você consiga
                  reservar o espaço que sempre sonhou, à distância de cliques,
                  para o dia e hora que idealizou.
                </>
              ),
            },
            {
              question: "É seguro pagar através da RINU?",
              answer: (
                <>
                  Pagar através da RINU é seguro, pois trabalhamos com a STRIPE,
                  uma instituição global presente em mais de 46 países e em
                  milhões de empresas.
                </>
              ),
            },
            {
              question: "Posso modificar ou cancelar uma reserva?",
              answer: (
                <>
                  A RINU traz flexibilidade. Consoante a política definida, é
                  possível cancelar, modificar ou alterar a reserva. Antes de
                  efetuar a reserva será informado qual a política de
                  cancelamento com o que o parceiro/espaço trabalha. Esta
                  política de cancelamento, pode variar consoante o espaço
                  escolhido, que pode ir de 12h a 60 dias.
                </>
              ),
            },
            {
              question: "O que faço se o espaço que quero está lotado?",
              answer: (
                <>
                  Se o espaço selecionado estiver indisponível, a RINU irá
                  pedir-lhe que ajuste a sua pesquisa. Para os parceiros que têm
                  mais do que um espaço, no final da página iremos sugerir
                  espaços diferentes do mesmo parceiro.
                  <br />
                  Estamos a trabalhar diariamente para que o leque de oferta
                  aumente de forma a irmos de encontro às expectativas dos
                  nossos clientes.
                </>
              ),
            },
          ]}
          cta={{
            text: "Somos especialistas em eventos. Pesquise locais ou faça-nos um pedido e os nossos experts entram em contacto!",
            actions: [
              <Button
                type="primary"
                leftIcon={<IconUserInterfaceActionsSearch />}
                label="Pesquisar locais"
                href="/search"
                key={1}
              />,
              <Button
                type="secondary"
                label="Fazer um pedido"
                key={2}
                onClick={() => {
                  if (!isMobile) {
                    setQuoteRequestModalData({
                      isOpen: true,
                      context: { type: "quote-request" },
                    });
                  }
                }}
                href={isMobile ? "/quote-request" : undefined}
              />,
            ],
          }}
        />
      </div>
    </div>
  );
};

export default HelpFaq;
