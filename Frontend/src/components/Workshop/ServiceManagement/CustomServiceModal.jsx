import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Define the validation schema
const serviceSchema = Yup.object().shape({
  serviceName: Yup.string()
    .trim()
    .required("Service name is required"),
  description: Yup.string()
    .trim()
    .required("Description is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be greater than zero")
    .required("Price is required"),
});

export function CustomServiceModal({ isOpen, onClose, onSubmit }) {
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
              <div className="grid gap-4 py-4">
                {/* Service Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="serviceName" className="text-right">
                    Name
                  </Label>
                  <div className="col-span-3">
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
                </div>

                {/* Description */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <div className="col-span-3">
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
                </div>

                {/* Price */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <div className="col-span-3">
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
                </div>
              </div>
              <DialogFooter>
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
