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
import type { IconName } from '@shared/icon-names'

/**
 * Data files reference icons by name so they stay free of JSX.
 *
 * The names themselves are declared in `shared/icon-names.ts`, because the
 * admin panel writes some of these rows and offers exactly that list in a menu.
 * `satisfies Record<IconName, ...>` is what keeps the two honest: add a name
 * there without mapping it here and this file stops compiling.
 */
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
} satisfies Record<IconName, LucideIcon>

export type { IconName }

export function Icon({ name, className }: { name: string; className?: string }) {
  const Component = icons[name as IconName] ?? Sparkles
  return <Component className={className} aria-hidden />
}
