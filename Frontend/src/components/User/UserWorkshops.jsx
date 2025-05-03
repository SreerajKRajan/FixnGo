import React, { useEffect, useState } from "react";
import {
  Button,
  Pagination,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
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

export default function UserWorkshops({
  workshops: propWorkshops,
  userLocation,
  searchQuery: parentSearchQuery,
  setSearchQuery: setParentSearchQuery,
  sortOption: parentSortOption,
  setSortOption: setParentSortOption,
}) {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState({});
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Local search and sorting states - will sync with parent
  const [searchQuery, setSearchQuery] = useState(parentSearchQuery || "");
  const [sortOption, setSortOption] = useState(parentSortOption || "relevance");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Keep local state in sync with parent state
  useEffect(() => {
    if (parentSearchQuery !== undefined && parentSearchQuery !== searchQuery) {
      setSearchQuery(parentSearchQuery);
    }

    if (parentSortOption !== undefined && parentSortOption !== sortOption) {
      setSortOption(parentSortOption);
    }
  }, [parentSearchQuery, parentSortOption]);

  // Effect to fetch workshops based on current state
  useEffect(() => {
    // If we received workshops via props and this is initial render, use them
    if (propWorkshops && propWorkshops.length > 0 && loading) {
      setWorkshops(propWorkshops);

      // Initialize image loading states
      const imageStates = {};
      propWorkshops.forEach((workshop) => {
        imageStates[workshop.id] = true;
      });
      setLoadingImages(imageStates);

      setLoading(false);
      return;
    }

    // If propWorkshops is explicitly null, always fetch from API
    if (propWorkshops === null) {
      // Clear any existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set a new timeout to debounce API calls
      const timeoutId = setTimeout(() => {
        fetchWorkshops(currentPage);
      }, 500);

      setSearchTimeout(timeoutId);
    }

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
        queryParams += `&latitude=${userLocation.lat}&longitude=${userLocation.lng}`;
      }

      // Add sort parameter
      if (sortOption !== "relevance") {
        queryParams += `&sort=${sortOption}`;
      }

      const response = await axiosInstance.get(
        `/users/workshops/list/?${queryParams}`
      );

      const { results, count } = response.data;
      setWorkshops(results);
      setTotalItems(count);

      // Calculate total pages
      const calculatedTotalPages = Math.ceil(count / 6);
      setTotalPages(calculatedTotalPages);

      // Initialize image loading states
      const imageStates = {};
      results.forEach((workshop) => {
        imageStates[workshop.id] = true;
      });
      setLoadingImages(imageStates);
    } catch (error) {
      console.error("Error fetching workshops", error);
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
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of workshops section
    window.scrollTo({
      top: document.getElementById("workshops-section")?.offsetTop || 0,
      behavior: "smooth",
    });
  };

  const handleSearchChange = (e) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    // Update parent state if callback provided
    if (setParentSearchQuery) {
      setParentSearchQuery(newSearchQuery);
    }
    setCurrentPage(1); // Reset to first page
  };

  const handleSortChange = (key) => {
    setSortOption(key);
    // Update parent state if callback provided
    if (setParentSortOption) {
      setParentSortOption(key);
    }
    setCurrentPage(1); // Reset to first page
  };

  // Render shimmer loading state
  if (loading) {
    return (
      <div
        id="workshops-section"
        className="bg-gray-100 p-6 rounded-lg shadow-md"
      >
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
    <div
      id="workshops-section"
      className="bg-gray-100 p-6 rounded-lg shadow-md"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Recommended Workshops
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow md:min-w-[260px] md:max-w-[320px]">
            <Input
              placeholder="Search by workshop name or location..."
              value={searchQuery}
              onChange={handleSearchChange}
              startContent={<Search size={18} />}
              className="w-full placeholder-ellipsis"
              classNames={{
                input: "truncate placeholder:text-ellipsis",
              }}
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
          <p className="text-gray-600 mb-2">
            No workshops found for "
            <span className="font-semibold">{searchQuery}</span>".
            <br />
            Please check the name or location and try again.
          </p>

          {searchQuery && (
            <Button
              className="bg-gray-200 text-gray-800 mt-2"
              onPress={() => {
                setSearchQuery("");
                if (setParentSearchQuery) setParentSearchQuery("");
              }}
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
              cursor: "bg-black text-white",
            }}
          />
        </div>
      )}
    </div>
  );
}
