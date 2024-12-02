import React, { useRef, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { otpVerification } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";

const OtpSchema = Yup.object().shape({
  digit1: Yup.number().required("Required"),
  digit2: Yup.number().required("Required"),
  digit3: Yup.number().required("Required"),
  digit4: Yup.number().required("Required"),
});

export default function OtpVerification() {
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, email } = useSelector((state) => state.auth);
  console.log(email, "user's email");
  

  useEffect(() => {
    inputRefs[0].current.focus();
  }, []);

  const handleKeyUp = (index, e) => {
    const currentInput = inputRefs[index].current;
    const nextInput = inputRefs[index + 1]?.current;
    const prevInput = inputRefs[index - 1]?.current;

    if (currentInput.value.length > 1) {
      currentInput.value = currentInput.value.slice(0, 1);
    }

    if (e.key !== "Backspace" && nextInput && currentInput.value !== "") {
      nextInput.focus();
    }

    if (e.key === "Backspace" && prevInput) {
      prevInput.focus();
    }
  };

  const handleSubmit = async (values) => {
    const otp = `${values.digit1}${values.digit2}${values.digit3}${values.digit4}`;
    if (!email){
        console.error("Emails is missing");
        return;
        
    }
    const resultAction = await dispatch(otpVerification({ otp, email }));

    if (otpVerification.fulfilled.match(resultAction)) {
      navigate("/login"); // Navigate to login page upon successful OTP verification
    } else {
      console.error("OTP Verification Failed:", resultAction.payload);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 4-digit code sent to your email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Formik
            initialValues={{ digit1: "", digit2: "", digit3: "", digit4: "" }}
            validationSchema={OtpSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                <div className="flex justify-between">
                  {[1, 2, 3, 4].map((digit, index) => (
                    <div key={digit} className="w-16">
                      <Field
                        name={`digit${digit}`}
                        type="text"
                        maxLength="1"
                        className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-4xl ${
                          errors[`digit${digit}`] && touched[`digit${digit}`]
                            ? "border-red-500"
                            : ""
                        }`}
                        onKeyUp={(e) => handleKeyUp(index, e)}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          ); // Allow only numbers
                        }}
                        innerRef={inputRefs[index]}
                      />

                      {errors[`digit${digit}`] && touched[`digit${digit}`] && (
                        <div className="mt-1 text-xs text-red-500">
                          {errors[`digit${digit}`]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
                {error && (
                  <div className="text-center text-sm text-red-500">
                    {error}
                  </div>
                )}
              </Form>
            )}
          </Formik>
          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150">
                Resend OTP
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
