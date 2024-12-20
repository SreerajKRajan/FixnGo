export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex mb-4 space-x-4">
      <button
        className={`px-4 py-2 rounded-md ${
          activeTab === "map" ? "bg-black text-white" : "bg-white text-black"
        } border border-white`}
        onClick={() => setActiveTab("map")}
      >
        Map
      </button>
      <button
        className={`px-4 py-2 rounded-md ${
          activeTab === "requests" ? "bg-black text-white" : "bg-white text-black"
        } border border-white`}
        onClick={() => setActiveTab("requests")}
      >
        Service Requests
      </button>
    </div>
  );
}
