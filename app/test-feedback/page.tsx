"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FeedbackModal } from "@/components/shared/FeedbackModal"

export default function TestFeedbackPage() {
  const [showModal, setShowModal] = useState(false)
  
  // Mock booking data for testing
  const mockBooking = {
    _id: "test-booking-id",
    service: "test-service-id",
    provider: "test-provider-id",
    date: new Date().toISOString(),
    status: "completed"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Feedback Test Page</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Feedback Button</h2>
        <p className="mb-4">Click the button below to test the feedback modal:</p>
        <Button onClick={() => setShowModal(true)}>
          Open Feedback Modal
        </Button>
      </Card>
      
      {showModal && (
        <FeedbackModal
          open={showModal}
          onOpenChange={setShowModal}
          booking={mockBooking}
          onSubmit={() => console.log("Feedback submitted")}
        />
      )}
    </div>
  )
}