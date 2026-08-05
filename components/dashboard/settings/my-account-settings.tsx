"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import toast from "react-hot-toast"
import { Camera, Check, Pencil, X } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { AvatarCropDialog } from "@/components/dashboard/settings/avatar-crop-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useStaffStore } from "@/lib/stores/staff-store"

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password."),
    newPassword: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm the new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export function MyAccountSettings() {
  const session = useAuthStore((s) => s.session)
  const updateSessionProfile = useAuthStore((s) => s.updateSessionProfile)
  const updateAvatar = useStaffStore((s) => s.updateAvatar)
  const updateName = useStaffStore((s) => s.updateName)
  const changeOwnPassword = useStaffStore((s) => s.changeOwnPassword)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = React.useState<string | null>(null)
  const [cropOpen, setCropOpen] = React.useState(false)
  const [editingName, setEditingName] = React.useState(false)
  const [nameDraft, setNameDraft] = React.useState("")

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  if (!session) return null

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const url = await readFileAsDataUrl(file)
    setCropSrc(url)
    setCropOpen(true)
  }

  function handleCropConfirm(dataUrl: string) {
    if (!session) return
    updateAvatar(session.id, dataUrl, session.name)
    updateSessionProfile({ avatarUrl: dataUrl })
    toast.success("Profile photo updated.")
  }

  function startEditingName() {
    setNameDraft(session!.name)
    setEditingName(true)
  }

  function saveName() {
    if (!session) return
    const result = updateName(session.id, nameDraft)
    if (!result.success) {
      toast.error(result.error ?? "Unable to update name.")
      return
    }
    updateSessionProfile({ name: nameDraft.trim() })
    setEditingName(false)
    toast.success("Name updated. This will be reflected across the system.")
  }

  function onSubmitPassword(values: PasswordFormValues) {
    if (!session) return
    const result = changeOwnPassword(session.id, values.currentPassword, values.newPassword)
    if (!result.success) {
      form.setError("currentPassword", { message: result.error ?? "Unable to change password." })
      return
    }
    toast.success("Password changed successfully.")
    form.reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Account" description="View your account details and manage your name, profile photo, and password." />

      <Card className="border-border/70">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <InitialsAvatar name={session.name} photoUrl={session.avatarUrl} size="xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Camera className="size-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </div>
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName()
                      if (e.key === "Escape") setEditingName(false)
                    }}
                    autoFocus
                    className="h-9 max-w-64"
                  />
                  <Button type="button" size="icon" className="size-8 shrink-0" onClick={saveName}>
                    <Check className="size-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="size-8 shrink-0" onClick={() => setEditingName(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-heading text-lg font-bold text-foreground">{session.name}</p>
                  <button
                    type="button"
                    onClick={startEditingName}
                    aria-label="Edit name"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>
              )}
              <Badge variant="outline" className="mt-1">{session.role}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <Label>Email Address</Label>
              <p className="mt-1.5 text-sm text-foreground">{session.email}</p>
            </div>
            <div>
              <Label>Position</Label>
              <p className="mt-1.5 text-sm text-foreground">{session.position}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-sm font-semibold text-foreground">Change Password</p>
            <p className="text-xs text-muted-foreground">Enter your current password to set a new one.</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitPassword)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
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
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Update Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AvatarCropDialog open={cropOpen} onOpenChange={setCropOpen} imageSrc={cropSrc} onConfirm={handleCropConfirm} />
    </div>
  )
}
