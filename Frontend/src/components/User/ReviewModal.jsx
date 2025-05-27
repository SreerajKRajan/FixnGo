import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../uis/modal";
import { Button } from "@nextui-org/react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import axiosInstance from "../../utils/axiosInstance";

const ReviewModal = ({ isOpen, onClose, workshopId, onReviewSubmit, serviceRequest }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setReviewText("");
    }
  }, [isOpen]);

  // Debug log to ensure workshopId is available
  useEffect(() => {
    if (isOpen && workshopId) {
      console.log("Review modal opened for workshop ID:", workshopId);
      console.log("Service request:", serviceRequest);
    }
  }, [isOpen, workshopId, serviceRequest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (reviewText.trim() === "") {
      toast.error("Please enter a review");
      return;
    }
    
    // Validate workshop ID
    if (!workshopId) {
      toast.error("Workshop information is missing");
      console.error("Missing workshop ID for review submission");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare review data
      const reviewData = {
        rating,
        text: reviewText
      };
      
      // Include service request ID if available
      if (serviceRequest && serviceRequest.id) {
        reviewData.service_request_id = serviceRequest.id;
      }
      
      console.log(`Submitting review to /users/workshops/${workshopId}/reviews/`, reviewData);
      
      const response = await axiosInstance.post(
        `/users/workshops/${workshopId}/reviews/`, 
        reviewData
      );
      
      toast.success("Review submitted successfully!");
      
      // Call the callback function with the new review data
      if (onReviewSubmit && typeof onReviewSubmit === 'function') {
        onReviewSubmit(response.data);
      }
      
      // Reset form and close modal
      setRating(0);
      setReviewText("");
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      
      if (error.response?.data?.error) {
        // Show specific error from backend
        toast.error(error.response.data.error);
      } else if (error.response?.status === 400) {
        // Common validation error
        toast.error("You need to complete a service before reviewing. If you've completed a service, try again later.");
      } else if (error.response?.status === 404) {
        toast.error("Workshop not found. Please try again later.");
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if no workshop ID is available
  if (!workshopId && isOpen) {
    console.warn("Attempted to open review modal without workshop ID");
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>How was your experience?</ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {serviceRequest && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700">
                {serviceRequest.workshop_service_name}
              </h3>
              <p className="text-sm text-gray-500">{serviceRequest.workshop_name}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Rating</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none mr-1"
                >
                  {star <= rating ? (
                    <StarIcon className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIconOutline className="h-8 w-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="border rounded w-full p-2 min-h-24"
              placeholder="Share your experience with this workshop..."
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="error" onClick={onClose} disabled={isSubmitting}>
            Maybe Later
          </Button>
          <Button 
            type="submit" 
            color="primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ReviewModal;