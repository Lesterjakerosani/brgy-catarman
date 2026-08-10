"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Search } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { CIVIL_STATUSES, PUROKS, RELATIONSHIP_OPTIONS, RESIDENT_TAGS } from "@/lib/constants"
import { useAllResidents, useAddResident } from "@/lib/api/hooks/use-residents"
import { useSitios } from "@/lib/api/hooks/use-geography"
import { ApiError } from "@/lib/api/types"
import { getResidentAge, getResidentFullName } from "@/data/residents"
import { cn } from "@/lib/utils"
import type { ResidentFormValues, ResidentTagType } from "@/types"

const quickResidentSchema = z.object({
  firstName: z.string().min(2, "Please enter a first name."),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Please enter a last name."),
  suffix: z.string().optional(),
  birthdate: z.string().min(1, "Please select a birthdate."),
  gender: z.enum(["Male", "Female"]),
  civilStatus: z.enum(CIVIL_STATUSES as [string, ...string[]]),
  contactNumber: z.string().min(7, "Please enter a valid contact number."),
  relationshipToHead: z.string().optional(),
  tags: z.array(z.string()),
})

type QuickResidentValues = z.infer<typeof quickResidentSchema>

const EMPTY_QUICK_RESIDENT: QuickResidentValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  birthdate: "",
  gender: "Male",
  civilStatus: "Single",
  contactNumber: "",
  relationshipToHead: "",
  tags: [],
}

interface MemberPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "head" | "member"
  excludeResidentIds: string[]
  defaultAddress: { street: string; houseNumber: string }
  onConfirm: (result: { residentId: string; relationshipToHead?: string }) => void
}

export function MemberPickerDialog({ open, onOpenChange, mode, excludeResidentIds, defaultAddress, onConfirm }: MemberPickerDialogProps) {
  const { residents } = useAllResidents()
  const addResident = useAddResident()
  const { puroks } = useSitios()

  const [tab, setTab] = React.useState<"existing" | "new">("existing")
  const [search, setSearch] = React.useState("")
  const [selectedResidentId, setSelectedResidentId] = React.useState<string | null>(null)
  const [relationship, setRelationship] = React.useState("")

  const form = useForm<QuickResidentValues>({
    resolver: zodResolver(quickResidentSchema),
    defaultValues: EMPTY_QUICK_RESIDENT,
  })

  React.useEffect(() => {
    if (open) {
      setTab("existing")
      setSearch("")
      setSelectedResidentId(null)
      setRelationship("")
      form.reset(EMPTY_QUICK_RESIDENT)
    }
  }, [open, form])

  const availableResidents = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    return residents
      .filter((r) => !excludeResidentIds.includes(r.id))
      .filter((r) => !term || getResidentFullName(r).toLowerCase().includes(term))
  }, [residents, excludeResidentIds, search])

  const birthdate = form.watch("birthdate")
  const previewAge = birthdate ? getResidentAge(birthdate) : null

  function handleConfirmExisting() {
    if (!selectedResidentId) {
      toast.error("Please select a resident.")
      return
    }
    if (mode === "member" && !relationship) {
      toast.error("Please select the relationship to household head.")
      return
    }
    onConfirm({ residentId: selectedResidentId, relationshipToHead: mode === "member" ? relationship : undefined })
  }

  async function handleCreateNew(values: QuickResidentValues) {
    if (mode === "member" && !values.relationshipToHead) {
      form.setError("relationshipToHead", { message: "Please select the relationship to household head." })
      return
    }
    const payload: ResidentFormValues = {
      firstName: values.firstName,
      middleName: values.middleName || undefined,
      lastName: values.lastName,
      suffix: values.suffix || undefined,
      gender: values.gender,
      birthdate: values.birthdate,
      civilStatus: values.civilStatus as ResidentFormValues["civilStatus"],
      purok: PUROKS[0],
      street: defaultAddress.street || "—",
      houseNumber: defaultAddress.houseNumber || "—",
      contactNumber: values.contactNumber,
      tags: values.tags as ResidentTagType[],
      isRegisteredVoter: false,
    }
    try {
      const resident = await addResident.mutateAsync({ values: payload, puroks })
      onConfirm({ residentId: resident.id, relationshipToHead: mode === "member" ? values.relationshipToHead : undefined })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to add resident.")
    }
  }

  function toggleTag(tag: ResidentTagType, checked: boolean) {
    const current = form.getValues("tags")
    form.setValue("tags", checked ? [...current, tag] : current.filter((t) => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-lg p-0 sm:max-w-[600px]">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
          <DialogTitle>{mode === "head" ? "Select Household Head" : "Add Family Member"}</DialogTitle>
          <DialogDescription>Select an existing resident or register a new one.</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "existing" | "new")} className="min-h-0 flex-1 overflow-hidden">
          <div className="shrink-0 px-6 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="existing">Select Existing Resident</TabsTrigger>
              <TabsTrigger value="new">Create New Resident</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="existing" className="min-h-0 flex-1 overflow-hidden">
            <div className="max-h-[calc(85vh-15rem)] overflow-y-auto px-6">
              <div className="space-y-4 py-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search residents by name..."
                    className="h-11 pl-9"
                  />
                </div>

                <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  {availableResidents.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matching residents.</p>
                  ) : (
                    availableResidents.map((r) => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setSelectedResidentId(r.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-secondary",
                          selectedResidentId === r.id && "bg-primary/10 hover:bg-primary/10"
                        )}
                      >
                        <InitialsAvatar name={getResidentFullName(r)} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{getResidentFullName(r)}</span>
                          <span className="block text-xs text-muted-foreground">
                            {getResidentAge(r.birthdate)} yrs • {r.gender}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>

                {mode === "member" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Relationship to Household Head<span className="text-destructive"> *</span>
                    </label>
                    <Select value={relationship} onValueChange={setRelationship}>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="new" className="min-h-0 flex-1 overflow-hidden">
            <div className="max-h-[calc(85vh-15rem)] overflow-y-auto px-6">
              <Form {...form}>
                <form id="quick-resident-form" onSubmit={form.handleSubmit(handleCreateNew)} className="space-y-5 py-4">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personal Information</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              First Name<span className="text-destructive"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11" {...field} />
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
                              <Input className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Last Name<span className="text-destructive"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="suffix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suffix</FormLabel>
                            <FormControl>
                              <Input className="h-11" placeholder="Jr., Sr., III" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="birthdate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Birthdate<span className="text-destructive"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="date" className="h-11" {...field} />
                            </FormControl>
                            {previewAge !== null ? <p className="text-xs text-muted-foreground">Age: {previewAge} years old</p> : null}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Sex<span className="text-destructive"> *</span>
                            </FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="h-11 w-full">
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
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="civilStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Civil Status<span className="text-destructive"> *</span>
                            </FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="h-11 w-full">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CIVIL_STATUSES.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
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
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Contact Number<span className="text-destructive"> *</span>
                            </FormLabel>
                            <FormControl>
                              <Input className="h-11" placeholder="09XX XXX XXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {mode === "member" ? (
                      <FormField
                        control={form.control}
                        name="relationshipToHead"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Relationship to Household Head<span className="text-destructive"> *</span>
                            </FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="h-11 w-full">
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {RELATIONSHIP_OPTIONS.map((r) => (
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
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Community Tags</p>
                    <div className="grid grid-cols-1 gap-2.5 rounded-lg border border-border p-3 sm:grid-cols-2">
                      {RESIDENT_TAGS.filter((t) => t !== "4Ps Beneficiary").map((tag) => (
                        <label key={tag} className="flex cursor-pointer items-center gap-2 text-sm">
                          <Checkbox
                            checked={form.watch("tags").includes(tag)}
                            onCheckedChange={(checked) => toggleTag(tag, Boolean(checked))}
                          />
                          {tag}
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="shrink-0 border-t border-border bg-muted/30 px-6 py-4">
          <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {tab === "existing" ? (
            <Button type="button" className="h-11" onClick={handleConfirmExisting}>
              {mode === "head" ? "Set as Household Head" : "Add Member"}
            </Button>
          ) : (
            <Button type="submit" form="quick-resident-form" className="h-11">
              Save &amp; {mode === "head" ? "Set as Head" : "Add Member"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
