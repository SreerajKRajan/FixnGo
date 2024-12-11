import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner"; // Import Sonner for notifications

// Helper function to handle state updates for items (block/unblock, approve/reject)
const updateItemStatus = async (endpoint, itemId, currentStatus, setItems, successMessage) => {
  try {
    const response = await axiosInstance.post(endpoint, {
      item_id: itemId,
      status: !currentStatus,
    });
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, is_active: response.data.is_active } : item
      )
    );
    toast.success(successMessage || "Status updated successfully!");
  } catch (error) {
    console.error("Failed to update status:", error);
    const errorMessage =
      error.response?.data?.error || "Failed to update status. Please try again.";
    toast.error(errorMessage);
  }
};

export function WorkshopList() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch workshops from backend
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
        const response = await axiosInstance.get("/admin_side/workshop-list/", {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request headers
          },
        });
        setWorkshops(response.data);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Failed to fetch workshops:", error);
        setLoading(false); // Ensure loading is false even on error
        toast.error("Failed to fetch workshops. Please try again later.");
      }
    };

    fetchWorkshops();
  }, []);

  // Approve a workshop
  const approveWorkshop = async (workshopId) => {
    const workshop = workshops.find((w) => w.id === workshopId);

    // Check if the workshop is verified
    if (!workshop.is_verified) {
      // If not verified, show a toast message
      toast.error("Workshop is not verified. Cannot approve.");
      return;
    }

    try {
      await axiosInstance.post("/admin_side/approve-workshop/", {
        workshop_id: workshopId,
      });
      setWorkshops((prev) =>
        prev.map((workshop) =>
          workshop.id === workshopId
            ? { ...workshop, is_approved: true }
            : workshop
        )
      );
      toast.success("Workshop approved successfully!");
    } catch (error) {
      console.error("Failed to approve workshop:", error);
      toast.error("Failed to approve workshop.");
    }
  };

  // Reject a workshop
  const rejectWorkshop = async (workshopId) => {
    try {
      await axiosInstance.post("/admin_side/reject-workshop/", {
        workshop_id: workshopId,
      });
      setWorkshops((prev) =>
        prev.map((workshop) =>
          workshop.id === workshopId
            ? { ...workshop, is_approved: false, rejected: true }
            : workshop
        )
      );
      toast.success("Workshop rejected successfully!");
    } catch (error) {
      console.error("Failed to reject workshop:", error);
      toast.error("Failed to reject workshop.");
    }
  };

  // Block/Unblock a workshop
  const toggleWorkshopStatus = async (workshopId) => {
    try {
      const workshop = workshops.find((w) => w.id === workshopId);
      const newStatus = workshop.is_active ? "Blocked" : "Active";
  
      const response = await axiosInstance.post("/admin_side/toggle-workshop-status/", {
        workshop_id: workshopId,
        status: newStatus,
      });
  
      // Update the specific user's status in state using the response from the backend
      setWorkshops((prev) =>
        prev.map((w) =>
          w.id === workshopId ? { ...w, is_active: response.data.is_active } : w
        )
      );
  
      toast.success(response.data.message);
    } catch (error) {
      console.error("Failed to update workshop status:", error);
      toast.error("Failed to update workshop status. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading workshops...</p>;
  }

  if (workshops.length === 0) {
    return <p>No workshops found.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Workshop List</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Approval</TableHead>
            <TableHead>Block/Unblock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workshops.map((workshop) => (
            <TableRow key={workshop.id}>
              <TableCell>{workshop.name}</TableCell>
              <TableCell>{workshop.email}</TableCell>
              <TableCell>
                {workshop.is_verified ? (
                  workshop.is_approved ? (
                    <span className="text-green-500 font-semibold">Approved</span>
                  ) : workshop.rejected ? (
                    <span className="text-red-500 font-semibold">Rejected</span>
                  ) : (
                    <div className="space-x-2">
                      <Button
                        onClick={() => approveWorkshop(workshop.id)}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-1 py-1 rounded-md shadow-md hover:shadow-lg transition duration-200 ease-in-out"
                        size="sm"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectWorkshop(workshop.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-1 py-1 rounded-md shadow-md hover:shadow-lg transition duration-200 ease-in-out"
                        size="sm"
                      >
                        Reject
                      </Button>
                    </div>
                  )
                ) : (
                  <span>Not Verified</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => toggleWorkshopStatus(workshop.id)}
                  variant={workshop.is_active ? "destructive" : "default"}
                >
                  {workshop.is_active ? "Block" : "Unblock"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
