import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FaUser, FaComments, FaVideo } from "react-icons/fa";
import { logout } from "../../store/workshopAuthSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

const WorkshopServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/workshop/login");
  };

  // Formik setup for creating new service
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      base_price: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Service name is required"),
      description: Yup.string().required("Description is required"),
      base_price: Yup.number()
        .required("Base price is required")
        .positive("Price must be a positive number")
        .integer("Price must be an integer"),
    }),
    onSubmit: async (values) => {
      try {
        const token = localStorage.getItem("workshopToken");
        const response = await axiosInstance.post(
          "/workshop/services/",
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setServices([...services, response.data]);
        setIsModalOpen(false); // Close modal on successful creation
        formik.resetForm(); // Reset form fields
      } catch (err) {
        setError("Failed to create service");
      }
    },
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("workshopToken");
        const response = await axiosInstance.get("/workshop/services/list/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setServices(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch services");
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <p>Loading services...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="bg-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FixNgo Workshop</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white">
              <FaComments />
            </button>
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white">
              <FaVideo />
            </button>
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white">
              <FaUser />
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white py-1 px-3 rounded-md hover:bg-gray-600 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto mt-8 px-4">
        <div className="p-6 bg-white shadow-md rounded">
          <h2 className="text-2xl font-bold mb-4">Workshop Services</h2>
          {services.length === 0 ? (
            <p>No services available</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Service Name</th>
                  <th className="border border-gray-300 p-2">Description</th>
                  <th className="border border-gray-300 p-2">Base Price</th>
                  <th className="border border-gray-300 p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2">{service.name}</td>
                    <td className="border border-gray-300 p-2">{service.description}</td>
                    <td className="border border-gray-300 p-2">₹{service.base_price}</td>
                    <td
                      className={`border border-gray-300 p-2 ${
                        service.is_approved
                          ? "text-green-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                      }`}
                    >
                      {service.is_approved ? "Approved" : "Pending Approval"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Create Service Button */}
        <div className="mt-4 text-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Create Service
          </button>
        </div>
      </main>

      {/* Modal for Create Service */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Create New Service</h2>
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2" htmlFor="name">
                  Service Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...formik.getFieldProps("name")}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-600 text-sm">{formik.errors.name}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  {...formik.getFieldProps("description")}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-600 text-sm">{formik.errors.description}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2" htmlFor="base_price">
                  Base Price (₹)
                </label>
                <input
                  type="number"
                  id="base_price"
                  {...formik.getFieldProps("base_price")}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {formik.touched.base_price && formik.errors.base_price && (
                  <div className="text-red-600 text-sm">{formik.errors.base_price}</div>
                )}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 FixNgo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WorkshopServiceList;
