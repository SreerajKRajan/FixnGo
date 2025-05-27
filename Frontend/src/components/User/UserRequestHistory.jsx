"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  PenToolIcon as ToolIcon,
  CreditCardIcon,
} from "lucide-react";
import { Pagination } from "@nextui-org/react"; // Added Pagination import
import { Link } from "react-router-dom";

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "PENDING":
        return <ClockIcon className="w-4 h-4 mr-1" />;
      case "ACCEPTED":
        return <CheckCircleIcon className="w-4 h-4 mr-1" />;
      case "REJECTED":
        return <XCircleIcon className="w-4 h-4 mr-1" />;
      case "IN_PROGRESS":
        return <ToolIcon className="w-4 h-4 mr-1" />;
      case "COMPLETED":
        return <CheckCircleIcon className="w-4 h-4 mr-1" />;
      case "PAID":
      case "SUCCESS":
        return <CreditCardIcon className="w-4 h-4 mr-1" />;
      case "FAILED":
        return <AlertCircleIcon className="w-4 h-4 mr-1" />;
      default:
        return <ClockIcon className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}
    >
      {getStatusIcon()}
      {status}
    </span>
  );
};

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function UserRequestHistory() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests"); // 'requests' or 'payments'
  const [error, setError] = useState("");

  // Add pagination states
  const [requestsCurrentPage, setRequestsCurrentPage] = useState(1);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);
  const [paymentsCurrentPage, setPaymentsCurrentPage] = useState(1);
  const [paymentsTotalPages, setPaymentsTotalPages] = useState(1);

  // Fetch service requests and payments with pagination
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");

        // Fetch service requests with pagination
        const requestsResponse = await axiosInstance.get(
          `users/service-requests/history/?page=${requestsCurrentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch payments with pagination
        const paymentsResponse = await axiosInstance.get(
          `users/payments/history/?page=${paymentsCurrentPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Payments Response:", paymentsResponse.data);
        console.log("Service Requests Response:", requestsResponse.data);

        setServiceRequests(requestsResponse.data.results || []);
        setPayments(paymentsResponse.data.results || []);

        // Set pagination information
        setRequestsTotalPages(Math.ceil(requestsResponse.data.count / 6)); // Assuming 6 items per page
        setPaymentsTotalPages(Math.ceil(paymentsResponse.data.count / 6)); // Assuming 6 items per page
      } catch (error) {
        console.error("Failed to fetch history", error);
        setError("Failed to load history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [requestsCurrentPage, paymentsCurrentPage, activeTab]); // Add dependencies to reload when pages change

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("requests")}
            className={`${
              activeTab === "requests"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Service Requests
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`${
              activeTab === "payments"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Payment History
          </button>
        </nav>
      </div>

      {/* Service Requests Tab */}
      {activeTab === "requests" && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Service Requests</h3>

          {serviceRequests.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <ToolIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">
                You haven't made any service requests yet.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Service
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Workshop
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Vehicle
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Cost
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {serviceRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.workshop_service_name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {request.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/workshops/${request.workshop}`}>
                            <div className="text-sm text-gray-900">
                              {request.workshop_name}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.vehicle_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={request.status} />
                          {request.payment_status === "PAID" && (
                            <div className="mt-1">
                              <StatusBadge status={request.payment_status} />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.total_cost
                              ? `₹${request.total_cost}`
                              : "Pending"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination for service requests */}
              <div className="flex justify-center mt-4">
                {requestsTotalPages > 1 && (
                  <Pagination
                    total={requestsTotalPages}
                    initialPage={requestsCurrentPage}
                    onChange={(page) => setRequestsCurrentPage(page)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Payment History</h3>

          {payments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">
                You haven't made any payments yet.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Payment ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Service Request
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payment.razorpay_payment_id || "Pending"}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {payment.razorpay_order_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payment.service_request_details
                              ?.workshop_service_name || "Unknown Service"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.service_request_details?.workshop_name ||
                              "Unknown Workshop"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{payment.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payment.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination for payments */}
              <div className="flex justify-center mt-4">
                {paymentsTotalPages > 1 && (
                  <Pagination
                    total={paymentsTotalPages}
                    initialPage={paymentsCurrentPage}
                    onChange={(page) => setPaymentsCurrentPage(page)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
