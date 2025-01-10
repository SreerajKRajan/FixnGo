import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Button } from "../ui/button";
import { toast } from "sonner"; // For notifications
import axiosInstance from "../../utils/axiosInstance";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export function WorkshopServiceList() {
  const [workshops, setWorkshops] = useState([]); // Workshops with pending services
  const [services, setServices] = useState([]); // Services for a selected workshop
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  // Fetch workshops with pending services on component load
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await axiosInstance.get(
          "/service/workshop-services/pending/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        setWorkshops(response.data);
      } catch (error) {
        console.error("Failed to fetch workshops:", error);
        toast.error("Failed to fetch workshops. Please try again.");
      }
    };

    fetchWorkshops();
  }, []);

  // Fetch pending services for a selected workshop
  const fetchServicesForWorkshop = async (workshopId) => {
    try {
      const response = await axiosInstance.get(
        `/service/workshops-with-pending-services/${workshopId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      setSelectedWorkshop(workshops.find((w) => w.id === workshopId));
      setServices(response.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      toast.error("Failed to fetch services. Please try again.");
    }
  };

  // Approve workshop service
  const approveService = async (serviceId) => {
    try {
      await axiosInstance.put(
        `/service/workshop/${serviceId}/approve/`,
        {}, // An empty object for the request body since no data is being sent
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      setServices(
        (prev) => prev.filter((s) => s.id !== serviceId) // Remove the approved service
      );
      toast.success("Service approved successfully.");
    } catch (error) {
      console.error("Failed to approve service:", error);
      toast.error("Failed to approve service. Please try again.");
    }
  };

  // Reject workshop service
  const rejectService = async (reason) => {
    try {
      await axiosInstance.request({
        url: `/service/workshop/${selectedService.id}/reject/`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        data: { rejection_reason: reason }, // Send the rejection reason
      });
      setServices((prev) => prev.filter((s) => s.id !== selectedService.id)); // Remove rejected service
      setIsModalOpen(false);
      toast.success("Service rejected successfully.");
    } catch (error) {
      console.error("Failed to reject service:", error);
      toast.error("Failed to reject service. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Workshop Service Management</h2>
      {!selectedWorkshop ? (
        <div>
          <h3 className="text-lg font-semibold mb-2">Workshops</h3>
          {workshops.length === 0 ? (
            <p>No workshops with pending services found.</p>
          ) : (
            <ul className="list-disc pl-5">
              {workshops.map((workshop) => (
                <li
                  key={workshop.id}
                  className="cursor-pointer text-blue-500 underline"
                  onClick={() => fetchServicesForWorkshop(workshop.id)}
                >
                  {workshop.name} ({workshop.email})
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedWorkshop(null)}
            className="mb-4 text-blue-500 underline"
          >
            Back to Workshop List
          </button>
          <h3 className="text-lg font-semibold mb-2">
            Pending Services for {selectedWorkshop.name}
          </h3>
          {services.length === 0 ? (
            <p>No pending services found.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-200 text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 p-2">Name</th>
                  <th className="border border-gray-200 p-2">Description</th>
                  <th className="border border-gray-200 p-2">Base Price</th>
                  <th className="border border-gray-200 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-2">
                      {service.name}
                    </td>
                    <td className="border border-gray-200 p-2 max-w-xs whitespace-normal break-words">
                      {service.description}
                    </td>
                    <td className="border border-gray-200 p-2">
                      ₹{service.base_price}
                    </td>
                    <td className="border border-gray-200 p-2">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => approveService(service.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedService(service);
                            setIsModalOpen(true);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Formik
            initialValues={{ rejection_reason: "" }}
            validationSchema={Yup.object({
              rejection_reason: Yup.string().required(
                "Rejection reason is required"
              ),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await axiosInstance.request({
                  url: `/service/workshop/${selectedService.id}/reject/`,
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "adminToken"
                    )}`,
                  },
                  data: { rejection_reason: values.rejection_reason },
                });
                setServices(
                  (prev) => prev.filter((s) => s.id !== selectedService.id) // Remove the rejected service
                );
                setIsModalOpen(false);
                toast.success("Service rejected successfully.");
              } catch (error) {
                console.error("Failed to reject service:", error);
                toast.error("Failed to reject service. Please try again.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <ModalHeader>Reject Service</ModalHeader>
                <ModalBody>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">
                      Reason for Rejection
                    </label>
                    <Field
                      name="rejection_reason"
                      as="textarea"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      name="rejection_reason"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    {isSubmitting ? "Rejecting..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </div>
  );
}
