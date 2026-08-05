"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { PUROKS, CIVIL_STATUSES, RESIDENT_TAGS, RELIGIONS, OCCUPATIONS, EDUCATION_LEVELS } from "@/lib/constants"
import { useResidentsStore } from "@/lib/stores/residents-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { Resident, ResidentFormValues } from "@/types"

const residentSchema = z.object({
  firstName: z.string().min(2, "Please enter a first name."),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Please enter a last name."),
  suffix: z.string().optional(),
  gender: z.enum(["Male", "Female"]),
  birthdate: z.string().min(1, "Please select a birthdate."),
  civilStatus: z.enum(CIVIL_STATUSES as [string, ...string[]]),
  religion: z.string().optional(),
  occupation: z.string().optional(),
  educationalAttainment: z.string().optional(),
  purok: z.string().min(1, "Please select a purok."),
  street: z.string().min(2, "Please enter a street."),
  houseNumber: z.string().min(1, "Please enter a house number."),
  contactNumber: z.string().min(7, "Please enter a valid contact number."),
  email: z.union([z.email(), z.literal("")]).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  isRegisteredVoter: z.boolean(),
  tags: z.array(z.enum(RESIDENT_TAGS as [string, ...string[]])),
})

type FormValues = z.infer<typeof residentSchema>

interface ResidentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resident?: Resident
}

export function ResidentFormDialog({ open, onOpenChange, resident }: ResidentFormDialogProps) {
  const addResident = useResidentsStore((s) => s.addResident)
  const updateResident = useResidentsStore((s) => s.updateResident)
  const session = useAuthStore((s) => s.session)

  const form = useForm<FormValues>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      gender: "Male",
      birthdate: "",
      civilStatus: "Single",
      religion: "",
      occupation: "",
      educationalAttainment: "",
      purok: PUROKS[0],
      street: "",
      houseNumber: "",
      contactNumber: "",
      email: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      isRegisteredVoter: false,
      tags: [],
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset(
        resident
          ? {
              firstName: resident.firstName,
              middleName: resident.middleName ?? "",
              lastName: resident.lastName,
              suffix: resident.suffix ?? "",
              gender: resident.gender,
              birthdate: resident.birthdate,
              civilStatus: resident.civilStatus,
              religion: resident.religion ?? "",
              occupation: resident.occupation ?? "",
              educationalAttainment: resident.educationalAttainment ?? "",
              purok: resident.address.purok,
              street: resident.address.street,
              houseNumber: resident.address.houseNumber,
              contactNumber: resident.contactNumber,
              email: resident.email ?? "",
              emergencyContactName: resident.emergencyContactName ?? "",
              emergencyContactNumber: resident.emergencyContactNumber ?? "",
              isRegisteredVoter: resident.isRegisteredVoter,
              tags: resident.tags,
            }
          : {
              firstName: "",
              middleName: "",
              lastName: "",
              suffix: "",
              gender: "Male",
              birthdate: "",
              civilStatus: "Single",
              religion: "",
              occupation: "",
              educationalAttainment: "",
              purok: PUROKS[0],
              street: "",
              houseNumber: "",
              contactNumber: "",
              email: "",
              emergencyContactName: "",
              emergencyContactNumber: "",
              isRegisteredVoter: false,
              tags: [],
            }
      )
    }
  }, [open, resident, form])

  function onSubmit(values: FormValues) {
    const actor = session?.name ?? "Staff"
    const payload = values as ResidentFormValues
    if (resident) {
      updateResident(resident.id, payload, actor)
      toast.success("Resident record updated successfully.")
    } else {
      addResident(payload, actor)
      toast.success("Resident added successfully.")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{resident ? "Edit Resident" : "Add New Resident"}</DialogTitle>
          <DialogDescription>
            {resident ? "Update the resident's information below." : "Fill out the form to register a new resident."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
          <Form {...form}>
            <form id="resident-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthdate</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="civilStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Civil Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CIVIL_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="religion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Religion</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RELIGIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OCCUPATIONS.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="educationalAttainment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EDUCATION_LEVELS.map((e) => (
                            <SelectItem key={e} value={e}>
                              {e}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="purok"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purok</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PUROKS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="houseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>House No.</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resident Tags</FormLabel>
                    <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-border p-3 sm:grid-cols-3">
                      {RESIDENT_TAGS.map((tag) => (
                        <label key={tag} className="flex cursor-pointer items-center gap-2 text-sm">
                          <Checkbox
                            checked={field.value.includes(tag)}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? [...field.value, tag] : field.value.filter((t: string) => t !== tag))
                            }}
                          />
                          {tag}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRegisteredVoter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer font-normal">Registered Voter</FormLabel>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="resident-form">
            {resident ? "Save Changes" : "Add Resident"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
