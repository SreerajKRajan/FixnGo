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
import { toast } from "sonner"; // Import Sonner for notifications

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/admin_side/user-list/");
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to fetch users. Please try again later.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Toggle user status between Active and Blocked
  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      const newStatus = user.is_active ? "Blocked" : "Active";

      const response = await axiosInstance.post("/admin_side/toggle-user-status/", {
        user_id: userId,
        status: newStatus,
      });

      // Update the specific user's status in state using the response from the backend
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
    <div>
      <h2 className="text-2xl font-bold mb-4">User List</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Block/Unblock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span
                  className={`font-semibold ${
                    user.is_active ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {user.is_active ? "Active" : "Blocked"}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => toggleUserStatus(user.id)}
                  className="bg-black text-white font-semibold px-1 py-1 rounded-md shadow-md hover:bg-gray-800 transition duration-200 ease-in-out"
                >
                  {user.is_active ? "Block" : "Unblock"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
