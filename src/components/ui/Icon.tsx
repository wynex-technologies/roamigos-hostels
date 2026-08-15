import {
  Award,
  Bike,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  Compass,
  CreditCard,
  Flame,
  Headphones,
  Lock,
  Luggage,
  MapPin,
  Mic,
  Mountain,
  ShieldCheck,
  ShowerHead,
  Sparkles,
  Star,
  Users,
  Utensils,
  Wallet,
  WashingMachine,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/** Data files reference icons by name so they stay free of JSX. */
const icons = {
  award: Award,
  bike: Bike,
  'calendar-check': CalendarCheck,
  clipboard: ClipboardCheck,
  clock: Clock,
  compass: Compass,
  'credit-card': CreditCard,
  flame: Flame,
  headphones: Headphones,
  lock: Lock,
  luggage: Luggage,
  'map-pin': MapPin,
  mic: Mic,
  mountain: Mountain,
  shield: ShieldCheck,
  shower: ShowerHead,
  sparkles: Sparkles,
  star: Star,
  users: Users,
  utensils: Utensils,
  wallet: Wallet,
  washing: WashingMachine,
  wifi: Wifi,
  zap: Zap,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof icons

export function Icon({ name, className }: { name: string; className?: string }) {
  const Component = icons[name as IconName] ?? Sparkles
  return <Component className={className} aria-hidden />
}
