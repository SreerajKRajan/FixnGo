import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { PlusCircle } from "lucide-react";
import { ServiceHeader } from "./ServiceHeader";
import { GlobalServicesTab } from "./GlobalServicesTab";
import { MyServicesTab } from "./MyServicesTab";
import { AllServicesTab } from "./AllServicesTab";
import { CustomServiceModal } from "./CustomServiceModal";
import { Toaster } from "@/components/ui/Toaster";
import { useToast } from "@/components/ui/use-toast";
import WorkshopHeader from "@/components/Workshop/WorkshopHeader";
import WorkshopFooter from "@/components/Workshop/WorkshopFooter";

export default function WorkshopServiceManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAddService = () => {
    toast({
      title: "Service added successfully!",
      description: "The service has been added to your list.",
    });
  };

  const handleCreateCustomService = (serviceData) => {
    setIsModalOpen(false);
    toast({
      title: "Custom service submitted for approval",
      description: "We'll review your service and get back to you soon.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Include WorkshopHeader */}
      <WorkshopHeader />

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <ServiceHeader />
        <Tabs defaultValue="all" className="mt-8">
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
          className="fixed bottom-8 right-8 rounded-full shadow-lg"
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

      {/* Include WorkshopFooter */}
      <WorkshopFooter />
    </div>
  );
}
