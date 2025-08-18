"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, ChevronDown, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const selectedStateName = US_STATES.find((state) => state.code === selectedState)?.name

  const filteredStates = US_STATES.filter(
    (state) =>
      state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStateSelect = (stateCode: string) => {
    onStateSelect(stateCode)
    setOpen(false)
    setSearchTerm("")
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setButtonRect(rect)
    setOpen(!open)
  }

  const handleClickOutside = () => {
    setOpen(false)
  }

  const dropdownContent = open && buttonRect && (
    <>
      <div className="fixed inset-0 z-40" onClick={handleClickOutside} />
      <div
        className="fixed bg-white border border-gray-200 rounded-md shadow-xl z-50 max-h-[300px] overflow-hidden"
        style={{
          top: buttonRect.bottom + window.scrollY + 4,
          left: buttonRect.left + window.scrollX,
          width: buttonRect.width,
        }}
      >
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search states..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-[280px] overflow-y-auto overscroll-contain">
          {filteredStates.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">No state found.</div>
          ) : (
            <div className="p-1">
              {filteredStates.map((state) => (
                <button
                  key={state.code}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStateSelect(state.code)
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-3 py-2 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100",
                    selectedState === state.code && "bg-blue-50 text-blue-900",
                  )}
                >
                  <div className="flex items-center">
                    <span className="font-medium">{state.name}</span>
                    <span className="ml-2 text-sm text-gray-500">({state.code})</span>
                  </div>
                  <Check
                    className={cn("h-4 w-4 text-blue-600", selectedState === state.code ? "opacity-100" : "opacity-0")}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Select Your State</h3>
        <p className="text-gray-600">
          Choose the state where you reside and are applying for benefits. Each state has different requirements and
          processes.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Label htmlFor="state-selector" className="text-sm font-medium mb-2 block">
          State of Residence
        </Label>
        <div className="relative">
          <Button
            id="state-selector"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            type="button"
            onClick={handleButtonClick}
            className="w-full justify-between h-12 text-left font-normal bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {selectedState ? (
              <span className="flex items-center">
                <span className="font-medium">{selectedStateName}</span>
                <span className="ml-2 text-sm text-gray-500">({selectedState})</span>
              </span>
            ) : (
              <span className="text-gray-500">Select a state...</span>
            )}
            <ChevronDown
              className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")}
            />
          </Button>

          {mounted && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
        </div>
      </div>

      {selectedState && (
        <div className="text-center">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Selected: {selectedStateName} ({selectedState})
          </Badge>
        </div>
      )}
    </div>
  )
}
