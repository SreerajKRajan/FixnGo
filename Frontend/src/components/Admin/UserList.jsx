import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Pagination,
} from "@nextui-org/react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner";

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Use `currentPage` in the API request
        const response = await axiosInstance.get(
          `/admin_side/user-list/?page=${currentPage}`
        );
        setUsers(
          Array.isArray(response.data.results) ? response.data.results : []
        );
        setTotalPages(Math.ceil(response.data.count / 5)); // Assuming 5 users per page
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to fetch users. Please try again later.");
        setLoading(false);
      }
    };

    fetchUsers(); // Fetch data when `currentPage` changes
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage); // Update the `currentPage` state
  };

  // Toggle user status between Active and Blocked
  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      const newStatus = user.is_active ? "Blocked" : "Active";

      const response = await axiosInstance.post(
        "/admin_side/toggle-user-status/",
        {
          user_id: userId,
          status: newStatus,
        }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_active: response.data.is_active } : u
        )
      );

      toast.success(response.data.message);
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        User List
      </h2>
      <Table
        aria-label="User Table"
        shadow={true}
        selectionMode="none"
        className="max-w-full bg-white rounded-lg overflow-hidden shadow-lg"
      >
        <TableHeader>
          <TableColumn>Username</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-100">
              <TableCell className="text-gray-800 font-medium">
                {user.username}
              </TableCell>
              <TableCell className="text-gray-600">{user.email}</TableCell>
              <TableCell>
                <Chip color={user.is_active ? "success" : "danger"}>
                  {user.is_active ? "Active" : "Blocked"}
                </Chip>
              </TableCell>
              <TableCell>
                <Button
                  color={user.is_active ? "danger" : "success"}
                  onPress={() => toggleUserStatus(user.id)}
                >
                  {user.is_active ? "Block" : "Unblock"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center mt-4">
        <Pagination
          total={totalPages}
          initialPage={currentPage}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
