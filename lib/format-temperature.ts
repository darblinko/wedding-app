import type { TemperatureUnit } from "@/contexts/settings-context"

export function formatTemperature(value: number, unit: TemperatureUnit): string {
  const formattedValue = value.toFixed(1)
  const unitSymbol = unit === "celsius" ? "°C" : "°F"
  return `${formattedValue}${unitSymbol}`
}
