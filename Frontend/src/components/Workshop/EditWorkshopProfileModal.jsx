import { useFormik } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner";
import React, { useState } from "react";

function WorkshopOtpVerificationModal({ email, onClose, onVerified }) {
  const [otp, setOtp] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [resendLoading, setResendLoading] = React.useState(false);

  const handleOtpSubmit = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("workshop_token");
      const res = await axiosInstance.post("/workshop/verify-email-otp/", {
        email,
        otp,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(res.data.message || "Email verified successfully!");
      onVerified(); // Call parent callback
    } catch (err) {
      toast.error(err.response?.data?.error || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const token = localStorage.getItem("workshop_token");
      await axiosInstance.post("/workshop/resend-email-otp/", { 
        email 
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("OTP resent successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Verify New Email</h2>
        <p className="text-sm mb-4 text-gray-600">
          An OTP was sent to <strong>{email}</strong>. Please enter it below to verify your new email address.
        </p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Enter 4-digit OTP"
          maxLength={4}
          disabled={isLoading}
        />
        
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
          >
            {resendLoading ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleOtpSubmit}
            disabled={isLoading || !otp.trim()}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditWorkshopModal({ workshopData, onClose, onProfileUpdate }) {
  const [previewImage, setPreviewImage] = useState(workshopData?.profile_image || null);
  const [documentName, setDocumentName] = useState("No file chosen");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: workshopData?.name || "",
      email: workshopData?.email || "",
      phone: workshopData?.phone || "",
      location: workshopData?.location || "",
      profileImage: null,
      document: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Workshop name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be 10 digits")
        .required("Phone is required"),
      location: Yup.string().required("Location is required"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("location", values.location);

      if (values.profileImage) {
        formData.append("profile_image", values.profileImage);
      }

      if (values.document) {
        formData.append("document", values.document);
      }

      try {
        const token = localStorage.getItem("workshop_token");
        const response = await axiosInstance.put("/workshop/profile/", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        // Check if email verification is required
        if (response.data.email_verification_required) {
          // Show OTP modal for email verification
          setPendingEmail(values.email);
          setShowOtpModal(true);
          toast.success("Workshop profile updated! Please verify your new email address.");
        } else {
          // No email change, just show success and close
          toast.success(response.data.message || "Workshop profile updated successfully!");
          onProfileUpdate(); // Refetch profile data in parent
          onClose(); // Close the modal
        }
      } catch (error) {
        console.error("Failed to update workshop profile", error.response?.data || error.message);
        const errMsg = 
          error.response?.data?.error || 
          error.response?.data?.message ||
          "Failed to update profile. Please try again.";
        toast.error(errMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      formik.setFieldValue("profileImage", file);
      
      // Create preview for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'image/jpeg', 'image/png'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, DOC, DOCX, JPG, JPEG or PNG files are allowed");
        return;
      }

      formik.setFieldValue("document", file);
      setDocumentName(file.name);
    }
  };

  const handleOtpVerified = () => {
    setShowOtpModal(false);
    toast.success("Email verified successfully! Workshop profile update completed.");
    onProfileUpdate(); // Refetch profile data in parent
    onClose(); // Close the modal
  };

  const handleOtpModalClose = () => {
    setShowOtpModal(false);
    // Email was NOT updated since verification was cancelled
    toast.info("Email verification cancelled. Your email address remains unchanged.");
    onProfileUpdate(); // Refresh data to show current profile (without email change)
    onClose(); // Close the main modal
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-40">
        <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Edit Workshop Profile</h2>
          
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
              {/* Preview Image */}
              {previewImage && (
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
                    <img 
                      src={previewImage} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium">Workshop Name</label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="text-red-500 text-sm">{formik.errors.name}</p>
                ) : null}
              </div>
              
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-red-500 text-sm">{formik.errors.email}</p>
                ) : null}
                {formik.values.email !== workshopData?.email && (
                  <p className="text-amber-600 text-xs mt-1">
                    ⚠️ Changing email will require verification via OTP sent to your new email
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                />
                {formik.touched.phone && formik.errors.phone ? (
                  <p className="text-red-500 text-sm">{formik.errors.phone}</p>
                ) : null}
              </div>
              
              <div>
                <label className="block text-sm font-medium">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                />
                {formik.touched.location && formik.errors.location ? (
                  <p className="text-red-500 text-sm">{formik.errors.location}</p>
                ) : null}
              </div>
              
              <div>
                <label className="block text-sm font-medium">Profile Image</label>
                <div className="mt-1 flex items-center">
                  <label className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg cursor-pointer">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </label>
                  <span className="ml-3 text-sm text-gray-500">
                    {formik.values.profileImage ? formik.values.profileImage.name : "No file chosen"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium">Document</label>
                <div className="mt-1 flex items-center">
                  <label className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg cursor-pointer">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleDocumentChange}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </label>
                  <span className="ml-3 text-sm text-gray-500 truncate max-w-[150px]">
                    {documentName}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formik.isValid}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showOtpModal && (
        <WorkshopOtpVerificationModal
          email={pendingEmail}
          onClose={handleOtpModalClose}
          onVerified={handleOtpVerified}
        />
      )}
    </>
  );
}

export default React.memo(EditWorkshopModal);