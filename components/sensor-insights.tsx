"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Thermometer, Zap, Activity, Waves, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { equipmentData } from "./equipment-list"

type SensorMetric = {
  average: number
  unit: string
  fluctuations: number
  spikes: number
  score: number
  explanation: string
}

type EquipmentSensorData = {
  id: string
  name: string
  temperature: SensorMetric
  energyLoad: SensorMetric
  currentDraw: SensorMetric
  vibration: SensorMetric
  overallScore: number
}

export function SensorInsights({ selectedEquipmentId }: { selectedEquipmentId?: string }) {
  const [sensorData, setSensorData] = useState<EquipmentSensorData[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate mock sensor data for each equipment
  useEffect(() => {
    setIsLoading(true)

    // Generate data for all equipment
    const generatedData: EquipmentSensorData[] = equipmentData.map((equipment) => {
      // Temperature data
      const tempFluctuations = Math.floor(Math.random() * 10) // 0-9 fluctuations
      const tempScore = calculateScore(tempFluctuations, [1, 3, 6])
      const tempExplanation = generateExplanation("temperature", tempFluctuations, tempScore)

      // Energy load data
      const energySpikes = Math.floor(Math.random() * 8) // 0-7 spikes
      const energyScore = calculateScore(energySpikes, [1, 3, 6])
      const energyExplanation = generateExplanation("energy", energySpikes, energyScore)

      // Current draw data
      const currentEfficiency = 50 + Math.floor(Math.random() * 51) // 50-100% efficiency
      const currentScore = calculateEfficiencyScore(currentEfficiency)
      const currentExplanation = generateEfficiencyExplanation(currentEfficiency, currentScore)

      // Vibration data
      const vibrationSpikes = Math.floor(Math.random() * 6) // 0-5 spikes
      const vibrationScore = calculateScore(vibrationSpikes, [0, 2, 4])
      const vibrationExplanation = generateExplanation("vibration", vibrationSpikes, vibrationScore)

      // Calculate overall score (average of all metrics)
      const overallScore = Math.round((tempScore + energyScore + currentScore + vibrationScore) / 4)

      return {
        id: equipment.id,
        name: equipment.name,
        temperature: {
          average: -18 + Math.random() * 5, // -18°C to -13°C
          unit: "°C",
          fluctuations: tempFluctuations,
          spikes: Math.floor(tempFluctuations / 2),
          score: tempScore,
          explanation: tempExplanation,
        },
        energyLoad: {
          average: 2 + Math.random() * 3, // 2-5 kW
          unit: "kW",
          fluctuations: Math.floor(Math.random() * 5),
          spikes: energySpikes,
          score: energyScore,
          explanation: energyExplanation,
        },
        currentDraw: {
          average: 5 + Math.random() * 3, // 5-8 A
          unit: "A",
          fluctuations: Math.floor(Math.random() * 7),
          spikes: Math.floor(Math.random() * 4),
          score: currentScore,
          explanation: currentExplanation,
        },
        vibration: {
          average: Math.random() * 0.5, // 0-0.5 mm/s
          unit: "mm/s",
          fluctuations: Math.floor(Math.random() * 8),
          spikes: vibrationSpikes,
          score: vibrationScore,
          explanation: vibrationExplanation,
        },
        overallScore,
      }
    })

    setSensorData(generatedData)

    // Set initial selected equipment
    if (selectedEquipmentId) {
      setSelectedEquipment(selectedEquipmentId)
    } else if (generatedData.length > 0) {
      setSelectedEquipment(generatedData[0].id)
    }

    setIsLoading(false)
  }, [selectedEquipmentId])

  // Calculate score based on thresholds
  const calculateScore = (value: number, thresholds: number[]): number => {
    if (value <= thresholds[0]) return 100
    if (value <= thresholds[1]) return 80 + Math.floor(Math.random() * 11) // 80-90
    if (value <= thresholds[2]) return 50 + Math.floor(Math.random() * 31) // 50-80
    return Math.max(20, 50 - Math.floor(Math.random() * 31)) // 20-49
  }

  // Calculate score based on efficiency percentage
  const calculateEfficiencyScore = (efficiency: number): number => {
    if (efficiency >= 90) return 100
    if (efficiency >= 80) return 80 + Math.floor(Math.random() * 11) // 80-90
    if (efficiency >= 50) return 50 + Math.floor(Math.random() * 31) // 50-80
    return Math.max(20, 50 - Math.floor(Math.random() * 31)) // 20-49
  }

  // Generate explanation text based on metric type and score
  const generateExplanation = (metricType: string, fluctuations: number, score: number): string => {
    if (score >= 90) {
      return `Excellent ${metricType} stability with minimal fluctuations.`
    } else if (score >= 80) {
      return `Good ${metricType} stability with ${fluctuations} minor fluctuations detected.`
    } else if (score >= 50) {
      return `Moderate ${metricType} instability with ${fluctuations} fluctuations detected.`
    } else {
      return `Critical ${metricType} instability with ${fluctuations} significant fluctuations detected.`
    }
  }

  // Generate explanation text for efficiency
  const generateEfficiencyExplanation = (efficiency: number, score: number): string => {
    if (score >= 90) {
      return `Excellent current efficiency at ${efficiency}%.`
    } else if (score >= 80) {
      return `Good current efficiency at ${efficiency}%, slight optimization possible.`
    } else if (score >= 50) {
      return `Moderate current efficiency at ${efficiency}%, optimization recommended.`
    } else {
      return `Poor current efficiency at ${efficiency}%, immediate attention required.`
    }
  }

  // Get score color class based on score value
  const getScoreColorClass = (score: number): string => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  // Get badge color class based on score value
  const getBadgeColorClass = (score: number): string => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-green-50 text-green-600"
    if (score >= 50) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  // Get progress color class based on score value
  const getProgressColorClass = (score: number): string => {
    if (score >= 90) return "bg-green-500"
    if (score >= 80) return "bg-green-400"
    if (score >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Convert Celsius to Fahrenheit
  const celsiusToFahrenheit = (celsius: number): number => {
    return (celsius * 9) / 5 + 32
  }

  // Get the selected equipment data
  const selectedEquipmentData = sensorData.find((item) => item.id === selectedEquipment)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sensor Insights</CardTitle>
          <CardDescription>Loading sensor data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Sensor Insights</CardTitle>
        <CardDescription>24-hour performance analysis based on sensor data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={selectedEquipment || sensorData[0]?.id} onValueChange={setSelectedEquipment}>
          <TabsList className="mb-4 flex flex-nowrap overflow-x-auto pb-1">
            {sensorData.map((equipment) => (
              <TabsTrigger key={equipment.id} value={equipment.id} className="flex-shrink-0">
                {equipment.name}
                <Badge className={cn("ml-2", getBadgeColorClass(equipment.overallScore))}>
                  {equipment.overallScore}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {sensorData.map((equipment) => (
            <TabsContent key={equipment.id} value={equipment.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Temperature Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Thermometer className="mr-2 h-5 w-5 text-blue-500" />
                        <CardTitle className="text-base">Temperature</CardTitle>
                      </div>
                      <Badge className={getBadgeColorClass(equipment.temperature.score)}>
                        Score: {equipment.temperature.score}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Average</p>
                          <p className="text-lg font-semibold">
                            {equipment.temperature.average.toFixed(1)}°C /{" "}
                            {celsiusToFahrenheit(equipment.temperature.average).toFixed(1)}°F
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fluctuations</p>
                          <p className="text-lg font-semibold">{equipment.temperature.fluctuations}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Performance Score</span>
                          <span className={cn("text-sm font-medium", getScoreColorClass(equipment.temperature.score))}>
                            {equipment.temperature.score}%
                          </span>
                        </div>
                        <Progress
                          value={equipment.temperature.score}
                          className="h-2"
                          indicatorClassName={getProgressColorClass(equipment.temperature.score)}
                        />
                      </div>

                      <div className="text-sm">
                        <div className="flex items-start">
                          <Info className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                          <p>{equipment.temperature.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Energy Load Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-base">Energy Load</CardTitle>
                      </div>
                      <Badge className={getBadgeColorClass(equipment.energyLoad.score)}>
                        Score: {equipment.energyLoad.score}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Average</p>
                          <p className="text-lg font-semibold">
                            {equipment.energyLoad.average.toFixed(1)} {equipment.energyLoad.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Spikes</p>
                          <p className="text-lg font-semibold">{equipment.energyLoad.spikes}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Performance Score</span>
                          <span className={cn("text-sm font-medium", getScoreColorClass(equipment.energyLoad.score))}>
                            {equipment.energyLoad.score}%
                          </span>
                        </div>
                        <Progress
                          value={equipment.energyLoad.score}
                          className="h-2"
                          indicatorClassName={getProgressColorClass(equipment.energyLoad.score)}
                        />
                      </div>

                      <div className="text-sm">
                        <div className="flex items-start">
                          <Info className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                          <p>{equipment.energyLoad.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Draw Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-purple-500" />
                        <CardTitle className="text-base">Current Draw</CardTitle>
                      </div>
                      <Badge className={getBadgeColorClass(equipment.currentDraw.score)}>
                        Score: {equipment.currentDraw.score}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Average</p>
                          <p className="text-lg font-semibold">
                            {equipment.currentDraw.average.toFixed(1)} {equipment.currentDraw.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Efficiency</p>
                          <p className="text-lg font-semibold">{50 + Math.floor(Math.random() * 51)}%</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Performance Score</span>
                          <span className={cn("text-sm font-medium", getScoreColorClass(equipment.currentDraw.score))}>
                            {equipment.currentDraw.score}%
                          </span>
                        </div>
                        <Progress
                          value={equipment.currentDraw.score}
                          className="h-2"
                          indicatorClassName={getProgressColorClass(equipment.currentDraw.score)}
                        />
                      </div>

                      <div className="text-sm">
                        <div className="flex items-start">
                          <Info className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                          <p>{equipment.currentDraw.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vibration Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Waves className="mr-2 h-5 w-5 text-red-500" />
                        <CardTitle className="text-base">Vibration</CardTitle>
                      </div>
                      <Badge className={getBadgeColorClass(equipment.vibration.score)}>
                        Score: {equipment.vibration.score}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Average</p>
                          <p className="text-lg font-semibold">
                            {equipment.vibration.average.toFixed(2)} {equipment.vibration.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Spikes</p>
                          <p className="text-lg font-semibold">{equipment.vibration.spikes}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Performance Score</span>
                          <span className={cn("text-sm font-medium", getScoreColorClass(equipment.vibration.score))}>
                            {equipment.vibration.score}%
                          </span>
                        </div>
                        <Progress
                          value={equipment.vibration.score}
                          className="h-2"
                          indicatorClassName={getProgressColorClass(equipment.vibration.score)}
                        />
                      </div>

                      <div className="text-sm">
                        <div className="flex items-start">
                          <Info className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                          <p>{equipment.vibration.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Overall Performance Summary */}
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Overall Performance Summary</CardTitle>
                    <Badge className={getBadgeColorClass(equipment.overallScore)}>
                      Score: {equipment.overallScore}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Overall Performance Score</span>
                        <span className={cn("text-sm font-medium", getScoreColorClass(equipment.overallScore))}>
                          {equipment.overallScore}%
                        </span>
                      </div>
                      <Progress
                        value={equipment.overallScore}
                        className="h-3"
                        indicatorClassName={getProgressColorClass(equipment.overallScore)}
                      />
                    </div>

                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-start">
                        {equipment.overallScore >= 80 ? (
                          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
                        ) : equipment.overallScore >= 50 ? (
                          <Info className="h-5 w-5 mr-2 mt-0.5 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {equipment.overallScore >= 80
                              ? "Equipment is performing well"
                              : equipment.overallScore >= 50
                                ? "Equipment requires attention"
                                : "Equipment requires immediate maintenance"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {equipment.overallScore >= 80
                              ? "All systems are operating within optimal parameters with minor fluctuations."
                              : equipment.overallScore >= 50
                                ? "Some systems are showing moderate instability. Scheduled maintenance is recommended."
                                : "Multiple systems are showing critical instability. Immediate maintenance is required to prevent failure."}
                          </p>
                          {equipment.overallScore < 80 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Recommended actions:</p>
                              <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                                {equipment.temperature.score < 80 && (
                                  <li>Check temperature control systems and sensors</li>
                                )}
                                {equipment.energyLoad.score < 80 && (
                                  <li>Inspect power supply and energy management systems</li>
                                )}
                                {equipment.currentDraw.score < 80 && (
                                  <li>Evaluate electrical components and connections</li>
                                )}
                                {equipment.vibration.score < 80 && (
                                  <li>Examine mechanical components for wear or misalignment</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
