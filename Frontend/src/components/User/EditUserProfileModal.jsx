import { useFormik } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner";
import React from "react";

function EditProfileModal({ userData, onClose, onProfileUpdate }) {
  const formik = useFormik({
    initialValues: {
      username: userData?.username || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      profileImage: userData?.profile_image_url || null,
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be 10 digits")
        .required("Phone is required"),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      if (values.profileImage) {
        formData.append("profile_image", values.profileImage);
      }

      try {
        const token = localStorage.getItem("token");
        await axiosInstance.put("/users/profile/", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Profile updated successfully!");
        onProfileUpdate(); // Refetch profile data in parent
        onClose(); // Close the modal
      } catch (error) {
        console.error("Failed to update profile", error.response?.data || error.message);
        toast.error("Failed to update profile. Please try again.");
      }
    },
  });

  const handleFileChange = (e) => {
    formik.setFieldValue("profileImage", e.target.files[0]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              {formik.touched.username && formik.errors.username ? (
                <p className="text-red-500 text-sm">{formik.errors.username}</p>
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
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              {formik.touched.email && formik.errors.email ? (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              ) : null}
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
              <label className="block text-sm font-medium">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
              />
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

export default React.memo(EditProfileModal);
