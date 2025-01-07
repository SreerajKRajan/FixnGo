import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { Button } from "../ui/button";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";

export function WorkshopList() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch workshops from backend
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get("/admin_side/workshop-list/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const updatedWorkshops = response.data.map((workshop) => ({
          ...workshop,
          rejected: Boolean(workshop.rejection_reason),
        }));

        setWorkshops(updatedWorkshops);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch workshops:", error);
        setLoading(false);
        toast.error("Failed to fetch workshops. Please try again later.");
      }
    };

    fetchWorkshops();
  }, []);

  const approveWorkshop = async (workshopId) => {
    const workshop = workshops.find((w) => w.id === workshopId);
    if (!workshop.is_verified) {
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

  const openRejectModal = (workshop) => {
    setSelectedWorkshop(workshop);
    setRejectModalOpen(true);
  };

  const rejectWorkshop = async (workshopId, reason) => {
    try {
      const response = await axiosInstance.post(
        "/admin_side/reject-workshop/",
        {
          workshop_id: workshopId,
          rejection_reason: reason,
        }
      );
      setWorkshops((prev) =>
        prev.map((workshop) =>
          workshop.id === workshopId
            ? {
                ...workshop,
                is_approved: false,
                rejected: true,
                rejection_reason: reason,
              }
            : workshop
        )
      );
      toast.success("Workshop rejected successfully!");
    } catch (error) {
      console.error("Failed to reject workshop:", error);
      toast.error(
        error.response?.data?.message || "Failed to reject workshop."
      );
    }
  };

  const toggleWorkshopStatus = async (workshopId) => {
    try {
      const workshop = workshops.find((w) => w.id === workshopId);
      const newStatus = workshop.is_active ? "Blocked" : "Active";

      const response = await axiosInstance.post(
        "/admin_side/toggle-workshop-status/",
        {
          workshop_id: workshopId,
          status: newStatus,
        }
      );

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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Block/Unblock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workshops.map((workshop) => (
              <TableRow key={workshop.id}>
                <TableCell>{workshop.name}</TableCell>
                <TableCell>{workshop.email}</TableCell>
                <TableCell>{workshop.location}</TableCell>
                <TableCell>
                  <a
                    href={workshop.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Document
                  </a>
                </TableCell>
                <TableCell>
                  {workshop.is_verified ? (
                    workshop.is_approved ? (
                      <span className="text-green-500 font-semibold">
                        Approved
                      </span>
                    ) : workshop.rejected ? (
                      <span className="text-red-500 font-semibold">
                        Rejected
                      </span>
                    ) : (
                      <div className="space-x-2">
                        <Button
                          onClick={() => approveWorkshop(workshop.id)}
                          className="bg-black text-white px-2 py-1 rounded"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => openRejectModal(workshop)}
                          className="bg-black text-white px-2 py-1 rounded"
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
                    className="bg-black text-white px-2 py-1 rounded"
                  >
                    {workshop.is_active ? "Block" : "Unblock"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {rejectModalOpen && (
        <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
          <ModalHeader>Reject Workshop</ModalHeader>
          <ModalBody>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Enter reason for rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                if (selectedWorkshop && rejectReason.trim()) {
                  rejectWorkshop(selectedWorkshop.id, rejectReason);
                  setRejectModalOpen(false);
                } else {
                  toast.error("Please provide a rejection reason.");
                }
              }}
              className="bg-black text-white px-2 py-1 rounded"
            >
              Submit
            </Button>
            <Button
              onClick={() => setRejectModalOpen(false)}
              className="ml-2 bg-gray-300 px-2 py-1 rounded"
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
