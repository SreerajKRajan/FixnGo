import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
} from "@nextui-org/react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";

export function WorkshopList() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchWorkshops = async (page) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosInstance.get(
          `/admin_side/workshop-list/?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Map response data and set state
        const { results, count } = response.data;
        const updatedWorkshops = results.map((workshop) => ({
          ...workshop,
          rejected: Boolean(workshop.rejection_reason),
        }));

        setWorkshops(updatedWorkshops);
        setTotalPages(Math.ceil(count / 5)); // Assuming 5 items per page
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch workshops:", error);
        setLoading(false);
        toast.error("Failed to fetch workshops. Please try again later.");
      }
    };

    fetchWorkshops(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
      await axiosInstance.post("/admin_side/reject-workshop/", {
        workshop_id: workshopId,
        rejection_reason: reason,
      });
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
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Workshop List
      </h2>
      <Table>
        <TableHeader>
          <TableColumn>Name</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Location</TableColumn>
          <TableColumn>Document</TableColumn>
          <TableColumn>Approval</TableColumn>
          <TableColumn>Status</TableColumn>
        </TableHeader>
        <TableBody>
          {workshops.map((workshop) => (
            <TableRow key={workshop.id} className="hover:bg-gray-100">
              <TableCell className="text-gray-800 font-medium">
                {workshop.name}
              </TableCell>
              <TableCell className="text-gray-600">{workshop.email}</TableCell>
              <TableCell className="text-gray-600">
                {workshop.location}
              </TableCell>
              <TableCell>
                {workshop.document ? (
                  <a
                    href={workshop.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                    onClick={(e) => {
                      // If the URL contains double encoding of S3 paths, fix it on click
                      const docUrl = workshop.document;
                      if (docUrl.includes("amazonaws.com/media/https%3A/")) {
                        e.preventDefault();

                        // Extract the relevant parts
                        const parts = docUrl.split("workshop_documents/");
                        if (parts.length > 1) {
                          const region = docUrl.includes("us-east-1")
                            ? "us-east-1"
                            : docUrl.includes("eu-north-1")
                            ? "eu-north-1"
                            : "us-east-1";

                          // Construct direct URL to the file
                          const correctUrl = `https://fixngo-new-images.s3.${region}.amazonaws.com/media/workshop_documents/${
                            parts[1].split("%")[0]
                          }`;

                          // Open the corrected URL
                          window.open(correctUrl, "_blank");
                        }
                      }
                    }}
                  >
                    View Document
                  </a>
                ) : (
                  <span className="text-gray-400">No document</span>
                )}
              </TableCell>
              <TableCell>
                {workshop.is_verified ? (
                  workshop.is_approved ? (
                    <Chip color="success" className="capitalize">
                      Approved
                    </Chip>
                  ) : workshop.approval_status === "rejected" ? (
                    <Chip color="danger" className="capitalize">
                      Rejected
                    </Chip>
                  ) : (
                    <Dropdown>
                      <DropdownTrigger>
                        <Button auto flat color="primary">
                          Actions
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="approve"
                          onPress={() => approveWorkshop(workshop.id)}
                        >
                          Approve
                        </DropdownItem>
                        <DropdownItem
                          key="reject"
                          color="danger"
                          onPress={() => openRejectModal(workshop)}
                        >
                          Reject
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  )
                ) : (
                  <span className="text-red-500 font-medium">Not Verified</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  color={workshop.is_active ? "danger" : "success"}
                  onPress={() => toggleWorkshopStatus(workshop.id)}
                  isDisabled={workshop.approval_status === "rejected"}
                >
                  {workshop.is_active ? "Block" : "Unblock"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-center">
        <Pagination
          total={totalPages}
          initialPage={currentPage}
          onChange={handlePageChange}
        />
      </div>

      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          className="p-6"
        >
          <ModalHeader>Reject Workshop</ModalHeader>
          <ModalBody>
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Enter reason for rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              onPress={() => {
                if (selectedWorkshop && rejectReason.trim()) {
                  rejectWorkshop(selectedWorkshop.id, rejectReason);
                  setRejectModalOpen(false);
                } else {
                  toast.error("Please provide a rejection reason.");
                }
              }}
              color="danger"
              auto
            >
              Submit
            </Button>
            <Button
              auto
              flat
              color="default"
              onPress={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
