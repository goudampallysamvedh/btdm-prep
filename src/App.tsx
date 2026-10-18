import { lazy, Suspense, type ReactNode } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useMotionSync, useThemeSync } from './lib/theme'
import { usePlanTracker } from './lib/today'
import { useLiveSync } from './lib/live'
import { Empty, LinkButton } from './components/ui'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Progress = lazy(() => import('./pages/progress/Progress'))
const PartnerView = lazy(() => import('./pages/PartnerView'))
const TestReport = lazy(() => import('./pages/progress/TestReport'))
const ExamHub = lazy(() => import('./pages/exam/ExamHub'))
const Practice = lazy(() => import('./pages/exam/Practice'))
const Mock = lazy(() => import('./pages/exam/Mock'))
const Flashcards = lazy(() => import('./pages/cards/Flashcards'))
const MathLab = lazy(() => import('./pages/math/MathLab'))
const MathTool = lazy(() => import('./pages/math/MathTool'))
const LearnHub = lazy(() => import('./pages/learn/LearnHub'))
const StudyGuide = lazy(() => import('./pages/learn/StudyGuide'))
const Lessons = lazy(() => import('./pages/learn/Lessons'))
const Lesson = lazy(() => import('./pages/learn/Lesson'))
const Visual = lazy(() => import('./pages/learn/Visual'))
const Trends = lazy(() => import('./pages/learn/Trends'))
const Videos = lazy(() => import('./pages/learn/Videos'))
const Playbook = lazy(() => import('./pages/learn/Playbook'))
const PIGuide = lazy(() => import('./pages/learn/PIGuide'))
const Cases = lazy(() => import('./pages/cases/Cases'))
const CaseSim = lazy(() => import('./pages/cases/CaseSim'))
const JudgeDrill = lazy(() => import('./pages/cases/JudgeDrill'))
const Sync = lazy(() => import('./pages/Sync'))
const Settings = lazy(() => import('./pages/Settings'))

function Page({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted" role="status">Loading…</div>}>
      {children}
    </Suspense>
  )
}

function NotFound() {
  return (
    <Empty title="Page not found" action={<LinkButton to="/">Go home</LinkButton>}>
      That link doesn't match any screen in the app.
    </Empty>
  )
}

export function App() {
  useThemeSync()
  useMotionSync()
  usePlanTracker()
  useLiveSync()
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Page><Dashboard /></Page>} />
          <Route path="progress" element={<Page><Progress /></Page>} />
          <Route path="progress/test/:id" element={<Page><TestReport /></Page>} />
          <Route path="exam" element={<Page><ExamHub /></Page>} />
          <Route path="exam/practice" element={<Page><Practice /></Page>} />
          <Route path="exam/mock" element={<Page><Mock /></Page>} />
          <Route path="cards" element={<Page><Flashcards /></Page>} />
          <Route path="math" element={<Page><MathLab /></Page>} />
          <Route path="math/:tool" element={<Page><MathTool /></Page>} />
          <Route path="learn" element={<Page><LearnHub /></Page>} />
          <Route path="learn/guide" element={<Page><StudyGuide /></Page>} />
          <Route path="learn/guide/:area" element={<Page><StudyGuide /></Page>} />
          <Route path="learn/lessons" element={<Page><Lessons /></Page>} />
          <Route path="learn/lessons/:id" element={<Page><Lesson /></Page>} />
          <Route path="learn/visual" element={<Page><Visual /></Page>} />
          <Route path="learn/visual/:id" element={<Page><Visual /></Page>} />
          <Route path="learn/trends" element={<Page><Trends /></Page>} />
          <Route path="learn/trends/:id" element={<Page><Trends /></Page>} />
          <Route path="learn/videos" element={<Page><Videos /></Page>} />
          <Route path="learn/playbook" element={<Page><Playbook /></Page>} />
          <Route path="learn/pis" element={<Page><PIGuide /></Page>} />
          <Route path="cases" element={<Page><Cases /></Page>} />
          <Route path="cases/judge" element={<Page><JudgeDrill /></Page>} />
          <Route path="cases/:id" element={<Page><CaseSim /></Page>} />
          <Route path="sync" element={<Page><Sync /></Page>} />
          <Route path="partner" element={<Page><PartnerView /></Page>} />
          <Route path="settings" element={<Page><Settings /></Page>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
