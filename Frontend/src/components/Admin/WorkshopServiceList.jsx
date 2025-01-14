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
} from "@nextui-org/react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
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
      toast.success("Service approved successfully.");
    } catch (error) {
      console.error("Failed to approve service:", error);
      toast.error("Failed to approve service. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading workshops...</p>;
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Workshop Service Management
      </h2>
      
      {!selectedWorkshop ? (
        <Card className="bg-white">
          <CardBody>
            <h3 className="text-xl font-semibold mb-4">Workshops</h3>
            {workshops.length === 0 ? (
              <p>No workshops with pending services found.</p>
            ) : (
              <div className="space-y-2">
                {workshops.map((workshop) => (
                  <Button
                    key={workshop.id}
                    color="primary"
                    variant="light"
                    className="w-full justify-start"
                    onPress={() => fetchServicesForWorkshop(workshop.id)}
                  >
                    {workshop.name} ({workshop.email})
                  </Button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <div>
          <Button
            color="primary"
            variant="light"
            className="mb-4"
            onPress={() => setSelectedWorkshop(null)}
          >
            ← Back to Workshop List
          </Button>
          
          <Card className="bg-white">
            <CardBody>
              <h3 className="text-xl font-semibold mb-4">
                Pending Services for {selectedWorkshop.name}
              </h3>
              
              {services.length === 0 ? (
                <p>No pending services found.</p>
              ) : (
                <Table
                  aria-label="Pending services table"
                  shadow={true}
                  selectionMode="none"
                  className="max-w-full"
                >
                  <TableHeader>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Description</TableColumn>
                    <TableColumn>Base Price</TableColumn>
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
                          <div className="flex gap-2">
                            <Button
                              color="success"
                              size="sm"
                              onPress={() => approveService(service.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              onPress={() => {
                                setSelectedService(service);
                                setIsModalOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Formik
            initialValues={{ rejection_reason: "" }}
            validationSchema={Yup.object({
              rejection_reason: Yup.string().required("Rejection reason is required"),
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
                setServices((prev) => prev.filter((s) => s.id !== selectedService.id));
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
                    color="danger"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Rejecting..." : "Reject"}
                  </Button>
                  <Button
                    color="default"
                    onPress={() => setIsModalOpen(false)}
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