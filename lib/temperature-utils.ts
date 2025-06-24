import type { TemperatureUnit } from "@/contexts/settings-context"

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  if (from === to) return value
  if (from === "celsius" && to === "fahrenheit") {
    return (value * 9) / 5 + 32
  } else {
    return ((value - 32) * 5) / 9
  }
}

export function formatTemperature(value: number, unit: TemperatureUnit): string {
  const formattedValue = value.toFixed(1)
  const unitSymbol = unit === "celsius" ? "°C" : "°F"
  return `${formattedValue}${unitSymbol}`
}
