import React from "react";
import { Tabs as HeroTabs, Tab, Card, CardBody } from "@heroui/react";

export default function Tabs({ activeTab, setActiveTab }) {
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <HeroTabs
      aria-label="User Options"
      selectedKey={activeTab}
      onSelectionChange={handleTabChange}
      className="w-full"
    >
      {/* Map Tab */}
      <Tab key="map" title="Map">
        <Card className="shadow-md">
          <CardBody className="text-gray-700">
            <h2 className="text-xl font-bold mb-2">Explore Nearby Workshops</h2>
            <p>
              Use the map to find workshops near your location. Zoom in to see more details, click
              on workshop markers to view profiles, and get directions to your selected workshop.
            </p>
          </CardBody>
        </Card>
      </Tab>

      {/* Workshops Tab */}
      <Tab key="workshops" title="Workshops">
        <Card className="shadow-md">
          <CardBody className="text-gray-700">
            <h2 className="text-xl font-bold mb-2">Discover Local Workshops</h2>
            <p>
              Browse through a list of workshops in your area. View their profiles, check out
              available services, and find the right one for your needs. Click on a workshop to see
              more details and contact information.
            </p>
          </CardBody>
        </Card>
      </Tab>
    </HeroTabs>
  );
}
