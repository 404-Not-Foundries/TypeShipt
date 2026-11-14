"use client";
import { useEffect, useState } from "react";
import type { Need, Partner, Weather } from "@/lib/types";
import { errorMessage, loadWeather, simulateWeather, type Simulate } from "./api";
import { ALERT, BTN_SECONDARY, CARD, HEADING, PILL_EXPRESS, PILL_MUTED, WARM_CARD } from "./styles";

type Props = { partner: Partner; weather: Weather; needs: Need[]; onChanged: () => void };

const BUTTONS: { label: string; value: Simulate }[] = [
  { label: "Simulate cold night", value: "cold" },
  { label: "Simulate heat advisory", value: "heat" },
  { label: "Simulation off", value: null },
];

export function SurgePanel({ partner, weather, needs, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const surgePartner = partner.features.includes("weatherSurge");
  const raised = needs.filter((n) => n.surgeReason);

  // Ask the server for the live forecast once; later updates arrive with the polled state.
  useEffect(() => {
    let cancelled = false;
    loadWeather()
      .then(() => !cancelled && onChanged())
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [onChanged]);

  async function simulate(value: Simulate) {
    setBusy(true);
    setError(null);
    try {
      await simulateWeather(value);
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={weather.surge ? WARM_CARD : CARD}
      aria-labelledby="surge-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="surge-heading" className={HEADING}>
          Weather Surge
        </h2>
        <span
          className={weather.surge ? PILL_EXPRESS : PILL_MUTED}
        >
          {weather.surge ? "Surge active" : "No surge"}
        </span>
      </div>

      <p className="mt-2 text-sm text-primary">
        Tonight&apos;s low in Birmingham: <strong>{Math.round(weather.lowF)}°F</strong>
        <span className="ml-2 text-secondary">
          {weather.simulated ? "Simulated for the demo" : "National Weather Service forecast"}
        </span>
      </p>
      {weather.reason && <p className={`mt-2 ${PILL_EXPRESS}`}>{weather.reason}</p>}
      {weather.alerts.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-sm text-primary">
          {weather.alerts.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-sm text-secondary">
        {!surgePartner
          ? "Weather Surge is not turned on for this partner, so its needs keep their own urgency."
          : raised.length > 0
            ? `${raised.length} of your needs ${raised.length === 1 ? "is" : "are"} marked urgent on the donor feed: ${raised.map((n) => n.title).join(", ")}.`
            : "A low under 40°F or a heat advisory marks your cold-weather or heat items urgent automatically."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {BUTTONS.map((b) => (
          <button
            key={b.label}
            type="button"
            disabled={busy}
            onClick={() => simulate(b.value)}
            className={BTN_SECONDARY}
          >
            {b.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className={`mt-3 ${ALERT}`}>
          {error}
        </p>
      )}
    </section>
  );
}
