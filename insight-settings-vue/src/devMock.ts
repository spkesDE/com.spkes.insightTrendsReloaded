// Fake Homey object for `npm run dev`. It is only loaded in development builds.
import en from "../../locales/en.json";

// Same shape as FlowUtils: the name carries the units, the description is the device or app name.
const insights = [
  {id: "1", uri: "homey:device:1", name: "Temperature (°C)", units: "°C", description: "Hygrometer Bath", type: "number", icon: "images/weather.svg"},
  {id: "2", uri: "homey:device:2", name: "Temperature (°C)", units: "°C", description: "Thermostat Living room", type: "number", icon: "images/weather.svg"},
  {id: "3", uri: "homey:device:2", name: "Target temperature (°C)", units: "°C", description: "Thermostat Living room", type: "number", icon: "images/weather.svg"},
  {id: "4", uri: "homey:device:3", name: "Door open", description: "Front door", type: "boolean", icon: "images/logic.png"}
];

function translate(key: string): string {
  const value = key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], en);
  return typeof value === "string" ? value : key;
}

function calculated() {
  const now = Date.now();
  const data = Array.from({length: 100}, (_, i) => ({x: now - (100 - i) * 60_000, y: 18 + Math.random() * 4}));
  return {
    data,
    trendLine: [{x: data[0].x, y: 18.5}, {x: data[99].x, y: 21.2}],
    min: 18.0004, max: 21.9871, mean: 19.9512, median: 19.9433, standardDeviation: 1.1537,
    trend: 0.0000027, trend_direction: "up", size: data.length,
    firstvalue: data[0].y, firstvalue_time: new Date(data[0].x).toLocaleString("en-GB"), firstvalue_timestamp: data[0].x,
    lastvalue: data[99].y, lastvalue_time: new Date(data[99].x).toLocaleString("en-GB"), lastvalue_timestamp: data[99].x,
    percentile: 19.95, percent: 50
  };
}

export function installHomeyMock() {
  const settings: Record<string, unknown> = {};
  window.Homey = {
    __: translate,
    ready: () => undefined,
    alert: (message) => window.alert(message),
    get: (key, callback) => callback(null, settings[key]),
    set: (key, value, callback) => {
      settings[key] = value;
      callback(null, undefined);
    },
    api: (_method, path, _body, callback) => {
      const params = new URLSearchParams(path.split("?")[1]);
      const query = params.get("search")?.toLowerCase() ?? "";
      // A range under 5 minutes returns no data, to show the empty state.
      const empty = Number(params.get("range")) * Number(params.get("unit")) < 5;
      const result = path.startsWith("/searchInsights")
        ? insights.filter((insight) => `${insight.name} ${insight.description}`.toLowerCase().includes(query))
        : empty ? {size: 0, data: [], trendLine: []} : calculated();
      setTimeout(() => callback(null, result), 300);
    }
  };
  window.HomeyReady = true;
}
