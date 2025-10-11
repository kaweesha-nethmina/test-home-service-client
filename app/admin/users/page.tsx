"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { adminService } from "@/services/adminService"
import type { User } from "@/types/api"
import { Search, Ban, CheckCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const data = await adminService.getAllUsers()
      // Ensure data is an array
      if (Array.isArray(data)) {
        setUsers(data)
      } else if (data && Array.isArray(data.data)) {
        // If data is an object with a data array property
        setUsers(data.data)
      } else {
        // Fallback to empty array if data format is unexpected
        console.warn('Unexpected data format received:', data)
        setUsers([])
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: "Failed to load users",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleBlockToggle(user: User) {
    try {
      if (user.isBlocked) {
        await adminService.unblockUser(user._id)
        toast({ title: "User unblocked", description: `${user.firstName} ${user.lastName} has been unblocked` })
      } else {
        await adminService.blockUser(user._id)
        toast({ title: "User blocked", description: `${user.firstName} ${user.lastName} has been blocked` })
      }
      loadUsers()
    } catch (error) {
      toast({
        title: "Action failed",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  async function handleDelete() {
    if (!deleteId) return

    try {
      await adminService.deleteUser(deleteId)
      setUsers(users.filter((u) => u._id !== deleteId))
      toast({ title: "User deleted", description: "User has been removed from the system" })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const filteredUsers = Array.isArray(users) 
    ? users.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []
      
  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Users Management</h1>
        <p className="text-muted-foreground">Manage all users on the platform</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10 bg-secondary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user._id} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold text-primary">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {user.firstName} {user.lastName}
                      </h3>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                      {user.isBlocked && (
                        <Badge variant="destructive" className="text-xs">
                          Blocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBlockToggle(user)}
                    className={user.isBlocked ? "bg-transparent" : "bg-transparent"}
                  >
                    {user.isBlocked ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Block
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteId(user._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">Try adjusting your search query</p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}