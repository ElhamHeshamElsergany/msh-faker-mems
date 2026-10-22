import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { FavoritesProvider, useFavorites } from '../hooks/useFavorites'
import { HomePage } from '../pages/HomePage'
import { MemeImage } from '../components/MemeImage'
import type { MemeRecord } from '@msh/shared'

vi.mock('../api/client', () => ({
  searchMemes: vi.fn(),
  getTrending: vi.fn().mockResolvedValue({ basis: 'dataset-order', note: '', items: [] }),
}))

import { searchMemes } from '../api/client'

const meme: MemeRecord = {
  id: 'demo-last-minute-edit',
  label: 'تعديل اللحظة الأخيرة',
  imagePath: 'memes/missing.svg',
  characterName: null,
  sourceTitle: null,
  originalContext: null,
  keywords: ['مدير'],
  categories: ['work'],
  reactions: ['frustration'],
  exampleCaptions: ['تعديل بسيط يعني بكرة'],
  sourceUrl: null,
  attribution: 'رسم أصلي',
  license: 'CC0-1.0',
  allowDownload: true,
  verificationStatus: 'demo',
  disclaimer: 'رسم توضيحي أصلي للتجربة. ليس ميمًا حقيقيًا.',
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(searchMemes).mockReset()
  })

  it('shows the search placeholder and runs an example', async () => {
    vi.mocked(searchMemes).mockResolvedValue({
      engine: 'local',
      aiConfigured: false,
      dataSource: 'json',
      analysis: {
        original: 'لما المدير يقول فيه تعديل بسيط قبل ما نمشي بخمس دقايق',
        normalized: 'تعديل',
        keywords: ['تعديل'],
        categories: ['work'],
        reactions: ['frustration'],
        intentSummary: 'الموقف مرتبط بالشغل.',
      },
      situationCaption: null,
      results: [
        {
          meme,
          score: 20,
          confidence: 'high',
          explanation: 'كلمات قريبة: تعديل.',
          suggestedCaption: 'تعديل بسيط يعني بكرة',
          matchedTerms: ['تعديل'],
        },
      ],
      message: null,
    })

    const user = userEvent.setup()
    render(
      <FavoritesProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </FavoritesProvider>,
    )

    expect(screen.getByPlaceholderText('احكيلي الموقف اللي محتاجله ميم 😂')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'هاتلي ميم' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'لما المدير يقول فيه تعديل بسيط قبل ما نمشي بخمس دقايق' }))
    expect(await screen.findByRole('heading', { name: 'تعديل اللحظة الأخيرة' })).toBeInTheDocument()
    expect(screen.getByText(/الفهم والبحث محليين/)).toBeInTheDocument()
    expect(screen.getByText('رسم تجريبي')).toBeInTheDocument()
  })

  it('shows the honest empty state', async () => {
    vi.mocked(searchMemes).mockResolvedValue({
      engine: 'local',
      aiConfigured: false,
      dataSource: 'json',
      analysis: {
        original: 'وصفة',
        normalized: 'وصفه',
        keywords: [],
        categories: [],
        reactions: [],
        intentSummary: 'مش واضح.',
      },
      situationCaption: null,
      results: [],
      message: 'ملقناش ميم قريب بدرجة كافية في المجموعة الحالية.',
    })
    const user = userEvent.setup()
    render(
      <FavoritesProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </FavoritesProvider>,
    )
    await user.type(screen.getByLabelText('الموقف'), 'وصفة كيكة')
    await user.click(screen.getByRole('button', { name: 'هاتلي ميم' }))
    expect(await screen.findByRole('heading', { name: 'مفيش نتيجة مناسبة' })).toBeInTheDocument()
  })
})

describe('MemeImage', () => {
  it('shows a fallback when the image fails', () => {
    render(<MemeImage imagePath="memes/missing.svg" label="تجربة" status="demo" />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByText('الصورة مش متاحة دلوقتي')).toBeInTheDocument()
  })
})

function FavoriteHarness({ record }: { record: MemeRecord }) {
  const favorites = useFavorites()
  return (
    <button type="button" onClick={() => favorites.toggle(record, 'كابتشن محفوظ')}>
      {favorites.has(record.id) ? 'محفوظ' : 'احفظ'}
    </button>
  )
}

describe('favorites', () => {
  it('stores a meme in localStorage', async () => {
    const user = userEvent.setup()
    render(
      <FavoritesProvider>
        <FavoriteHarness record={meme} />
      </FavoritesProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'احفظ' }))
    expect(screen.getByRole('button', { name: 'محفوظ' })).toBeInTheDocument()
    expect(localStorage.getItem('msh-faker-mems-favorites')).toContain('demo-last-minute-edit')
  })
})
