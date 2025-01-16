import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { workshopSignup } from "../../store/workshopAuthSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import axios from "axios";

const WorkshopSignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Required"),
  location: Yup.string().required("Required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
  document: Yup.mixed()
    .required("Required")
    .test(
      "fileSize",
      "File too large (Max: 2MB)",
      (value) => !value || (value && value.size <= 2 * 1024 * 1024)
    )
    .test(
      "fileType",
      "Unsupported file format",
      (value) =>
        !value ||
        (value &&
          ["application/pdf", "image/jpeg", "image/png"].includes(value.type))
    ),
});

export default function WorkshopSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationError, setLocationError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.workshopAuth);

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Function to validate location via geocoding API (OpenStreetMap/Nominatim)
  const validateLocation = async (location) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: location,
            format: "json",
            addressdetails: 1,
            limit: 1,
          },
        }
      );

      if (response.data.length === 0) {
        setLocationError("Invalid location. Please enter a valid location.");
        return false; // Location is not valid
      }

      // Location is valid
      setLocationError("");
      return true;
    } catch (error) {
      setLocationError("Unable to validate location. Please try again.");
      return false;
    }
  };

  const handleSignup = async (values, { setSubmitting, setFieldError }) => {
    // Validate location before form submission
    const isLocationValid = await validateLocation(values.location);

    if (!isLocationValid) {
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("location", values.location);
    formData.append("password", values.password);
    formData.append("document", values.document);

    dispatch(workshopSignup(formData)).then((response) => {
      if (!response.error) {
        toast.success("Signup successful! Please verify your OTP.");
        navigate("/workshop/otp_verification");
      } else {
        const errors = response.payload?.data || response.payload;

        if (errors && typeof errors === "object") {
          Object.keys(errors).forEach((field) => {
            if (Array.isArray(errors[field])) {
              setFieldError(field, errors[field][0]);
            }
          });
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      }
      setSubmitting(false);
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-2 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white py-4 px-5 shadow sm:rounded-lg">
          <div className="sm:mx-auto sm:w-full sm:max-w-xs">
            <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">
              Join FixNgo as a Workshop
            </h2>
            <p className="mt-2 text-center text-xs text-gray-600">
              Start your journey to serving customers
            </p>
          </div>

          <Formik
            initialValues={{
              name: "",
              email: "",
              phone: "",
              location: "",
              password: "",
              confirmPassword: "",
              document: null,
            }}
            validationSchema={WorkshopSignupSchema}
            onSubmit={handleSignup}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Workshop Name
                  </label>
                  <div className="mt-1">
                    <Field
                      type="text"
                      name="name"
                      id="name"
                      className="appearance-none block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                      placeholder="Workshop Name"
                    />
                  </div>
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="mt-1 text-xs text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="mt-1">
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      className="appearance-none block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                      placeholder="you@example.com"
                    />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-xs text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <Field
                      type="tel"
                      name="phone"
                      id="phone"
                      className="appearance-none block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                      placeholder="1234567890"
                    />
                  </div>
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="mt-1 text-xs text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Location
                  </label>
                  <div className="mt-1">
                    <Field
                      type="text"
                      name="location"
                      id="location"
                      className="appearance-none block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                      placeholder="Enter location"
                    />
                  </div>
                  {locationError && (
                    <div className="mt-1 text-xs text-red-600">
                      {locationError}
                    </div>
                  )}
                  <ErrorMessage
                    name="location"
                    component="div"
                    className="mt-1 text-xs text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="document"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Upload Document
                  </label>
                  <div className="mt-1">
                    <input
                      type="file"
                      name="document"
                      id="document"
                      className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-black file:text-white
                      hover:file:bg-gray-800"
                      onChange={(event) =>
                        setFieldValue("document", event.currentTarget.files[0])
                      }
                    />
                  </div>
                  <ErrorMessage
                    name="document"
                    component="div"
                    className="mt-1 text-xs text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      className="appearance-none block w-full pr-10 px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility("password")}
                    >
                      {!showPassword ? (
                        <EyeSlashIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <EyeIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="mt-1 text-xs text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <Field
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="confirmPassword"
                      className="appearance-none block w-full pr-10 px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        togglePasswordVisibility("confirmPassword")
                      }
                    >
                      {!showConfirmPassword ? (
                        <EyeSlashIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <EyeIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </div>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="mt-1 text-xs text-red-600"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out"
                  >
                    {loading ? "Loading..." : "Sign up"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          <div className="mt-4">
            <p className="text-center text-xs text-gray-600">
              Already have an account?{" "}
              <Link
                to={"/workshop/login"}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
