"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Fragment, useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { formatEta, numberStops, routeColor } from "./format";
import type { RoutePlan } from "@/lib/types";

const BIRMINGHAM: [number, number] = [33.5186, -86.8104];

function stopIcon(n: number, color: string, start: boolean) {
  // divIcon avoids Leaflet's default marker images, which bundlers break.
  return L.divIcon({
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<span style="display:grid;place-items:center;width:26px;height:26px;border-radius:${start ? "6px" : "999px"};background:${color};color:#fff;font:700 12px/1 system-ui,sans-serif;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)">${start ? "S" : n}</span>`,
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join(";");
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [30, 30] });
    // Refit only when the stops change, not on every 2 s poll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function RouteMap({ routes }: { routes: RoutePlan[] }) {
  const points = useMemo(
    () => routes.flatMap((r) => r.stops.map((s) => [s.location.lat, s.location.lng] as [number, number])),
    [routes],
  );

  return (
    <MapContainer center={BIRMINGHAM} zoom={12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {routes.map((r, i) => {
        const color = routeColor(i);
        const line = (r.polyline ?? r.stops.map((s) => s.location)).map((p) => [p.lat, p.lng] as [number, number]);
        const nums = numberStops(r.stops);
        return (
          <Fragment key={r.driverId}>
            <Polyline positions={line} pathOptions={{ color, weight: 5, opacity: 0.8 }} />
            {r.stops.map((s, j) => {
              const start = s.kind === "start";
              return (
                <Marker key={s.id} position={[s.location.lat, s.location.lng]} icon={stopIcon(nums[j], color, start)}>
                  <Popup>
                    <strong>{s.label}</strong>
                    <br />
                    {r.driverName}: {start ? "start" : s.kind === "pickup" ? "pick up" : "drop off"}
                    {s.eta ? `, ETA ${formatEta(s.eta)}` : ""}
                  </Popup>
                </Marker>
              );
            })}
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
