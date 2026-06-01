"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useLocalStorage } from "../localStorage";
import Modal from "@/_design_system/Modal";
import { createBEMClasses } from "@/_utils/classname";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import Button, { StylelessButton, TextButton } from "@/_design_system/Button";
import IllustrationCookies from "@/_design_system/_illustrations/Cookies.svg";
import IconUserInterfaceNavigationArrowUp from "@/_design_system/_icons/UserInterface/Navigation/ArrowUp.svg";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import { useMediaQuery } from "@/_utils/mediaQuery";
import ToggleButton from "@/_design_system/ToggleButton";

type Cookies = { analytics: boolean };

const CookiesContext = createContext<{
  cookies: Cookies | null | undefined;
  setCookies: (cookies: Cookies) => void;
}>({
  cookies: undefined,
  setCookies: () => {},
});

export const CookiesProvider = ({ children }: { children: ReactNode }) => {
  const { value: cookies, setValue: setCookies } =
    useLocalStorage<Cookies>("cookies");

  return (
    <CookiesContext value={{ cookies, setCookies }}>
      <CookiesBanner />
      {children}
    </CookiesContext>
  );
};

export const useCookies = () => useContext(CookiesContext);

const { block: mainBlock, element: mainElement } =
  createBEMClasses("cookies-main");

const { block: settingsBlock, element: settingsElement } =
  createBEMClasses("cookies-settings");

const CookiesBanner = () => {
  const isMobile = useMediaQuery("large");

  const { cookies, setCookies } = useCookies();
  const [showSettings, setShowSettings] = useState(false);

  const [analytics, setAnalytics] = useState(false);

  if (!!cookies || cookies === undefined) {
    return null;
  }

  if (showSettings) {
    return (
      <Modal
        isOpen={showSettings}
        ariaLabel="Definições de cookies"
        showCloseButton={false}
        width="large"
      >
        <Stack gap="2rem" className={settingsBlock()}>
          <Stack gap="1rem">
            <h2 className={settingsElement("title")}>
              Configuração das Cookies
            </h2>
            <p className={settingsElement("text")}>
              Utilizamos cookies e tecnologias semelhantes para personalizar
              conteúdos e proporcionar uma melhor experiência. Ao clicar em OK,
              concorda com isto e com a nossa Política de Cookies. Para alterar
              as preferências ou retirar o consentimento, atualize as suas
              Preferências de Cookies.
            </p>
          </Stack>
          <Stack gap="1rem">
            <CookiesElement
              title="Cookies estritamente necessários"
              content="Estes cookies são necessários para o funcionamento do site e não podem ser desativados nos nossos sistemas. Normalmente, são definidos apenas em resposta a ações que realizou que resultam num pedido de serviços, como definir as suas preferências de privacidade, iniciar sessão ou preencher formulários. Pode configurar o seu navegador para bloquear ou alertar sobre estes cookies, mas algumas partes do site podem não funcionar como resultado."
              selected
              disabled
            />
            <CookiesElement
              title="Cookies de desempenho e análise"
              content="Estes cookies permitem-nos contar visitas e fontes de tráfego, para que possamos medir e melhorar o desempenho do nosso site. Ajudam-nos a saber quais as páginas mais e menos populares e a ver como os visitantes se movem pelo site. Se não permitir estes cookies, a informação proveniente deles não será utilizada para ajudar no desempenho do site."
              selected={analytics}
              setSelected={setAnalytics}
            />
          </Stack>
          <div className={settingsElement("actions")}>
            {!isMobile && (
              <Button
                type="primary"
                label="Aceitar todos"
                onClick={() => setCookies({ analytics: true })}
              />
            )}
            <Button
              type={isMobile ? "primary" : "link"}
              label="Guardar preferências"
              onClick={() => setCookies({ analytics })}
            />
          </div>
        </Stack>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={!showSettings}
      ariaLabel="Definições de cookies"
      showCloseButton={false}
      stickToBottom
    >
      <div className={mainBlock()}>
        <IllustrationCookies />
        <Stack gap="2rem">
          <TextBlock
            subtitle="Valorizamos a sua privacidade"
            body={
              <>
                Para lhe oferecer uma experiência mais personalizada, nós (e os
                terceiros com quem trabalhamos) recolhemos informações sobre
                como e quando utiliza a RINU. Isto ajuda-nos a memorizar os seus
                detalhes, mostrar anúncios relevantes e melhorar os nossos
                serviços. Mais informações na nossa{" "}
                <TextButton
                  target="_blank"
                  href="/cookies.pdf"
                  text="Política de Cookies"
                  className={mainElement("link")}
                  prefetch={false}
                />
                .
                <br />
                <br />
                Selecione &quot;Aceitar Cookies&quot; para permitir todos os
                cookies ou escolha &quot;Definições de Cookies&quot; para
                personalizar as suas configurações e desativar todos ou alguns
                cookies não essenciais
              </>
            }
          />
          <div className={mainElement("actions")}>
            <Button
              type="primary"
              label="Aceitar Cookies"
              onClick={() => setCookies({ analytics: true })}
            />
            <Button
              type="secondary"
              label="Definições de Cookies"
              onClick={() => setShowSettings(true)}
            />
          </div>
        </Stack>
      </div>
    </Modal>
  );
};

const CookiesElement = ({
  title,
  content,
  selected,
  setSelected,
  disabled,
}: {
  title: string;
  content: string;
  selected: boolean;
  setSelected?: (selected: boolean) => void;
  disabled?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState(0);

  const ref = useCallback((node: HTMLParagraphElement) => {
    if (node !== null) {
      setHeight(node.scrollHeight);
    }
  }, []);

  return (
    <StylelessButton
      className={settingsElement("element")}
      onClick={() => setExpanded(!expanded)}
    >
      <Stack
        row
        gap="0.5rem"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack row gap="0.5rem" alignItems="center">
          {expanded ? (
            <IconUserInterfaceNavigationArrowUp />
          ) : (
            <IconUserInterfaceNavigationArrowDown />
          )}
          <p className={settingsElement("element__title")}>{title}</p>
        </Stack>
        <ToggleButton
          selected={selected}
          onChange={setSelected}
          ariaLabel={selected ? "Cookies activos" : "Cookies inactivos"}
          disabled={disabled}
        />
      </Stack>
      <div
        ref={ref}
        className={settingsElement("element__content", { expanded })}
        style={{ maxHeight: expanded ? height : 0 }}
      >
        <div />
        {content}
      </div>
    </StylelessButton>
  );
};
