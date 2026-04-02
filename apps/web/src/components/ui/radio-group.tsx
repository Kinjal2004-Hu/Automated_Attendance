import * as React from "react"
import { Primitive } from "@base-ui/react/Primitive"
import { useControlled } from "@base-ui/react/useControlled"
import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
  }
>(({ className, value: valueProp, onValueChange, ...props }, ref) => {
  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: "",
  })

  return (
    <Primitive.div
      ref={ref}
      role="radiogroup"
      className={cn("flex flex-col space-y-2", className)}
      {...props}
      onClick={(e: React.MouseEvent) => {
        props.onClick?.(e)
        const target = e.target as HTMLInputElement
        if (target.type === "radio") {
          setValue(target.value)
          onValueChange?.(target.value)
        }
      }}
    />
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    value: string
  }
>(({ className, ...props }, ref) => (
  <input
    type="radio"
    ref={ref}
    className={cn(
      "h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600 cursor-pointer",
      className
    )}
    {...props}
  />
))
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
