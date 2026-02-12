"use client"

import * as React from "react"

interface SliderProps {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, min, max, step, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        value={value[0]}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onValueChange?.([parseFloat(e.target.value)])}
        className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500 ${className}`}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
