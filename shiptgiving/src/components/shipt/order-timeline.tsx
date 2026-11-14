import type { PledgeStatus } from "@/lib/types";

const STEPS: { status: PledgeStatus; label: string }[] = [
  { status: "pledged", label: "Order placed" },
  { status: "batched", label: "Shopper assigned" },
  { status: "picked_up", label: "On the way" },
  { status: "delivered", label: "Delivered" },
  { status: "received", label: "Received" },
];

export function OrderTimeline({ status, partnerName, volunteer }: {
  status: PledgeStatus; partnerName: string; volunteer: boolean;
}) {
  const current = STEPS.findIndex((step) => step.status === status);
  const labelFor = (step: typeof STEPS[number]) => step.status === "received"
    ? `Received by ${partnerName}, receipt ready`
    : step.status === "batched" && volunteer ? "Route planned" : step.label;
  return (
    <section aria-labelledby="order-progress-title" className="rounded-2xl border border-hairline bg-white p-5 sm:p-6">
      <h2 id="order-progress-title" className="text-2xl font-bold">Donation progress</h2>
      <p role="status" className="sr-only">{current >= 0 ? labelFor(STEPS[current]) : "Waiting for an order update"}</p>
      <ol className="mt-5">
        {STEPS.map((step, index) => (
          <li key={step.status} aria-current={index === current ? "step" : undefined} className="relative flex min-h-16 gap-4 last:min-h-10">
            {index < STEPS.length - 1 && <span aria-hidden="true" className="absolute top-9 left-[17px] h-7 border-l border-hairline" />}
            <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${index < current ? "border-primary bg-primary text-white" : index === current ? "border-transparent bg-express text-express" : "border-hairline bg-white text-secondary"}`}>
              {index < current ? "✓" : index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <span className={index === current ? "inline-block rounded-full bg-express px-3 py-1 text-sm font-semibold text-express" : `text-sm ${index < current ? "font-semibold" : "text-secondary"}`}>
                {labelFor(step)}
              </span>
              {index < current && <span className="sr-only">, completed</span>}
              {index === current && <span className="sr-only">, current step</span>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
