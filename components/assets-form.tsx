"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Trash2, DollarSign, Car, Shield } from "lucide-react"
import { useTranslation } from "@/contexts/translation-context"

interface Asset {
  id: string
  type: "financial" | "vehicle" | "life_insurance"
  owner: string
  details: {
    // Financial assets
    accountType?: string
    bankName?: string
    accountBalance?: string
    // Vehicle assets
    vehicleType?: string
    make?: string
    model?: string
    year?: string
    estimatedValue?: string
    // Life insurance
    policyType?: string
    insuranceCompany?: string
    faceValue?: string
    cashValue?: string
  }
}

interface AssetsFormProps {
  data: {
    assets: Asset[]
  }
  householdMembers: Array<{ id: string; firstName: string; lastName: string }>
  applicantName: string
  onUpdate: (data: { assets: Asset[] }) => void
}

export function AssetsForm({ data, householdMembers, applicantName, onUpdate }: AssetsFormProps) {
  const { t } = useTranslation()
  const [assets, setAssets] = useState<Asset[]>(data.assets || [])

  const allMembers = [
    {
      id: "applicant",
      firstName: applicantName.split(" ")[0] || "Applicant",
      lastName: applicantName.split(" ")[1] || "",
    },
    ...householdMembers,
  ]

  const updateAssets = (newAssets: Asset[]) => {
    setAssets(newAssets)
    onUpdate({ assets: newAssets })
  }

  const addAsset = (type: Asset["type"]) => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      type,
      owner: "",
      details: {},
    }
    updateAssets([...assets, newAsset])
  }

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    updateAssets(assets.map((asset) => (asset.id === id ? { ...asset, ...updates } : asset)))
  }

  const removeAsset = (id: string) => {
    updateAssets(assets.filter((asset) => asset.id !== id))
  }

  const renderAssetForm = (asset: Asset) => {
    const ownerName = allMembers.find((m) => m.id === asset.owner)
    const displayName = ownerName ? `${ownerName.firstName} ${ownerName.lastName}`.trim() : ""

    return (
      <Card key={asset.id} className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {asset.type === "financial" && <DollarSign className="h-5 w-5 text-green-600" />}
              {asset.type === "vehicle" && <Car className="h-5 w-5 text-blue-600" />}
              {asset.type === "life_insurance" && <Shield className="h-5 w-5 text-purple-600" />}
              <CardTitle className="text-lg">
                {asset.type === "financial" && t("forms.assetTypes.financial")}
                {asset.type === "vehicle" && t("forms.assetTypes.vehicle")}
                {asset.type === "life_insurance" && t("forms.assetTypes.lifeInsurance")}
                {displayName && ` - ${displayName}`}
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeAsset(asset.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`owner-${asset.id}`}>{t("forms.assets.assetOwner")} *</Label>
            <Select value={asset.owner} onValueChange={(value) => updateAsset(asset.id, { owner: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t("forms.assetOwnerPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {allMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {`${member.firstName} ${member.lastName}`.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {asset.type === "financial" && (
            <>
              <div>
                <Label htmlFor={`account-type-${asset.id}`}>{t("forms.assets.accountType")} *</Label>
                <Select
                  value={asset.details.accountType || ""}
                  onValueChange={(value) =>
                    updateAsset(asset.id, { details: { ...asset.details, accountType: value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.selectOption")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">{t("forms.accountTypes.checking")}</SelectItem>
                    <SelectItem value="savings">{t("forms.accountTypes.savings")}</SelectItem>
                    <SelectItem value="money_market">{t("forms.accountTypes.moneyMarket")}</SelectItem>
                    <SelectItem value="cd">{t("forms.accountTypes.cd")}</SelectItem>
                    <SelectItem value="investment">{t("forms.accountTypes.investment")}</SelectItem>
                    <SelectItem value="cash">{t("forms.accountTypes.cash")}</SelectItem>
                    <SelectItem value="other">{t("forms.accountTypes.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`bank-name-${asset.id}`}>{t("forms.assets.bankName")}</Label>
                <Input
                  id={`bank-name-${asset.id}`}
                  value={asset.details.bankName || ""}
                  onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, bankName: e.target.value } })}
                  placeholder={t("forms.bankNamePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor={`balance-${asset.id}`}>{t("forms.assets.currentBalance")} *</Label>
                <Input
                  id={`balance-${asset.id}`}
                  type="number"
                  step="0.01"
                  value={asset.details.accountBalance || ""}
                  onChange={(e) =>
                    updateAsset(asset.id, { details: { ...asset.details, accountBalance: e.target.value } })
                  }
                  placeholder={t("forms.balancePlaceholder")}
                />
              </div>
            </>
          )}

          {asset.type === "vehicle" && (
            <>
              <div>
                <Label htmlFor={`vehicle-type-${asset.id}`}>{t("forms.assets.vehicleType")} *</Label>
                <Select
                  value={asset.details.vehicleType || ""}
                  onValueChange={(value) =>
                    updateAsset(asset.id, { details: { ...asset.details, vehicleType: value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.selectOption")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">{t("forms.vehicleTypes.car")}</SelectItem>
                    <SelectItem value="truck">{t("forms.vehicleTypes.truck")}</SelectItem>
                    <SelectItem value="motorcycle">{t("forms.vehicleTypes.motorcycle")}</SelectItem>
                    <SelectItem value="van">{t("forms.vehicleTypes.van")}</SelectItem>
                    <SelectItem value="suv">{t("forms.vehicleTypes.suv")}</SelectItem>
                    <SelectItem value="rv">{t("forms.vehicleTypes.rv")}</SelectItem>
                    <SelectItem value="boat">{t("forms.vehicleTypes.boat")}</SelectItem>
                    <SelectItem value="other">{t("forms.vehicleTypes.otherVehicle")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`make-${asset.id}`}>{t("forms.assets.make")} *</Label>
                  <Input
                    id={`make-${asset.id}`}
                    value={asset.details.make || ""}
                    onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, make: e.target.value } })}
                    placeholder={t("forms.makePlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor={`model-${asset.id}`}>{t("forms.assets.model")} *</Label>
                  <Input
                    id={`model-${asset.id}`}
                    value={asset.details.model || ""}
                    onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, model: e.target.value } })}
                    placeholder={t("forms.modelPlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor={`year-${asset.id}`}>{t("forms.assets.year")} *</Label>
                  <Input
                    id={`year-${asset.id}`}
                    type="number"
                    min="1900"
                    max="2025"
                    value={asset.details.year || ""}
                    onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, year: e.target.value } })}
                    placeholder={t("forms.yearPlaceholder")}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`vehicle-value-${asset.id}`}>{t("forms.assets.estimatedValue")} *</Label>
                <Input
                  id={`vehicle-value-${asset.id}`}
                  type="number"
                  step="0.01"
                  value={asset.details.estimatedValue || ""}
                  onChange={(e) =>
                    updateAsset(asset.id, { details: { ...asset.details, estimatedValue: e.target.value } })
                  }
                  placeholder={t("forms.balancePlaceholder")}
                />
                <p className="text-sm text-gray-500 mt-1">{t("forms.valueNote")}</p>
              </div>
            </>
          )}

          {asset.type === "life_insurance" && (
            <>
              <div>
                <Label htmlFor={`policy-type-${asset.id}`}>{t("forms.assets.policyType")} *</Label>
                <Select
                  value={asset.details.policyType || ""}
                  onValueChange={(value) => updateAsset(asset.id, { details: { ...asset.details, policyType: value } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.selectOption")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="term">{t("forms.policyTypes.term")}</SelectItem>
                    <SelectItem value="whole">{t("forms.policyTypes.whole")}</SelectItem>
                    <SelectItem value="universal">{t("forms.policyTypes.universal")}</SelectItem>
                    <SelectItem value="variable">{t("forms.policyTypes.variable")}</SelectItem>
                    <SelectItem value="other">{t("forms.policyTypes.otherInsurance")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`insurance-company-${asset.id}`}>{t("forms.assets.insuranceCompany")} *</Label>
                <Input
                  id={`insurance-company-${asset.id}`}
                  value={asset.details.insuranceCompany || ""}
                  onChange={(e) =>
                    updateAsset(asset.id, { details: { ...asset.details, insuranceCompany: e.target.value } })
                  }
                  placeholder={t("forms.insuranceCompanyPlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor={`face-value-${asset.id}`}>{t("forms.faceValueLabel")} *</Label>
                <Input
                  id={`face-value-${asset.id}`}
                  type="number"
                  step="0.01"
                  value={asset.details.faceValue || ""}
                  onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, faceValue: e.target.value } })}
                  placeholder={t("forms.balancePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor={`cash-value-${asset.id}`}>{t("forms.assets.cashValue")}</Label>
                <Input
                  id={`cash-value-${asset.id}`}
                  type="number"
                  step="0.01"
                  value={asset.details.cashValue || ""}
                  onChange={(e) => updateAsset(asset.id, { details: { ...asset.details, cashValue: e.target.value } })}
                  placeholder={t("forms.balancePlaceholder")}
                />
                <p className="text-sm text-gray-500 mt-1">{t("forms.cashValueNote")}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t("forms.assets.title")}</h2>
        <p className="text-gray-600">{t("forms.assets.subtitle")}</p>
      </div>

      {assets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t("forms.assets.currentAssets")}</h3>
          {assets.map(renderAssetForm)}
        </div>
      )}

      <div className="space-y-4">
        <Separator />
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t("forms.assets.addNewAsset")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => addAsset("financial")}
              className="h-20 md:h-28 flex flex-col items-center justify-center space-y-2 md:space-y-3 border-dashed border-2 hover:border-green-300 hover:bg-green-50"
            >
              <DollarSign className="h-6 w-6 md:h-7 md:w-7 text-green-600" />
              <span className="md:text-base">{t("forms.assets.addFinancialAsset")}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => addAsset("vehicle")}
              className="h-20 md:h-28 flex flex-col items-center justify-center space-y-2 md:space-y-3 border-dashed border-2 hover:border-blue-300 hover:bg-blue-50"
            >
              <Car className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
              <span className="md:text-base">{t("forms.assets.addVehicle")}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => addAsset("life_insurance")}
              className="h-20 md:h-28 flex flex-col items-center justify-center space-y-2 md:space-y-3 border-dashed border-2 hover:border-purple-300 hover:bg-purple-50"
            >
              <Shield className="h-6 w-6 md:h-7 md:w-7 text-purple-600" />
              <span className="md:text-base">{t("forms.assets.addLifeInsurance")}</span>
            </Button>
          </div>
        </div>
      </div>

      {assets.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">{t("forms.assets.noAssetsMessage")}</p>
          <p className="text-sm text-gray-400">{t("forms.assets.noAssetsNote")}</p>
        </div>
      )}
    </div>
  )
}
