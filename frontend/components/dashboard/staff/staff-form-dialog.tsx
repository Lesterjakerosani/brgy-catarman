"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAddStaff, useUpdateStaff } from "@/lib/api/hooks/use-staff"
import { ApiError } from "@/lib/api/types"
import type { StaffMember } from "@/types"

function buildStaffSchema() {
  return z.object({
    name: z.string().min(2, "Please enter the staff member's full name."),
    email: z.email("Please enter a valid email address."),
    role: z.enum(["Staff", "Administrator"]),
    position: z.string().min(2, "Please enter a position/title."),
    contactNumber: z.string().optional(),
  })
}

type FormValues = z.infer<ReturnType<typeof buildStaffSchema>>

export function StaffFormDialog({ open, onOpenChange, staff }: { open: boolean; onOpenChange: (open: boolean) => void; staff?: StaffMember }) {
  const addStaff = useAddStaff()
  const updateStaff = useUpdateStaff()

  const form = useForm<FormValues>({
    resolver: zodResolver(buildStaffSchema()),
    defaultValues: { name: "", email: "", role: "Staff", position: "", contactNumber: "" },
  })

  React.useEffect(() => {
    if (open) {
      form.reset(
        staff
          ? { name: staff.name, email: staff.email, role: staff.role, position: staff.position, contactNumber: staff.contactNumber ?? "" }
          : { name: "", email: "", role: "Staff", position: "", contactNumber: "" }
      )
    }
  }, [open, staff, form])

  async function onSubmit(values: FormValues) {
    try {
      if (staff) {
        await updateStaff.mutateAsync({ id: staff.id, values })
      } else {
        const { temporaryPassword } = await addStaff.mutateAsync(values)
        toast.success(
          `Staff account created. Temporary password: ${temporaryPassword} — share this with them; they'll be asked to change it on first login.`,
          { duration: 15000 },
        )
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save staff account.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{staff ? "Edit Staff Account" : "Add New Staff Account"}</DialogTitle>
          <DialogDescription>{staff ? "Update staff account details." : "Create a new staff or administrator account."}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position / Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Records Officer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!staff ? (
              <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                A temporary password will be generated automatically and shown once the account is created.
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{staff ? "Save Changes" : "Create Account"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
