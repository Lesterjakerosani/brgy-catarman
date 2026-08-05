"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { ArrowLeft, ArrowRight, Lock, MapPin, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { BarangaySeal } from "@/components/shared/barangay-seal"
import { Particles } from "@/components/public/sections/particles"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useSettingsStore } from "@/lib/stores/settings-store"

const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
  rememberMe: z.boolean(),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const settings = useSettingsStore((s) => s.settings)
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  })

  function onSubmit(values: LoginValues) {
    const result = login(values.email, values.password, values.rememberMe)
    if (!result.success) {
      setFormError(result.error ?? "Unable to log in. Please try again.")
      return
    }
    setFormError(null)
    router.push("/dashboard/overview")
  }

  function handleForgotPassword() {
    toast("Please contact your barangay administrator to reset your password.", { icon: "🔒" })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid min-h-screen grid-cols-1 md:grid-cols-2 lg:grid-cols-[55%_45%]"
    >
      {/* Left branding panel */}
      <div className="relative hidden overflow-hidden md:block">
        {settings.loginBackgroundUrl ? (
          <>
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.loginBackgroundUrl} alt="" className="size-full scale-105 object-cover blur-[1px]" />
            </div>
            <div className="absolute inset-0 bg-[#0F2B5B]/70" />
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(8,26,58,0.45) 100%)" }}
            />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0F2B5B 0%, #173A73 100%)" }} />
        )}

        {/* Decorative background layer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-28 -top-28 size-72 rounded-full bg-[#D4AF37]/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 size-96 rounded-full bg-white/10 blur-3xl" />
          <span className="absolute right-16 top-24 size-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_12px_3px_rgba(212,175,55,0.5)]" />
          <span className="absolute bottom-32 left-16 size-1 rounded-full bg-white/60 shadow-[0_0_10px_3px_rgba(255,255,255,0.35)]" />
        </div>
        <Particles count={10} minSize={4} maxSize={9} glow minDuration={20} maxDuration={36} glowIntensity={0.25} />

        <div className="relative flex h-full flex-col overflow-y-auto p-10 lg:p-14">
          <div className="mx-auto flex w-full max-w-[540px] flex-1 flex-col items-center py-4 text-center">
            {/* Top government badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
              <p className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">
                <BarangaySeal className="size-4" />
                Republic of the Philippines
              </p>
              <p className="mt-2 text-xs text-white/60">{settings.barangayName}</p>
              <p className="text-xs text-white/45">
                {settings.municipality}, {settings.province}
              </p>
              <div className="mt-4 h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
            </motion.div>

            {/* Logo in floating glass circle with glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="relative mt-10"
            >
              <div className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/25 blur-3xl" />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex size-[150px] items-center justify-center rounded-full border border-[#D4AF37]/40 bg-white/[0.08] shadow-xl backdrop-blur-md"
              >
                <BarangaySeal className="size-[100px] drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="mt-8 font-heading text-[44px] font-extrabold leading-[1.05] tracking-normal text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.25)] md:text-[56px] lg:text-[64px]"
            >
              e-Catarman
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
              className="mt-4 text-[20px] font-medium text-white/[0.82]"
            >
              Digital Barangay Operations Management System
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
              className="mx-auto mt-5 max-w-[500px] text-[17px] leading-[1.8] font-normal text-white/70"
            >
              A centralized platform designed to streamline barangay operations, resident services, records
              management, and public service delivery.
            </motion.p>
          </div>

          {/* Bottom information */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="mx-auto mt-10 w-full max-w-[540px] space-y-4"
          >
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 shadow-lg backdrop-blur-md">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Lock className="size-4 text-[#D4AF37]" />
                Government Staff Portal
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/60">Authorized Personnel Only</p>
              <p className="mt-2.5 flex items-center gap-1.5 text-xs text-white/45">
                <MapPin className="size-3.5 shrink-0" />
                Serving {settings.barangayName}, {settings.municipality}
              </p>
            </div>
            <p className="text-center text-xs text-white/40">© {new Date().getFullYear()} Barangay Catarman. All rights reserved.</p>
          </motion.div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="relative flex items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8">
        {/* Soft decorative background layer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F8FAFC] to-[#EEF4FF]" />

          {/* Large blurred blue circle, top-right */}
          <div className="absolute -right-24 -top-24 size-[350px] rounded-full bg-blue-500/15 blur-3xl" />
          {/* Medium blurred navy circle, bottom-left */}
          <div className="absolute -bottom-16 -left-16 size-[250px] rounded-full bg-[#0F2A52]/10 blur-3xl" />

          {/* Thin curved geometric lines, flowing behind the card */}
          <svg className="absolute inset-0 size-full opacity-[0.08]" viewBox="0 0 800 900" fill="none" preserveAspectRatio="xMidYMid slice">
            <path d="M -50 200 C 250 100, 450 350, 850 220" stroke="#3B82F6" strokeWidth="2" />
            <path d="M -50 700 C 300 850, 500 550, 850 680" stroke="#3B82F6" strokeWidth="2" />
          </svg>

          {/* Subtle dot-grid pattern, centered behind the login card */}
          <div
            className="absolute left-1/2 top-1/2 h-[720px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle, #0F2A52 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />

          {/* Small gold accent dots */}
          <span className="absolute left-[15%] top-[20%] size-2 rounded-full bg-[#D4AF37]/40 blur-[0.5px]" />
          <span className="absolute bottom-[24%] right-[16%] size-2.5 rounded-full bg-[#D4AF37]/40 blur-[0.5px]" />
          <span className="absolute right-[26%] top-[62%] size-1.5 rounded-full bg-[#D4AF37]/40 blur-[0.5px]" />

          {/* Soft radial glow behind the card */}
          <div className="absolute left-1/2 top-1/2 size-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/25 blur-[110px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative w-full max-w-[430px]"
        >
          <Link href="/" className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground md:hidden">
            <ArrowLeft className="size-3.5" />
            Back to homepage
          </Link>

          <div className="mb-8 flex items-center gap-3 md:hidden">
            <BarangaySeal className="size-10" />
            <div>
              <p className="font-heading text-base font-bold text-foreground">e-Catarman</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Digital Barangay Operations Management System</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white/90 shadow-[0_20px_60px_rgba(15,42,82,0.10)] backdrop-blur-xl">
            <div className="h-1 w-full bg-gradient-to-r from-[#0F2A52] to-[#1E40AF]" />

            <div className="p-6 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-foreground">Staff & Admin Login</p>
              <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-[#0a1930]">Welcome Back</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Sign in using your official Barangay account to continue.</p>

              <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3.5 py-1.5 text-xs font-medium text-[#1E40AF]">
                <ShieldCheck className="size-3.5" />
                Secure Government Portal
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-9 space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@barangaycatarman.gov.ph"
                            className="h-[54px] rounded-[14px] border-[#DCE3EE] pl-4 text-base transition-all duration-200 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/15"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="••••••••"
                            className="h-[54px] rounded-[14px] border-[#DCE3EE] pl-4 text-base transition-all duration-200 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/15"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0 cursor-pointer font-normal">Remember me</FormLabel>
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {formError ? <p className="text-sm font-medium text-destructive">{formError}</p> : null}

                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="h-[54px] w-full rounded-[14px] text-base font-semibold shadow-md transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
                  >
                    Sign In
                    <ArrowRight className="size-4" />
                  </Button>
                </form>
              </Form>

              <div className="my-7 h-px w-full bg-border" />

              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Need help? Contact your Barangay System Administrator.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
