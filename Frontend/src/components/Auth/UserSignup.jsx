import { useState } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { userSignup } from "../../store/userAuthSlice"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode";
import { userGoogleSignup } from "../../store/userAuthSlice"

const SignupSchema = Yup.object().shape({
  username: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
})

export default function UserSignup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.userAuth)

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
  }

  const handleSignup = (values, { setSubmitting, setFieldError }) => {
    const userData = {
      username: values.username,
      email: values.email,
      phone: values.phone,
      password: values.password,
    }

    dispatch(userSignup(userData)).then((response) => {
      console.log("Full Response:", response)
      console.log("Payload:", response.payload)
      console.log("Error:", response.error)

      if (!response.error) {
        toast.success("Signup successful! Please verify your OTP.")
        navigate("/otp_verification")
      } else {
        const errors = response.payload?.data || response.payload
        console.log("Errors from backend:", errors)

        if (errors && typeof errors === "object") {
          Object.keys(errors).forEach((field) => {
            if (Array.isArray(errors[field])) {
              setFieldError(field, errors[field][0])
            }
          })
        } else {
          toast.error("Something went wrong. Please try again.")
        }
      }
      setSubmitting(false)
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-2 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white py-4 px-5 shadow sm:rounded-lg">
          <div className="sm:mx-auto sm:w-full sm:max-w-xs">
            <h2 className="mt-2 text-center text-2xl font-bold text-black">Join FixNgo</h2>
            <p className="mt-2 text-center text-xs text-gray-600">Start your journey to hassle-free repairs</p>
          </div>

                  {/* Replace your custom Google button with the GoogleOAuthProvider and GoogleLogin */}
                  <GoogleOAuthProvider 
        clientId="111926382141-a0gum91dmvct79964hk0rn7b20fpv9pn.apps.googleusercontent.com"
      >
        <div className="mt-4">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              try {
                const decoded = jwtDecode(credentialResponse.credential);
                console.log("Google User:", decoded);
                
                const userData = {
                  credential: credentialResponse.credential,
                  email: decoded.email,
                  username: decoded.name,
                  google_id: decoded.sub,
                  profile_image: decoded.picture,
                };

                dispatch(userGoogleSignup(userData)).then((response) => {
                  if (!response.error) {
                    toast.success("Signup successful! Redirecting...");
                    navigate("/home"); // Change as per your routing
                  } else {
                    toast.error("Signup failed. Try again.");
                  }
                }).catch((error) => {
                  console.error("Google Signup Error:", error);
                  toast.error("Signup failed. Try again.");
                });
              } catch (error) {
                console.error("Decoding error:", error);
                toast.error("Google Signup Failed");
              }
            }}
            onError={() => {
              toast.error("Google Signup Failed");
            }}
          />
        </div>
      </GoogleOAuthProvider>

          {/* Google Sign Up Button */}
          {/* <div className="mt-4">
            <button
              type="button"
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign up with Google
            </button>
          </div> */}

          {/* Separator */}
          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-xs text-gray-500">Or</span>
            </div>
          </div>

          <Formik
            initialValues={{
              username: "",
              email: "",
              phone: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={SignupSchema}
            onSubmit={handleSignup}
          >
            {({ isSubmitting }) => (
              <Form className="mt-4 space-y-4">
                <div>
                  <label htmlFor="username" className="block text-xs font-medium text-black">
                    Username
                  </label>
                  <div className="mt-1">
                    <Field
                      type="text"
                      name="username"
                      id="username"
                      className="appearance-none block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                      placeholder="johndoe"
                    />
                  </div>
                  <ErrorMessage name="username" component="div" className="mt-1 text-xs text-red-600" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-black">
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
                  <ErrorMessage name="email" component="div" className="mt-1 text-xs text-red-600" />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-black">
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
                  <ErrorMessage name="phone" component="div" className="mt-1 text-xs text-red-600" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-black">
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
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="mt-1 text-xs text-red-600" />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-black">
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
                      onClick={() => togglePasswordVisibility("confirmPassword")}
                    >
                      {!showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-xs text-red-600" />
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
              <Link to={"/login"} className="font-medium text-black hover:text-gray-800">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

