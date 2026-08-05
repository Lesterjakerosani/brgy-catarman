"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Building, Mail, Palette, Pencil, Phone, Plus, Trash2, Users2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { InitialsAvatar } from "@/components/shared/initials-avatar"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { OfficialFormDialog } from "@/components/dashboard/settings/official-form-dialog"
import { MyAccountSettings } from "@/components/dashboard/settings/my-account-settings"
import { useSettingsStore } from "@/lib/stores/settings-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { Official, SystemSettings, UploadedFile } from "@/types"

export default function SettingsPage() {
  const session = useAuthStore((s) => s.session)

  if (session && session.role !== "Administrator") {
    return <MyAccountSettings />
  }

  return <SystemSettingsPage />
}

function SystemSettingsPage() {
  const settings = useSettingsStore((s) => s.settings)
  const officials = useSettingsStore((s) => s.officials)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const deleteOfficial = useSettingsStore((s) => s.deleteOfficial)
  const session = useAuthStore((s) => s.session)
  const actor = session?.name ?? "Administrator"

  const { register, handleSubmit, reset } = useForm<SystemSettings>({ defaultValues: settings })
  React.useEffect(() => reset(settings), [settings, reset])

  const [logo, setLogo] = React.useState<UploadedFile[]>([])
  const [seal, setSeal] = React.useState<UploadedFile[]>([])
  const [heroBg, setHeroBg] = React.useState<UploadedFile[]>(
    settings.heroBackgroundUrl ? [{ id: "existing-hero-bg", name: "hero-background", url: settings.heroBackgroundUrl, sizeKb: 0, mimeType: "image/*", uploadedAt: "" }] : []
  )
  const [loginBg, setLoginBg] = React.useState<UploadedFile[]>(
    settings.loginBackgroundUrl ? [{ id: "existing-login-bg", name: "login-background", url: settings.loginBackgroundUrl, sizeKb: 0, mimeType: "image/*", uploadedAt: "" }] : []
  )
  const [officialFormOpen, setOfficialFormOpen] = React.useState(false)
  const [editingOfficial, setEditingOfficial] = React.useState<Official | undefined>()
  const [deletingOfficialId, setDeletingOfficialId] = React.useState<string | null>(null)

  function onSaveGeneral(values: SystemSettings) {
    updateSettings(values, actor)
    toast.success("Barangay information updated.")
  }

  function saveLogos() {
    updateSettings({ logoUrl: logo[0]?.url ?? settings.logoUrl, sealUrl: seal[0]?.url ?? settings.sealUrl }, actor)
    toast.success("Logo and seal updated.")
  }

  function saveTheme(primary: string, accent: string) {
    updateSettings({ themePrimaryColor: primary, themeAccentColor: accent }, actor)
    toast.success("Theme colors applied.")
  }

  function saveHeroBackground() {
    updateSettings({ heroBackgroundUrl: heroBg[0]?.url ?? "" }, actor)
    toast.success("Homepage background photo updated.")
  }

  function saveLoginBackground() {
    updateSettings({ loginBackgroundUrl: loginBg[0]?.url ?? "" }, actor)
    toast.success("Login page background photo updated.")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="Configure barangay information, officials, and system preferences." />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">
            <Building className="size-4" />
            Barangay Info
          </TabsTrigger>
          <TabsTrigger value="officials">
            <Users2 className="size-4" />
            Officials
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="size-4" />
            Contact & Email
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="size-4" />
            Theme & Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-border/70">
            <CardContent className="space-y-5 p-6">
              <form onSubmit={handleSubmit(onSaveGeneral)} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Barangay Name</Label>
                    <Input className="mt-1.5" {...register("barangayName")} />
                  </div>
                  <div>
                    <Label>Municipality</Label>
                    <Input className="mt-1.5" {...register("municipality")} />
                  </div>
                  <div>
                    <Label>Province</Label>
                    <Input className="mt-1.5" {...register("province")} />
                  </div>
                </div>
                <div>
                  <Label>Full Address</Label>
                  <Input className="mt-1.5" {...register("fullAddress")} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Founded</Label>
                    <Input className="mt-1.5" {...register("founded")} />
                  </div>
                  <div>
                    <Label>Population</Label>
                    <Input className="mt-1.5" {...register("population")} />
                  </div>
                  <div>
                    <Label>Land Area</Label>
                    <Input className="mt-1.5" {...register("landArea")} />
                  </div>
                </div>
                <div>
                  <Label>Mission Statement</Label>
                  <Textarea className="mt-1.5" rows={3} {...register("missionStatement")} />
                </div>
                <div>
                  <Label>Vision Statement</Label>
                  <Textarea className="mt-1.5" rows={3} {...register("visionStatement")} />
                </div>
                <div>
                  <Label>History</Label>
                  <Textarea className="mt-1.5" rows={4} {...register("historyText")} />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="officials">
          <Card className="border-border/70">
            <CardContent className="p-6">
              <div className="mb-4 flex justify-end">
                <Button onClick={() => { setEditingOfficial(undefined); setOfficialFormOpen(true) }}>
                  <Plus className="size-4" />
                  Add Official
                </Button>
              </div>
              <div className="space-y-2">
                {officials.map((official) => (
                  <div key={official.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <InitialsAvatar name={official.name} photoUrl={official.photoUrl} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{official.name}</p>
                      <p className="text-xs text-muted-foreground">{official.position}{official.committee ? ` · ${official.committee}` : ""}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingOfficial(official); setOfficialFormOpen(true) }}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingOfficialId(official.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card className="border-border/70">
            <CardContent className="space-y-5 p-6">
              <form onSubmit={handleSubmit(onSaveGeneral)} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Primary Contact Number</Label>
                    <Input className="mt-1.5" defaultValue={settings.contactNumbers[0]} {...register("contactNumbers.0")} />
                  </div>
                  <div>
                    <Label>Secondary Contact Number</Label>
                    <Input className="mt-1.5" defaultValue={settings.contactNumbers[1]} {...register("contactNumbers.1")} />
                  </div>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input className="mt-1.5" {...register("emailAddress")} />
                </div>
                <div>
                  <Label>Office Hours</Label>
                  <Input className="mt-1.5" {...register("officeHours")} />
                </div>
                <div className="rounded-lg border border-dashed border-border p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Mail className="size-4" />
                    SMTP Email Configuration
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>SMTP Host</Label>
                      <Input className="mt-1.5" {...register("smtpHost")} />
                    </div>
                    <div>
                      <Label>SMTP Port</Label>
                      <Input className="mt-1.5" {...register("smtpPort")} />
                    </div>
                    <div>
                      <Label>SMTP Username</Label>
                      <Input className="mt-1.5" {...register("smtpUsername")} />
                    </div>
                    <div>
                      <Label>Sender Name</Label>
                      <Input className="mt-1.5" {...register("smtpSenderName")} />
                    </div>
                  </div>
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="border-border/70">
            <CardContent className="space-y-6 p-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Barangay Logo & Seal</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FileDropzone label="Upload Logo" accept="image/*" multiple={false} value={logo} onChange={setLogo} />
                  <FileDropzone label="Upload Official Seal" accept="image/*" multiple={false} value={seal} onChange={setSeal} />
                </div>
                <Button className="mt-3" onClick={saveLogos}>
                  Save Logo & Seal
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">Homepage Background Photo</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Replaces the illustrated Barangay Hall backdrop behind the homepage hero section. Leave empty to use the default illustration.
                </p>
                <FileDropzone label="Upload Background Photo" accept="image/*" multiple={false} value={heroBg} onChange={setHeroBg} />
                <Button className="mt-3" onClick={saveHeroBackground}>
                  Save Background Photo
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">Login Page Background Photo</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Replaces the navy gradient backdrop behind the branding panel on the staff/admin login page. Leave empty to use the default gradient.
                </p>
                <FileDropzone label="Upload Background Photo" accept="image/*" multiple={false} value={loginBg} onChange={setLoginBg} />
                <Button className="mt-3" onClick={saveLoginBackground}>
                  Save Background Photo
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">Website Theme Colors</p>
                <ThemeColorForm settings={settings} onSave={saveTheme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OfficialFormDialog open={officialFormOpen} onOpenChange={setOfficialFormOpen} official={editingOfficial} />

      <ConfirmDialog
        open={!!deletingOfficialId}
        onOpenChange={(open) => !open && setDeletingOfficialId(null)}
        title="Remove Official"
        description="This will remove this official from the barangay council listing."
        destructive
        confirmLabel="Remove"
        onConfirm={() => {
          if (deletingOfficialId) {
            deleteOfficial(deletingOfficialId, actor)
            toast.success("Official removed.")
          }
        }}
      />
    </div>
  )
}

function ThemeColorForm({ settings, onSave }: { settings: SystemSettings; onSave: (primary: string, accent: string) => void }) {
  const [primary, setPrimary] = React.useState(settings.themePrimaryColor)
  const [accent, setAccent] = React.useState(settings.themeAccentColor)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Primary Color (Navy)</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="size-9 cursor-pointer rounded border border-input" />
            <Input value={primary} onChange={(e) => setPrimary(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Accent Color (Gold)</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="size-9 cursor-pointer rounded border border-input" />
            <Input value={accent} onChange={(e) => setAccent(e.target.value)} />
          </div>
        </div>
      </div>
      <Button onClick={() => onSave(primary, accent)}>Apply Theme</Button>
    </div>
  )
}
