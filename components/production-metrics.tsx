import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProductionMetricsProps {
  productionMetrics: {
    target: number
    actual: number
    efficiency: number
    downtime: number
    quality: number
  }
  className?: string
}

const ProductionMetrics: React.FC<ProductionMetricsProps> = ({ productionMetrics, className = "" }) => {
  return (
    <Card className={`col-span-1 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>Production Metrics</CardTitle>
        <CardDescription>Current production performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Production Efficiency</span>
              <span className="text-sm font-medium">{productionMetrics.efficiency}%</span>
            </div>
            <Progress value={productionMetrics.efficiency} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Target: {productionMetrics.target} units</span>
              <span>Actual: {productionMetrics.actual} units</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Quality Rate</span>
              <span className="text-sm font-medium">{productionMetrics.quality}%</span>
            </div>
            <Progress value={productionMetrics.quality} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Downtime</span>
              <span className="text-sm font-medium">{productionMetrics.downtime} minutes</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-gray-100 p-3 rounded-md">
                <div className="text-2xl font-bold">{productionMetrics.efficiency}%</div>
                <div className="text-xs text-muted-foreground">Efficiency</div>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <div className="text-2xl font-bold">{productionMetrics.quality}%</div>
                <div className="text-xs text-muted-foreground">Quality</div>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <div className="text-2xl font-bold">
                  {Math.round((productionMetrics.actual / productionMetrics.target) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Target</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Production Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Production Rate</div>
                <div className="text-lg font-semibold">
                  {Math.round(productionMetrics.actual / (24 - productionMetrics.downtime / 60))} units/hr
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Completion</div>
                <div className="text-lg font-semibold">
                  {Math.round((productionMetrics.actual / productionMetrics.target) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { ProductionMetrics }
