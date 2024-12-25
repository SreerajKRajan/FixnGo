import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "./ui/Modal";
import { Button } from "./ui/button";
import { toast } from "sonner"; // For notifications
import axiosInstance from "../../utils/axiosInstance";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export function ServiceList() {
  const [services, setServices] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Fetch services on component load
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get("/service/services/");
        setServices(response.data);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        toast.error("Failed to fetch services. Please try again.");
      }
    };

    const fetchPendingServices = async () => {
      try {
        const response = await axiosInstance.get("/service/pending-services/"); // Adjust endpoint as needed
        setPendingServices(response.data);
      } catch (error) {
        console.error("Failed to fetch pending services:", error);
        toast.error("Failed to fetch pending services. Please try again.");
      }
    };

    fetchServices();
    fetchPendingServices();
  }, []);

  // Open Add Service Modal
  const handleAddService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  // Open Edit Service Modal
  const handleEditService = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Handle Save Service (Add/Edit)
  const saveService = async (values, { resetForm }) => {
    try {
      if (selectedService) {
        // Update service
        const response = await axiosInstance.put(
          `/service/services/${selectedService.id}/`,
          values
        );
        setServices((prev) =>
          prev.map((s) => (s.id === selectedService.id ? response.data : s))
        );
        toast.success("Service updated successfully.");
      } else {
        // Add new service
        const response = await axiosInstance.post("/service/services/", values);
        setServices((prev) => [...prev, response.data]);
        toast.success("Service added successfully.");
      }
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save service:", error);
      toast.error("Failed to save service. Please try again.");
    }
  };

  // Open Delete Confirmation Modal
  const handleDeleteService = (service) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Service
  const confirmDeleteService = async () => {
    try {
      await axiosInstance.delete(`/service/services/${serviceToDelete.id}/`);
      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      toast.success("Service deleted successfully.");
    } catch (error) {
      console.error("Failed to delete service:", error);
      toast.error("Failed to delete service. Please try again.");
    }
  };

  // Approve or Reject Service
  const handleApproveService = async (serviceId) => {
    try {
      await axiosInstance.put(`/service/approve-service/${serviceId}/`);
      setPendingServices((prev) =>
        prev.filter((s) => s.id !== serviceId)
      );
      toast.success("Service approved successfully.");
    } catch (error) {
      console.error("Failed to approve service:", error);
      toast.error("Failed to approve service. Please try again.");
    }
  };

  const handleRejectService = async (serviceId) => {
    try {
      await axiosInstance.put(`/service/reject-service/${serviceId}/`);
      setPendingServices((prev) =>
        prev.filter((s) => s.id !== serviceId)
      );
      toast.success("Service rejected successfully.");
    } catch (error) {
      console.error("Failed to reject service:", error);
      toast.error("Failed to reject service. Please try again.");
    }
  };

  // Formik validation schema
  const serviceSchema = Yup.object().shape({
    name: Yup.string().required("Service name is required"),
    description: Yup.string()
      .required("Service description is required")
      .max(200, "Description can't exceed 200 characters"),
    base_price: Yup.number()
      .required("Base price is required")
      .min(1, "Base price must be greater than 0"),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Service List</h2>
        <Button
          onClick={handleAddService}
          className="bg-black text-white font-semibold px-4 py-2 rounded-md shadow-md hover:bg-gray-800 transition duration-200 ease-in-out"
        >
          Add Service
        </Button>
      </div>
      {services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200 text-center">
          <thead>
            <tr>
              <th className="border border-gray-200 p-2">Name</th>
              <th className="border border-gray-200 p-2">Description</th>
              <th className="border border-gray-200 p-2">Base Price</th>
              <th className="border border-gray-200 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td className="border border-gray-200 p-2">{service.name}</td>
                <td className="border border-gray-200 p-2">
                  {service.description}
                </td>
                <td className="border border-gray-200 p-2">
                  ₹{service.base_price}
                </td>
                <td className="border border-gray-200 p-2">
                  <Button
                    onClick={() => handleEditService(service)}
                    className="mr-2 bg-blue-500 text-white px-2 py-1 rounded-md"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteService(service)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pending Services Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Pending Services for Approval</h3>
        {pendingServices.length === 0 ? (
          <p>No services awaiting approval.</p>
        ) : (
          <ul className="space-y-4">
            {pendingServices.map((service) => (
              <li key={service.id} className="flex justify-between items-center border p-4 rounded-md">
                <div>
                  <p className="font-bold">{service.name}</p>
                  <p>{service.description}</p>
                </div>
                <div className="space-x-4">
                  <Button
                    onClick={() => handleApproveService(service.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRejectService(service.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Formik
            initialValues={{
              name: selectedService?.name || "",
              description: selectedService?.description || "",
              base_price: selectedService?.base_price || "",
            }}
            validationSchema={serviceSchema}
            onSubmit={saveService}
          >
            {({ isSubmitting }) => (
              <Form>
                <ModalHeader>
                  {selectedService ? "Edit Service" : "Add Service"}
                </ModalHeader>
                <ModalBody>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">
                      Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">
                      Description
                    </label>
                    <Field
                      name="description"
                      as="textarea"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">
                      Base Price
                    </label>
                    <Field
                      name="base_price"
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <ErrorMessage
                      name="base_price"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
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

      {deleteModalOpen && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
        >
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            Are you sure you want to delete the service{" "}
            <strong>{serviceToDelete?.name}</strong>?
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={confirmDeleteService}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Delete
            </Button>
            <Button
              onClick={() => setDeleteModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
