import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Button } from "../ui/button";
import { toast } from "sonner"; // For notifications
import axiosInstance from "../../utils/axiosInstance";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export function ServiceList() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

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

    fetchServices();
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

  const toggleServiceStatus = async (service) => {
    try {
      const newStatus =
        service.status === "available" ? "unavailable" : "available";
      await axiosInstance.patch(`/service/services/${service.id}/`, {
        status: newStatus,
      });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, status: newStatus } : s))
      );
      toast.success(`Service marked as ${newStatus}.`);
    } catch (error) {
      console.error("Failed to update service status:", error);
      toast.error("Failed to update service status. Please try again.");
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
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-200 p-2">Name</th>
            <th className="border border-gray-200 p-2">Description</th>
            <th className="border border-gray-200 p-2">Base Price</th>
            <th className="border border-gray-200 p-2">Status</th>
            <th className="border border-gray-200 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="hover:bg-gray-50">
              <td className="border border-gray-200 p-2">{service.name}</td>
              <td
                className="border border-gray-200 p-2 max-w-sm whitespace-normal break-words"
              >
                {service.description}
              </td>
              <td className="border border-gray-200 p-2">₹{service.base_price}</td>
              <td className="border border-gray-200 p-2 capitalize">
                {service.status}
              </td>
              <td className="border border-gray-200 p-2">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                  <button
                    onClick={() => handleEditService(service)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleServiceStatus(service)}
                    className={`px-3 py-1 rounded-md text-white transition duration-200 ${
                      service.status === "available"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {service.status === "available"
                      ? "Mark Unavailable"
                      : "Mark Available"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>      
      )}
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
    </div>
  );
}
