"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import Alerts from "@/components/alerts"

export default function AlertsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="text-muted-foreground">View and manage system alerts</p>
      </div>

      <Alerts />
    </div>
  )
}
