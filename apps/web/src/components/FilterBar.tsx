import { CATEGORIES, REACTIONS, SOURCES, type CategoryId, type ReactionId, type SourceId } from '@msh/shared'

function Chip({
  pressed,
  label,
  onClick,
}: {
  pressed: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold ${
        pressed ? 'border-palm bg-palm text-sand-50' : 'border-ink bg-sand-50 text-ink'
      }`}
    >
      {label}
    </button>
  )
}

export function FilterBar({
  categories,
  reactions,
  sources,
  onCategories,
  onReactions,
  onSources,
}: {
  categories: CategoryId[]
  reactions: ReactionId[]
  sources: SourceId[]
  onCategories: (value: CategoryId[]) => void
  onReactions: (value: ReactionId[]) => void
  onSources: (value: SourceId[]) => void
}) {
  function toggle<T extends string>(list: T[], value: T, update: (next: T[]) => void) {
    update(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  return (
    <div className="space-y-4 rounded-3xl border-2 border-ink bg-sand-50 p-4">
      <fieldset>
        <legend className="mb-2 font-extrabold">التصنيف</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              pressed={categories.includes(item.id)}
              onClick={() => toggle(categories, item.id, onCategories)}
            />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-extrabold">الإحساس</legend>
        <div className="flex flex-wrap gap-2">
          {REACTIONS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              pressed={reactions.includes(item.id)}
              onClick={() => toggle(reactions, item.id, onReactions)}
            />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-extrabold">المصدر</legend>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              pressed={sources.includes(item.id)}
              onClick={() => toggle(sources, item.id, onSources)}
            />
          ))}
        </div>
      </fieldset>
    </div>
  )
}
