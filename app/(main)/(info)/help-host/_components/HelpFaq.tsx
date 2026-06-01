"use client";

import HelpFaqCta from "@/_components/HelpFaqCta";
import { TextButton } from "@/_design_system/Button";
import { createBEMClasses } from "@/_utils/classname";
import BecomeHostButton from "./BecomeHostButton";
import Script from "next/script";
import ScheduleDemoButton from "./ScheduleDemoButton";

const { element } = createBEMClasses("help-host-page");

const HelpFaq = () => {
  return (
    <>
      <div className={element("faq-cta")}>
        <div className={element("faq-cta__content")}>
          <HelpFaqCta
            faqs={[
              {
                question: "Como posso registar o meu espaço na RINU?",
                answer: (
                  <>
                    Registar um espaço na RINU é muito simples. Serão 4 os
                    passos necessários:
                    <br />
                    <br />
                    <ol>
                      <li>
                        Comece por registar-se em{" "}
                        <TextButton
                          href="?action=register&source=become-host"
                          text="rinu.pt"
                          prefetch={false}
                        />
                        .
                      </li>
                      <li>
                        Descreva o seu local (Hotel, Restaurante, Quinta, Espaço
                        para Eventos, entre outros…).
                      </li>
                      <li>
                        Defina o espaço que quer rentabilizar, porque num local
                        pode ter mais do que um espaço.
                      </li>
                      <li>
                        E por fim defina a oferta que quer ter no seu espaço
                        (aluguer, aluguer com serviços, etc…).
                      </li>
                    </ol>
                    <br />
                    Pode adicionar quantos locais, espaços e packs quiser.
                  </>
                ),
              },
              {
                question: "Quais são as taxas associadas ao uso da RINU?",
                answer: (
                  <>
                    A inscrição e utilização das potencialidades da ferramenta
                    são gratuitas, o modelo de negócio está assente numa
                    comissão retida pela RINU por cada evento no seu espaço
                    reservado através da nossa plataforma. Esta comissão pode
                    variar consoante os programas escolhidos, mas nunca será
                    superior a 15%.
                  </>
                ),
              },
              {
                question:
                  "Posso escolher os tipos de eventos que quero receber no meu espaço?",
                answer: (
                  <>
                    Sim. Durante o processo de inscrição, você poderá definir
                    quais os tipos de eventos que quer receber no seu espaço,
                    sendo uma das formas de segmentar o seu cliente.
                  </>
                ),
              },
              {
                question: "Como funciona o sistema de avaliações?",
                answer: (
                  <>
                    Depois do evento acontecer, o cliente terá a oportunidade de
                    escrever um comentário da sua experiência. As avaliações
                    poderão influenciar o seu rating e consequente logaritmo na
                    plataforma RINU. Maior satisfação, maior visibilidade.
                  </>
                ),
              },
            ]}
            cta={{
              text: "Comece por criar o seu registo na RINU ou agende uma demonstração para falar connosco e esclarecer dúvidas",
              actions: [
                <BecomeHostButton key={1} />,
                <ScheduleDemoButton key={2} />,
              ],
            }}
          />
        </div>
      </div>
      <Script src="https://tally.so/widgets/embed.js" />
    </>
  );
};

export default HelpFaq;
