import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import axiosInstance from "../../../utils/axiosInstance";

const UserRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get("/workshop/service-requests/list/");
        console.log("Fetched service requests", response.data)
        setRequests(response.data.results);
      } catch (error) {
        console.error("Error fetching service requests:", error);
      }
    };
    fetchRequests();
  }, []);

  const updateRequestStatus = async (requestId, status) => {
    try {
      await axiosInstance.post(`/workshop/service-requests/${requestId}/update/`, {
        status,
      });
      alert(`Request ${status} successfully.`);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status } : req
        )
      );
    } catch (error) {
      console.error(`Error updating request status: ${error}`);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Service Requests</h1>

      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-3 px-6 font-medium text-gray-600 uppercase tracking-wider">ID</th>
            <th className="py-3 px-6 font-medium text-gray-600 uppercase tracking-wider">User</th>
            <th className="py-3 px-6 font-medium text-gray-600 uppercase tracking-wider">Service</th>
            <th className="py-3 px-6 font-medium text-gray-600 uppercase tracking-wider">Vehicle</th>
            <th className="py-3 px-6 font-medium text-gray-600 uppercase tracking-wider">Status</th>
            <th className="py-3 px-6 font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="py-4 px-6">{request.id}</td>
              <td className="py-4 px-6">{request.user_name}</td>
              <td className="py-4 px-6">{request.workshop_service_name}</td>
              <td className="py-4 px-6">{request.vehicle_type}</td>
              <td className="py-4 px-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    request.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : request.status === "in_progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {request.status}
                </span>
              </td>
              <td className="py-4 px-6">
                <Button
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-black"
                  onClick={() => handleViewRequest(request)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedRequest && (
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Request Details</h2>
          <p className="mb-2">
            <strong>User:</strong> {selectedRequest.user_name}
          </p>
          <p className="mb-2">
            <strong>Service:</strong> {selectedRequest.service_name}
          </p>
          <p className="mb-2">
            <strong>Vehicle:</strong> {selectedRequest.vehicle_type}
          </p>
          <p className="mb-2">
            <strong>Status:</strong> {selectedRequest.status}
          </p>
          <div className="mt-4 flex space-x-4">
            <Button
              color="success"
              onClick={() => {
                updateRequestStatus(selectedRequest.id, "accepted");
                setSelectedRequest(null);
              }}
            >
              Accept Request
            </Button>
            <Button
              color="danger"
              onClick={() => {
                updateRequestStatus(selectedRequest.id, "rejected");
                setSelectedRequest(null);
              }}
            >
              Reject Request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRequestsPage;
