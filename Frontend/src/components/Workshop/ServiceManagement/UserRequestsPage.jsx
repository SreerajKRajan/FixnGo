import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
} from "@nextui-org/react";
import axiosInstance from "../../../utils/axiosInstance";
import { toast } from "sonner";
import { MdOutlineCurrencyRupee, MdClose } from "react-icons/md";
import { FaVideo } from "react-icons/fa6";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { RiFileListLine } from "react-icons/ri";
import WorkshopHeader from "@/components/Workshop/WorkshopHeader";
import WorkshopFooter from "@/components/Workshop/WorkshopFooter";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../store/workshopAuthSlice";

const capitalizeStatus = (status) => {
  if (!status) return "";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const UserRequestsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [additionalCost, setAdditionalCost] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/workshop/login");
  };

  // Prevent back button navigation
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const fetchRequests = async (page) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/workshop/service-requests/list/?page=${page}`
      );
      setRequests(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 5));

      // Update selected request if it's open
      if (selectedRequest) {
        const updatedRequest = response.data.results.find(
          (req) => req.id === selectedRequest.id
        );
        if (updatedRequest) {
          setSelectedRequest(updatedRequest);
        }
      }
    } catch (error) {
      console.error("Error fetching service requests:", error);
      toast.error("Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const updateRequestStatus = async (requestId, status, reason = "") => {
    // Don't close modal immediately - show loading state instead
    const originalRequests = [...requests]; // Keep copy of original state for rollback
    
    // Set optimistic UI update for better UX
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status } : req))
    );
  
    try {
      // Show loading indicator in modal if needed
      // You could add a local loading state here if you want to show a spinner in the modal
      
      // Make API call
      await axiosInstance.post(
        `/workshop/service-requests/${requestId}/update/`,
        { status, rejection_reason: reason }
      );
  
      // On success, close modal and show success message
      closeModal();
      toast.success(`Request ${status} successfully.`);
  
      // Refresh data to ensure everything is in sync
      fetchRequests(currentPage);
    } catch (error) {
      // On error, revert the optimistic update
      setRequests(originalRequests);
      toast.error("Failed to update request status");
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setIsModalOpen(false);
    setAdditionalCost("");
    setShowRejectionInput(false);
    setRejectionReason("");
  };

  const handleSendPaymentRequest = async (requestId) => {
    try {
      const basePrice = selectedRequest?.base_price || 0;
      const additionalCharges = parseFloat(additionalCost) || 0;
      const totalCost = parseFloat(basePrice) + additionalCharges;
  
      if (!totalCost) {
        toast.error("Total cost is missing for this request.");
        return;
      }
  
      // Optimistic UI update
      const originalRequests = [...requests]; // Keep copy for rollback
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "IN_PROGRESS" } : req
        )
      );
  
      // Make API call
      await axiosInstance.post(`/workshop/send-payment-request/`, {
        requestId,
        totalCost,
      });
  
      // Only close modal after successful API call
      closeModal();
      toast.success("Payment request sent successfully.");
      
      // Refresh data
      fetchRequests(currentPage);
    } catch (error) {
      // Revert optimistic update on error
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: req.status } : req
        )
      );
      toast.error("Failed to send payment request.");
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
      <RiFileListLine className="text-gray-400" size={80} />
      <p className="mt-4 text-xl font-medium text-gray-500">
        No service requests found
      </p>
      <p className="mt-2 text-gray-400">
        When new service requests arrive, they will appear here
      </p>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      case "IN_PROGRESS":
        return "bg-yellow-500";
      case "PENDING":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  // Inline shimmer effect rendering
  const renderShimmerEffect = () => (
    <div className="w-full animate-pulse">
      {/* Table Header Shimmer */}
      <div className="flex w-full bg-gray-100 p-4 rounded-t-lg">
        <div className="w-1/6 h-8 bg-gray-200 rounded-md"></div>
        <div className="w-1/6 h-8 bg-gray-200 rounded-md ml-4"></div>
        <div className="w-1/6 h-8 bg-gray-200 rounded-md ml-4"></div>
        <div className="w-1/6 h-8 bg-gray-200 rounded-md ml-4"></div>
        <div className="w-1/6 h-8 bg-gray-200 rounded-md ml-4"></div>
        <div className="w-1/6 h-8 bg-gray-200 rounded-md ml-4"></div>
      </div>
      
      {/* Table Rows Shimmer */}
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex w-full border-b border-gray-200 p-4">
          <div className="w-1/6 h-6 bg-gray-200 rounded-md"></div>
          <div className="w-1/6 h-6 bg-gray-200 rounded-md ml-4"></div>
          <div className="w-1/6 h-6 bg-gray-200 rounded-md ml-4"></div>
          <div className="w-1/6 h-6 bg-gray-200 rounded-md ml-4"></div>
          <div className="w-1/6 h-6 bg-gray-200 rounded-md ml-4"></div>
          <div className="w-1/6 h-6 bg-gray-200 rounded-md ml-4"></div>
        </div>
      ))}
      
      {/* Pagination Shimmer */}
      <div className="flex justify-center mt-4">
        <div className="flex space-x-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="w-8 h-8 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompletedServiceDetails = () => {
    if (!selectedRequest) return null;

    return (
      <div className="mt-3 p-2 border border-gray-200 rounded-md">
        <p className="font-medium text-gray-700">Service Summary</p>
        <p className="text-sm mt-1 text-gray-600">
          Vehicle: {selectedRequest.vehicle_type}
        </p>
        <p className="text-sm mt-1 text-gray-600">
          Service: {selectedRequest.workshop_service_name}
        </p>
        <p className="text-sm mt-1 text-gray-600">
          Customer: {selectedRequest.user_name}
        </p>
        <p className="text-sm mt-1 text-gray-600">
          Completion Date: {new Date().toLocaleDateString()}
        </p>
      </div>
    );
  };

  const renderModalActions = () => {
    if (!selectedRequest) return null;

    const { status, id } = selectedRequest;

    if (status === "PENDING") {
      return (
        <div className="mt-4 space-y-4">
          <div className="flex space-x-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              onClick={() => updateRequestStatus(id, "accepted")}
            >
              Accept Request
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              onClick={() => setShowRejectionInput(true)}
            >
              Reject Request
            </button>
          </div>

          {showRejectionInput && (
            <div className="space-y-2">
              <textarea
                className="w-full border border-gray-300 rounded-md p-2"
                rows={3}
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => updateRequestStatus(id, "rejected", rejectionReason)}
              >
                Confirm Reject
              </button>
            </div>
          )}
        </div>
      );
    }

    // For accepted requests - show payment request form
    if (status === "accepted") {
      return (
        <div className="mt-4">
          <p className="mb-2 flex items-center">
            <strong>Base Price:</strong>&nbsp;
            <MdOutlineCurrencyRupee className="mt-1" />
            {selectedRequest.base_price}
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Additional Charges:
            </label>
            <input
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter additional charges"
              value={additionalCost}
              onChange={(e) => setAdditionalCost(e.target.value)}
            />
          </div>
          <Button
            onPress={() => handleSendPaymentRequest(id)}
            color="primary"
            fullWidth
          >
            Send Payment Request
          </Button>
        </div>
      );
    }

    // For in-progress status - show payment sent and communication options
    if (status === "IN_PROGRESS") {
      return (
        <div className="mt-4 p-3">
          <div className="bg-green-200 p-3 rounded-md text-green-800">
            <p>Payment Request Already Sent</p>
          </div>
        </div>
      );
    }

    // For completed status - show service completion message
    if (status === "completed") {
      return (
        <div className="mt-4 p-3">
          <div className="bg-blue-200 p-3 rounded-md text-blue-800">
            <p className="font-medium">Service Completed</p>
            <p className="text-sm mt-1">
              This service has been successfully completed and payment has been
              processed.
            </p>
          </div>
          {renderCompletedServiceDetails()}
        </div>
      );
    }

    // For rejected status
    if (status === "rejected") {
      return (
        <div className="mt-4 p-3">
          <div className="bg-red-200 p-3 rounded-md text-red-800">
            <p className="font-medium">Request Rejected</p>
            <p className="text-sm mt-1">
              This service request has been rejected.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <WorkshopHeader onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Service Requests
        </h1>

        {loading ? (
          <div className="flex-grow">
            {renderShimmerEffect()}
          </div>
        ) : requests.length > 0 ? (
          <>
            <div className="flex-grow">
              <Table aria-label="Service Requests">
                <TableHeader>
                  <TableColumn>ID</TableColumn>
                  <TableColumn>User</TableColumn>
                  <TableColumn>Service</TableColumn>
                  <TableColumn>Vehicle</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50">
                      <TableCell>{request.id}</TableCell>
                      <TableCell>{request.user_name}</TableCell>
                      <TableCell>{request.workshop_service_name}</TableCell>
                      <TableCell>{request.vehicle_type}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-white ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {capitalizeStatus(request.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          onPress={() => handleViewRequest(request)}
                          color="primary"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex justify-center">
                <Pagination
                  total={totalPages}
                  initialPage={currentPage}
                  onChange={handlePageChange}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow">
            <EmptyState />
          </div>
        )}

        {/* Custom Modal for Request Details */}
        {isModalOpen && selectedRequest && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <MdClose size={24} />
              </button>

              <h2 className="text-xl font-bold mb-4">Request Details</h2>
              <p className="mb-2">
                <strong>User:</strong> {selectedRequest.user_name}
              </p>
              <p className="mb-2">
                <strong>Service:</strong>{" "}
                {selectedRequest.workshop_service_name}
              </p>
              <p className="mb-2">
                <strong>Vehicle:</strong> {selectedRequest.vehicle_type}
              </p>
              <p className="mb-2">
                <strong>Description:</strong> {selectedRequest.description}
              </p>
              <p className="mb-2">
                <strong>Status:</strong>{" "}
                {capitalizeStatus(selectedRequest.status)}
              </p>

              {renderModalActions()}

              {/* Chat component */}
              {/* {selectedRequest.status === "IN_PROGRESS" && (
                <ChatComponent newChat={selectedChat} />
              )} */}
            </div>
          </div>
        )}
      </div>

      <WorkshopFooter />
    </div>
  );
};

export default UserRequestsPage;