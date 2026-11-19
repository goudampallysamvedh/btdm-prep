import type { ReactNode } from 'react'
import { useStore, emptyProgress, type Motion, type Theme } from '@/lib/store'
import { daysUntil } from '@/lib/dates'
import { Button, Field, LinkButton, PageHeader, Segmented, inputCls } from '@/components/ui'

/** One settings section: what it is on the left, its controls on a tonal panel on the right. */
function Section({ title, children, aside, panel }: { title: string; children?: ReactNode; aside?: ReactNode; panel: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-8 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      <div className="grid content-start gap-1.5 md:pt-5">
        <h2 className="text-base">{title}</h2>
        {children && <div className="text-sm text-muted">{children}</div>}
        {aside}
      </div>
      <div className="card grid gap-5 p-5 sm:p-6">{panel}</div>
    </section>
  )
}

function Choice({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  )
}

export default function Settings() {
  const s = useStore((st) => st.settings)
  const set = useStore((st) => st.setSettings)
  const days = daysUntil(s.competitionDate)

  return (
    <>
      <PageHeader title="Settings">Changes save as you make them.</PageHeader>
      <div className="max-w-[1000px]">
        <Section
          title="Competition"
          aside={
            <p className="num mt-2 text-sm text-ink-2">
              {days === null ? 'No date set, so Home shows no countdown.' : days < 0 ? 'That date has passed.' : days === 0 ? `${s.competitionName} is today.` : `${days} day${days === 1 ? '' : 's'} until ${s.competitionName}.`}
            </p>
          }
          panel={
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event name">{(id) => <input id={id} className={inputCls} value={s.competitionName} onChange={(e) => set({ competitionName: e.target.value })} />}</Field>
              <Field label="Date">{(id) => <input id={id} type="date" className={inputCls} value={s.competitionDate} onChange={(e) => set({ competitionDate: e.target.value })} />}</Field>
            </div>
          }
        >
          Home counts down to this date.
        </Section>

        <Section
          title="Team"
          panel={
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Partner A">{(id) => <input id={id} className={inputCls} value={s.partnerA} onChange={(e) => set({ partnerA: e.target.value })} />}</Field>
                <Field label="Partner B">{(id) => <input id={id} className={inputCls} value={s.partnerB} onChange={(e) => set({ partnerB: e.target.value })} />}</Field>
              </div>
              <Choice label="Who uses this device?">
                <Segmented label="Who uses this device" value={s.me} onChange={(v) => set({ me: v })} options={[{ value: 'A', label: s.partnerA }, { value: 'B', label: s.partnerB }]} />
              </Choice>
            </>
          }
        >
          BTDM is a two-person event. Names appear in the greeting, partner codes and case scoring.
        </Section>

        <Section
          title="Display"
          panel={
            <>
              <Choice label="Theme">
                <Segmented<Theme> label="Theme" value={s.theme} onChange={(v) => set({ theme: v })} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
              </Choice>
              <Choice label="Motion" hint="Follow device turns animation off when your device is set to reduce motion.">
                <Segmented<Motion> label="Motion" value={s.motion ?? 'on'} onChange={(v) => set({ motion: v })} options={[{ value: 'on', label: 'On' }, { value: 'device', label: 'Follow device' }, { value: 'off', label: 'Off' }]} />
              </Choice>
            </>
          }
        >
          Card flips, answer feedback, page transitions and badge unlocks are the animations Motion controls.
        </Section>

        <Section
          title="Your data"
          panel={
            <>
              <div className="grid gap-3">
                <p className="text-sm text-ink-2">Progress is saved on this device, in the browser. Sync copies it to your other devices or shares it with your partner.</p>
                <LinkButton to="/sync?tab=me" variant="ghost" className="justify-self-start">Sync my devices</LinkButton>
              </div>
              <div className="grid gap-3 border-t border-line pt-5">
                <p className="text-sm text-ink-2">
                  <span className="font-medium text-bad">Reset all progress</span> erases every answer, card, case and streak on this device. It can’t be undone; export a backup in Sync first if you might want it.
                </p>
                <Button
                  variant="danger"
                  className="justify-self-start"
                  onClick={() => {
                    if (confirm('Erase ALL progress on this device? Export a backup first if you might want it.')) {
                      useStore.getState().replaceAll({ ...emptyProgress, settings: s })
                    }
                  }}
                >
                  Reset all progress
                </Button>
              </div>
            </>
          }
        >
          Where your progress lives, and how to start over.
        </Section>

        <p className="border-t border-line pt-6 text-xs text-muted">
          App version <span className="num">{__APP_VERSION__}</span>. Sell-Through is an unofficial study aid. Practice questions and cases are original. It is not affiliated with or endorsed by DECA Inc. or MBA Research.
        </p>
      </div>
    </>
  )
}
