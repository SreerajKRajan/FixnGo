import React, { useEffect, useState } from "react"
import axiosInstance from "@/utils/axiosInstance" // assuming you have axiosInstance setup
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

export function MyServicesTab() {
  const [services, setServices] = useState([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get("/workshop/services/list/") // adjust the URL
        setServices(response.data.workshop_created_services)
      } catch (error) {
        console.error("Error fetching services:", error)
      }
    }
    fetchServices()
  }, [])

  const toggleAvailability = async (id, isAvailable) => {
    try {
      const response = await axiosInstance.patch(`/workshop/services/${id}/availability/`, {
        is_available: !isAvailable,
      })
      setServices((prevServices) =>
        prevServices.map((service) =>
          service.id === id ? { ...service, is_available: !isAvailable } : service
        )
      )
    } catch (error) {
      console.error("Error updating availability:", error)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Availability</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell>{service.name}</TableCell>
            <TableCell>
              {service.is_approved ? (
                <Badge variant="success">Approved</Badge>
              ) : (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                  <span>Pending</span>
                </div>
              )}
            </TableCell>
            <TableCell>
              {service.is_approved ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toggleAvailability(service.id, service.is_available)
                  }
                >
                  {service.is_available ? "Available" : "Unavailable"}
                </Button>
              ) : (
                <span className="text-gray-500">Awaiting Approval</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
