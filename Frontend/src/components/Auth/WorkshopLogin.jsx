import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { workshopLogin } from "../../store/workshopAuthSlice";
import { toast } from "sonner";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function WorkshopLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.workshopAuth);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await dispatch(workshopLogin(values)).unwrap();
      toast.success("Login successful!");
      navigate("/workshop/dashboard"); // Redirect on successful login
    } catch (err) {
      console.error("Login failed:", err);

      // Safely extract error message from the backend response
      const errorMessage = err?.error || err?.message || "Login failed";
      console.log("errormessage", errorMessage);

      toast.error(errorMessage); // Display the specific error message
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-2 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white py-4 px-5 shadow sm:rounded-lg">
          <div className="sm:mx-auto sm:w-full sm:max-w-xs">
            <h2 className="mt-2 text-center text-2xl font-bold text-black">
              Workshop Login
            </h2>
            <p className="mt-2 text-center text-xs text-gray-600">
              Log in to access your FixNgo workshop account
            </p>
          </div>

          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-black"
                  >
                    Email address
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
                    htmlFor="password"
                    className="block text-xs font-medium text-black"
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
                      onClick={togglePasswordVisibility}
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
                <div className="text-right mt-1">
                  <Link
                    to="/workshop/forgot-password"
                    className="text-xs text-black hover:text-gray-800 font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                  >
                    {loading ? "Logging in..." : "Log in"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-4">
            <p className="text-center text-xs text-gray-600">
              Don’t have an account?{" "}
              <Link
                to={"/workshop/signup"}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
