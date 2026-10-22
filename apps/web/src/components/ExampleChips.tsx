import { EXAMPLES } from '../lib/format'

export function ExampleChips({ onPick }: { onPick: (value: string) => void }) {
  return (
    <div>
      <p className="mb-3 font-bold">جرّب موقف جاهز</p>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onPick(example)}
            className="rounded-full border-2 border-ink bg-sand-50 px-4 py-2 text-start text-sm font-semibold shadow-soft hover:bg-sand-100"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}
