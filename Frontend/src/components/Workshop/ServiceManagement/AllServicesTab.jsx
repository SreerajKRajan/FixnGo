import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import axiosInstance from "@/utils/axiosInstance"; // Make sure axiosInstance is properly configured

export function AllServicesTab() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get("/workshop/services/list/");
        const {
          admin_services_added,
          workshop_created_services,
        } = response.data;

        // Combine services into one array with a flag for their source and availability
        const allServices = [
          ...admin_services_added.map((service) => ({
            ...service,
            source: "Admin",
            isAvailable: service.is_available, // Use the backend-provided status
          })),
          ...workshop_created_services.map((service) => ({
            ...service,
            source: "Custom",
            isAvailable: service.is_available, // Use the backend-provided status
          })),
        ];

        setServices(allServices);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const toggleAvailability = async (id, isAvailable) => {
    try {
      const response = await axiosInstance.patch(`/workshop/services/${id}/availability/`, {
        is_available: !isAvailable,
      });
      const updatedService = response.data.service;

      setServices((prevServices) =>
        prevServices.map((service) =>
          service.id === id ? { ...service, isAvailable: updatedService.is_available } : service
        )
      );
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  if (loading) {
    return <p className="text-center">Loading services...</p>;
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <img src="/placeholder.svg" alt="No services found" className="mx-auto mb-4 w-48 h-48" />
        <p className="text-xl font-semibold">No services to display</p>
        <p className="text-muted-foreground">Start by adding or adopting services!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {service.name}
              <Badge variant={service.source === "Admin" ? "secondary" : "outline"}>
                {service.source}
              </Badge>
            </CardTitle>
            <CardDescription>{service.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{service.base_price}</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <span
              className={`text-sm font-medium ${
                service.isAvailable ? "text-green-600" : "text-gray-500"
              }`}
            >
              {service.isAvailable ? "Available" : "Unavailable"}
            </span>
            <Switch
              checked={service.isAvailable}
              onCheckedChange={() => toggleAvailability(service.id, service.isAvailable)}
              disabled={service.source === "Admin"}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
