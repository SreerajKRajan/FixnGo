import React, { useEffect, useState } from "react";
import { Input } from "@/components/uis/Input";
import { Button } from "@/components/uis/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Search } from "lucide-react";
import axiosInstance from "../../../utils/axiosInstance";

export function GlobalServicesTab({ onAddService }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [globalServices, setGlobalServices] = useState([]);
  const [message, setMessage] = useState(""); // New state for message
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/workshop/services/list/", {
          params: { search: searchTerm },
        });
        console.log("API Response:", response.data); // Debug response

        const services = Array.isArray(response.data.admin_services_available)
          ? response.data.admin_services_available
          : [];
        setGlobalServices(services);

        // Check for the message in the API response
        if (response.data.message) {
          setMessage(response.data.message);
        } else {
          setMessage(""); // Clear the message if not present
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchTerm]);

  const removeFromList = (id) => {
    setGlobalServices((prevServices) =>
      prevServices.filter((service) => service.id !== id)
    );
  };

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
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : globalServices.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {globalServices.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
                <CardTitle>{service.base_price}</CardTitle>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={async () => {
                    try {
                      await onAddService(service); // Call the parent function to add the service
                      removeFromList(service.id); // Immediately remove the service from the list
                    } catch (error) {
                      console.error("Error adding service:", error);
                    }
                  }}
                  className="w-full"
                >
                  Add Service
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl font-semibold">
            No services available at the moment
          </p>
          <p className="text-muted-foreground">
            Explore the opportunity to create your own services
          </p>
        </div>
      )}
    </div>
  );
}
