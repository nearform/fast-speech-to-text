import { IconWand } from '@/icons/icon-wand'

export function Branding() {
  return (
    <div className="flex items-center gap-4">
      <img src="/nearform-logo.svg" alt="Nearform" />
      <div className="flex space-x-2 border-l border-blue-300 pl-2 items-center">
        <IconWand />
        <span className="text-blue-700 playground-title">
          Fast speech to text experiments
        </span>
      </div>
    </div>
  )
}
