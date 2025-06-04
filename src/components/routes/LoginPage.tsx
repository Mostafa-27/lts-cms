"use client"

import { useForm } from "react-hook-form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card" // Corrected path
import { Label } from "@/components/ui/label" // Corrected path
import { Input } from "@/components/ui/input" // Corrected path
import { Button } from "@/components/ui/button" // Corrected path
import { useAuth } from "@/contexts/AuthContext"

type FormData = {
  email: string
  password: string
}

export function LoginPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>()
  const { login } = useAuth()

  const onSubmit = async (data: FormData) => {
    
    try {
      await login(data.email, data.password)
    } catch (error) {
      console.error("Login failed:", error)
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-4 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-center text-2xl dark:text-gray-100">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" {...register("email")} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" {...register("password")} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage;
