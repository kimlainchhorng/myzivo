import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, Clock, MapPin, Cloud, Sun, CloudRain, 
  Wind, Thermometer, Navigation
} from 'lucide-react';

interface FlightRouteMapAnimatedProps {
  departure: {
    code: string;
    city: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  arrival: {
    code: string;
    city: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  stops?: Array<{
    code: string;
    city: string;
    lat?: number;
    lng?: number;
    layoverTime?: string;
  }>;
  duration: string;
  flightNumber?: string;
  airline?: string;
  isAnimating?: boolean;
  showWeather?: boolean;
  className?: string;
}

// Simplified world coordinates for major airports
const airportCoordinates: Record<string, { lat: number; lng: number }> = {
  LAX: { lat: 33.9425, lng: -118.4081 },
  JFK: { lat: 40.6413, lng: -73.7781 },
  LHR: { lat: 51.4700, lng: -0.4543 },
  CDG: { lat: 49.0097, lng: 2.5479 },
  DXB: { lat: 25.2532, lng: 55.3657 },
  SIN: { lat: 1.3644, lng: 103.9915 },
  NRT: { lat: 35.7720, lng: 140.3929 },
  SYD: { lat: -33.9399, lng: 151.1753 },
  HKG: { lat: 22.3080, lng: 113.9185 },
  FRA: { lat: 50.0379, lng: 8.5622 },
  AMS: { lat: 52.3105, lng: 4.7683 },
  ICN: { lat: 37.4602, lng: 126.4407 },
  SFO: { lat: 37.6213, lng: -122.3790 },
  MIA: { lat: 25.7959, lng: -80.2870 },
  ORD: { lat: 41.9742, lng: -87.9073 },
  ATL: { lat: 33.6407, lng: -84.4277 },
  BKK: { lat: 13.6900, lng: 100.7501 },
  DEL: { lat: 28.5562, lng: 77.1000 },
  DOH: { lat: 25.2731, lng: 51.6080 },
  IST: { lat: 41.2753, lng: 28.7519 },
};

const getCoords = (code: string, providedLat?: number, providedLng?: number) => {
  if (providedLat !== undefined && providedLng !== undefined) {
    return { lat: providedLat, lng: providedLng };
  }
  return airportCoordinates[code] || { lat: 0, lng: 0 };
};

// Convert lat/lng to SVG coordinates (simple equirectangular projection)
const toSvgCoords = (lat: number, lng: number, width: number, height: number) => {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

// Generate curved path between two points
const generateCurvePath = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  curveIntensity = 0.3
) => {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  // Curve upward (toward poles) for visual appeal
  const curveOffset = Math.sqrt(dx * dx + dy * dy) * curveIntensity;
  const controlX = midX;
  const controlY = midY - curveOffset;
  
  return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
};

export default function FlightRouteMapAnimated({
  departure,
  arrival,
  stops = [],
  duration,
  flightNumber,
  airline,
  isAnimating = true,
  showWeather = true,
  className,
}: FlightRouteMapAnimatedProps) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showPlane, setShowPlane] = useState(false);

  const svgWidth = 800;
  const svgHeight = 400;

  const departureCoords = useMemo(() => {
    const coords = getCoords(departure.code, departure.lat, departure.lng);
    return toSvgCoords(coords.lat, coords.lng, svgWidth, svgHeight);
  }, [departure]);

  const arrivalCoords = useMemo(() => {
    const coords = getCoords(arrival.code, arrival.lat, arrival.lng);
    return toSvgCoords(coords.lat, coords.lng, svgWidth, svgHeight);
  }, [arrival]);

  const stopCoords = useMemo(() => {
    return stops.map(stop => {
      const coords = getCoords(stop.code, stop.lat, stop.lng);
      return {
        ...stop,
        ...toSvgCoords(coords.lat, coords.lng, svgWidth, svgHeight),
      };
    });
  }, [stops]);

  const flightPath = useMemo(() => {
    if (stopCoords.length === 0) {
      return generateCurvePath(departureCoords, arrivalCoords);
    }
    
    // Multi-leg path
    const allPoints = [departureCoords, ...stopCoords.map(s => ({ x: s.x, y: s.y })), arrivalCoords];
    let path = '';
    for (let i = 0; i < allPoints.length - 1; i++) {
      const segmentPath = generateCurvePath(allPoints[i], allPoints[i + 1], 0.25);
      path += (i === 0 ? '' : ' ') + segmentPath.replace('M ', i === 0 ? 'M ' : 'L ');
    }
    return path;
  }, [departureCoords, arrivalCoords, stopCoords]);

  // Animation effect
  useEffect(() => {
    if (!isAnimating) {
      setAnimationProgress(100);
      setShowPlane(true);
      return;
    }

    setShowPlane(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setAnimationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating]);

  // Calculate plane position along the path
  const planePosition = useMemo(() => {
    const t = animationProgress / 100;
    const x = departureCoords.x + (arrivalCoords.x - departureCoords.x) * t;
    const y = departureCoords.y + (arrivalCoords.y - departureCoords.y) * t;
    
    // Add curve offset
    const curveOffset = Math.sin(t * Math.PI) * 50;
    
    return { x, y: y - curveOffset };
  }, [animationProgress, departureCoords, arrivalCoords]);

  // Calculate plane rotation
  const planeRotation = useMemo(() => {
    const dx = arrivalCoords.x - departureCoords.x;
    const dy = arrivalCoords.y - departureCoords.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }, [departureCoords, arrivalCoords]);

  return (
    <Card className={cn("overflow-hidden border-border/50", className)}>
      <CardContent className="p-0 relative">
        {/* SVG Map */}
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
        >
          {/* Grid Lines (subtle) */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            </pattern>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Flight Path - Background */}
          <path
            d={flightPath}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
            strokeDasharray="8,8"
          />

          {/* Flight Path - Animated */}
          <path
            d={flightPath}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
            strokeDasharray="1000"
            strokeDashoffset={1000 - (animationProgress / 100) * 1000}
            className="transition-all duration-75"
          />

          {/* Stop Points */}
          {stopCoords.map((stop, idx) => (
            <g key={idx}>
              <circle
                cx={stop.x}
                cy={stop.y}
                r="8"
                fill="#1e293b"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <text
                x={stop.x}
                y={stop.y + 24}
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="12"
                fontWeight="600"
              >
                {stop.code}
              </text>
              {stop.layoverTime && (
                <text
                  x={stop.x}
                  y={stop.y + 38}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  {stop.layoverTime}
                </text>
              )}
            </g>
          ))}

          {/* Departure Point */}
          <g>
            <circle
              cx={departureCoords.x}
              cy={departureCoords.y}
              r="12"
              fill="#0ea5e9"
              className="animate-pulse"
            />
            <circle
              cx={departureCoords.x}
              cy={departureCoords.y}
              r="6"
              fill="#fff"
            />
            <text
              x={departureCoords.x}
              y={departureCoords.y + 28}
              textAnchor="middle"
              fill="#0ea5e9"
              fontSize="14"
              fontWeight="700"
            >
              {departure.code}
            </text>
            <text
              x={departureCoords.x}
              y={departureCoords.y + 44}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="11"
            >
              {departure.city}
            </text>
          </g>

          {/* Arrival Point */}
          <g>
            <circle
              cx={arrivalCoords.x}
              cy={arrivalCoords.y}
              r="12"
              fill="#6366f1"
              className={animationProgress >= 100 ? "animate-pulse" : ""}
            />
            <circle
              cx={arrivalCoords.x}
              cy={arrivalCoords.y}
              r="6"
              fill="#fff"
            />
            <text
              x={arrivalCoords.x}
              y={arrivalCoords.y + 28}
              textAnchor="middle"
              fill="#6366f1"
              fontSize="14"
              fontWeight="700"
            >
              {arrival.code}
            </text>
            <text
              x={arrivalCoords.x}
              y={arrivalCoords.y + 44}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="11"
            >
              {arrival.city}
            </text>
          </g>

          {/* Animated Airplane */}
          {showPlane && animationProgress < 100 && (
            <g transform={`translate(${planePosition.x}, ${planePosition.y}) rotate(${planeRotation})`}>
              <circle r="16" fill="rgba(14, 165, 233, 0.3)" className="animate-ping" />
              <circle r="10" fill="#0ea5e9" />
              <path
                d="M-6 0 L6 0 M-2 -4 L-2 4 M2 -2 L2 2"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
            </g>
          )}
        </svg>

        {/* Flight Info Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50">
            <p className="text-sky-400 font-semibold text-sm">{flightNumber || 'Flight'}</p>
            <p className="text-slate-400 text-xs">{airline}</p>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-white font-medium">{duration}</span>
          </div>
        </div>

        {/* Distance Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <Badge className="bg-sky-500/20 text-sky-400 border-0">
              {departure.code}
            </Badge>
            <div className="flex items-center gap-1 text-slate-400">
              <Navigation className="w-3 h-3" />
              <span className="text-xs">{stops.length > 0 ? `${stops.length} stop${stops.length > 1 ? 's' : ''}` : 'Direct'}</span>
            </div>
            <Badge className="bg-violet-500/20 text-violet-400 border-0">
              {arrival.code}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
