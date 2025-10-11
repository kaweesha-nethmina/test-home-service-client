"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface Review {
  id: string
  userName: string
  rating: number
  comment: string
  date: string
}

const mockReviews: Review[] = [
  {
    id: "1",
    userName: "John Doe",
    rating: 5,
    comment: "Excellent service! The provider was professional and completed the work on time.",
    date: "2023-10-15"
  },
  {
    id: "2",
    userName: "Sarah Smith",
    rating: 4,
    comment: "Very satisfied with the quality of work. Will definitely use this service again.",
    date: "2023-10-10"
  },
  {
    id: "3",
    userName: "Michael Johnson",
    rating: 5,
    comment: "Outstanding service from start to finish. Highly recommended!",
    date: "2023-10-05"
  }
]

export function ServiceReviews() {
  const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{mockReviews.length} reviews</div>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = mockReviews.filter(r => r.rating === stars).length
              const percentage = (count / mockReviews.length) * 100
              return (
                <div key={stars} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-4">{stars}</span>
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          {mockReviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>{review.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{review.userName}</h4>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-2">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}