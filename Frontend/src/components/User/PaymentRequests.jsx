import React, { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { Button, Spinner } from "@nextui-org/react";
import axiosInstance from "../../utils/axiosInstance";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const PaymentRequests = () => {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const user = useSelector((state) => state.userAuth.user);

  useEffect(() => {
    const fetchPaymentRequests = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data
        const response = await axiosInstance.get(
          "/users/workshops/payment-requests/"
        );
        console.log("fetched requests", response.data);
        setPaymentRequests(response.data.results);
      } catch (error) {
        console.error("Error fetching requests", error);
        toast.error("Failed to fetch payment requests.");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    fetchPaymentRequests();
  }, []);

  const handlePayNow = async (id) => {
    try {
      if (!user || !user.id) {
        toast.error("User is not logged in or invalid user data!");
        return;
      }

      const selectedRequest = paymentRequests.find((req) => req.id === id);
      if (!selectedRequest) {
        throw new Error("Payment request not found");
      }

      const { data } = await axiosInstance.post("/users/create-order/", {
        user_id: user.id,
        service_request_id: selectedRequest.id,
        amount: selectedRequest.total_cost * 100,
      });

      const { order_id } = data;

      const options = {
        key: "rzp_test_Vunq6st6Uq4zxb",
        amount: selectedRequest.total_cost * 100,
        currency: "INR",
        name: "FixnGo",
        description: `Payment for ${selectedRequest.workshop_service_name}`,
        order_id,
        handler: async (response) => {
          try {
            const verifyResponse = await axiosInstance.post(
              "/users/verify-payment/",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }
            );
            if (
              verifyResponse.data.message === "Payment verified successfully."
            ) {
              toast.success("Payment successful!");
              setPaymentRequests((prev) =>
                prev.filter((req) => req.id !== id)
              ); // Remove the paid request
            } else {
              toast.error("Payment verification failed!");
            }
          } catch (error) {
            toast.error("Payment verification failed!");
          }
        },
        prefill: {
          name: user.username || "Customer Name",
          email: user.email || "customer@example.com",
          contact: user.phone || "9999999999",
        },
        theme: {
          color: "#61dafb",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to initiate payment!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Workshop Payment Requests
        </h1>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spinner size="lg" color="primary" />
          </div>
        ) : paymentRequests.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paymentRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">
                    {request.workshop_name}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {request.workshop_service_name}
                  </p>
                  <div className="mb-4">
                    <span className="flex items-center text-2xl font-bold text-gray-800">
                      <MdOutlineCurrencyRupee />
                      {request.total_cost}
                    </span>
                  </div>
                  <Button
                    onPress={() => handlePayNow(request.id)}
                    fullWidth
                    color="primary"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[200px]">
            <p className="text-gray-600">No payment requests available.</p>
          </div>
        )}
      </div>
      <div className="mt-52">
        <Footer />
      </div>
    </div>
  );
};

export default PaymentRequests;
