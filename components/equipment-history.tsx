import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Equipment {
  id: string
  name: string
  // Add other properties as needed
}

export function EquipmentHistory({ equipment }: { equipment: Equipment | null }) {
  if (!equipment) return null

  // This is mock data. In a real application, you would fetch this data from your backend.
  const historyData = [
    { type: "Alert", timestamp: new Date("2023-05-01T10:30:00"), description: "High temperature detected" },
    { type: "Maintenance", timestamp: new Date("2023-04-15T09:00:00"), description: "Routine maintenance performed" },
    { type: "Alert", timestamp: new Date("2023-03-22T14:45:00"), description: "Low pressure warning" },
    // Add more history items as needed
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {historyData.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.timestamp.toLocaleString()}</TableCell>
            <TableCell>{item.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
