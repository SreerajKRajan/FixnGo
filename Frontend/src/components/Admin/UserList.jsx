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

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
        const response = await axiosInstance.get("/admin_side/user-list/", {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request headers
          },
        });
        console.log("Fetched Users:", response.data);
        setUsers(response.data);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to fetch users. Please try again later.");
        setLoading(false); // Ensure loading is false even on error
      }
    };

    fetchUsers();
  }, []);

  // Toggle user status between Active and Blocked
  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      const newStatus = user.status === "Active" ? "Blocked" : "Active";

      await axiosInstance.post("/admin_side/toggle-user-status/", {
        user_id: userId,
        status: newStatus,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_active: !u.is_active } : u
        )
      );

      toast.success(`User status updated to ${newStatus}.`);
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
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
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.is_active ? "Active": "Blocked"}</TableCell>
              <TableCell>
                <Button
                  onClick={() => toggleUserStatus(user.id)}
                  variant={user.is_active ? "destructive" : "default"}
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
