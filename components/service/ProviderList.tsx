"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Phone, Mail, MapPin } from "lucide-react"
import type { User } from "@/types/api"
import Link from "next/link"

interface ProviderListProps {
  providers: User[]
  serviceId: string
}

export function ProviderList({ providers, serviceId }: ProviderListProps) {
  if (providers.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Available Providers ({providers.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <Card key={provider._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-semibold text-primary">
                    {provider.firstName?.[0]}
                    {provider.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {provider.firstName} {provider.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span>4.9</span>
                        <span>(87)</span>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/bookings/create?serviceId=${serviceId}&providerId=${provider._id}`}>
                        Book
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{provider.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Colombo, Sri Lanka</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}