export default function MapPlaceholder() {
  return (
    <div className="bg-black text-white rounded-lg shadow-md p-1 h-96"> {/* Set background to black and text to white */}
      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white"> {/* Darker background for the inner div */}
        Map Component (Google Maps or similar) goes here
      </div>
    </div>
  );
}
