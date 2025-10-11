import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Service } from "@/types/api"
import { Star } from "lucide-react"
import api from "@/lib/api"

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  // Ensure image URLs include the backend URL if they're relative paths
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Use the API base URL from the api instance
    const baseURL = api.defaults.baseURL || "http://localhost:5000";
    return `${baseURL}${imageUrl}`;
  };

  return (
    <Card className="border-border/50 overflow-hidden group hover:border-primary/50 transition-all">
      <div className="aspect-video relative overflow-hidden bg-secondary">
        {service.images?.[0] ? (
          <img
            src={getImageUrl(service.images[0]) || "/placeholder.svg"}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{service.name?.[0] || "S"}</span>
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{service.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-medium">4.8</span>
          </div>
          <div className="text-lg font-bold text-primary">${service.price}</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/services/${service._id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}