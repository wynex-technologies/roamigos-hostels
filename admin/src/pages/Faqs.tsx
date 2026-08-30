import { useCallback, useEffect, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { COLUMNS, type FaqRow } from '@/lib/db'
import {
  Area,
  Button,
  Card,
  Empty,
  ErrorNote,
  Field,
  Loading,
  PageHeader,
  Text,
  Toggle,
} from '@/components/ui'

/**
 * The contact page's questions.
 *
 * These are also the site's FAQ rich result: `faqSchema()` marks up this exact
 * list, and Google only shows an FAQ result when the question and the answer
 * are both on the page as written. So whatever is typed here is what gets
 * marked up - there is no second, shortened copy to keep in step.
 *
 * Which also means the answers are worth writing properly. A one-word answer
 * is a one-word search result.
 */
export default function Faqs() {
  const [rows, setRows] = useState<FaqRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: failure } = await supabase
      .from('faqs')
      .select(COLUMNS.faq)
      .order('sort_order', { ascending: true })

    if (failure) setError(failure.message)
    else setRows((data ?? []) as unknown as FaqRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function edit(id: number, patch: Partial<FaqRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  async function saveAll() {
    setBusy(true)
    setError('')

    // One statement per row. There are half a dozen of these, so a bulk upsert
    // would be more machinery than the job is worth.
    for (const row of rows) {
      const { id, ...fields } = row
      const { error: failure } = await supabase.from('faqs').update(fields).eq('id', id)
      if (failure) {
        setError(failure.message)
        break
      }
    }

    setBusy(false)
  }

  async function add() {
    const { error: failure } = await supabase.from('faqs').insert({
      question: 'New question',
      answer: '',
      sort_order: rows.length,
      published: true,
    })
    if (failure) setError(failure.message)
    else load()
  }

  async function remove(id: number) {
    if (!confirm('Delete this question?')) return
    const { error: failure } = await supabase.from('faqs').delete().eq('id', id)
    if (failure) setError(failure.message)
    else load()
  }

  if (loading) return <Loading />

  return (
    <>
      <PageHeader
        title="FAQs"
        note="Printed on the contact page, and marked up as the FAQ search result."
        actions={
          <>
            <Button variant="ghost" onClick={add}>
              <Plus className="size-4" />
              Add
            </Button>
            <Button busy={busy} onClick={saveAll}>
              <Save className="size-4" />
              Save all
            </Button>
          </>
        }
      />

      {error && <ErrorNote error={error} />}

      {rows.length === 0 ? (
        <Empty>No questions yet.</Empty>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <Card key={row.id} className="space-y-3">
              <Field label="Question">
                <Text
                  value={row.question}
                  onChange={(event) => edit(row.id, { question: event.target.value })}
                />
              </Field>

              <Field label="Answer">
                <Area
                  rows={4}
                  value={row.answer}
                  onChange={(event) => edit(row.id, { answer: event.target.value })}
                />
              </Field>

              <div className="flex flex-wrap items-center gap-5">
                <Toggle
                  checked={row.published}
                  onChange={(next) => edit(row.id, { published: next })}
                  label="Live"
                />

                <Field label="Order" className="w-24">
                  <Text
                    type="number"
                    value={row.sort_order}
                    onChange={(event) => edit(row.id, { sort_order: Number(event.target.value) })}
                  />
                </Field>

                <Button variant="danger" className="ml-auto" onClick={() => remove(row.id)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
