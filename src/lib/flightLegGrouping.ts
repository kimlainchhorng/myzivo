/**
 * Groups round-trip offers by outbound or return leg fingerprint
 * so users can select legs step-by-step
 */

import { type DuffelOffer, type DuffelSegment } from "@/hooks/useDuffelFlights";
import { type LegGroup, type LegSummary } from "@/components/flight/FlightLegCard";

function parseDurationText(duration?: string): number {
  if (!duration) return 0;
  const hours = duration.match(/(\d+)h/i);
  const minutes = duration.match(/(\d+)m/i);
  return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
}

function calcLayoverMinutes(prev: DuffelSegment, next: DuffelSegment): number {
  try {
    const ms = new Date(next.departingAt).getTime() - new Date(prev.arrivingAt).getTime();
    return Math.max(0, Math.round(ms / 60000));
  } catch { return 0; }
}

function getSliceSummary(segs: DuffelSegment[]): LegSummary | null {
  if (!segs.length) return null;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const depTime = first.departingAt?.split("T")[1]?.slice(0, 5) || "—";
  const arrTime = last.arrivingAt?.split("T")[1]?.slice(0, 5) || "—";
  const depCode = first.origin.code;
  const arrCode = last.destination.code;

  let dayDiff = 0;
  try {
    const depDate = first.departingAt?.split("T")[0];
    const arrDate = last.arrivingAt?.split("T")[0];
    if (depDate && arrDate) {
      dayDiff = Math.round((new Date(arrDate).getTime() - new Date(depDate).getTime()) / (1000 * 60 * 60 * 24));
    }
  } catch { /* ignore */ }

  const flightMin = segs.reduce((t, s) => t + parseDurationText(s.duration), 0);
  let totalMin = flightMin + segs.slice(1).reduce((t, s, i) => t + calcLayoverMinutes(segs[i], s), 0);
  if (totalMin <= 0) {
    totalMin = Math.max(0, Math.round((new Date(last.arrivingAt).getTime() - new Date(first.departingAt).getTime()) / 60000));
  }
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const duration = totalMin > 0 ? `${hours}h ${mins}m` : "—";
  const stops = segs.length - 1;

  const stopDetails: { code: string; city: string; layoverDuration: string }[] = [];
  for (let i = 0; i < segs.length - 1; i++) {
    const layMin = calcLayoverMinutes(segs[i], segs[i + 1]);
    const lh = Math.floor(layMin / 60);
    const lm = layMin % 60;
    stopDetails.push({
      code: segs[i].destination.code,
      city: segs[i].destination.city || segs[i].destination.code,
      layoverDuration: layMin > 0 ? `${lh}h ${lm}m` : "",
    });
  }

  return { depTime, arrTime, depCode, arrCode, duration, stops, stopDetails, dayDiff };
}

/** Split an offer's segments into outbound and return */
export function splitSegments(segments: DuffelSegment[], destCode: string) {
  if (!segments?.length || !destCode) return { outbound: segments || [], returnSegs: [] };
  const dest = destCode.toUpperCase();
  const splitIdx = segments.findIndex((seg, i) => i > 0 && seg.origin.code.toUpperCase() === dest);
  if (splitIdx <= 0) return { outbound: segments, returnSegs: [] };
  return { outbound: segments.slice(0, splitIdx), returnSegs: segments.slice(splitIdx) };
}

/** Create a fingerprint for a set of segments (route identity) */
function legFingerprint(segs: DuffelSegment[]): string {
  return segs.map(s => `${s.marketingCarrierCode}${s.flightNumber}-${s.departingAt}-${s.arrivingAt}`).join("|");
}

/** Group offers by outbound leg */
export function groupByOutbound(offers: DuffelOffer[], destCode: string): LegGroup[] {
  const map = new Map<string, { offers: DuffelOffer[]; segments: DuffelSegment[] }>();

  for (const offer of offers) {
    if (!offer.segments?.length) continue;
    const { outbound } = splitSegments(offer.segments, destCode);
    if (!outbound.length) continue;
    const fp = legFingerprint(outbound);
    const existing = map.get(fp);
    if (existing) {
      existing.offers.push(offer);
    } else {
      map.set(fp, { offers: [offer], segments: outbound });
    }
  }

  const groups: LegGroup[] = [];
  for (const [fp, data] of map) {
    const summary = getSliceSummary(data.segments);
    if (!summary) continue;
    const prices = data.offers.map(o => o.price);
    const fromPrice = Math.min(...prices);
    const cheapest = data.offers.reduce((min, o) => o.price < min.price ? o : min, data.offers[0]);
    groups.push({
      fingerprint: fp,
      representativeOffer: cheapest,
      offers: data.offers,
      segments: data.segments,
      summary,
      fromPrice,
      fareCount: data.offers.length,
    });
  }

  return groups;
}

/** Group offers (that share a specific outbound) by return leg */
export function groupByReturn(offers: DuffelOffer[], destCode: string): LegGroup[] {
  const map = new Map<string, { offers: DuffelOffer[]; segments: DuffelSegment[] }>();

  for (const offer of offers) {
    if (!offer.segments?.length) continue;
    const { returnSegs } = splitSegments(offer.segments, destCode);
    if (!returnSegs.length) continue;
    const fp = legFingerprint(returnSegs);
    const existing = map.get(fp);
    if (existing) {
      existing.offers.push(offer);
    } else {
      map.set(fp, { offers: [offer], segments: returnSegs });
    }
  }

  const groups: LegGroup[] = [];
  for (const [fp, data] of map) {
    const summary = getSliceSummary(data.segments);
    if (!summary) continue;
    const prices = data.offers.map(o => o.price);
    const fromPrice = Math.min(...prices);
    const cheapest = data.offers.reduce((min, o) => o.price < min.price ? o : min, data.offers[0]);
    groups.push({
      fingerprint: fp,
      representativeOffer: cheapest,
      offers: data.offers,
      segments: data.segments,
      summary,
      fromPrice,
      fareCount: data.offers.length,
    });
  }

  return groups;
}

/** Get durationMinutes from a LegGroup for sorting */
export function getLegDurationMinutes(group: LegGroup): number {
  const { summary } = group;
  const match = summary.duration.match(/(\d+)h\s*(\d+)m/);
  if (match) return Number(match[1]) * 60 + Number(match[2]);
  return 9999;
}
