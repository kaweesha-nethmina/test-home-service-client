"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { paymentService } from "@/services/paymentService"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import type { Payment } from "@/types/api"
import { CreditCard, Wallet, XCircle, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PaymentsPage() {
  const { isLoading: authLoading } = useRequireAuth({ roles: ["customer"] })
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading) {
      loadPayments()
    }
  }, [authLoading])

  async function loadPayments() {
    try {
      const data = await paymentService.getAll()
      setPayments(data)
    } catch (error) {
      toast({
        title: "Failed to load payments",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "failed":
        return <XCircle className="h-6 w-6 text-destructive" />
      default:
        return <Clock className="h-6 w-6 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-secondary rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment History</h1>
          <p className="text-muted-foreground">View and manage your payment transactions</p>
        </div>

        {payments.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No payments yet</h3>
              <p className="text-muted-foreground mb-6">Your payment history will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment._id} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">Payment #{payment._id.slice(0, 8)}</h3>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {payment.paymentMethod || "Card"} • {new Date(payment.createdAt || "").toLocaleDateString()}
                        </p>
                        {payment.transactionId && (
                          <p className="text-xs text-muted-foreground mt-1">Transaction ID: {payment.transactionId}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">${payment.amount.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}