"use client";

import { ReactNode, useState } from "react";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceActionsCheck from "@/_design_system/_icons/UserInterface/Actions/Check.svg";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import { createBEMClasses } from "@/_utils/classname";
import { formatMoney } from "@/_utils/number";
import BecomeHostButton from "../BecomeHostButton";
import ScheduleDemoButton from "../ScheduleDemoButton";
import {
  ANNUAL_SAVE_LABEL,
  LANDING_PLANS,
  LandingPlan,
  PLAN_FAQS,
  PLAN_FOOTNOTES,
  PlanFaq,
  SHOWCASE,
  Showcase,
  ShowcaseVisual,
} from "./data";

const { block, element } = createBEMClasses("help-host-plans");

type Interval = "month" | "year";

const Plans = () => {
  const [interval, setInterval] = useState<Interval>("year");

  return (
    <section className={block()} id="planos">
      <div className={element("content")}>
        <Hero />

        <div className={element("billing")}>
          <div className={element("toggle")}>
            <button
              type="button"
              className={element("toggle__option", {
                active: interval === "month",
              })}
              onClick={() => setInterval("month")}
            >
              Mensal
            </button>
            <button
              type="button"
              className={element("toggle__option", {
                active: interval === "year",
              })}
              onClick={() => setInterval("year")}
            >
              Anual
            </button>
          </div>
          <span className={element("save")}>{ANNUAL_SAVE_LABEL}</span>
        </div>

        <div className={element("grid")}>
          {LANDING_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} interval={interval} />
          ))}
        </div>

        <div className={element("footnotes")}>
          {PLAN_FOOTNOTES.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>

        <div className={element("features")}>
          <Stack gap="0.5rem" className={element("features__head")}>
            <h2>Funcionalidades</h2>
            <p>
              As alavancas de crescimento incluídas nos planos Premium e
              Expert.
            </p>
          </Stack>
          <div className={element("flow")}>
            {SHOWCASE.map((item) => (
              <ShowcaseRow key={item.title} item={item} />
            ))}
          </div>
        </div>

        <CtaBand />

        <div className={element("faqs")}>
          <Stack gap="0.5rem" className={element("features__head")}>
            <h2>Perguntas frequentes</h2>
            <p>Respostas às questões mais frequentes sobre os planos.</p>
          </Stack>
          <FaqList faqs={PLAN_FAQS} />
        </div>
      </div>
    </section>
  );
};

const Hero = () => (
  <Stack gap="1rem" className={element("hero")}>
    <span className={element("kicker")}>
      <span className={element("kicker__dot")} />
      Subscrições para parceiros RINU
    </span>
    <h1>
      Mais leads. Mais visibilidade.
      <br />
      Decisões mais informadas.
    </h1>
    <p className={element("lead")}>
      Escolha o plano adequado ao seu espaço e acelere a captação de reservas
      com leads qualificadas, posicionamento premium, conteúdo profissional e
      insights de mercado.
    </p>
    <p className={element("hero-note")}>
      Os planos <strong>Premium</strong> e <strong>Expert</strong> são
      faturados <strong>por venue</strong>. O plano <strong>Standard</strong> é
      gratuito.
    </p>
  </Stack>
);

const PlanCard = ({
  plan,
  interval,
}: {
  plan: LandingPlan;
  interval: Interval;
}) => {
  const isFree = plan.priceMonthly === null;
  const price = interval === "year" ? plan.priceAnnual : plan.priceMonthly;
  const suffix = interval === "year" ? "/ano" : "/mês";

  return (
    <article className={element("card", { tone: plan.tone, featured: plan.featured })}>
      {plan.ribbon && (
        <span className={element("ribbon", { tone: plan.tone })}>
          {plan.ribbon}
        </span>
      )}

      <Stack gap="0.25rem">
        <h3>
          {plan.name}
          {plan.perVenue && (
            <span className={element("card__per")}> (por venue)</span>
          )}
        </h3>
        <p className={element("card__subtitle")}>{plan.subtitle}</p>
      </Stack>

      <div className={element("card__price")}>
        {isFree ? (
          "Gratuito"
        ) : (
          <>
            {formatMoney(price ?? 0, {
              maximumFractionDigits: interval === "year" ? 0 : 2,
            })}
            <span className={element("card__price__suffix")}>{suffix}</span>
          </>
        )}
      </div>
      <p className={element("card__note")}>{plan.note}</p>

      <FeatureList features={plan.coreFeatures} />

      {plan.extraFeatures.length > 0 && (
        <>
          <hr className={element("card__divider")} />
          {plan.extraLabel && (
            <p className={element("card__section-label")}>{plan.extraLabel}</p>
          )}
          <FeatureList features={plan.extraFeatures} />
        </>
      )}

      <div className={element("card__cta")}>
        {plan.cta === "demo" ? <ScheduleDemoButton /> : <BecomeHostButton />}
      </div>
    </article>
  );
};

const FeatureList = ({ features }: { features: LandingPlan["coreFeatures"] }) => (
  <ul className={element("plan-features")}>
    {features.map((feature, index) => (
      <li
        key={index}
        className={element("plan-features__item", {
          highlight: feature.highlight,
        })}
      >
        <span className={element("plan-features__check")}>
          <IconUserInterfaceActionsCheck />
        </span>
        <span>
          <strong>{feature.label}</strong>
          {feature.sub && (
            <span className={element("plan-features__sub")}>: {feature.sub}</span>
          )}
        </span>
      </li>
    ))}
  </ul>
);

const ShowcaseRow = ({ item }: { item: Showcase }) => (
  <div className={element("flow-item", { reverse: item.reverse })}>
    <div className={element("flow-copy")}>
      <div className={element("flow-pills")}>
        {item.pills.map((pill) => (
          <span
            key={pill.label}
            className={element("pill", { tone: pill.tone })}
          >
            {pill.label}
          </span>
        ))}
      </div>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
      <ul className={element("flow-list")}>
        {item.bullets.map((bullet) => (
          <li key={bullet}>
            <span className={element("flow-list__dot")} />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className={element("flow-visual")}>
      <MockVisual visual={item.visual} />
    </div>
  </div>
);

const MockVisual = ({ visual }: { visual: ShowcaseVisual }) => (
  <div className={element("mock")}>
    <div className={element("mock__bar")}>
      <span className={element("mock__dots")}>
        <i />
        <i />
        <i />
      </span>
      <span className={element("mock__label")}>{MOCK_LABELS[visual]}</span>
    </div>
    <div className={element("mock__body")}>{MOCK_BODIES[visual]}</div>
  </div>
);

const MOCK_LABELS: Record<ShowcaseVisual, string> = {
  leads: "LeadHub — Leads Qualificadas",
  ai: "RINU AI Agent — Propostas",
  visibility: "Listagens — Visibilidade & Montra",
  advertising: "AEO & Advertising — Performance",
  ecosystem: "RINU Ecossistema — Fornecedores",
  insights: "Market Insights — Relatório",
};

const LeadsMock = () => (
  <>
    <div className={element("chart")}>
      {[40, 55, 72, 48, 90, 64, 100].map((height, index) => (
        <span
          key={index}
          className={element("chart__bar", { accent: index % 2 === 0 })}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
    <div className={element("rows")}>
      {["success", "neutral", "brand"].map((tone, index) => (
        <div key={index} className={element("rows__row")}>
          <span className={element("rows__dot", { tone })} />
          <span className={element("rows__line")} />
        </div>
      ))}
    </div>
    <p className={element("mock__hint")}>
      Leads alinhadas com o tipo de espaço, disponibilidade e orçamento.
    </p>
  </>
);

const AiMock = () => (
  <>
    <div className={element("chat", { incoming: true })}>
      Preciso de espaço para 80 pax, jantar corporativo, 14 Jun
    </div>
    <div className={element("chat", { ai: true })}>
      <strong>RINU AI — Proposta gerada</strong>
      <span>Espaço A · 85 pax · Menu Executivo</span>
      <span>AV incluído · €2.400 estimado</span>
    </div>
    <div className={element("chat", { success: true })}>
      <span className={element("rows__dot", { tone: "success" })} />
      Lead aceite · Reserva confirmada
    </div>
    <p className={element("mock__hint")}>
      O AI Agent gera propostas Taylor Made e faz matching automático com o seu
      espaço.
    </p>
  </>
);

const VisibilityMock = () => (
  <>
    <div className={element("listing", { montra: true })}>
      <span className={element("listing__thumb")} />
      <span className={element("listing__lines")}>
        <span className={element("listing__line")} />
        <span className={element("listing__line", { short: true })} />
      </span>
      <span className={element("listing__badge", { montra: true })}>MONTRA</span>
    </div>
    <div className={element("listing", { top: true })}>
      <span className={element("listing__thumb")} />
      <span className={element("listing__lines")}>
        <span className={element("listing__line")} />
        <span className={element("listing__line", { short: true })} />
      </span>
      <span className={element("listing__badge")}>TOP</span>
    </div>
    <div className={element("listing")}>
      <span className={element("listing__thumb")} />
      <span className={element("listing__lines")}>
        <span className={element("listing__line")} />
        <span className={element("listing__line", { short: true })} />
      </span>
    </div>
    <p className={element("mock__hint")}>
      Expert: Montra exclusiva + 1.ª prioridade em Oferta e Página Inicial.
    </p>
  </>
);

const AdvertisingMock = () => (
  <>
    <div className={element("map")}>
      {[
        { top: "30%", left: "22%", size: "lg", tone: "brand" },
        { top: "18%", left: "44%", size: "sm", tone: "brand" },
        { top: "38%", left: "60%", size: "lg", tone: "tertiary" },
        { top: "22%", left: "76%", size: "md", tone: "tertiary" },
        { top: "60%", left: "34%", size: "sm", tone: "brand" },
      ].map((pin, index) => (
        <span
          key={index}
          className={element("map__pin", { size: pin.size, tone: pin.tone })}
          style={{ top: pin.top, left: pin.left }}
        />
      ))}
    </div>
    <div className={element("region-pills")}>
      <span className={element("region", { tone: "brand" })}>EUROPA</span>
      <span className={element("region", { tone: "tertiary" })}>MUNDO</span>
      <span className={element("region")}>AEO reinvest. 10%</span>
    </div>
    <p className={element("mock__hint")}>
      Premium: Advertising Europa. Expert: Advertising Mundial + Display Ads.
    </p>
  </>
);

const EcosystemMock = () => (
  <>
    <div className={element("hub")}>
      <span className={element("hub__center")}>RINU</span>
      <span className={element("hub__node", { pos: "tl" })}>Opera</span>
      <span className={element("hub__node", { pos: "tr", success: true })}>
        5% back
      </span>
      <span className={element("hub__node", { pos: "bl" })}>The Fork</span>
      <span className={element("hub__node", { pos: "br" })}>Catering</span>
    </div>
    <p className={element("mock__hint")}>
      Integração PMS sujeita a análise. 5% back em reservas via fornecedores
      RINU.
    </p>
  </>
);

const InsightsMock = () => (
  <>
    <svg
      className={element("line-chart")}
      viewBox="0 0 280 110"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rinu-insights" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--rinu-accent-2)" />
          <stop offset="1" stopColor="var(--rinu-accent-1)" />
        </linearGradient>
      </defs>
      <path
        d="M8 92 C 48 72, 78 80, 108 60 C 140 40, 172 48, 204 30 C 232 16, 258 26, 272 12"
        fill="none"
        stroke="url(#rinu-insights)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
    <div className={element("highlights")}>
      <span className={element("highlights__card", { tone: "brand" })} />
      <span className={element("highlights__card", { tone: "tertiary" })} />
      <span className={element("highlights__card")} />
    </div>
    <p className={element("mock__hint")}>
      Relatórios de mercado: tendências, procura e oportunidades por segmento.
    </p>
  </>
);

const MOCK_BODIES: Record<ShowcaseVisual, ReactNode> = {
  leads: <LeadsMock />,
  ai: <AiMock />,
  visibility: <VisibilityMock />,
  advertising: <AdvertisingMock />,
  ecosystem: <EcosystemMock />,
  insights: <InsightsMock />,
};

const CtaBand = () => (
  <div className={element("cta-band")}>
    <Stack gap="0.375rem">
      <h3>Pretende escolher o plano mais adequado ao seu espaço?</h3>
      <p>
        Fale com a equipa RINU e valide o melhor enquadramento (Premium vs
        Expert) para o seu volume de procura.
      </p>
    </Stack>
    <Stack row gap="0.75rem" flexWrap="wrap" alignItems="center">
      <ScheduleDemoButton />
      <BecomeHostButton />
    </Stack>
  </div>
);

const FaqList = ({ faqs }: { faqs: PlanFaq[] }) => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={element("faq")}>
      {faqs.map((faq, index) => {
        const isOpen = open === index;
        return (
          <div key={faq.q} className={element("qa", { open: isOpen })}>
            <button
              type="button"
              className={element("qa__q")}
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className={element("qa__title")}>
                {faq.q} <span className={element("qa__tag")}>{faq.tag}</span>
              </span>
              <span className={element("qa__caret")}>
                <IconUserInterfaceNavigationArrowDown />
              </span>
            </button>
            {isOpen && <p className={element("qa__a")}>{faq.a}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default Plans;
