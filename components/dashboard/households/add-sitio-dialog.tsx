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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useSitiosStore } from "@/lib/stores/sitios-store"
import { useAuthStore } from "@/lib/stores/auth-store"

const sitioSchema = z.object({
  name: z.string().min(1, "Sitio name cannot be empty."),
})

type FormValues = z.infer<typeof sitioSchema>

interface AddSitioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (sitioId: string) => void
}

export function AddSitioDialog({ open, onOpenChange, onCreated }: AddSitioDialogProps) {
  const addSitio = useSitiosStore((s) => s.addSitio)
  const session = useAuthStore((s) => s.session)

  const form = useForm<FormValues>({
    resolver: zodResolver(sitioSchema),
    defaultValues: { name: "" },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({ name: "" })
    }
  }, [open, form])

  function onSubmit(values: FormValues) {
    const actor = session?.name ?? "Staff"
    const result = addSitio(values.name, actor)

    if (!result.success) {
      form.setError("name", { message: result.error ?? "Unable to create sitio." })
      return
    }

    toast.success(`Sitio "${result.sitio!.name}" created.`)
    onOpenChange(false)
    onCreated?.(result.sitio!.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Sitio</DialogTitle>
          <DialogDescription>Create a new Sitio to organize households.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="add-sitio-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Sitio Name" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="add-sitio-form" className="bg-[#1E40AF] hover:bg-[#1D4ED8]">
            Create Sitio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
