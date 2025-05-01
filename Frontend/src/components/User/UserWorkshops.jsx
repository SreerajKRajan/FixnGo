import React, { useEffect, useState } from "react";
import { Button, Pagination, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import axiosInstance from "../../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronDown } from "lucide-react";

// Shimmer Effect Component
const ShimmerEffect = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Workshop Card Shimmer
const WorkshopCardShimmer = () => (
  <div className="bg-white rounded-lg shadow-md">
    <ShimmerEffect className="rounded-t-lg h-48 w-full" />
    <div className="p-4">
      <ShimmerEffect className="h-5 w-3/4 mb-2" />
      <ShimmerEffect className="h-4 w-1/2 mb-4" />
      <ShimmerEffect className="h-10 w-32 rounded-lg" />
    </div>
  </div>
);

export default function UserWorkshops({ workshops: propWorkshops }) {
  const [workshops, setWorkshops] = useState(propWorkshops || []);
  const [loading, setLoading] = useState(
    !propWorkshops || propWorkshops.length === 0
  );
  const [loadingImages, setLoadingImages] = useState({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Search and sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [sortOption, setSortOption] = useState("relevance");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // If workshops are passed as props, use them
    if (propWorkshops && propWorkshops.length > 0) {
      setWorkshops(propWorkshops);

      // Initialize image loading states
      const imageStates = {};
      propWorkshops.forEach((workshop) => {
        imageStates[workshop.id] = true; // Start with all images in loading state
      });
      setLoadingImages(imageStates);

      setLoading(false);
      return;
    }

    // Clear any existing timeout when dependency changes
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout for search to avoid excessive API calls while typing
    const timeoutId = setTimeout(() => {
      fetchWorkshops(currentPage);
    }, 500);

    setSearchTimeout(timeoutId);

    // Cleanup function
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [currentPage, propWorkshops, searchQuery, sortOption, userLocation]);

  const fetchWorkshops = async (page) => {
    setLoading(true);
    try {
      // Build query parameters
      let queryParams = `page=${page}`;
      
      // Add search query if exists
      if (searchQuery) {
        queryParams += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      // Add location for distance-based sorting
      if (sortOption === "distance" && userLocation) {
        queryParams += `&latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
      }
      
      // Add sort parameter
      if (sortOption !== "relevance") {
        queryParams += `&sort=${sortOption}`;
      }
      
      const response = await axiosInstance.get(
        `/users/workshops/list/?${queryParams}`
      );
      console.log("fetched workshops: ", response.data);

      const { results, count } = response.data;
      setWorkshops(results);
      setTotalItems(count);
      
      // Calculate total pages: ceiling of total items divided by page size (6)
      const calculatedTotalPages = Math.ceil(count / 6);
      setTotalPages(calculatedTotalPages);

      // Initialize image loading states
      const imageStates = {};
      results.forEach((workshop) => {
        imageStates[workshop.id] = true; // Start with all images in loading state
      });
      setLoadingImages(imageStates);
    } catch (error) {
      console.log("Error fetching workshops", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image load completion
  const handleImageLoad = (workshopId) => {
    setLoadingImages((prev) => ({
      ...prev,
      [workshopId]: false,
    }));
  };

  // Handle image load error
  const handleImageError = (workshopId) => {
    setLoadingImages((prev) => ({
      ...prev,
      [workshopId]: false,
    }));
    // You could also set a flag to show a placeholder/fallback image
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of workshops section
    window.scrollTo({
      top: document.getElementById('workshops-section')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleSortChange = (key) => {
    setSortOption(key);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Render shimmer loading state
  if (loading) {
    return (
      <div id="workshops-section" className="bg-gray-100 p-6 rounded-lg shadow-md">
        <ShimmerEffect className="h-8 w-64 mb-6" /> {/* Title shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Generate 6 shimmer cards */}
          {[...Array(6)].map((_, index) => (
            <WorkshopCardShimmer key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="workshops-section" className="bg-gray-100 p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Recommended Workshops
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Input
              placeholder="Search workshops..."
              value={searchQuery}
              onChange={handleSearchChange}
              startContent={<Search size={18} />}
              className="w-full"
            />
          </div>
          
          {/* Sort Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat" 
                className="flex items-center gap-1 bg-white"
                endContent={<ChevronDown size={16} />}
              >
                {sortOption === "distance" ? (
                  <>
                    <MapPin size={16} />
                    <span>Distance</span>
                  </>
                ) : sortOption === "name" ? (
                  "Name (A-Z)"
                ) : sortOption === "-created_at" ? (
                  "Newest First"
                ) : (
                  "Relevance"
                )}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Sort options"
              onAction={handleSortChange}
              selectedKeys={[sortOption]}
              selectionMode="single"
            >
              <DropdownItem key="relevance">Relevance</DropdownItem>
              <DropdownItem key="distance" startContent={<MapPin size={16} />}>
                Distance
              </DropdownItem>
              <DropdownItem key="name">Name (A-Z)</DropdownItem>
              <DropdownItem key="-created_at">Newest First</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      
      {workshops.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-2">No workshops match your search criteria.</p>
          {searchQuery && (
            <Button 
              className="bg-gray-200 text-gray-800 mt-2"
              onPress={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative rounded-t-lg h-48 w-full overflow-hidden">
                {/* Shimmer while image loads */}
                {loadingImages[workshop.id] && (
                  <ShimmerEffect className="absolute inset-0 rounded-t-lg h-48 w-full" />
                )}
                <img
                  src={workshop.document}
                  alt={workshop.name}
                  className={`rounded-t-lg h-48 w-full object-cover ${
                    loadingImages[workshop.id] ? "opacity-0" : "opacity-100"
                  } transition-opacity duration-300`}
                  onLoad={() => handleImageLoad(workshop.id)}
                  onError={() => handleImageError(workshop.id)}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  {workshop.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {workshop.location}
                  {workshop.distance && (
                    <span className="ml-2 text-blue-600">
                      ({parseFloat(workshop.distance).toFixed(1)} km)
                    </span>
                  )}
                </p>
                <Button
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm"
                  onPress={() => navigate(`/workshops/${workshop.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination - only show if we have more than one page */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            total={totalPages}
            initialPage={1}
            page={currentPage}
            onChange={handlePageChange}
            size="lg"
            color="default"
            showShadow
            isCompact
            showControls
            classNames={{
              wrapper: "gap-2",
              item: "bg-white text-black hover:bg-gray-200",
              cursor: "bg-black text-white"
            }}
          />
        </div>
      )}
    </div>
  );
}