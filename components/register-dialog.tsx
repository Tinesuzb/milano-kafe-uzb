"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"

interface RegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegisterDialog({ open, onOpenChange }: RegisterDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: t("error"),
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const success = await register(email, password, name, phone)
      if (success) {
        toast({
          title: t("success"),
          description: "Registration successful!",
        })
        onOpenChange(false)
        // Clear form
        setName("")
        setEmail("")
        setPhone("")
        setPassword("")
        setConfirmPassword("")
      } else {
        toast({
          title: t("error"),
          description: "Registration failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{t("register")}</DialogTitle>
          <DialogDescription>{t("register")} to start ordering delicious meals from Milano Cafe</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" value={name} required onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">{t("confirm")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700">
            {isLoading ? t("loading") : t("register")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
