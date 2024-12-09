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
import { toast } from "sonner";  // Import Sonner for notifications

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
        console.log("Fetched Workshops:", response.data);
        setWorkshops(response.data);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Failed to fetch workshops:", error);
        setLoading(false); // Ensure loading is false even on error
      }
    };

    fetchWorkshops();
  }, []);

  // Approve a workshop
  const approveWorkshop = async (workshopId) => {
    const workshop = workshops.find(w => w.id === workshopId);

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
    } catch (error) {
      console.error("Failed to approve workshop:", error);
    }
  };

  // Reject a workshop
  const   rejectWorkshop = async (workshopId) => {
    try {
      await axiosInstance.post("/admin_side/reject-workshop/", {
        workshop_id: workshopId,
      });
      setWorkshops((prev) =>
        prev.map((workshop) =>
          workshop.id === workshopId
            ? { ...workshop, is_approved: false }
            : workshop
        )
      );
    } catch (error) {
      console.error("Failed to reject workshop:", error);
    }
  };

  if (loading) {
    return <p>Loading workshops...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Workshop List</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workshops.map((workshop, index) => (
            <TableRow key={workshop.id || index}>
              <TableCell>{workshop.name}</TableCell>
              <TableCell>{workshop.email}</TableCell>
              <TableCell>
                {workshop.is_verified ? "Verified" : "Pending"}
              </TableCell>
              <TableCell>
                {workshop.is_approved === false && workshop.is_verified === true ? (
                  <div className="space-x-2">
                    <Button
                      onClick={() => approveWorkshop(workshop.id)}
                      variant="default"
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => rejectWorkshop(workshop.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </div>
                ) : workshop.is_verified === false ? (
                  <span>Workshop not verified</span>
                ) : (
                  <span>Approved</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
