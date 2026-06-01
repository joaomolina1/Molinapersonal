import { SPACE_CATEGORIES_FLAT } from "@/_constants/space/categories";
import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import { Metadata } from "next";
import Image from "next/image";

const { block, element } = createBEMClasses("about-us");

export const metadata: Metadata = {
  title: "Sobre nós",
  openGraph: {
    title: "Sobre nós",
    images: "/about-us-2.jpeg",
  },
};

export default function AboutUs() {
  return (
    <Stack gap="1rem" className={block()}>
      <div className={element("unir")}>
        <Stack gap="1rem" className={element("unir__content")}>
          <h1>RINU - UNIR ao contrário!</h1>
          <h2>
            Somos a RINU, uma start-up portuguesa que nasceu da vontade de
            revolucionar o mundo dos eventos. A nossa visão é simples:
            transformar a forma como os eventos são criados e vivenciados,
            facilitando a união de pessoas e ideias. Na RINU, UNIR é mais do que
            um conceito, é a nossa missão.
          </h2>
        </Stack>
      </div>
      <div className={element("tech")}>
        <div className={element("tech__content")}>
          <Stack gap="1rem" className={element("tech__text")}>
            <h2>Conectar através da tecnologia</h2>
            <h6>
              Num mundo cada vez mais interligado, somos o facilitador para
              conectar pessoas. Pretendemos oferecer uma rede de espaços, para
              eventos memoráveis.
              <br />
              <br />
              Desde hotéis a quintas, de restaurantes a estúdios, a diversidade
              de locais disponíveis garante que cada evento seja único e
              especial.
              <br />
              <br />
              Aspiramos ser a “booking” dos eventos. Queremos ganhar asas e
              levar os nossos clientes a voar connosco, proporcionando
              experiências únicas e inesquecíveis.
              <br />
              <br />
              Na RINU, cada clique abre a porta para um novo mundo de
              possibilidades.
            </h6>
          </Stack>
          <div className={element("tech__image")}>
            <Image alt="" src="/about-us-1.jpeg" fill />
          </div>
        </div>
      </div>
      <div className={element("spaces")}>
        <Stack gap="1rem" className={element("spaces__content")}>
          <h2>
            Nascemos versáteis e irreverentes com todo o tipo de espaços, sejam
            eles
          </h2>
          <Stack row justifyContent="center" flexWrap="wrap">
            {SPACE_CATEGORIES_FLAT.filter(({ id }) => id !== "conference-room")
              .slice(0, 10)
              .map((category) => (
                <div className={element("spaces__item")} key={category.id}>
                  {category.icon}
                  <span>{category.label}</span>
                </div>
              ))}
          </Stack>
          <h2>Com o objetivo de UNIR as pessoas.</h2>
        </Stack>
      </div>
      <div className={element("all-always")}>
        <div className={element("all-always__content")}>
          <div className={element("all-always__image")}>
            <Image alt="" src="/about-us-2.jpeg" fill />
          </div>
          <Stack gap="1rem" className={element("all-always__text")}>
            <h2>Para Todos, Sempre</h2>
            <h6>
              Acreditamos que todos devem poder sonhar grande. Por isso,
              desenvolvemos uma ferramenta que responde a todo o tipo de
              eventos. Seja um organizador de eventos experiente ou alguém que
              deseja organizar um encontro memorável, a nossa plataforma é o seu
              portal para uma experiência sem complicações.
              <br />
              <br />
              Propomos-nos a romper com o modelo tradicional de eventos. A RINU
              é versátil e está pronta para atrair uma ampla gama de espaços.
              Somos parceiros na rentabilização de locais, ajudando a atrair
              novos clientes e a explorar novos mercados através de simples
              cliques.
            </h6>
          </Stack>
        </div>
      </div>
      <div className={element("unir")}>
        <Stack gap="1rem" className={element("unir__content")}>
          <h1>A RINU é para Unir</h1>
          <h2>
            Porque agora, unir pessoas e ideias, ou melhor, RINU, é apenas uma
            questão de cliques. Junte-se a nós nessa jornada transformadora e
            descubra o poder de criar eventos de maneira simples, eficiente e
            memorável.
          </h2>
        </Stack>
      </div>
    </Stack>
  );
}
