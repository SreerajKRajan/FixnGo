export default function ServiceRequests() {
  return (
    <div className="bg-black text-white rounded-lg shadow-md p-4"> {/* Black background and white text */}
      <h2 className="text-xl font-semibold mb-4">Service Requests</h2>
      <div className="space-y-4">
        <div className="border-b border-white pb-4"> {/* White border */}
          <h3 className="font-semibold">Active Request: Flat Tire</h3>
          <p className="text-sm text-gray-400">Workshop: Quick Fix Auto</p> {/* Lighter gray text for details */}
          <p className="text-sm text-gray-400">Status: En route</p>
        </div>
        <div className="border-b border-white pb-4"> {/* White border */}
          <h3 className="font-semibold">Past Request: Oil Change</h3>
          <p className="text-sm text-gray-400">Workshop: Speedy Lube</p> {/* Lighter gray text for details */}
          <p className="text-sm text-gray-400">Status: Completed</p>
        </div>
      </div>
    </div>
  );
}
