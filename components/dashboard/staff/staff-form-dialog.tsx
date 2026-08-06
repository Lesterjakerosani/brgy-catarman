"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useStaffStore } from "@/lib/stores/staff-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { StaffMember } from "@/types"

function buildStaffSchema(isCreate: boolean) {
  return z
    .object({
      name: z.string().min(2, "Please enter the staff member's full name."),
      email: z.email("Please enter a valid email address."),
      role: z.enum(["Staff", "Administrator"]),
      position: z.string().min(2, "Please enter a position/title."),
      contactNumber: z.string().optional(),
      status: z.enum(["Active", "Disabled"]),
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!isCreate) return
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({ code: "custom", path: ["password"], message: "Password must be at least 6 characters." })
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." })
      }
    })
}

type FormValues = z.infer<ReturnType<typeof buildStaffSchema>>

export function StaffFormDialog({ open, onOpenChange, staff }: { open: boolean; onOpenChange: (open: boolean) => void; staff?: StaffMember }) {
  const addStaff = useStaffStore((s) => s.addStaff)
  const updateStaff = useStaffStore((s) => s.updateStaff)
  const setStaffPassword = useStaffStore((s) => s.setStaffPassword)
  const session = useAuthStore((s) => s.session)
  const isCreate = !staff

  const form = useForm<FormValues>({
    resolver: zodResolver(buildStaffSchema(isCreate)),
    defaultValues: { name: "", email: "", role: "Staff", position: "", contactNumber: "", status: "Active", password: "", confirmPassword: "" },
  })

  React.useEffect(() => {
    if (open) {
      form.reset(
        staff
          ? {
              name: staff.name,
              email: staff.email,
              role: staff.role,
              position: staff.position,
              contactNumber: staff.contactNumber ?? "",
              status: staff.status,
              password: "",
              confirmPassword: "",
            }
          : { name: "", email: "", role: "Staff", position: "", contactNumber: "", status: "Active", password: "", confirmPassword: "" }
      )
    }
  }, [open, staff, form])

  function onSubmit(values: FormValues) {
    const actor = session?.name ?? "Administrator"
    const { password, confirmPassword: _confirmPassword, ...rest } = values
    if (staff) {
      updateStaff(staff.id, rest, actor)
      toast.success("Staff account updated.")
    } else {
      const created = addStaff(rest, actor)
      if (password) setStaffPassword(created.id, password, actor)
      toast.success(`Staff account created. A welcome email was sent to ${values.email}.`)
    }
    onOpenChange(false)
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

            {isCreate ? (
              <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
