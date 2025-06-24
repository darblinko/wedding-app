"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Wifi, Radio, Bluetooth, Upload, X, Trash2 } from "lucide-react"
import { useBleScanner } from "@/hooks/useBleScanner"
import { useWifiScanner } from "@/hooks/useWifiScanner"
import { useLoRaWANScanner } from "@/hooks/useLoRaWANScanner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface EquipmentOnboardingProps {
  onClose: () => void
  onEquipmentAdded?: (equipmentId: string) => void
}

type SensorType = "temperature" | "humidity" | "pressure" | "current" | "vibration" | "door" | "other"

interface Sensor {
  id: string
  type: SensorType
  name: string
  unit: string
  minRange?: number
  maxRange?: number
  alarmThreshold?: number
}

export function EquipmentOnboarding({ onClose, onEquipmentAdded }: EquipmentOnboardingProps) {
  const [step, setStep] = useState(1)
  const [equipmentType, setEquipmentType] = useState("")
  const [equipmentName, setEquipmentName] = useState("")
  const [equipmentImage, setEquipmentImage] = useState<string | null>(null)
  const [connectionType, setConnectionType] = useState<"ble" | "wifi" | "lorawan" | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [manufacturer, setManufacturer] = useState("")
  const [model, setModel] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [electricalVoltage, setElectricalVoltage] = useState("")
  const [electricalCurrent, setElectricalCurrent] = useState("")
  const [electricalPhase, setElectricalPhase] = useState("single")

  // Sensor management
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [currentSensor, setCurrentSensor] = useState<Sensor>({
    id: "",
    type: "temperature",
    name: "",
    unit: "°C",
  })
  const [editingSensorIndex, setEditingSensorIndex] = useState<number | null>(null)

  const { devices: bleDevices, startScan: startBleScan, stopScan: stopBleScan } = useBleScanner()
  const { networks: wifiNetworks, startScan: startWifiScan, stopScan: stopWifiScan } = useWifiScanner()
  const { gateways, startScan: startLoraScan, stopScan: stopLoraScan } = useLoRaWANScanner()
  const loraGateways = gateways || []

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setEquipmentImage(e.target.result as string)
        }
      }
      reader.onerror = () => {
        console.error("Error reading file")
        alert("Failed to load image. Please try again.")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setEquipmentImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleScan = () => {
    setIsScanning(true)
    if (connectionType === "ble") {
      startBleScan()
    } else if (connectionType === "wifi") {
      startWifiScan()
    } else if (connectionType === "lorawan") {
      startLoraScan()
    }

    // Auto-stop scanning after 10 seconds
    setTimeout(() => {
      setIsScanning(false)
      if (connectionType === "ble") {
        stopBleScan()
      } else if (connectionType === "wifi") {
        stopWifiScan()
      } else if (connectionType === "lorawan") {
        stopLoraScan()
      }
    }, 10000)
  }

  const handleConnect = () => {
    if (!selectedDevice) return

    setIsConnecting(true)

    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false)
      setStep(4) // Move to sensor setup step
    }, 2000)
  }

  const handleAddSensor = () => {
    if (!currentSensor.name) return

    const newSensor = {
      ...currentSensor,
      id: `sensor-${Date.now()}`,
    }

    if (editingSensorIndex !== null) {
      // Update existing sensor
      const updatedSensors = [...sensors]
      updatedSensors[editingSensorIndex] = newSensor
      setSensors(updatedSensors)
      setEditingSensorIndex(null)
    } else {
      // Add new sensor
      setSensors([...sensors, newSensor])
    }

    // Reset current sensor form
    setCurrentSensor({
      id: "",
      type: "temperature",
      name: "",
      unit: "°C",
    })
  }

  const handleEditSensor = (index: number) => {
    setCurrentSensor(sensors[index])
    setEditingSensorIndex(index)
  }

  const handleRemoveSensor = (index: number) => {
    const updatedSensors = [...sensors]
    updatedSensors.splice(index, 1)
    setSensors(updatedSensors)

    // If we're currently editing this sensor, reset the form
    if (editingSensorIndex === index) {
      setCurrentSensor({
        id: "",
        type: "temperature",
        name: "",
        unit: "°C",
      })
      setEditingSensorIndex(null)
    }
  }

  const getDefaultUnitForSensorType = (type: SensorType): string => {
    switch (type) {
      case "temperature":
        return "°C"
      case "humidity":
        return "%"
      case "pressure":
        return "kPa"
      case "current":
        return "A"
      case "vibration":
        return "mm/s"
      case "door":
        return "open/closed"
      default:
        return ""
    }
  }

  const handleSensorTypeChange = (type: SensorType) => {
    setCurrentSensor({
      ...currentSensor,
      type,
      unit: getDefaultUnitForSensorType(type),
    })
  }

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log({
      equipmentType,
      equipmentName,
      manufacturer,
      model,
      serialNumber,
      electrical: {
        voltage: electricalVoltage,
        current: electricalCurrent,
        phase: electricalPhase,
      },
      equipmentImage,
      connectionType,
      selectedDevice,
      sensors,
    })

    // Generate a new equipment ID
    const newEquipmentId = `equipment${Date.now()}`

    // Call the onEquipmentAdded callback if provided
    if (onEquipmentAdded) {
      onEquipmentAdded(newEquipmentId)
    }

    // Close the dialog
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New Equipment</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-auto pr-4 h-full max-h-[calc(85vh-120px)]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equipment-type">Equipment Type</Label>
                <Select value={equipmentType} onValueChange={setEquipmentType}>
                  <SelectTrigger id="equipment-type">
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freezer">Freezer</SelectItem>
                    <SelectItem value="refrigerator">Refrigerator</SelectItem>
                    <SelectItem value="mixer">Mixer</SelectItem>
                    <SelectItem value="oven">Oven</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment-name">Equipment Name</Label>
                <Input
                  id="equipment-name"
                  placeholder="Enter equipment name"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  placeholder="Enter manufacturer name"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="Enter model number"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial-number">Serial Number</Label>
                <Input
                  id="serial-number"
                  placeholder="Enter serial number"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Electrical Specifications</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="voltage" className="text-xs">
                      Voltage (V)
                    </Label>
                    <Input
                      id="voltage"
                      placeholder="e.g., 120, 240"
                      value={electricalVoltage}
                      onChange={(e) => setElectricalVoltage(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="current" className="text-xs">
                      Current (A)
                    </Label>
                    <Input
                      id="current"
                      placeholder="e.g., 15, 30"
                      value={electricalCurrent}
                      onChange={(e) => setElectricalCurrent(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <Label htmlFor="phase" className="text-xs">
                    Phase
                  </Label>
                  <Select value={electricalPhase} onValueChange={setElectricalPhase}>
                    <SelectTrigger id="phase">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Phase</SelectItem>
                      <SelectItem value="three">Three Phase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Equipment Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                    {equipmentImage ? (
                      <>
                        <img
                          src={equipmentImage || "/placeholder.svg"}
                          alt="Equipment"
                          className="h-full w-full object-cover"
                          onError={() => {
                            console.error("Image failed to load")
                            setEquipmentImage(null)
                          }}
                        />
                        <button
                          className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!equipmentType || !equipmentName}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Connection Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Card
                    className={`cursor-pointer ${connectionType === "ble" ? "border-primary" : ""}`}
                    onClick={() => setConnectionType("ble")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <Bluetooth className="h-8 w-8 mb-2" />
                      <span>Bluetooth</span>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer ${connectionType === "wifi" ? "border-primary" : ""}`}
                    onClick={() => setConnectionType("wifi")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <Wifi className="h-8 w-8 mb-2" />
                      <span>Wi-Fi</span>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer ${connectionType === "lorawan" ? "border-primary" : ""}`}
                    onClick={() => setConnectionType("lorawan")}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <Radio className="h-8 w-8 mb-2" />
                      <span>LoRaWAN</span>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!connectionType}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Available Devices</Label>
                  <Button variant="outline" size="sm" onClick={handleScan} disabled={isScanning}>
                    {isScanning ? "Scanning..." : "Scan"}
                  </Button>
                </div>

                <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2">
                  {connectionType === "ble" &&
                    bleDevices.map((device, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-md cursor-pointer ${selectedDevice === device.id ? "bg-primary/10" : "hover:bg-muted"}`}
                        onClick={() => setSelectedDevice(device.id)}
                      >
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground">{device.id}</div>
                      </div>
                    ))}

                  {connectionType === "wifi" &&
                    wifiNetworks.map((network, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-md cursor-pointer ${selectedDevice === network.ssid ? "bg-primary/10" : "hover:bg-muted"}`}
                        onClick={() => setSelectedDevice(network.ssid)}
                      >
                        <div className="font-medium">{network.ssid}</div>
                        <div className="text-sm text-muted-foreground">Signal: {network.signal}%</div>
                      </div>
                    ))}

                  {connectionType === "lorawan" &&
                    loraGateways.map((gateway, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-md cursor-pointer ${selectedDevice === gateway.id ? "bg-primary/10" : "hover:bg-muted"}`}
                        onClick={() => setSelectedDevice(gateway.id)}
                      >
                        <div className="font-medium">{gateway.name}</div>
                        <div className="text-sm text-muted-foreground">{gateway.id}</div>
                      </div>
                    ))}

                  {((connectionType === "ble" && bleDevices.length === 0) ||
                    (connectionType === "wifi" && wifiNetworks.length === 0) ||
                    (connectionType === "lorawan" && loraGateways.length === 0)) && (
                    <div className="p-4 text-center text-muted-foreground">
                      {isScanning ? "Scanning for devices..." : "No devices found. Click Scan to search."}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleConnect} disabled={!selectedDevice || isConnecting}>
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Connection successful</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your equipment has been successfully connected. Now let's set up the sensors.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Sensor Configuration</h3>

                <div className="space-y-3 border rounded-md p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="sensor-type" className="text-xs">
                        Sensor Type
                      </Label>
                      <Select
                        value={currentSensor.type}
                        onValueChange={(value) => handleSensorTypeChange(value as SensorType)}
                      >
                        <SelectTrigger id="sensor-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="temperature">Temperature</SelectItem>
                          <SelectItem value="humidity">Humidity</SelectItem>
                          <SelectItem value="pressure">Pressure</SelectItem>
                          <SelectItem value="current">Current</SelectItem>
                          <SelectItem value="vibration">Vibration</SelectItem>
                          <SelectItem value="door">Door Sensor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="sensor-name" className="text-xs">
                        Sensor Name
                      </Label>
                      <Input
                        id="sensor-name"
                        placeholder="e.g., Main Temperature"
                        value={currentSensor.name}
                        onChange={(e) => setCurrentSensor({ ...currentSensor, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="sensor-unit" className="text-xs">
                        Unit
                      </Label>
                      <Input
                        id="sensor-unit"
                        placeholder="e.g., °C, %, A"
                        value={currentSensor.unit}
                        onChange={(e) => setCurrentSensor({ ...currentSensor, unit: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="min-range" className="text-xs">
                        Min Range
                      </Label>
                      <Input
                        id="min-range"
                        type="number"
                        placeholder="Minimum"
                        value={currentSensor.minRange || ""}
                        onChange={(e) =>
                          setCurrentSensor({
                            ...currentSensor,
                            minRange: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="max-range" className="text-xs">
                        Max Range
                      </Label>
                      <Input
                        id="max-range"
                        type="number"
                        placeholder="Maximum"
                        value={currentSensor.maxRange || ""}
                        onChange={(e) =>
                          setCurrentSensor({
                            ...currentSensor,
                            maxRange: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="alarm-threshold" className="text-xs">
                      Alarm Threshold
                    </Label>
                    <Input
                      id="alarm-threshold"
                      type="number"
                      placeholder="Threshold value for alerts"
                      value={currentSensor.alarmThreshold || ""}
                      onChange={(e) =>
                        setCurrentSensor({
                          ...currentSensor,
                          alarmThreshold: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>

                  <Button onClick={handleAddSensor} disabled={!currentSensor.name} className="w-full">
                    {editingSensorIndex !== null ? "Update Sensor" : "Add Sensor"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Configured Sensors</h4>
                    <Badge>{sensors.length} sensors</Badge>
                  </div>

                  {sensors.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm border rounded-md">
                      No sensors configured yet. Add at least one sensor.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {sensors.map((sensor, index) => (
                        <div key={sensor.id} className="flex items-center justify-between border rounded-md p-2">
                          <div>
                            <div className="font-medium">{sensor.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {sensor.type} • {sensor.unit}
                              {sensor.minRange !== undefined &&
                                sensor.maxRange !== undefined &&
                                ` • Range: ${sensor.minRange} to ${sensor.maxRange}`}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditSensor(index)}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveSensor(index)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={() => setStep(5)}>Next</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Setup complete</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your equipment and sensors have been configured successfully.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Equipment Summary</h3>
                <div className="rounded-md bg-muted p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{equipmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{equipmentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Manufacturer:</span>
                    <span className="font-medium">{manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-medium">{model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serial Number:</span>
                    <span className="font-medium">{serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Electrical:</span>
                    <span className="font-medium">
                      {electricalVoltage}V / {electricalCurrent}A / {electricalPhase === "single" ? "Single" : "Three"}{" "}
                      Phase
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connection:</span>
                    <span className="font-medium">{connectionType?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device ID:</span>
                    <span className="font-medium">{selectedDevice}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Sensors ({sensors.length})</h3>
                <div className="rounded-md bg-muted p-4 space-y-2 max-h-[200px] overflow-y-auto">
                  {sensors.map((sensor) => (
                    <div key={sensor.id} className="border-b pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                      <div className="flex justify-between">
                        <span className="font-medium">{sensor.name}</span>
                        <Badge variant="outline">{sensor.type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Unit: {sensor.unit}
                        {sensor.minRange !== undefined &&
                          sensor.maxRange !== undefined &&
                          ` • Range: ${sensor.minRange} to ${sensor.maxRange}`}
                        {sensor.alarmThreshold !== undefined && ` • Alarm at: ${sensor.alarmThreshold}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep(4)}>
                  Back
                </Button>
                <Button onClick={handleSubmit}>Finish Setup</Button>
              </DialogFooter>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
