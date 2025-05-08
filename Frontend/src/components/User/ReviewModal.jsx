import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../uis/Modal";
import { Button } from "@nextui-org/react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import axiosInstance from "../../utils/axiosInstance";

const ReviewModal = ({ isOpen, onClose, workshopId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    setIsSubmitting(true);
    
    try {
      // Since we don't have a service request ID, the backend will need to handle this
      // You may need to modify your backend to allow reviews without a service request ID
      // or to find a completed service request for the current user and this workshop
      const response = await axiosInstance.post(`/users/workshops/${workshopId}/reviews/`, {
        rating,
        text: reviewText
      });
      
      toast.success("Review submitted successfully!");
      
      // Call the callback function with the new review data
      if (onReviewSubmitted && typeof onReviewSubmitted === 'function') {
        onReviewSubmitted(response.data);
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
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Write a Review</ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
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
            Cancel
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