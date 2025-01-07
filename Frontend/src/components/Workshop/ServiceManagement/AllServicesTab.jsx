import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Switch } from "@/components/ui/Switch"
import { Badge } from "@/components/ui/Badge"

const allServices = [
  { id: "1", name: "Oil Change", type: "Global", description: "Basic oil change for all vehicle types", price: 50, isAvailable: true },
  { id: "2", name: "Tire Rotation", type: "Global", description: "Rotate tires to ensure even wear", price: 30, isAvailable: true },
  { id: "3", name: "Custom Detailing", type: "Custom", description: "Comprehensive car detailing service", price: 150, isAvailable: true },
  { id: "4", name: "Engine Tuning", type: "Custom", description: "Performance tuning for your engine", price: 200, isAvailable: false },
]

export function AllServicesTab() {
  const [services, setServices] = useState(allServices)

  const toggleAvailability = (id) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, isAvailable: !service.isAvailable } : service
    ))
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <img src="/placeholder.svg" alt="No services found" className="mx-auto mb-4 w-48 h-48" />
        <p className="text-xl font-semibold">No services to display</p>
        <p className="text-muted-foreground">Start by adding or adopting services!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {service.name}
              <Badge variant={service.type === "Global" ? "secondary" : "outline"}>
                {service.type}
              </Badge>
            </CardTitle>
            <CardDescription>{service.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${service.price}</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <span className={`text-sm font-medium ${service.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
              {service.isAvailable ? 'Available' : 'Unavailable'}
            </span>
            <Switch
              checked={service.isAvailable}
              onCheckedChange={() => toggleAvailability(service.id)}
              disabled={service.type === "Global"}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

