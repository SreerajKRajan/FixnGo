import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Card,
  CardBody,
  Pagination,
  Chip,
  Tooltip,
  Spinner,
  Avatar,
  Badge,
} from "@nextui-org/react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../uis/modal";
import { toast } from "sonner";
import axiosInstance from "../../utils/axiosInstance";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export function WorkshopServiceList() {
  const [workshops, setWorkshops] = useState([]);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [itemsPerPage] = useState(5);

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
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch workshops:", error);
        toast.error("Failed to fetch workshops. Please try again.");
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const fetchServicesForWorkshop = async (workshopId, page = 1) => {
    setServicesLoading(true);
    try {
      const response = await axiosInstance.get(
        `/service/workshops-with-pending-services/${workshopId}/`,
        {
          params: {
            page,
            page_size: itemsPerPage,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      setSelectedWorkshop(workshops.find((w) => w.id === workshopId));
      if (Array.isArray(response.data.results)) {
        setServices(response.data.results);
      } else {
        console.error("Unexpected response format:", response.data);
        setServices([]);
      }
      setTotalServices(response.data.count);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      toast.error("Failed to fetch services. Please try again.");
    } finally {
      setServicesLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchServicesForWorkshop(selectedWorkshop.id, page);
  };

  const approveService = async (serviceId) => {
    try {
      await axiosInstance.put(
        `/service/workshop/${serviceId}/approve/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      setTotalServices((prev) => prev - 1);
      toast.success("Service approved successfully.");
    } catch (error) {
      console.error("Failed to approve service:", error);
      toast.error("Failed to approve service. Please try again.");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" label="Loading workshops..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Workshop Service Management
          </h1>
          <p className="text-gray-600 text-lg">
            Manage and review pending workshop services
          </p>
        </div>

        {!selectedWorkshop ? (
          /* Workshop Selection View */
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Select Workshop
                </h2>
                <Badge content={workshops.length} color="primary" size="lg">
                  <Chip color="primary" variant="flat">
                    Total Workshops
                  </Chip>
                </Badge>
              </div>
              
              {workshops.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔧</div>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">
                    No Pending Services
                  </h3>
                  <p className="text-gray-500">
                    All workshop services have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {workshops.map((workshop) => (
                    <Card
                      key={workshop.id}
                      isPressable
                      onPress={() => fetchServicesForWorkshop(workshop.id)}
                      className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-primary-300"
                    >
                      <CardBody className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar
                            name={workshop.name}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                            size="lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {workshop.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 truncate">
                              {workshop.email}
                            </p>
                            <Chip
                              size="sm"
                              color="warning"
                              variant="flat"
                              className="text-xs"
                            >
                              Pending Review
                            </Chip>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ) : (
          /* Services Table View */
          <div className="space-y-6">
            {/* Back Button and Workshop Info */}
            <div className="flex items-center gap-4">
              <Button
                color="primary"
                variant="ghost"
                onPress={() => {
                  setSelectedWorkshop(null);
                  setServices([]);
                  setCurrentPage(1);
                }}
                className="font-medium"
              >
                ← Back to Workshops
              </Button>
              <div className="flex items-center gap-3">
                <Avatar
                  name={selectedWorkshop.name}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedWorkshop.name}
                  </h2>
                  <p className="text-sm text-gray-600">{selectedWorkshop.email}</p>
                </div>
              </div>
            </div>

            {/* Services Table Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardBody className="p-0">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Pending Services
                    </h3>
                    <Chip color="warning" variant="flat">
                      {totalServices} Services
                    </Chip>
                  </div>
                </div>

                {servicesLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Spinner size="lg" label="Loading services..." />
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-medium text-gray-600 mb-2">
                      All Services Reviewed
                    </h3>
                    <p className="text-gray-500">
                      No pending services found for this workshop.
                    </p>
                  </div>
                ) : (
                  <>
                    <Table
                      aria-label="Pending services table"
                      className="table-auto"
                      classNames={{
                        wrapper: "shadow-none border-0",
                        th: "bg-gray-50/50 text-gray-700 font-semibold border-b border-gray-200",
                        td: "border-b border-gray-100 py-4",
                        tbody: "divide-y divide-gray-100",
                      }}
                      removeWrapper
                    >
                      <TableHeader>
                        <TableColumn className="text-left pl-6">SERVICE</TableColumn>
                        <TableColumn className="text-left">DESCRIPTION</TableColumn>
                        <TableColumn className="text-center">PRICE</TableColumn>
                        <TableColumn className="text-center pr-6">ACTIONS</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {services.map((service) => (
                          <TableRow 
                            key={service.id} 
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                  {service.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {service.name}
                                  </p>
                                  <Chip size="sm" color="warning" variant="flat" className="mt-1">
                                    Pending
                                  </Chip>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Tooltip content={service.description} placement="top">
                                <p className="text-gray-600 text-sm max-w-xs cursor-help">
                                  {truncateText(service.description)}
                                </p>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="font-semibold text-gray-900 text-lg">
                                {formatPrice(service.base_price)}
                              </div>
                            </TableCell>
                            <TableCell className="pr-6">
                              <div className="flex justify-center gap-2">
                                <Button
                                  color="success"
                                  size="sm"
                                  variant="flat"
                                  onPress={() => approveService(service.id)}
                                  className="font-medium"
                                >
                                  Approve
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  variant="flat"
                                  onPress={() => {
                                    setSelectedService(service);
                                    setIsModalOpen(true);
                                  }}
                                  className="font-medium"
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {Math.ceil(totalServices / itemsPerPage) > 1 && (
                      <div className="flex justify-center py-6 border-t border-gray-200">
                        <Pagination
                          total={Math.ceil(totalServices / itemsPerPage)}
                          page={currentPage}
                          onChange={handlePageChange}
                          color="primary"
                          size="lg"
                          showControls
                          classNames={{
                            wrapper: "gap-2",
                            item: "w-10 h-10 text-small",
                            cursor: "bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold",
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Rejection Modal */}
        {isModalOpen && (
          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            className="max-w-lg"
          >
            <Formik
              initialValues={{ rejection_reason: "" }}
              validationSchema={Yup.object({
                rejection_reason: Yup.string()
                  .min(10, "Reason must be at least 10 characters")
                  .required("Rejection reason is required"),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await axiosInstance.request({
                    url: `/service/workshop/${selectedService.id}/reject/`,
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                    data: { rejection_reason: values.rejection_reason },
                  });
                  setServices((prev) =>
                    prev.filter((s) => s.id !== selectedService.id)
                  );
                  setTotalServices((prev) => prev - 1);
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
                  <ModalHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-lg">⚠️</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Reject Service
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedService?.name}
                        </p>
                      </div>
                    </div>
                  </ModalHeader>
                  <ModalBody className="py-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Rejection *
                      </label>
                      <Field
                        name="rejection_reason"
                        as="textarea"
                        rows={4}
                        placeholder="Please provide a detailed reason for rejecting this service..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <ErrorMessage
                        name="rejection_reason"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </ModalBody>
                  <ModalFooter className="pt-4">
                    <div className="flex gap-3 w-full">
                      <Button 
                        color="default" 
                        variant="light"
                        onPress={() => setIsModalOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        color="danger" 
                        disabled={isSubmitting}
                        className="flex-1 font-medium"
                      >
                        {isSubmitting ? "Rejecting..." : "Reject Service"}
                      </Button>
                    </div>
                  </ModalFooter>
                </Form>
              )}
            </Formik>
          </Modal>
        )}
      </div>
    </div>
  );
}