"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type MaintenanceTask = {
  task: string
  frequency: string
  details: string
}

type TroubleshootingStep = {
  issue: string
  action: string
}

type BOMItem = {
  partName: string
  partNumber: string
  supplier?: string
}

type MaintenanceData = {
  maintenanceTasks: MaintenanceTask[]
  troubleshootingSteps: TroubleshootingStep[]
  billOfMaterials: BOMItem[]
}

export default function MaintenanceGenerator() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState({
    equipmentMake: "",
    equipmentModel: "",
    equipmentType: "",
    manualText: "",
    fallback: "foodservice_fridge_standard_maintenance",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null)

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generateMaintenanceData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate maintenance data")
      }

      const data = await response.json()
      setMaintenanceData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Maintenance Schedule Generator</CardTitle>
          <CardDescription>
            Generate maintenance schedules, troubleshooting guides, and parts lists for your equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentMake">Equipment Make</Label>
                <Input
                  id="equipmentMake"
                  name="equipmentMake"
                  value={formData.equipmentMake}
                  onChange={handleInputChange}
                  placeholder="e.g., ACME"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipmentModel">Equipment Model</Label>
                <Input
                  id="equipmentModel"
                  name="equipmentModel"
                  value={formData.equipmentModel}
                  onChange={handleInputChange}
                  placeholder="e.g., Model X"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentType">Equipment Type</Label>
              <Input
                id="equipmentType"
                name="equipmentType"
                value={formData.equipmentType}
                onChange={handleInputChange}
                placeholder="e.g., Refrigerator, HVAC, Pump"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualText">Manual Text (Optional)</Label>
              <Textarea
                id="manualText"
                name="manualText"
                value={formData.manualText}
                onChange={handleInputChange}
                placeholder="Paste relevant sections from the equipment manual here..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fallback">Fallback Template (If no manual is provided)</Label>
              <Select value={formData.fallback} onValueChange={(value) => handleSelectChange("fallback", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foodservice_fridge_standard_maintenance">Foodservice Refrigeration</SelectItem>
                  <SelectItem value="hvac_standard_maintenance">HVAC System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <div className="bg-red-50 text-red-800 p-4 rounded-md">{error}</div>}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Maintenance Data"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {maintenanceData && (
        <div className="mt-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceData.maintenanceTasks.map((task, index) => (
                  <div key={index} className="border-b pb-4">
                    <h3 className="font-medium">{task.task}</h3>
                    <p className="text-sm text-muted-foreground">Frequency: {task.frequency}</p>
                    <p className="mt-2">{task.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceData.troubleshootingSteps.map((step, index) => (
                  <div key={index} className="border-b pb-4">
                    <h3 className="font-medium">{step.issue}</h3>
                    <p className="mt-2">{step.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bill of Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceData.billOfMaterials.map((item, index) => (
                  <div key={index} className="border-b pb-4">
                    <h3 className="font-medium">{item.partName}</h3>
                    <p className="text-sm text-muted-foreground">Part Number: {item.partNumber}</p>
                    {item.supplier && <p className="text-sm text-muted-foreground">Supplier: {item.supplier}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
