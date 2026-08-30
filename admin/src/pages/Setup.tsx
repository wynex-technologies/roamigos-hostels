import { Card } from '@/components/ui'

/** The panel has not been pointed at a Supabase project yet. */
export default function Setup() {
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-xl font-semibold">Not connected yet</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Copy <code className="text-[0.8125rem]">admin/.env.example</code> to{' '}
          <code className="text-[0.8125rem]">admin/.env</code> and fill in the project URL and the
          public anon key from the Supabase dashboard, under Project Settings then API.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Do not put the service_role key in there. It bypasses every access rule, and anything in
          this file is compiled into a bundle anybody can read.
        </p>
      </Card>
    </div>
  )
}
