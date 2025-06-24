import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Alerts | Industrial Dashboard",
  description: "Alert management for industrial equipment",
}

export default function AlertsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
