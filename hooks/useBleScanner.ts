"use client"

import { useState, useCallback } from "react"

type BleDevice = {
  id: string
  name: string
  signal?: number
}

export function useBleScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<BleDevice[]>([])

  const startScan = useCallback(() => {
    setIsScanning(true)
    // Simulate finding BLE devices
    setTimeout(() => {
      setDevices([
        { id: "ble-001", name: "Temperature Sensor 1", signal: 90 },
        { id: "ble-002", name: "Humidity Sensor 2", signal: 75 },
        { id: "ble-003", name: "Pressure Sensor 3", signal: 60 },
      ])
    }, 2000)
  }, [])

  const stopScan = useCallback(() => {
    setIsScanning(false)
    // Implement BLE scan stop logic here
    console.log("Stopping BLE scan...")
  }, [])

  return { isScanning, devices, startScan, stopScan }
}
