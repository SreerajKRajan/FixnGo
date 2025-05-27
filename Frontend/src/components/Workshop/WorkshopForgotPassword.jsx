import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { forgotWorkshopPassword } from "../../store/workshopAuthSlice";
import { Link, useNavigate } from "react-router-dom";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function WorkshopForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(forgotWorkshopPassword(values.email)).unwrap();
      toast.success(
        "Password reset link has been sent to your email. Please check your inbox."
      );
      navigate("/workshop/login");
    } catch (err) {
      console.error("Failed to send reset link:", err);

      const errorMessage =
        err?.error || err?.message || "Failed to send reset link.";
      toast.error(errorMessage);
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
              Forgot Password
            </h2>
            <p className="mt-2 text-center text-xs text-gray-600">
              Enter your email to receive a password reset link
            </p>
          </div>

          <Formik
            initialValues={{
              email: "",
            }}
            validationSchema={ForgotPasswordSchema}
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
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                  >
                    {isSubmitting ? "Sending link..." : "Send Reset Link"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-4">
            <p className="text-center text-xs text-gray-600">
              Remembered your password?{" "}
              <Link
                to={"/workshop/login"}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
