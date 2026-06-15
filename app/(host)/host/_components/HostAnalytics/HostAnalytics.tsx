"use client";

import { useMemo, useState } from "react";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import InputSelect from "@/_design_system/InputSelect";
import Tag from "@/_design_system/Tag";
import EmptyState from "@/_components/EmptyState";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";
import { useVenues } from "@/_models/venue";
import { useAllSpaces } from "@/_models/space";
import { createBEMClasses } from "@/_utils/classname";
import { formatInt, formatMoney } from "@/_utils/number";

const { block, element } = createBEMClasses("host-dashboard");

const PERIODS = [
  { id: "7", text: "Últimos 7 dias" },
  { id: "30", text: "Últimos 30 dias" },
  { id: "90", text: "Últimos 90 dias" },
] as const;

// Deterministic pseudo-random so mock metrics stay stable per seed.
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Metrics = {
  visits: number;
  requests: number;
  bookings: number;
  revenue: number;
  conversion: number;
  visitsDelta: number;
  series: { label: string; value: number }[];
  sources: { label: string; value: number }[];
};

function buildMetrics(seedKey: string, periodDays: number): Metrics {
  const rng = seeded(hash(`${seedKey}:${periodDays}`));
  const scale = periodDays / 30;
  const visits = Math.round((400 + rng() * 1600) * scale);
  const requests = Math.round(visits * (0.04 + rng() * 0.05));
  const bookings = Math.round(requests * (0.25 + rng() * 0.3));
  const avgTicket = 900 + rng() * 2600;
  const revenue = Math.round(bookings * avgTicket);
  const conversion = visits > 0 ? (bookings / visits) * 100 : 0;
  const visitsDelta = Math.round((rng() * 40 - 12) * 10) / 10;

  const bars = periodDays === 7 ? 7 : periodDays === 30 ? 10 : 12;
  const series = Array.from({ length: bars }, (_, i) => ({
    label:
      periodDays === 7
        ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][i] ?? `${i + 1}`
        : `${i + 1}`,
    value: Math.round((visits / bars) * (0.5 + rng())),
  }));

  const rawSources = [
    { label: "Pesquisa Google", weight: 0.3 + rng() * 0.3 },
    { label: "Direto", weight: 0.15 + rng() * 0.2 },
    { label: "Meta (FB/IG)", weight: 0.1 + rng() * 0.2 },
    { label: "Referências", weight: 0.05 + rng() * 0.15 },
  ];
  const totalWeight = rawSources.reduce((sum, s) => sum + s.weight, 0);
  const sources = rawSources
    .map((s) => ({ label: s.label, value: Math.round((s.weight / totalWeight) * 100) }))
    .sort((a, b) => b.value - a.value);

  return {
    visits,
    requests,
    bookings,
    revenue,
    conversion,
    visitsDelta,
    series,
    sources,
  };
}

const HostAnalytics = () => {
  const { data: venues = [] } = useVenues();
  const { data: spaces = [] } = useAllSpaces();

  const [period, setPeriod] = useState<string>("30");
  const [venueId, setVenueId] = useState<string>("all");

  const periodDays = Number(period);

  const venueOptions = [
    { id: "all", text: "Todos os locais e empresas" },
    ...venues.map((venue) => ({ id: venue.id, text: venue.name || "Sem nome" })),
  ];

  const seedKey = venueId === "all" ? "all-venues" : venueId;
  const metrics = useMemo(
    () => buildMetrics(seedKey, periodDays),
    [seedKey, periodDays],
  );

  const relevantSpaces =
    venueId === "all"
      ? spaces
      : spaces.filter((space) => space.venueID === venueId);

  const topSpaces = useMemo(() => {
    return relevantSpaces
      .map((space) => {
        const m = buildMetrics(space.id, periodDays);
        return {
          id: space.id,
          name: space.name || "Espaço sem nome",
          visits: m.visits,
          bookings: m.bookings,
          revenue: m.revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, periodDays, spaces.length]);

  const maxBar = Math.max(...metrics.series.map((s) => s.value), 1);

  return (
    <div className={block()}>
      <div className={element("header")}>
        <TextBlock
          title="Dashboard"
          body="Desempenho dos seus locais e empresas"
        />
        <div className={element("filters")}>
          <InputSelect
            value={venueId}
            onChange={(value) => setVenueId(value ?? "all")}
            options={venueOptions}
            showLabel={false}
            label="Local"
          />
          <InputSelect
            value={period}
            onChange={(value) => setPeriod(value ?? "30")}
            options={PERIODS.map((p) => ({ id: p.id, text: p.text }))}
            showLabel={false}
            label="Período"
          />
        </div>
      </div>

      <div className={element("kpis")}>
        <Kpi label="Visitas" value={formatInt(metrics.visits)} delta={metrics.visitsDelta} />
        <Kpi label="Pedidos" value={formatInt(metrics.requests)} />
        <Kpi label="Reservas" value={formatInt(metrics.bookings)} />
        <Kpi
          label="Receita"
          value={formatMoney(metrics.revenue, { maximumFractionDigits: 0 })}
        />
        <Kpi
          label="Conversão"
          value={`${metrics.conversion.toFixed(1)}%`}
        />
      </div>

      <div className={element("row")}>
        <div className={element("card")}>
          <h3>Visitas no período</h3>
          <div className={element("bars")}>
            {metrics.series.map((point, index) => (
              <div key={index} className={element("bars__bar")}>
                <div
                  className={element("bars__bar__fill")}
                  style={{ height: `${(point.value / maxBar) * 100}%` }}
                  title={`${point.label}: ${formatInt(point.value)} visitas`}
                />
                <span className={element("bars__bar__label")}>
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={element("card")}>
          <h3>Origem do tráfego</h3>
          <div className={element("sources")}>
            {metrics.sources.map((source) => (
              <div key={source.label} className={element("source")}>
                <div className={element("source__head")}>
                  <span>{source.label}</span>
                  <span>{source.value}%</span>
                </div>
                <div className={element("source__track")}>
                  <div
                    className={element("source__fill")}
                    style={{ width: `${source.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={element("card")}>
        <h3>Espaços com melhor desempenho</h3>
        {topSpaces.length === 0 ? (
          <EmptyState text={{ body: "Sem espaços para o filtro escolhido." }} />
        ) : (
          <TableWrapper>
            <Table ariaLabel="Espaços com melhor desempenho">
              <TableHeader>
                <Column isRowHeader>Espaço</Column>
                <Column>Visitas</Column>
                <Column>Reservas</Column>
                <Column>Receita</Column>
              </TableHeader>
              <TableBody>
                {topSpaces.map((space, index) => (
                  <Row key={space.id} odd={index % 2 === 1}>
                    <Cell>
                      <Stack row gap="0.5rem" alignItems="center">
                        {index === 0 && (
                          <Tag size="small" type="success" text="Top" />
                        )}
                        <span>{space.name}</span>
                      </Stack>
                    </Cell>
                    <Cell>
                      <div>{formatInt(space.visits)}</div>
                    </Cell>
                    <Cell>
                      <div>{formatInt(space.bookings)}</div>
                    </Cell>
                    <Cell>
                      <div>
                        {formatMoney(space.revenue, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </Cell>
                  </Row>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
        )}
      </div>

      <p className={element("disclaimer")}>
        Dados de demonstração. A ligação ao Google Analytics 4 será recolhida
        periodicamente e substituirá estes valores.
      </p>
    </div>
  );
};

const Kpi = ({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) => (
  <div className={element("kpi")}>
    <span className={element("kpi__label")}>{label}</span>
    <span className={element("kpi__value")}>{value}</span>
    {delta !== undefined && (
      <span
        className={element("kpi__delta", {
          up: delta >= 0,
          down: delta < 0,
        })}
      >
        {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs. período anterior
      </span>
    )}
  </div>
);

export default HostAnalytics;
