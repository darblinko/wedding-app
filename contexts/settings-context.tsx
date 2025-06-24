"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserSettings = {
  darkMode: boolean
  compactView: boolean
  showAlerts: boolean
}

// Default settings
const defaultSettings: UserSettings = {
  darkMode: false,
  compactView: false,
  showAlerts: true,
}

// Create context
type SettingsContextType = {
  settings: UserSettings
  updateSettings: (settings: Partial<UserSettings>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Create provider
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("userSettings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userSettings", JSON.stringify(settings))
    }
  }, [settings])

  // Update settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>
}

// Create hook for using the context
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
