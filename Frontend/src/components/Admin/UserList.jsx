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
        const response = await axiosInstance.get("/admin_side/user-list/");
        console.log("Fetched Users:", response.data);
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
