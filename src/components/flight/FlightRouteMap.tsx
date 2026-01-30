import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plane, MapPin, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface Airport {
  code: string;
  city: string;
  lat: number;
  lng: number;
}

interface FlightRouteMapProps {
  departure: Airport;
  arrival: Airport;
  stops?: Airport[];
  flightDuration?: string;
  flightNumber?: string;
  airline?: string;
  className?: string;
}

// Convert lat/lng to SVG coordinates
const geoToSvg = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

// Generate curved path between two points
const generateCurvedPath = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  curveIntensity: number = 0.3
) => {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control point offset perpendicular to the line
  const offsetX = -dy * curveIntensity;
  const offsetY = dx * curveIntensity;
  
  const controlX = midX + offsetX;
  const controlY = midY + offsetY - distance * 0.15; // Curve upward
  
  return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
};

// Calculate great circle distance in km
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const FlightRouteMap = ({
  departure,
  arrival,
  stops = [],
  flightDuration,
  flightNumber,
  airline,
  className,
}: FlightRouteMapProps) => {
  const svgWidth = 600;
  const svgHeight = 300;

  const routeData = useMemo(() => {
    const allPoints = [departure, ...stops, arrival];
    const svgPoints = allPoints.map((point) =>
      geoToSvg(point.lat, point.lng, svgWidth, svgHeight)
    );

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 0; i < allPoints.length - 1; i++) {
      totalDistance += calculateDistance(
        allPoints[i].lat,
        allPoints[i].lng,
        allPoints[i + 1].lat,
        allPoints[i + 1].lng
      );
    }

    // Generate paths for each segment
    const paths: string[] = [];
    for (let i = 0; i < svgPoints.length - 1; i++) {
      paths.push(generateCurvedPath(svgPoints[i], svgPoints[i + 1]));
    }

    // Calculate viewBox to center on the route
    const minX = Math.min(...svgPoints.map((p) => p.x)) - 50;
    const maxX = Math.max(...svgPoints.map((p) => p.x)) + 50;
    const minY = Math.min(...svgPoints.map((p) => p.y)) - 50;
    const maxY = Math.max(...svgPoints.map((p) => p.y)) + 50;

    return {
      svgPoints,
      paths,
      totalDistance,
      viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
    };
  }, [departure, arrival, stops]);

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-sky-500/20 backdrop-blur-xl",
        className
      )}
    >
      {/* Header Info Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-background/90 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {airline && (
              <span className="text-sm font-medium text-muted-foreground">
                {airline}
              </span>
            )}
            {flightNumber && (
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold">
                {flightNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            {flightDuration && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>{flightDuration}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Navigation className="w-3.5 h-3.5 text-sky-500" />
              <span>{routeData.totalDistance.toLocaleString()} km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map SVG */}
      <svg
        viewBox={routeData.viewBox}
        className="w-full h-64"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Glow filter for route */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for route line */}
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
          </linearGradient>

          {/* Dashed pattern for route */}
          <pattern
            id="dashPattern"
            patternUnits="userSpaceOnUse"
            width="20"
            height="1"
          >
            <line
              x1="0"
              y1="0"
              x2="10"
              y2="0"
              stroke="url(#routeGradient)"
              strokeWidth="3"
            />
          </pattern>
        </defs>

        {/* Background grid pattern */}
        <pattern
          id="grid"
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 30 0 L 0 0 0 30"
            fill="none"
            stroke="rgba(56, 189, 248, 0.05)"
            strokeWidth="0.5"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Route paths */}
        {routeData.paths.map((path, index) => (
          <g key={index}>
            {/* Shadow path */}
            <motion.path
              d={path}
              fill="none"
              stroke="rgba(56, 189, 248, 0.2)"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: index * 0.3, ease: "easeInOut" }}
            />
            {/* Main path */}
            <motion.path
              d={path}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: index * 0.3, ease: "easeInOut" }}
            />
            {/* Animated dash overlay */}
            <motion.path
              d={path}
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="8 16"
              initial={{ pathLength: 0, strokeDashoffset: 0 }}
              animate={{ pathLength: 1, strokeDashoffset: -24 }}
              transition={{
                pathLength: { duration: 1.5, delay: index * 0.3, ease: "easeInOut" },
                strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" },
              }}
            />
          </g>
        ))}

        {/* Airport markers */}
        {routeData.svgPoints.map((point, index) => {
          const airport = [departure, ...stops, arrival][index];
          const isEndpoint = index === 0 || index === routeData.svgPoints.length - 1;
          const isStop = !isEndpoint;

          return (
            <motion.g
              key={airport.code}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
            >
              {/* Pulse ring for endpoints */}
              {isEndpoint && (
                <>
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r="20"
                    fill="none"
                    stroke={index === 0 ? "#22c55e" : "#ef4444"}
                    strokeWidth="2"
                    opacity="0.4"
                    animate={{ r: [20, 30, 20], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    fill={index === 0 ? "#22c55e" : "#ef4444"}
                    opacity="0.2"
                  />
                </>
              )}

              {/* Main marker */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isEndpoint ? 8 : 5}
                fill={isStop ? "#f59e0b" : index === 0 ? "#22c55e" : "#ef4444"}
                stroke="white"
                strokeWidth="2"
              />

              {/* Airport label */}
              <text
                x={point.x}
                y={point.y - 18}
                textAnchor="middle"
                className="fill-white font-bold text-sm"
                style={{ fontSize: "12px" }}
              >
                {airport.code}
              </text>
              <text
                x={point.x}
                y={point.y - 6}
                textAnchor="middle"
                className="fill-muted-foreground text-xs"
                style={{ fontSize: "8px" }}
              >
                {airport.city}
              </text>
            </motion.g>
          );
        })}

        {/* Animated plane icon along route */}
        <motion.g
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ offsetPath: `path("${routeData.paths[0]}")` }}
        >
          <circle r="6" fill="#0ea5e9" />
          <Plane className="w-4 h-4" style={{ transform: "translate(-8px, -8px)" }} />
        </motion.g>
      </svg>

      {/* Bottom Legend */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-t from-background/90 to-transparent">
        <div className="flex items-center justify-between">
          {/* Departure */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xs text-muted-foreground">Departure</p>
              <p className="text-sm font-semibold">
                {departure.city} ({departure.code})
              </p>
            </div>
          </div>

          {/* Stops indicator */}
          {stops.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-500">
                {stops.length} stop{stops.length > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Arrival */}
          <div className="flex items-center gap-2">
            <div>
              <p className="text-xs text-muted-foreground text-right">Arrival</p>
              <p className="text-sm font-semibold">
                {arrival.city} ({arrival.code})
              </p>
            </div>
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightRouteMap;
