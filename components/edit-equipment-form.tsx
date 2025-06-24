"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Equipment {
  id: string
  name: string
  model: string
  location: string
  status: "operational" | "warning" | "critical" | "maintenance"
}

export function EditEquipmentForm({ equipment, onSave }: { equipment: Equipment | null; onSave: () => void }) {
  const [editedEquipment, setEditedEquipment] = useState(equipment)

  if (!editedEquipment) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedEquipment({ ...editedEquipment, [name]: value })
  }

  const handleStatusChange = (value: string) => {
    setEditedEquipment({ ...editedEquipment, status: value as Equipment["status"] })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the updated equipment data to your backend
    console.log("Updated equipment:", editedEquipment)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <Input id="name" name="name" value={editedEquipment.name} onChange={handleInputChange} />
      </div>
      <div>
        <label htmlFor="model">Model</label>
        <Input id="model" name="model" value={editedEquipment.model} onChange={handleInputChange} />
      </div>
      <div>
        <label htmlFor="location">Location</label>
        <Input id="location" name="location" value={editedEquipment.location} onChange={handleInputChange} />
      </div>
      <div>
        <label htmlFor="status">Status</label>
        <Select value={editedEquipment.status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Save Changes</Button>
    </form>
  )
}
