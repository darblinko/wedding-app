"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Site = {
  id: string
  name: string
}

const sites: Site[] = [
  { id: "site1", name: "Factory A" },
  { id: "site2", name: "Factory B" },
  { id: "site3", name: "Warehouse C" },
]

export function SiteSelector({ onSiteChange }: { onSiteChange: (siteId: string) => void }) {
  const [selectedSite, setSelectedSite] = useState(sites[0].id)

  const handleSiteChange = (siteId: string) => {
    setSelectedSite(siteId)
    onSiteChange(siteId)
  }

  return (
    <Select value={selectedSite} onValueChange={handleSiteChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select site" />
      </SelectTrigger>
      <SelectContent>
        {sites.map((site) => (
          <SelectItem key={site.id} value={site.id}>
            {site.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
