import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/uis/Tabs";
import { Button } from "@/components/ui/Button";
import { PlusCircle } from "lucide-react";
import { ServiceHeader } from "./ServiceHeader";
import { GlobalServicesTab } from "./GlobalServicesTab";
import { MyServicesTab } from "./MyServicesTab";
import { AllServicesTab } from "./AllServicesTab";
import { CustomServiceModal } from "./CustomServiceModal";
import { Toaster } from "@/components/uis/Toaster";
import { useToast } from "@/components/uis/use-toast";
import WorkshopHeader from "@/components/Workshop/WorkshopHeader";
import WorkshopFooter from "@/components/Workshop/WorkshopFooter";
import axiosInstance from "../../../utils/axiosInstance";

export default function WorkshopServiceManagement() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "all";
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleTabChange = (value) => {
    setActiveTab(value);
    localStorage.setItem("activeTab", value);
  };

  const handleAddService = async (service) => {
    try {
      await axiosInstance.post("/workshop/services/", {
        admin_service_id: service.id,
        base_price: 100, // Example data
      });
      toast({
        title: "Service added successfully!",
        description: `The service "${service.name}" has been added to your list.`,
      });
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        variant: "destructive",
        title: "Failed to add service",
        description: "An error occurred while adding the service.",
      });
    }
  };

  const handleCreateCustomService = async (serviceData) => {
    try {
      await axiosInstance.post("/workshop/services/", {
        name: serviceData.serviceName,
        description: serviceData.description,
        base_price: serviceData.price,
      });
      setIsModalOpen(false);
      toast({
        title: "Custom service submitted for approval",
        description: `The service "${serviceData.serviceName}" has been submitted for admin approval.`,
      });
    } catch (error) {
      console.error("Error submitting custom service:", error);
      toast({
        variant: "destructive",
        title: "Failed to submit custom service",
        description: "An error occurred while submitting your service.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <WorkshopHeader />
      <div className="flex-grow container mx-auto px-4 py-8">
        <ServiceHeader />
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="global">Global Services</TabsTrigger>
            <TabsTrigger value="my">My Services</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <AllServicesTab />
          </TabsContent>
          <TabsContent value="global">
            <GlobalServicesTab onAddService={handleAddService} />
          </TabsContent>
          <TabsContent value="my">
            <MyServicesTab />
          </TabsContent>
        </Tabs>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-14 right-2 rounded-full shadow-lg"
          size="lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Service
        </Button>
        <CustomServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateCustomService}
        />
        <Toaster />
      </div>
      <WorkshopFooter />
    </div>
  );
}
