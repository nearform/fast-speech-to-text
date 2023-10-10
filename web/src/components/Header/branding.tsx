import { IconMic } from '@/icons/icon-mic'

export function Branding() {
  return (
    <div className="flex items-center gap-4">
      <img src="/nearform-logo.svg" alt="Nearform" />
      <div className="flex space-x-2 border-l border-blue-300 pl-2 items-center">
        <IconMic />
        <span className="text-blue-700 playground-title">
          Fast text to speech
        </span>
      </div>
    </div>
  )
}
