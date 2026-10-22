import { Link } from 'react-router-dom'
import { MemeImage } from '../components/MemeImage'
import { useFavorites } from '../hooks/useFavorites'

export function FavoritesPage() {
  const favorites = useFavorites()

  return (
    <section>
      <h1 className="text-4xl font-extrabold">المحفوظات</h1>
      <p className="mt-2 leading-8 text-ink-soft">متخزنة على جهازك بس، في localStorage. مش بتتبعت للخادم.</p>
      {favorites.items.length === 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-ink bg-sand-50 p-6">
          <p className="text-lg font-bold">لسه محفوظش حاجة.</p>
          <Link to="/" className="mt-3 inline-block font-extrabold text-palm-dark">
            ارجع دوّر على موقف
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {favorites.items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-3xl border-[3px] border-ink bg-sand-50 shadow-soft">
              <div className="aspect-[4/3] bg-sand-100">
                <MemeImage imagePath={item.imagePath} label={item.label} status={item.verificationStatus} />
              </div>
              <div className="space-y-3 p-4">
                <h2 className="text-2xl font-extrabold">{item.label}</h2>
                <p className="text-sm font-bold">{item.verificationStatus === 'verified' ? 'مصدر متحقق' : 'رسم تجريبي'}</p>
                {item.caption ? <p className="leading-8">{item.caption}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Link to={`/meme/${item.id}`} className="rounded-full bg-ink px-4 py-2 text-sm font-extrabold text-sand-50">
                    افتح
                  </Link>
                  <button type="button" onClick={() => favorites.remove(item.id)} className="rounded-full border-2 border-ink px-4 py-2 text-sm font-extrabold">
                    احذف
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
