"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

const AddEquipment = () => {
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [model, setModel] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [installationDate, setInstallationDate] = useState("")
  const [maintenanceSchedule, setMaintenanceSchedule] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        // Set the image preview when the file is read
        setImagePreview(reader.result as string)
      }
      reader.onerror = () => {
        console.error("Error reading file")
        setImagePreview(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    console.log({
      name,
      type,
      manufacturer,
      model,
      serialNumber,
      installationDate,
      maintenanceSchedule,
      location,
      description,
      image: imagePreview, // Include the image data
    })

    // Reset form
    setName("")
    setType("")
    setManufacturer("")
    setModel("")
    setSerialNumber("")
    setInstallationDate("")
    setMaintenanceSchedule("")
    setLocation("")
    setDescription("")
    setImagePreview(null) // Reset image preview

    // Show success message
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Add Equipment</h1>
      {showSuccessMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Equipment added successfully.</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Equipment Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Enter equipment name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Equipment Type</Label>
          <Select onValueChange={setType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Mechanical">Mechanical</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            type="text"
            id="manufacturer"
            placeholder="Enter manufacturer"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input
            type="text"
            id="model"
            placeholder="Enter model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            type="text"
            id="serialNumber"
            placeholder="Enter serial number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="installationDate">Installation Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !installationDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {installationDate ? format(new Date(installationDate), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={installationDate ? new Date(installationDate) : undefined}
                onSelect={(date) => setInstallationDate(date?.toISOString())}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="maintenanceSchedule">Maintenance Schedule</Label>
          <Input
            type="text"
            id="maintenanceSchedule"
            placeholder="Enter maintenance schedule"
            value={maintenanceSchedule}
            onChange={(e) => setMaintenanceSchedule(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            type="text"
            id="location"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Equipment Image</Label>
          <div className="flex items-center gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center w-40 h-40 bg-gray-50">
              {imagePreview ? (
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Equipment preview"
                  className="max-h-full max-w-full object-contain"
                  onError={() => setImagePreview(null)}
                />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Upload image</p>
                </>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Select Image
              </Button>
              {imagePreview && (
                <Button type="button" variant="outline" onClick={handleRemoveImage}>
                  Remove Image
                </Button>
              )}
            </div>
          </div>
        </div>

        <Button type="submit">Add Equipment</Button>
      </form>
    </div>
  )
}

export default AddEquipment
