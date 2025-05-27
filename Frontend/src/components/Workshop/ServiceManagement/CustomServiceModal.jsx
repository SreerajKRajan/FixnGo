import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/uis/dialog";
import { Button } from "@/components/uis/button";
import { Input } from "@/components/uis/input";
import { Textarea } from "@/components/uis/textArea";
import { Label } from "@/components/uis/label";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Define the validation schema
const serviceSchema = Yup.object().shape({
  serviceName: Yup.string().trim().required("Service name is required"),
  description: Yup.string().trim().required("Description is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be greater than zero")
    .required("Price is required"),
});

export function CustomServiceModal({ isOpen, onClose, onSubmit, platformFee }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Service</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            serviceName: "",
            description: "",
            price: "",
          }}
          validationSchema={serviceSchema}
          onSubmit={(values, { resetForm }) => {
            onSubmit({
              serviceName: values.serviceName,
              description: values.description,
              price: parseFloat(values.price),
            });
            resetForm();
            onClose();
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="space-y-4 py-4">
                {/* Service Name */}
                <div>
                  <Label htmlFor="serviceName">Name</Label>
                  <Field
                    id="serviceName"
                    name="serviceName"
                    as={Input}
                    className="w-full"
                  />
                  <ErrorMessage
                    name="serviceName"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Field
                    id="description"
                    name="description"
                    as={Textarea}
                    className="w-full"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Price */}
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Field
                    id="price"
                    name="price"
                    type="number"
                    as={Input}
                    className="w-full"
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Platform Fee Notice */}
                {platformFee !== undefined && (
                  <div className="text-sm text-gray-600 text-center">
                    Note: A platform fee of {platformFee}% will be deducted from
                    this service.
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
