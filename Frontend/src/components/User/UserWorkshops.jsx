import React from "react";

export default function UserWorkshops() {
  // Mock data for workshops
  const workshops = [
    {
      id: 1,
      name: "Quick Fix Auto",
      description: "Expert in quick repairs and maintenance services.",
      location: "123 Main Street, Cityville",
      contact: "123-456-7890",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      name: "Speedy Lube",
      description: "Specialized in oil changes and battery replacements.",
      location: "456 Elm Street, Townsville",
      contact: "987-654-3210",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      name: "Auto Hub",
      description: "Your one-stop shop for all car repairs.",
      location: "789 Pine Road, Metropolis",
      contact: "555-123-4567",
      image: "https://via.placeholder.com/150",
    },
  ];

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nearby Workshops</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map((workshop) => (
          <div
            key={workshop.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            <img
              src={workshop.image}
              alt={workshop.name}
              className="rounded-t-lg h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800">
                {workshop.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{workshop.description}</p>
              <button
                className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
