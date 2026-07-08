export type AqiCategory =
  | "Good"
  | "Satisfactory"
  | "Moderate"
  | "Poor"
  | "Very Poor"
  | "Severe";

export interface AqiInfo {
  category: AqiCategory;
  color: string; // tailwind bg class root token
  hex: string; // for charts / inline styles
  ring: string;
  soft: string;
  text: string;
  advice: string;
}

export function getAqiInfo(aqi: number): AqiInfo {
  if (aqi <= 50)
    return {
      category: "Good",
      color: "bg-aqi-good",
      hex: "#22c55e",
      ring: "ring-aqi-good/40",
      soft: "bg-aqi-good/10",
      text: "text-aqi-good",
      advice: "Air quality is excellent. Perfect for outdoor activities.",
    };
  if (aqi <= 100)
    return {
      category: "Satisfactory",
      color: "bg-aqi-satisfactory",
      hex: "#84cc16",
      ring: "ring-aqi-satisfactory/40",
      soft: "bg-aqi-satisfactory/10",
      text: "text-aqi-satisfactory",
      advice: "Acceptable air quality with minor concern for sensitive groups.",
    };
  if (aqi <= 200)
    return {
      category: "Moderate",
      color: "bg-aqi-moderate",
      hex: "#eab308",
      ring: "ring-aqi-moderate/40",
      soft: "bg-aqi-moderate/10",
      text: "text-aqi-moderate",
      advice: "Sensitive groups may experience mild breathing discomfort.",
    };
  if (aqi <= 300)
    return {
      category: "Poor",
      color: "bg-aqi-poor",
      hex: "#f97316",
      ring: "ring-aqi-poor/40",
      soft: "bg-aqi-poor/10",
      text: "text-aqi-poor",
      advice: "Breathing discomfort likely on prolonged exposure. Limit outdoors.",
    };
  if (aqi <= 400)
    return {
      category: "Very Poor",
      color: "bg-aqi-very-poor",
      hex: "#ef4444",
      ring: "ring-aqi-very-poor/40",
      soft: "bg-aqi-very-poor/10",
      text: "text-aqi-very-poor",
      advice: "Respiratory illness on prolonged exposure. Wear a mask outdoors.",
    };
  return {
    category: "Severe",
    color: "bg-aqi-severe",
    hex: "#a855f7",
    ring: "ring-aqi-severe/40",
    soft: "bg-aqi-severe/10",
    text: "text-aqi-severe",
    advice: "Serious health impact. Avoid outdoor activity. N95 mask required.",
  };
}

// Simplified CPCB sub-index calculation
const breakpoints: Record<string, Array<[number, number, number, number]>> = {
  pm25: [
    [0, 30, 0, 50],
    [31, 60, 51, 100],
    [61, 90, 101, 200],
    [91, 120, 201, 300],
    [121, 250, 301, 400],
    [251, 500, 401, 500],
  ],
  pm10: [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 250, 101, 200],
    [251, 350, 201, 300],
    [351, 430, 301, 400],
    [431, 600, 401, 500],
  ],
  no2: [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 180, 101, 200],
    [181, 280, 201, 300],
    [281, 400, 301, 400],
    [401, 600, 401, 500],
  ],
  so2: [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 380, 101, 200],
    [381, 800, 201, 300],
    [801, 1600, 301, 400],
    [1601, 2400, 401, 500],
  ],
  co: [
    [0, 1, 0, 50],
    [1.1, 2, 51, 100],
    [2.1, 10, 101, 200],
    [10.1, 17, 201, 300],
    [17.1, 34, 301, 400],
    [34.1, 50, 401, 500],
  ],
  o3: [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 168, 101, 200],
    [169, 208, 201, 300],
    [209, 748, 301, 400],
    [749, 1000, 401, 500],
  ],
};

function subIndex(pollutant: keyof typeof breakpoints, value: number): number {
  const bps = breakpoints[pollutant];
  for (const [cLow, cHigh, iLow, iHigh] of bps) {
    if (value >= cLow && value <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (value - cLow) + iLow);
    }
  }
  return value > bps[bps.length - 1][1] ? 500 : 0;
}

export interface Pollutants {
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
}

export function computeAqi(p: Pollutants) {
  const subs = {
    "PM2.5": subIndex("pm25", p.pm25),
    PM10: subIndex("pm10", p.pm10),
    NO2: subIndex("no2", p.no2),
    SO2: subIndex("so2", p.so2),
    CO: subIndex("co", p.co),
    O3: subIndex("o3", p.o3),
  };
  let aqi = 0;
  let dominant: keyof typeof subs = "PM2.5";
  (Object.keys(subs) as (keyof typeof subs)[]).forEach((k) => {
    if (subs[k] > aqi) {
      aqi = subs[k];
      dominant = k;
    }
  });
  return { aqi, dominant, subs };
}