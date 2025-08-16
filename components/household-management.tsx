"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Trash2, User } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

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

const RELATIONSHIP_OPTIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "grandparent", label: "Grandparent" },
  { value: "grandchild", label: "Grandchild" },
  { value: "other_relative", label: "Other Relative" },
  { value: "unrelated", label: "Unrelated Person" },
]

export function HouseholdManagement({ householdMembers, onUpdate }: HouseholdManagementProps) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMember, setNewMember] = useState<Omit<HouseholdMember, "id">>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    socialSecurityNumber: "",
    relationship: "",
  })

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
      const memberWithId = { ...newMember, id: uuidv4() }
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
        <h3 className="text-xl font-semibold mb-2">Household Members</h3>
        <p className="text-gray-600">
          Add any additional people who live with you and should be included in your application. You can skip this step
          if you live alone.
        </p>
      </div>

      {/* Current Household Members */}
      {householdMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Current Household Members ({householdMembers.length})
            </CardTitle>
            <CardDescription>People included in your application</CardDescription>
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
                        Born: {new Date(member.dateOfBirth).toLocaleDateString()}
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
            <CardTitle>Add Household Member</CardTitle>
            <CardDescription>Enter information for the new household member</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberFirstName">First Name *</Label>
                <Input
                  id="memberFirstName"
                  type="text"
                  value={newMember.firstName}
                  onChange={(e) => updateNewMemberField("firstName", e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberLastName">Last Name *</Label>
                <Input
                  id="memberLastName"
                  type="text"
                  value={newMember.lastName}
                  onChange={(e) => updateNewMemberField("lastName", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberDob">Date of Birth *</Label>
                <Input
                  id="memberDob"
                  type="date"
                  value={newMember.dateOfBirth}
                  onChange={(e) => updateNewMemberField("dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberRelationship">Relationship to You *</Label>
                <Select
                  value={newMember.relationship}
                  onValueChange={(value) => updateNewMemberField("relationship", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
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
              <Label htmlFor="memberSSN">Social Security Number *</Label>
              <Input
                id="memberSSN"
                type="text"
                value={newMember.socialSecurityNumber}
                onChange={(e) => updateNewMemberField("socialSecurityNumber", formatSSN(e.target.value))}
                placeholder="XXX-XX-XXXX"
                maxLength={11}
              />
              <p className="text-xs text-gray-500">Required for benefit eligibility verification</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={addMember} className="flex-1">
                Add Member
              </Button>
              <Button variant="outline" onClick={cancelAdd} className="flex-1 bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <Button onClick={() => setIsAddingMember(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Household Member
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            {householdMembers.length === 0
              ? "No additional household members added yet"
              : `${householdMembers.length} household member${householdMembers.length > 1 ? "s" : ""} added`}
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
              <p className="font-medium text-blue-900 mb-1">Who should I include?</p>
              <p className="text-blue-800">
                Include anyone who lives with you regularly, shares meals, or contributes to household expenses. This
                includes spouses, children, parents, and other relatives or unrelated individuals living in your home.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
