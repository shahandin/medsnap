"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Trash2, User } from "lucide-react"
import { useTranslation } from "@/lib/translations"

interface HouseholdMember {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  socialSecurityNumber: string
  relationship: string
}

interface HouseholdManagementProps {
  householdMembers: HouseholdMember[]
  onUpdate: (members: HouseholdMember[]) => void
}

const generateId = () => uuidv4()

export function HouseholdManagement({ householdMembers, onUpdate }: HouseholdManagementProps) {
  const { t } = useTranslation()
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState<Omit<HouseholdMember, "id">>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    socialSecurityNumber: "",
    relationship: "",
  })

  const RELATIONSHIP_OPTIONS = [
    { value: "spouse", label: t("forms.household.relationships.spouse") },
    { value: "child", label: t("forms.household.relationships.child") },
    { value: "parent", label: t("forms.household.relationships.parent") },
    { value: "sibling", label: t("forms.household.relationships.sibling") },
    { value: "grandparent", label: t("householdManagement.relationships.grandparent") },
    { value: "grandchild", label: t("householdManagement.relationships.grandchild") },
    { value: "other_relative", label: t("householdManagement.relationships.otherRelative") },
    { value: "unrelated", label: t("householdManagement.relationships.unrelated") },
  ]

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length >= 9) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`
    } else if (digits.length >= 5) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
    } else if (digits.length >= 3) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`
    }
    return digits
  }

  const updateNewMemberField = (field: keyof Omit<HouseholdMember, "id">, value: string) => {
    setNewMember((prev) => ({ ...prev, [field]: value }))
  }

  const addMember = () => {
    if (
      newMember.firstName.trim() &&
      newMember.lastName.trim() &&
      newMember.dateOfBirth &&
      newMember.socialSecurityNumber.trim() &&
      newMember.relationship
    ) {
      const memberWithId = { ...newMember, id: generateId() }
      onUpdate([...householdMembers, memberWithId])
      setNewMember({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        socialSecurityNumber: "",
        relationship: "",
      })
      setIsAddingMember(false)
    }
  }

  const removeMember = (id: string) => {
    onUpdate(householdMembers.filter((member) => member.id !== id))
  }

  const cancelAdd = () => {
    setNewMember({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      socialSecurityNumber: "",
      relationship: "",
    })
    setIsAddingMember(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t("householdManagement.title")}</h3>
        <p className="text-gray-600">{t("householdManagement.description")}</p>
      </div>

      {/* Current Household Members */}
      {householdMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t("householdManagement.currentMembers", { count: householdMembers.length })}
            </CardTitle>
            <CardDescription>{t("householdManagement.peopleIncluded")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {householdMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <User className="w-8 h-8 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t("householdManagement.born")}: {new Date(member.dateOfBirth).toLocaleDateString()}
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {RELATIONSHIP_OPTIONS.find((r) => r.value === member.relationship)?.label}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Member Form */}
      {isAddingMember ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("householdManagement.addMemberTitle")}</CardTitle>
            <CardDescription>{t("householdManagement.addMemberDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberFirstName">{t("householdManagement.firstName")} *</Label>
                <Input
                  id="memberFirstName"
                  type="text"
                  value={newMember.firstName}
                  onChange={(e) => updateNewMemberField("firstName", e.target.value)}
                  placeholder={t("householdManagement.firstNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberLastName">{t("householdManagement.lastName")} *</Label>
                <Input
                  id="memberLastName"
                  type="text"
                  value={newMember.lastName}
                  onChange={(e) => updateNewMemberField("lastName", e.target.value)}
                  placeholder={t("householdManagement.lastNamePlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberDob">{t("householdManagement.dateOfBirth")} *</Label>
                <Input
                  id="memberDob"
                  type="date"
                  value={newMember.dateOfBirth}
                  onChange={(e) => updateNewMemberField("dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberRelationship">{t("householdManagement.relationshipToYou")} *</Label>
                <Select
                  value={newMember.relationship}
                  onValueChange={(value) => updateNewMemberField("relationship", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("householdManagement.selectRelationship")} />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberSSN">{t("householdManagement.socialSecurityNumber")} *</Label>
              <Input
                id="memberSSN"
                type="text"
                value={newMember.socialSecurityNumber}
                onChange={(e) => updateNewMemberField("socialSecurityNumber", formatSSN(e.target.value))}
                placeholder={t("householdManagement.ssnPlaceholder")}
                maxLength={11}
              />
              <p className="text-xs text-gray-500">{t("householdManagement.ssnNote")}</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={addMember} className="flex-1">
                {t("householdManagement.addMember")}
              </Button>
              <Button variant="outline" onClick={cancelAdd} className="flex-1 bg-transparent">
                {t("common.cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <Button onClick={() => setIsAddingMember(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t("forms.household.addMember")}
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            {householdMembers.length === 0
              ? t("householdManagement.noMembersAdded")
              : t("householdManagement.membersAdded", {
                  count: householdMembers.length,
                  plural: householdMembers.length > 1 ? "s" : "",
                })}
          </p>
        </div>
      )}

      {/* Information Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">{t("householdManagement.whoToIncludeTitle")}</p>
              <p className="text-blue-800">{t("householdManagement.whoToIncludeDescription")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
