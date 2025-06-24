import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | Industrial Dashboard",
  description: "Manage your dashboard settings",
}

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
