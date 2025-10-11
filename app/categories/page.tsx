"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { categoryService } from "@/services/categoryService"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Category } from "@/types/api"
import { Header } from "@/components/layout/Header"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      setFilteredCategories(categories.filter((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase())))
    } else {
      setFilteredCategories(categories)
    }
  }, [searchQuery, categories])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
      setFilteredCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
              </Card>
            ))}
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Categories</h1>
          <p className="text-muted-foreground">Find the perfect service for your home</p>
        </div>

        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link key={category._id} href={`/categories/${category._id}`}>
                <Card className="p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 hover:border-primary">
                  <div className="text-center">
                    <div className="text-5xl mb-4">{category.icon || "📦"}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description || "Explore services"}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}