"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { BackButton } from "@/components/back-button"
import { quizStorage } from "@/lib/quiz-storage"
import type { Category } from "@/lib/quiz-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CategoriesPage() {
  const { isAdmin } = useAuth()
  const { language } = useI18n()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  })

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }
    loadCategories()
  }, [isAdmin, router])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const cats = await quizStorage.getCategories()
      setCategories(cats)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCategory) {
        await quizStorage.updateCategory(editingCategory.id, formData)
      } else {
        const newCategory: Category = {
          id: crypto.randomUUID(),
          ...formData,
        }
        await quizStorage.addCategory(newCategory)
      }

      await loadCategories()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (
      confirm(
        language === "km"
          ? "តើអ្នកប្រាកដថាចង់លុបប្រភេទនេះទេ? តេស្តក្នុងប្រភេទនេះនឹងមិនត្រូវបានលុបទេ។"
          : "Are you sure you want to delete this category? Quizzes in this category will not be deleted."
      )
    ) {
      try {
        await quizStorage.deleteCategory(id)
        await loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "#3b82f6" })
    setEditingCategory(null)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton href="/" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {language === "km" ? "ប្រភេទ" : "Categories"}
              </h1>
              <p className="text-muted-foreground">
                {language === "km" ? "រៀបចំតេស្តរបស់អ្នកតាមប្រធានបទ" : "Organize your quizzes by subjects or topics"}
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === "km" ? "បន្ថែមប្រភេទ" : "Add Category"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory
                      ? language === "km"
                        ? "កែសម្រួលប្រភេទ"
                        : "Edit Category"
                      : language === "km"
                        ? "បង្កើតប្រភេទថ្មី"
                        : "Create New Category"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory
                      ? language === "km"
                        ? "ធ្វើបច្ចុប្បន្នភាពព័ត៌មានលម្អិតប្រភេទខាងក្រោម"
                        : "Update the category details below"
                      : language === "km"
                        ? "បន្ថែមប្រភេទថ្មីដើម្បីរៀបចំតេស្តរបស់អ្នក"
                        : "Add a new category to organize your quizzes"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {language === "km" ? "ឈ្មោះប្រភេទ" : "Category Name"}
                    </Label>
                    <Input
                      id="name"
                      placeholder={
                        language === "km"
                          ? "ឧ. គណិតវិទ្យា វិទ្យាសាស្ត្រ ប្រវត្តិសាស្ត្រ"
                          : "e.g., Mathematics, Science, History"
                      }
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {language === "km" ? "ការពិពណ៌នា" : "Description"}
                    </Label>
                    <Textarea
                      id="description"
                      placeholder={
                        language === "km"
                          ? "ការពិពណ៌នាសង្ខេបអំពីប្រភេទនេះ"
                          : "Brief description of this category"
                      }
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">
                      {language === "km" ? "ពណ៌" : "Color"}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-20 h-10"
                      />
                      <span className="text-sm text-muted-foreground">{formData.color}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                      {language === "km" ? "បោះបង់" : "Cancel"}
                    </Button>
                    <Button type="submit">
                      {editingCategory
                        ? language === "km"
                          ? "ធ្វើបច្ចុប្បន្នភាព"
                          : "Update"
                        : language === "km"
                          ? "បង្កើត"
                          : "Create"}{" "}
                      {language === "km" ? "ប្រភេទ" : "Category"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </CardContent>
            </Card>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "km" ? "មិនទាន់មានប្រភេទនៅឡើយ" : "No categories yet"}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {language === "km"
                    ? "បង្កើតប្រភេទដំបូងរបស់អ្នកដើម្បីចាប់ផ្តើមរៀបចំតេស្ត"
                    : "Create your first category to start organizing quizzes"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: category.color + "20" }}
                        >
                          <FolderOpen className="h-5 w-5" style={{ color: category.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{category.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{category.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        {language === "km" ? "កែសម្រួល" : "Edit"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive bg-transparent"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
