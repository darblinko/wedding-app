"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Search() {
  const [searchTerm, setSearchTerm] = React.useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", searchTerm)
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full sm:w-64">
      <Input
        type="search"
        placeholder="Search equipment..."
        className="w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button type="submit" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-2">
        <SearchIcon className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}
