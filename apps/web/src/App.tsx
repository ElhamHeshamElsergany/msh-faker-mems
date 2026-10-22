import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { FavoritesProvider } from './hooks/useFavorites'
import { routerBasename } from './lib/format'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { MemePage } from './pages/MemePage'

export function App() {
  return (
    <FavoritesProvider>
      <BrowserRouter basename={routerBasename()}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/meme/:id" element={<MemePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="*" element={<p className="text-xl font-extrabold">الصفحة دي مش موجودة.</p>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </FavoritesProvider>
  )
}
