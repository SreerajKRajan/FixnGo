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
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../uis/modal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { IoChatbubbleEllipses } from "react-icons/io5";
import ChatComponent from "../Chat/ChatComponent";
import unavailableImg from "@/assets/unavailable.svg";

// Shimmer loading component
const ShimmerEffect = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const WorkshopDetailsPage = () => {
  const [workshop, setWorkshop] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const { WorkshopId } = useParams();

  const [selectedChat, setSelectedChat] = useState(null);

  const handleChatClick = () => {
    // Get the actual workshop ID 
    const workshopId = workshop?.id || WorkshopId;
    
    if (!workshopId) {
      console.error("No workshop ID available");
      return;
    }
    
    // Format the workshop data to match the chat window's expected props
    const chatData = {
      id: `chat_${workshopId}`, // Format ID as expected by backend
      workshop_details: {
        id: workshopId,
        name: workshop?.name || "Workshop",
        document: workshop?.profile_image || "/default-avatar.png",
      }
    };
    
    console.log("Opening chat with workshop:", chatData);
    setSelectedChat(chatData);
  };

  const handleChatClose = () => {
    setSelectedChat(null);
  };

  useEffect(() => {
    const fetchWorkshopDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/users/workshops/${WorkshopId}/`
        );
        setWorkshop(response.data.workshop);
        setServices(response.data.services);
        
        // Fetch reviews
        await fetchReviews();
      } catch (error) {
        console.error("Error fetching workshop details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshopDetails();
  }, [WorkshopId]);
  
  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get(`/users/workshops/${WorkshopId}/reviews/`);
      setReviews(response.data.reviews);
      setAvgRating(response.data.avg_rating);
      setTotalReviews(response.data.total_reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

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
      toast.error(error.response?.data?.error || "Failed to submit service request");
    }
  };

  // Shimmer loading UI
  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8">
          {/* Workshop Info Shimmer */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <ShimmerEffect className="h-8 w-64" />
            </div>
            <div className="flex items-center mb-2">
              <ShimmerEffect className="h-5 w-5 mr-2 rounded-full" />
              <ShimmerEffect className="h-5 w-32" />
            </div>
            <div className="flex items-center mb-2">
              <ShimmerEffect className="h-5 w-5 mr-2 rounded-full" />
              <ShimmerEffect className="h-5 w-48" />
            </div>
            <div className="flex items-center mb-4">
              <ShimmerEffect className="h-5 w-5 mr-2 rounded-full" />
              <ShimmerEffect className="h-5 w-64" />
              <ShimmerEffect className="h-8 w-24 ml-4 rounded" />
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <ShimmerEffect key={i} className="h-5 w-5 mr-1 rounded-full" />
              ))}
              <ShimmerEffect className="h-5 w-10 ml-2" />
            </div>
          </div>

          {/* Services Section Shimmer */}
          <ShimmerEffect className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-4 flex flex-col justify-between h-64">
                <ShimmerEffect className="h-6 w-3/4 mb-2" />
                <ShimmerEffect className="h-4 w-full mb-1" />
                <ShimmerEffect className="h-4 w-full mb-1" />
                <ShimmerEffect className="h-4 w-2/3 mb-1" />
                <ShimmerEffect className="h-6 w-1/3 mb-4" />
                <ShimmerEffect className="h-10 w-full rounded" />
              </Card>
            ))}
          </div>

          {/* Reviews Section Shimmer */}
          <ShimmerEffect className="h-8 w-32 mb-4" />
          <div className="space-y-4 mb-8">
            {[...Array(2)].map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center mb-2">
                  <ShimmerEffect className="h-8 w-8 rounded-full mr-2" />
                  <ShimmerEffect className="h-5 w-32" />
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <ShimmerEffect key={i} className="h-5 w-5 mr-1 rounded-full" />
                  ))}
                </div>
                <ShimmerEffect className="h-4 w-full mb-1" />
                <ShimmerEffect className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                  i < avgRating ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-gray-600">({avgRating.toFixed(1)}) • {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>

        {/* Fixed Chat Button */}
      <div
        className="fixed right-4 bottom-96 flex flex-col space-y-4 z-40"
        style={{ pointerEvents: "auto" }}
      >
        <button
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition duration-300"
          style={{ fontSize: "1.25rem" }}
          onClick={handleChatClick}
        >
          <IoChatbubbleEllipses />
        </button>
      </div>

      {/* Pass selectedChat to ChatComponent */}
      {selectedChat && (
        <ChatComponent 
          role="user" 
          newChat={selectedChat} 
          onChatClose={handleChatClose} 
        />
      )}

        <h2 className="text-2xl font-semibold mb-4">Services Offered</h2>

        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 py-10">
            <img
              src={unavailableImg}
              alt="No services"
              className="w-40 h-40 mb-4"
            />
            <p className="text-lg font-medium">
              No services available currently.
            </p>
            <p className="text-sm text-gray-400">Please check back later!</p>
          </div>
        ) : (
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
                <p className="text-lg font-bold mb-4">{service.base_price}</p>
                <Button
                  onClick={() => handleRequestService(service)}
                  color="primary"
                >
                  Request Service
                </Button>
              </Card>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        <div className="space-y-4 mb-8">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 py-6">
              <p className="text-lg font-medium">No reviews yet</p>
              <p className="text-sm text-gray-400">Be the first to review this workshop!</p>
            </div>
          ) : (
            reviews.map((review, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center mb-2">
                  <Avatar 
                    name={review.user_name} 
                    src={review.user_image || undefined} 
                    size="sm" 
                    className="mr-2" 
                  />
                  <span className="font-semibold">{review.user_name}</span>
                  <span className="text-gray-400 text-sm ml-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
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
            ))
          )}
        </div>
      </div>

      {/* Service Request Modal */}
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