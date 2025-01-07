import React, { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Search } from 'lucide-react'

const globalServices = [
  { id: "1", name: "Oil Change", description: "Basic oil change for all vehicle types" },
  { id: "2", name: "Tire Rotation", description: "Rotate tires to ensure even wear" },
  { id: "3", name: "Brake Inspection", description: "Comprehensive brake system check" },
]

export function GlobalServicesTab({ onAddService }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredServices = globalServices.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search global services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      {filteredServices.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => onAddService(service)} className="w-full">
                  Add Service
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <img src="/placeholder.svg" alt="No services found" className="mx-auto mb-4 w-48 h-48" />
          <p className="text-xl font-semibold">No services found</p>
          <p className="text-muted-foreground">Check back later for new services from the admin.</p>
        </div>
      )}
    </div>
  )
}

