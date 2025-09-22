"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Check } from "lucide-react"
import { useTranslation } from "@/lib/translations"

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
]

interface StateSelectionProps {
  selectedState: string
  onStateSelect: (state: string) => void
}

export function StateSelection({ selectedState, onStateSelect }: StateSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const filteredStates = US_STATES.filter(
    (state) =>
      state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedStateName = US_STATES.find((state) => state.code === selectedState)?.name

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleStateSelect = (state: { code: string; name: string }) => {
    onStateSelect(state.code)
    setSearchTerm("")
    setShowDropdown(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowDropdown(value.length > 0)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t("stateSelection.title")}</h3>
        <p className="text-gray-600">{t("stateSelection.description")}</p>
      </div>

      <div className="max-w-md mx-auto">
        <Label htmlFor="state-selector" className="text-sm font-medium mb-2 block">
          {t("stateSelection.stateOfResidence")}
        </Label>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={t("stateSelection.searchPlaceholder")}
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => searchTerm.length > 0 && setShowDropdown(true)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {showDropdown && filteredStates.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto mt-1"
            >
              {filteredStates.map((state) => (
                <button
                  key={state.code}
                  onClick={() => handleStateSelect(state)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                >
                  <span className="text-base">
                    {state.name} ({state.code})
                  </span>
                  {selectedState === state.code && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedState && (
        <div className="text-center">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {t("stateSelection.selected")}: {selectedStateName} ({selectedState})
          </Badge>
        </div>
      )}
    </div>
  )
}
