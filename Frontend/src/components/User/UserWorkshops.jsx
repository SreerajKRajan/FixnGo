import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";

export default function UserWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await axiosInstance.get("/users/workshops/list/");
        console.log("fetched workshopss: ", response.data);
        setWorkshops(response.data.results);
      } catch (error) {
        console.log("Error fetching workshops", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshops();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Recommended Workshops
      </h2>
      {workshops.length === 0 ? (
        <p className="text-gray-600">No workshops available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={workshop.document}
                alt={workshop.name}
                className="rounded-t-lg h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  {workshop.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {workshop.location}
                </p>
                <Link to={`/workshops/${workshop.id}`}>
                  <Button className="bg-black text-white px-4 py-2 rounded-lg text-sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
