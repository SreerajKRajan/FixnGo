import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/uis/table";
import { Button } from "@/components/uis/button";
import { Badge } from "@/components/uis/badge";

export function MyServicesTab() {
  const [approvedServices, setApprovedServices] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get("/workshop/services/list/");
        setApprovedServices(response.data.workshop_services_approved);
        setPendingServices(response.data.workshop_services_pending);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  const toggleAvailability = async (id, isAvailable) => {
    try {
      await axiosInstance.patch(`/workshop/services/${id}/availability/`, {
        is_available: !isAvailable,
      });
      setApprovedServices((prev) =>
        prev.map((service) =>
          service.id === id ? { ...service, is_available: !isAvailable } : service
        )
      );
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  return (
    <>
      {approvedServices.length > 0 || pendingServices.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Availability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvedServices.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>
                  <Badge variant="success">Approved</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toggleAvailability(service.id, service.is_available)
                    }
                  >
                    {service.is_available ? "Available" : "Unavailable"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pendingServices.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                    <span>Pending</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-500">Awaiting Approval</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl font-semibold">No custom services available</p>
          <p className="text-muted-foreground">
            You can start by adding your own unique services!
          </p>
        </div>
      )}
    </>
  );
}
