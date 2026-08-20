import { Banknote } from 'lucide-react'

/**
 * The payment marks the desk accepts, drawn here rather than shipped as brand
 * asset files - each one is the simplified shape its network is recognised by,
 * sized to read at a glance on a light tile.
 */

function Mastercard() {
  return (
    <svg viewBox="0 0 36 24" aria-hidden className="h-[1.05rem] w-auto">
      <clipPath id="mastercard-lens">
        <circle cx="14" cy="12" r="9" />
      </clipPath>
      <circle cx="14" cy="12" r="9" fill="#EB001B" />
      <circle cx="22" cy="12" r="9" fill="#F79E1B" />
      {/* Where the two discs overlap the ink reads darker, as on the card. */}
      <circle cx="22" cy="12" r="9" fill="#FF5F00" clipPath="url(#mastercard-lens)" />
    </svg>
  )
}

function UpiArrow() {
  return (
    <svg viewBox="0 0 18 24" aria-hidden className="h-[0.95rem] w-auto">
      <path d="M7 1h5L6 23H1z" fill="#097939" />
      <path d="M13 1h4L11 23H7z" fill="#ED752E" />
    </svg>
  )
}

export interface PaymentMark {
  label: string
  mark: React.ReactNode
}

export const paymentMarks: PaymentMark[] = [
  {
    label: 'UPI',
    mark: (
      <span className="flex items-center gap-1.5">
        <UpiArrow />
        <span className="text-[0.8125rem] font-extrabold tracking-tight text-[#0F2E4C]">UPI</span>
      </span>
    ),
  },
  {
    label: 'Visa',
    mark: (
      <span className="text-[0.9375rem] font-bold tracking-tight text-[#1A1F71] italic">VISA</span>
    ),
  },
  { label: 'Mastercard', mark: <Mastercard /> },
  {
    label: 'RuPay',
    mark: (
      <span className="text-[0.875rem] font-extrabold tracking-tight">
        <span className="text-[#0B6FB4]">Ru</span>
        <span className="text-[#F26522]">Pay</span>
      </span>
    ),
  },
  {
    label: 'Cash',
    mark: (
      <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[#3F3F46]">
        <Banknote aria-hidden className="size-[1.05rem]" />
        Cash
      </span>
    ),
  },
]
