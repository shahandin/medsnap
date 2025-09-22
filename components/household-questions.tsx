"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslation } from "@/contexts/translation-context"

interface HouseholdMember {
  id: string
  firstName: string
  lastName: string
  relationship: string
}

interface HouseholdQuestionsProps {
  data: {
    appliedWithDifferentInfo: string
    appliedWithDifferentInfoMembers: string[]
    appliedInOtherState: string
    appliedInOtherStateMembers: string[]
    receivedBenefitsBefore: string
    receivedBenefitsBeforeMembers: string[]
    receivingSNAPThisMonth: string
    receivingSNAPThisMonthMembers: string[]
    disqualifiedFromBenefits: string
    disqualifiedFromBenefitsMembers: string[]
    wantSomeoneElseToReceiveSNAP: string
    wantSomeoneElseToReceiveSNAPMembers: string[]
  }
  benefitTypes: string[]
  householdMembers: HouseholdMember[]
  applicantName: string
  onUpdate: (data: any) => void
}

export default function HouseholdQuestions({
  data,
  benefitTypes,
  householdMembers,
  applicantName,
  onUpdate,
}: HouseholdQuestionsProps) {
  const { t } = useTranslation()
  const isApplyingForSNAP = benefitTypes.includes("snap") || benefitTypes.includes("both")

  // Create a list of all household members including the applicant
  const allMembers = [
    {
      id: "applicant",
      firstName: applicantName.split(" ")[0] || t("householdQuestions.you"),
      lastName: "",
      relationship: t("householdQuestions.applicant"),
    },
    ...householdMembers,
  ]

  const updateField = (field: string, value: string) => {
    const updates = { ...data, [field]: value }

    if (value === "no") {
      const memberField = `${field}Members`
      if (data[memberField as keyof typeof data]) {
        updates[memberField as keyof typeof updates] = []
      }
    }

    onUpdate(updates)
  }

  const updateMemberSelection = (field: string, memberId: string, checked: boolean) => {
    const memberField = `${field}Members`
    const currentMembers = (data[memberField as keyof typeof data] as string[]) || []

    let updatedMembers
    if (checked) {
      updatedMembers = [...currentMembers, memberId]
    } else {
      updatedMembers = currentMembers.filter((id) => id !== memberId)
    }

    onUpdate({
      ...data,
      [memberField]: updatedMembers,
    })
  }

  const renderMemberSelection = (field: string, questionAnswer: string) => {
    if (questionAnswer !== "yes") return null

    const memberField = `${field}Members`
    const selectedMembers = (data[memberField as keyof typeof data] as string[]) || []

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">{t("householdQuestions.selectMembers")}</Label>
        <div className="space-y-2">
          {allMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${field}-${member.id}`}
                checked={selectedMembers.includes(member.id)}
                onCheckedChange={(checked) => updateMemberSelection(field, member.id, checked as boolean)}
              />
              <Label htmlFor={`${field}-${member.id}`} className="text-sm">
                {member.firstName} {member.lastName} {member.relationship && `(${member.relationship})`}
              </Label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Question 1: Applied with different name/SSN */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("householdQuestions.appliedWithDifferentInfo")}</Label>
            <RadioGroup
              value={data.appliedWithDifferentInfo}
              onValueChange={(value) => updateField("appliedWithDifferentInfo", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="different-info-yes" />
                <Label htmlFor="different-info-yes">{t("common.yes")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="different-info-no" />
                <Label htmlFor="different-info-no">{t("common.no")}</Label>
              </div>
            </RadioGroup>
            {renderMemberSelection("appliedWithDifferentInfo", data.appliedWithDifferentInfo)}
          </div>

          <Separator />

          {/* Question 2: Applied in other state */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("householdQuestions.appliedInOtherState")}</Label>
            <RadioGroup
              value={data.appliedInOtherState}
              onValueChange={(value) => updateField("appliedInOtherState", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="other-state-yes" />
                <Label htmlFor="other-state-yes">{t("common.yes")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="other-state-no" />
                <Label htmlFor="other-state-no">{t("common.no")}</Label>
              </div>
            </RadioGroup>
            {renderMemberSelection("appliedInOtherState", data.appliedInOtherState)}
          </div>

          <Separator />

          {/* Question 3: Ever received benefits */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t("householdQuestions.receivedBenefitsBefore")}</Label>
            <RadioGroup
              value={data.receivedBenefitsBefore}
              onValueChange={(value) => updateField("receivedBenefitsBefore", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="received-before-yes" />
                <Label htmlFor="received-before-yes">{t("common.yes")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="received-before-no" />
                <Label htmlFor="received-before-no">{t("common.no")}</Label>
              </div>
            </RadioGroup>
            {renderMemberSelection("receivedBenefitsBefore", data.receivedBenefitsBefore)}
          </div>

          {/* SNAP-specific questions */}
          {isApplyingForSNAP && (
            <>
              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-4">{t("householdQuestions.snapSpecificQuestions")}</h3>

                {/* Question 4: Receiving SNAP this month */}
                <div className="space-y-3 mb-6">
                  <Label className="text-base font-medium text-blue-900">
                    {t("householdQuestions.receivingSNAPThisMonth")}
                  </Label>
                  <RadioGroup
                    value={data.receivingSNAPThisMonth}
                    onValueChange={(value) => updateField("receivingSNAPThisMonth", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="snap-this-month-yes" />
                      <Label htmlFor="snap-this-month-yes">{t("common.yes")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="snap-this-month-no" />
                      <Label htmlFor="snap-this-month-no">{t("common.no")}</Label>
                    </div>
                  </RadioGroup>
                  {renderMemberSelection("receivingSNAPThisMonth", data.receivingSNAPThisMonth)}
                </div>

                {/* Question 5: Disqualified from benefits */}
                <div className="space-y-3 mb-6">
                  <Label className="text-base font-medium text-blue-900">
                    {t("householdQuestions.disqualifiedFromBenefits")}
                  </Label>
                  <RadioGroup
                    value={data.disqualifiedFromBenefits}
                    onValueChange={(value) => updateField("disqualifiedFromBenefits", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="disqualified-yes" />
                      <Label htmlFor="disqualified-yes">{t("common.yes")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="disqualified-no" />
                      <Label htmlFor="disqualified-no">{t("common.no")}</Label>
                    </div>
                  </RadioGroup>
                  {renderMemberSelection("disqualifiedFromBenefits", data.disqualifiedFromBenefits)}
                </div>

                {/* Question 6: Someone else receive SNAP */}
                <div className="space-y-3">
                  <Label className="text-base font-medium text-blue-900">
                    {t("householdQuestions.wantSomeoneElseToReceiveSNAP")}
                  </Label>
                  <p className="text-sm text-blue-700">{t("householdQuestions.authorizedRepresentativeNote")}</p>
                  <RadioGroup
                    value={data.wantSomeoneElseToReceiveSNAP}
                    onValueChange={(value) => updateField("wantSomeoneElseToReceiveSNAP", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="someone-else-snap-yes" />
                      <Label htmlFor="someone-else-snap-yes">{t("common.yes")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="someone-else-snap-no" />
                      <Label htmlFor="someone-else-snap-no">{t("common.no")}</Label>
                    </div>
                  </RadioGroup>
                  {renderMemberSelection("wantSomeoneElseToReceiveSNAP", data.wantSomeoneElseToReceiveSNAP)}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
