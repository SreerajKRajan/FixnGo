import React, { useEffect, useState } from "react";
import { Card, Button, Avatar, Spinner } from "@nextui-org/react";
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import Header from "./Header";
import Footer from "./Footer";
import axiosInstance from "../../utils/axiosInstance";
import { Link, useParams } from "react-router-dom";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { IoChatbubbleEllipses } from "react-icons/io5";
import LinkedInMessages from "../Chat/LinkedInMessages";

import { FaVideo } from "react-icons/fa6";

const WorkshopDetailsPage = () => {
  const reviews = [
    { name: "John Doe", rating: 5, text: "Great service! Highly recommended." },
    { name: "Jane Smith", rating: 4, text: "Good experience overall." },
  ];

  const [workshop, setWorkshop] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const { WorkshopId } = useParams();

  const [selectedChat, setSelectedChat] = useState(null);

  const handleChatClick = () => {
    setSelectedChat(workshop); // Set selected workshop to chat
  };

  useEffect(() => {
    const fetchWorkshopDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/users/workshops/${WorkshopId}/`
        );
        setWorkshop(response.data.workshop);
        setServices(response.data.services);
      } catch (error) {
        console.error("Error fetching workshop details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshopDetails();
  }, [WorkshopId]);

  const validationSchema = Yup.object({
    vehicleType: Yup.string().required("Vehicle type is required"),
    description: Yup.string().required("Description is required"),
  });

  const handleRequestService = (service) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("vehicle_type", values.vehicleType);
      formData.append("description", values.description);

      const response = await axiosInstance.post(
        `/users/workshops/${WorkshopId}/services/${selectedService.id}/request/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Service request submitted:", response.data);
      toast.success(
        "Service request submitted successfully! Wait for workshop response."
      );
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting service request:", error);
      alert("Failed to submit service request. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner size="lg" color="primary" />
      </div>
    );

  if (!workshop) return <div>Workshop not found.</div>;

  return (
    <div>
      <Header />

      <div className="container mx-auto px-4 py-8 relative">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{workshop.name}</h1>
          </div>
          <div className="flex items-center mb-2">
            <PhoneIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span>{workshop.phone}</span>
          </div>
          <div className="flex items-center mb-2">
            <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span>{workshop.email}</span>
          </div>
          <div className="flex items-center mb-4">
            <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span>{workshop.location}</span>
            <Button size="sm" color="primary" variant="flat" className="ml-4">
              View on Map
            </Button>
          </div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 ${
                  i < 4 ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-gray-600">(4.0)</span>
          </div>
        </div>

        {/* Fixed Chat and Video Buttons */}
        <div
        className="fixed right-4 bottom-96 flex flex-col space-y-4 z-40"
        style={{ pointerEvents: "auto" }}
      >
        <button
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition duration-300"
          style={{ fontSize: "1.25rem" }}
          onClick={handleChatClick} // Open chat window with this workshop
        >
          <IoChatbubbleEllipses />
        </button>
        <button
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition duration-300"
          style={{ fontSize: "1.25rem" }}
        >
          <FaVideo />
        </button>
      </div>

      {/* Pass selectedChat to LinkedInMessages */}
      <LinkedInMessages newChat={selectedChat} />

        <h2 className="text-2xl font-semibold mb-4">Services Offered</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-4 flex flex-col justify-between h-64"
            >
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-2 line-clamp-3">
                {service.description}
              </p>
              <p className="text-lg font-bold mb-4">{service.bas10e_price}</p>
              <Button
                onClick={() => handleRequestService(service)}
                color="primary"
              >
                Request Service
              </Button>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        <div className="space-y-4 mb-8">
          {reviews.map((review, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center mb-2">
                <Avatar name={review.name} size="sm" className="mr-2" />
                <span className="font-semibold">{review.name}</span>
              </div>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">{review.text}</p>
            </Card>
          ))}
        </div>
        <Button color="primary">Add Review</Button>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader>Request Service</ModalHeader>
        <Formik
          initialValues={{
            vehicleType: "",
            description: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form>
              <ModalBody>
                <div className="mb-4">
                  <label className="block text-gray-700">Vehicle Type</label>
                  <Field
                    name="vehicleType"
                    className="border rounded w-full p-2"
                    placeholder="Type of vehicle"
                  />
                  <ErrorMessage
                    name="vehicleType"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Description</label>
                  <Field
                    as="textarea"
                    name="description"
                    className="border rounded w-full p-2"
                    placeholder="Describe the issue"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="error" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  Submit
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </Modal>

      <Footer />
    </div>
  );
};

export default WorkshopDetailsPage;
