import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 font-extrabold ${isActive ? 'bg-ink text-sand-50' : 'text-ink hover:bg-sand-200'}`

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-10 focus:rounded-full focus:bg-sand-50 focus:px-4 focus:py-2"
      >
        تخطي إلى المحتوى
      </a>
      <header className="sticky top-0 z-10 -mx-4 mb-6 border-b-[3px] border-ink bg-[#f3e6d2] px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border-[3px] border-ink bg-sand-50 text-2xl shadow-soft">
              ؟
            </span>
            <span>
              <span className="block text-2xl font-extrabold leading-none">مش فاكر الميم</span>
              <span className="text-sm font-semibold text-ink-soft">دوّر على الموجود، متولّدش جديد</span>
            </span>
          </NavLink>
          <nav aria-label="التنقل" className="flex gap-2">
            <NavLink to="/" className={linkClass} end>
              الرئيسية
            </NavLink>
            <NavLink to="/favorites" className={linkClass}>
              المحفوظات
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="content" className="flex-1">
        {children}
      </main>
      <footer className="mt-12 border-t-2 border-ink/20 pt-4 text-sm leading-7 text-ink-soft">
        المجموعة الحالية رسوم توضيحية أصلية للتجربة، مش ميمز من أفلام أو الإنترنت. أي سجل مش عليه مصدر متحقق
        مش بيتقدم كميم مشهور.
      </footer>
    </div>
  )
}
