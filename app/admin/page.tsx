"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminService } from "@/services/adminService"
import type { User, Service, Category, Booking, Complaint, Notification } from "@/types/api"
import { 
  Users, 
  Briefcase, 
  FolderTree, 
  Calendar, 
  MessageSquare, 
  Bell,
  BarChart3,
  PieChart
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    services: 0,
    categories: 0,
    bookings: 0,
    complaints: 0,
    notifications: 0,
  })
  const [loading, setLoading] = useState(true)
  const [complaintData, setComplaintData] = useState<{name: string, value: number}[]>([])
  const [notificationData, setNotificationData] = useState<{name: string, value: number}[]>([])

  useEffect(() => {
    async function loadStats() {
      try {
        const [users, services, categories, bookings, complaints, notifications] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllServices(),
          adminService.getAllCategories(),
          adminService.getAllBookings(),
          adminService.getAllComplaints(),
          adminService.getAllNotifications(),
        ])

        // Handle API responses properly
        const usersData = Array.isArray(users) ? users : users.data || []
        const servicesData = Array.isArray(services) ? services : services.data || []
        const categoriesData = Array.isArray(categories) ? categories : categories.data || []
        const bookingsData = Array.isArray(bookings) ? bookings : bookings.data || []
        const complaintsData = Array.isArray(complaints) ? complaints : complaints.data || []
        const notificationsData = Array.isArray(notifications) ? notifications : notifications.data || []

        setStats({
          users: usersData.length,
          services: servicesData.length,
          categories: categoriesData.length,
          bookings: bookingsData.length,
          complaints: complaintsData.length,
          notifications: notificationsData.length,
        })

        // Prepare complaint data for chart
        const complaintStats = [
          { name: "Open", value: complaintsData.filter((c: Complaint) => c.status === "open").length },
          { name: "In Progress", value: complaintsData.filter((c: Complaint) => c.status === "in-progress").length },
          { name: "Resolved", value: complaintsData.filter((c: Complaint) => c.status === "resolved").length },
          { name: "Closed", value: complaintsData.filter((c: Complaint) => c.status === "closed").length },
        ]
        setComplaintData(complaintStats)

        // Prepare notification data for chart
        const notificationStats = [
          { name: "Info", value: notificationsData.filter((n: Notification) => n.type === "info").length },
          { name: "Success", value: notificationsData.filter((n: Notification) => n.type === "success").length },
          { name: "Warning", value: notificationsData.filter((n: Notification) => n.type === "warning").length },
          { name: "Error", value: notificationsData.filter((n: Notification) => n.type === "error").length },
        ]
        setNotificationData(notificationStats)
      } catch (error) {
        console.error("Failed to load stats:", error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const statCards = [
    { name: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { name: "Total Services", value: stats.services, icon: Briefcase, color: "text-primary" },
    { name: "Categories", value: stats.categories, icon: FolderTree, color: "text-primary" },
    { name: "Total Bookings", value: stats.bookings, icon: Calendar, color: "text-primary" },
    { name: "Complaints", value: stats.complaints, icon: MessageSquare, color: "text-destructive" },
    { name: "Notifications", value: stats.notifications, icon: Bell, color: "text-blue-500" },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-secondary rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.name} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Complaint Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={complaintData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {complaintData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={notificationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New booking created</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New complaint submitted</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Providers</span>
              <span className="text-sm font-semibold">{Math.floor(stats.users * 0.3)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Customers</span>
              <span className="text-sm font-semibold">{Math.floor(stats.users * 0.7)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Bookings</span>
              <span className="text-sm font-semibold">{Math.floor(stats.bookings * 0.4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed Bookings</span>
              <span className="text-sm font-semibold">{Math.floor(stats.bookings * 0.6)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Open Complaints</span>
              <span className="text-sm font-semibold">
                {complaintData.find(c => c.name === "Open")?.value || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Unread Notifications</span>
              <span className="text-sm font-semibold">
                {notificationData.reduce((sum, n) => sum + n.value, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}