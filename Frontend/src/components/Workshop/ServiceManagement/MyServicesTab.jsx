import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Edit2, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const initialServices = [
  { id: "1", name: "Oil Change", type: "Global", status: "Approved" },
  { id: "2", name: "Custom Detailing", type: "Custom", status: "Pending" },
  { id: "3", name: "Engine Tuning", type: "Custom", status: "Rejected", rejectionReason: "Insufficient details provided" },
]

export function MyServicesTab() {
  const [services, setServices] = useState(initialServices)

  const handleDelete = (id) => {
    setServices(services.filter((service) => service.id !== id))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">{service.name}</TableCell>
            <TableCell>{service.type}</TableCell>
            <TableCell>
              <Badge
                variant={
                  service.status === "Approved"
                    ? "success"
                    : service.status === "Pending"
                    ? "warning"
                    : "destructive"
                }
              >
                {service.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {service.type === "Custom" && (
                <Button variant="ghost" size="sm" className="mr-2">
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the service from your list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(service.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

