import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
} from "@nextui-org/react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../uis/modal";
import axiosInstance from "../../utils/axiosInstance";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { FiEdit } from "react-icons/fi";
import { Pagination } from "@nextui-org/pagination";


export function ServiceList() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() =>{
      // Try to get the page number from localStorage (if any)
  const savedPage = localStorage.getItem("currentPage");
  return savedPage ? parseInt(savedPage) : 1;  // Default to page 1 if not found
  });
  const [totalPages, setTotalPages] = useState(1); // For total pages

  useEffect(() => {
    const fetchServices = async (page = 1) => {
      try {
        const response = await axiosInstance.get(`/service/services/?page=${page}`);
        setServices(response.data.results); // Update the list with current page data
        const totalItems = response.data.count; // Total count of items
        const pageSize = 5; // Number of items per page (set by your backend)
  
        // Calculate the total pages dynamically, ensuring no extra page
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize)); // Ensure at least 1 page
        setTotalPages(totalPages);  // Set total pages
        setLoading(false);  // Set loading to false after data fetch
      } catch (error) {
        console.error("Failed to fetch services:", error);
        toast.error("Failed to fetch services. Please try again.");
        setLoading(false);
      }
    };

    fetchServices(currentPage);
  }, [currentPage]);

  useEffect(() => {
  localStorage.setItem("currentPage", currentPage);
}, [currentPage]);

  const handleAddService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const saveService = async (values, { resetForm }) => {
    try {
      if (selectedService) {
        const response = await axiosInstance.put(
          `/service/services/${selectedService.id}/`,
          values
        );
        setServices((prev) =>
          prev.map((s) => (s.id === selectedService.id ? response.data : s))
        );
        toast.success("Service updated successfully.");
      } else {
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

  const serviceSchema = Yup.object().shape({
    name: Yup.string().required("Service name is required"),
    description: Yup.string()
      .required("Service description is required")
      .max(200, "Description can't exceed 200 characters"),
    base_price: Yup.number()
      .required("Base price is required")
      .min(1, "Base price must be greater than 0"),
  });

  if (loading) {
    return <p>Loading services...</p>;
  }

  if (services.length === 0) {
    return <p>No services found.</p>;
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Service List</h2>
        <Button color="primary" onPress={handleAddService}>
          Add Service
        </Button>
      </div>

      <Table
        aria-label="Service Table"
        shadow={true}
        selectionMode="none"
        className="max-w-full bg-white rounded-lg overflow-hidden shadow-lg"
      >
        <TableHeader>
          <TableColumn>Name</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Base Price</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id} className="hover:bg-gray-100">
              <TableCell className="text-gray-800 font-medium">
                {service.name}
              </TableCell>
              <TableCell className="text-gray-600 max-w-md">
                {service.description}
              </TableCell>
              <TableCell className="text-gray-600">
                ₹{service.base_price}
              </TableCell>
              <TableCell>
                <Chip
                  color={service.status === "available" ? "success" : "danger"}
                >
                  {service.status === "available" ? "Available" : "Unavailable"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <FiEdit
                    className="text-black cursor-pointer"
                    size={27}
                    onClick={() => handleEditService(service)}
                  />
                  <Button
                    color={
                      service.status === "available" ? "danger" : "success"
                    }
                    size="sm"
                    onPress={() => toggleServiceStatus(service)}
                  >
                    {service.status === "available" ? "Block" : "Unblock"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 flex justify-center">
      <Pagination
        total={totalPages}
        initialPage={1}
        page={currentPage}
        onChange={(page) => setCurrentPage(page)}
      />
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
                  <Button type="submit" disabled={isSubmitting} color="success">
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                  <Button color="danger" onPress={() => setIsModalOpen(false)}>
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
