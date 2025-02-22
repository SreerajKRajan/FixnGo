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
import LinkedInMessages from "../../Chat/LinkedInMessages";

const capitalizeStatus = (status) => {
  if (!status) return "";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const UserRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [additionalCost, setAdditionalCost] = useState("");

  const [selectedChat, setSelectedChat] = useState(null);

  const handleChatClick = () => {
    setSelectedChat(requests); // Set selected workshop to chat
  };

  useEffect(() => {
    const fetchRequests = async (page) => {
      try {
        const response = await axiosInstance.get(
          `/workshop/service-requests/list/?page=${page}`
        );
        console.log("Fetched service requests", response.data);
        setRequests(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 5)); // Assuming 5 items per page
      } catch (error) {
        console.error("Error fetching service requests:", error);
      }
    };
    fetchRequests(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      await axiosInstance.post(
        `/workshop/service-requests/${requestId}/update/`,
        {
          status,
        }
      );
      toast.success(`Request ${status} successfully.`);
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status } : req))
      );
      closeModal(); // Close modal after updating status
    } catch (error) {
      console.error(`Error updating request status: ${error}`);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setIsModalOpen(false);
    setAdditionalCost(""); // Reset additional cost
  };

  const handleSendPaymentRequest = async (requestId) => {
    try {
      const basePrice = selectedRequest?.base_price || 0;
      const additionalCharges = parseFloat(additionalCost) || 0;
      const totalCost = parseFloat(basePrice) + additionalCharges; // Calculate total cost
      console.log("Total cost: ", totalCost);

      if (!totalCost) {
        toast.error("Total cost is missing for this request.");
        return;
      }

      const response = await axiosInstance.post(
        `/workshop/send-payment-request/`,
        {
          requestId,
          totalCost,
        }
      );

      toast.success("Payment request sent successfully.");
      console.log("Payment request response:", response.data);
      closeModal(); // Close modal after sending payment request
    } catch (error) {
      console.error("Error sending payment request:", error);
      toast.error("Failed to send payment request.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Service Requests</h1>

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
                  className={`px-3 py-1 rounded-full text-white ${
                    request.status === "accepted"
                      ? "bg-green-500"
                      : request.status === "rejected"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
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
            {/* Close button */}
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
              <strong>Service:</strong> {selectedRequest.workshop_service_name}
            </p>
            <p className="mb-2">
              <strong>Vehicle:</strong> {selectedRequest.vehicle_type}
            </p>
            <p className="mb-2">
              <strong>Description:</strong> {selectedRequest.description}
            </p>

            {/* Display base price and option to enter total cost */}
            {selectedRequest.status === "accepted" && (
              <>
                <p className="mb-2 flex items-centre">
                  <strong>Base Price:</strong>&nbsp;
                  <MdOutlineCurrencyRupee className="mt-1" />
                  {selectedRequest.base_price}
                </p>

                {/* Form to add total cost */}
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
                  onPress={() => handleSendPaymentRequest(selectedRequest.id)}
                  color="primary"
                  fullWidth
                >
                  Send Payment Request
                </Button>
              </>
            )}

            {/* For IN_PROGRESS status, show requested payment */}
            {selectedRequest.status === "IN_PROGRESS" && (
              <div className="mt-4 p-3">
                {/* Text with background */}
                <div className="bg-green-200 p-3 rounded-md text-green-800">
                  <p>Payment Request Already Sent</p>
                </div>

                {/* Icon Buttons Row centered horizontally */}
                <div className="flex justify-center gap-4 mt-4">
                  {/* Video Call Button */}
                  <button className="text-blue-500 text-2xl hover:text-blue-700 transition">
                    <FaVideo />
                  </button>

                  {/* Chat Button */}
                  <button
                    className="text-gray-800 text-2xl hover:text-gray-900 transition"
                    onClick={handleChatClick}
                  >
                    <IoChatbubbleEllipses />
                  </button>
                </div>
              </div>
            )}
            <LinkedInMessages newChat={selectedChat} />

            <div className="mt-4 flex space-x-4">
              {/* Conditionally render buttons based on the request status */}
              {selectedRequest.status !== "accepted" &&
                selectedRequest.status !== "rejected" &&
                selectedRequest.status !== "IN_PROGRESS" && (
                  <>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                      onClick={() =>
                        updateRequestStatus(selectedRequest.id, "accepted")
                      }
                    >
                      Accept Request
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      onClick={() =>
                        updateRequestStatus(selectedRequest.id, "rejected")
                      }
                    >
                      Reject Request
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRequestsPage;
