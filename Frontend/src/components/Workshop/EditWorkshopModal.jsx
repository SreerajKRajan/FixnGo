import { useFormik } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner";
import React, { useState } from "react";

function EditWorkshopModal({ workshopData, onClose, onProfileUpdate }) {
  const [previewImage, setPreviewImage] = useState(workshopData?.profile_image_url || null);
  const [documentName, setDocumentName] = useState("No file chosen");

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
        await axiosInstance.put("/workshop/profile/", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Workshop profile updated successfully!");
        onProfileUpdate(); // Refetch profile data in parent
        onClose(); // Close the modal
      } catch (error) {
        console.error("Failed to update workshop profile", error.response?.data || error.message);
        toast.error(error.response?.data?.error || "Failed to update profile. Please try again.");
      }
    },
  });

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      formik.setFieldValue("document", file);
      setDocumentName(file.name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
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
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                type="text"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                    className="hidden"
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {formik.values.profileImage ? formik.values.profileImage.name : "No file chosen"}
                </span>
              </div>
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
              className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default React.memo(EditWorkshopModal);