import { useStore, emptyProgress, type Motion, type Theme } from '@/lib/store'
import { Button, Card, Field, PageHeader, SectionTitle, Segmented, inputCls } from '@/components/ui'
import { LinkButton } from '@/components/ui'

export default function Settings() {
  const s = useStore((st) => st.settings)
  const set = useStore((st) => st.setSettings)

  return (
    <>
      <PageHeader eyebrow="You" title="Settings" />
      <div className="grid max-w-2xl gap-4">
        <Card className="grid gap-4">
          <h2 className="text-xl">Competition</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Event name">{(id) => <input id={id} className={inputCls} value={s.competitionName} onChange={(e) => set({ competitionName: e.target.value })} />}</Field>
            <Field label="Date">{(id) => <input id={id} type="date" className={inputCls} value={s.competitionDate} onChange={(e) => set({ competitionDate: e.target.value })} />}</Field>
          </div>
        </Card>

        <Card className="grid gap-4">
          <h2 className="text-xl">Team</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Partner A">{(id) => <input id={id} className={inputCls} value={s.partnerA} onChange={(e) => set({ partnerA: e.target.value })} />}</Field>
            <Field label="Partner B">{(id) => <input id={id} className={inputCls} value={s.partnerB} onChange={(e) => set({ partnerB: e.target.value })} />}</Field>
          </div>
          <div className="grid gap-1">
            <span className="text-sm font-bold">Who uses this device?</span>
            <Segmented label="Who uses this device" value={s.me} onChange={(v) => set({ me: v })} options={[{ value: 'A', label: s.partnerA }, { value: 'B', label: s.partnerB }]} />
          </div>
        </Card>

        <Card className="grid gap-4">
          <h2 className="text-xl">Display & goals</h2>
          <div className="grid gap-1">
            <span className="text-sm font-bold">Theme</span>
            <Segmented<Theme> label="Theme" value={s.theme} onChange={(v) => set({ theme: v })} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
          </div>
          <div className="grid gap-1">
            <span className="text-sm font-bold">Motion</span>
            <Segmented<Motion> label="Motion" value={s.motion ?? 'on'} onChange={(v) => set({ motion: v })} options={[{ value: 'on', label: 'On' }, { value: 'device', label: 'Follow device' }, { value: 'off', label: 'Off' }]} />
            <span className="text-xs text-muted">Card flips, answer feedback, and other small animations. "Follow device" turns them off when your device is set to reduce motion.</span>
          </div>
          <Field label="Daily goal (study actions)" hint="One action = one answered question, flashcard, or math problem.">
            {(id) => <input id={id} type="number" min={5} max={200} className={inputCls + ' max-w-32'} value={s.dailyGoal} onChange={(e) => set({ dailyGoal: Math.max(5, Number(e.target.value) || 20) })} />}
          </Field>
        </Card>

        <SectionTitle>Data</SectionTitle>
        <Card className="grid gap-3">
          <p className="text-sm text-muted">Progress is saved on this device only (in the browser's IndexedDB). Use Sync to copy it to your other devices or share it with your partner.</p>
          <div className="flex flex-wrap gap-2">
            <LinkButton to="/sync?tab=me" variant="ghost">Sync my devices</LinkButton>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Erase ALL progress on this device? Export a backup first if you might want it.')) {
                  useStore.getState().replaceAll({ ...emptyProgress, settings: s })
                }
              }}
            >
              Reset all progress
            </Button>
          </div>
        </Card>
        <p className="text-xs text-muted">
          App version {__APP_VERSION__}. Sell-Through is an unofficial study aid. Practice questions and cases are original. It is not affiliated with or endorsed by DECA Inc. or MBA Research.
        </p>
      </div>
    </>
  )
}
