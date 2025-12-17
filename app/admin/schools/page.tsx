"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Building2, MapPin, Trash2, Edit } from "lucide-react"
import { quizStorage } from "@/lib/quiz-storage"
import type { School } from "@/lib/quiz-types"
import Link from "next/link"

export default function SchoolsPage() {
  const { isAdmin, isTeacher } = useAuth()
  const { language, t } = useI18n()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    nameKm: "",
    address: "",
    province: "",
    district: "",
  })

  useEffect(() => {
    if (isAdmin || isTeacher) {
      loadSchools()
    }
  }, [isAdmin, isTeacher])

  const loadSchools = async () => {
    try {
      setLoading(true)
      const data = await quizStorage.getSchools()
      setSchools(data)
    } catch (error) {
      console.error('Error loading schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingSchool) {
        await quizStorage.updateSchool(editingSchool.id, formData)
      } else {
        const newSchool: School = {
          id: `school-${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString(),
        }
        await quizStorage.addSchool(newSchool)
      }

      await loadSchools()
      setIsOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving school:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm(language === "km" ? "តើអ្នកប្រាកដទេ?" : "Are you sure?")) {
      try {
        await quizStorage.deleteSchool(id)
        await loadSchools()
      } catch (error) {
        console.error('Error deleting school:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: "", nameKm: "", address: "", province: "", district: "" })
    setEditingSchool(null)
  }

  const handleEdit = (school: School) => {
    setEditingSchool(school)
    setFormData({
      name: school.name,
      nameKm: school.nameKm || "",
      address: school.address,
      province: school.province,
      district: school.district,
    })
    setIsOpen(true)
  }

  if (!isAdmin && !isTeacher) {
    return <div>{language === "km" ? "អ្នកមិនមានសិទ្ធិចូលប្រើទំព័រនេះ" : "Access denied"}</div>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton href="/" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">{language === "km" ? "គ្រឹះស្ថានសិក្សា" : "Schools"}</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {language === "km" ? "គ្រប់គ្រងគ្រឹះស្ថានសិក្សា" : "Manage educational institutions"}
              </p>
            </div>

            {isAdmin && (
              <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                  setIsOpen(open)
                  if (!open) resetForm()
                }}
              >
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    {language === "km" ? "បន្ថែមសាលា" : "Add School"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSchool
                        ? language === "km"
                          ? "កែសម្រួលសាលា"
                          : "Edit School"
                        : language === "km"
                          ? "បន្ថែមសាលា"
                          : "Add School"}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === "km" ? "ឈ្មោះ (English)" : "Name (English)"}</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Phnom Penh High School"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{language === "km" ? "ឈ្មោះ (ខ្មែរ)" : "Name (Khmer)"}</Label>
                        <Input
                          value={formData.nameKm}
                          onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                          placeholder="វិទ្យាល័យភ្នំពេញ"
                          className="font-khmer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === "km" ? "អាសយដ្ឋាន" : "Address"}</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Street 123, Sangkat..."
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === "km" ? "ខេត្ត" : "Province"}</Label>
                        <Input
                          value={formData.province}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                          placeholder={language === "km" ? "ភ្នំពេញ" : "Phnom Penh"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{language === "km" ? "ស្រុក" : "District"}</Label>
                        <Input
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          placeholder={language === "km" ? "ដូនពេញ" : "Doun Penh"}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSubmit} className="w-full">
                      {editingSchool
                        ? language === "km"
                          ? "រក្សាទុកការផ្លាស់ប្តូរ"
                          : "Save Changes"
                        : language === "km"
                          ? "បន្ថែមសាលា"
                          : "Add School"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
          ) : schools.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{language === "km" ? "មិនទាន់មានសាលា" : "No schools yet"}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schools.map((school) => (
              <Card key={school.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {language === "km" && school.nameKm ? school.nameKm : school.name}
                        </CardTitle>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(school)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(school.id)} className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{school.address}</p>
                        <p className="text-muted-foreground">
                          {school.district}, {school.province}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link href={`/admin/schools/${school.id}/classes`}>
                    <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                      {language === "km" ? "មើលថ្នាក់" : "View Classes"}
                    </Button>
                  </Link>
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
