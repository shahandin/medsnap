let clsxFn: any
let twMergeFn: any

try {
  const clsxModule = require("clsx")
  clsxFn = clsxModule.clsx || clsxModule.default
} catch {
  // Fallback implementation for clsx
  clsxFn = (...inputs: any[]) => {
    return inputs.flat().filter(Boolean).join(" ")
  }
}

try {
  const twMergeModule = require("tailwind-merge")
  twMergeFn = twMergeModule.twMerge || twMergeModule.default
} catch {
  // Fallback implementation for tailwind-merge
  twMergeFn = (classes: string) => classes
}

export function cn(...inputs: any[]) {
  return twMergeFn(clsxFn(inputs))
}
