// app/routes/index.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { KanbanCard, KanbanCards } from '@/components/kanban-columns'
import { KanbanHeader } from '@/components/kanban-columns'
import { KanbanBoard } from '@/components/kanban-columns'
import { KanbanProvider } from '@/components/kanban-columns'
import { DragEndEvent } from '@dnd-kit/core'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { format } from 'date-fns'
import {
  startOfMonth,
  subMonths,
  subDays,
  endOfMonth,
  addMonths,
} from 'date-fns'

export const Route = createFileRoute('/board/columns')({
  component: Home,
})

function Home() {
  return (
    <div>
      <Example />
    </div>
  )
}

const Example = () => {
  const [features, setFeatures] = useState(exampleFeatures)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      return
    }

    const status = exampleStatuses.find((status) => status.name === over.id)

    if (!status) {
      return
    }

    setFeatures(
      features.map((feature) => {
        if (feature.id === active.id) {
          return { ...feature, status: status.id }
        }

        return feature
      }),
    )
  }

  return (
    <div className="overflow-y-auto min-w-[1000px]">
      <KanbanProvider onDragEnd={handleDragEnd} className="p-4">
        {exampleStatuses.map((status) => (
          <KanbanBoard key={status.name} id={status.name}>
            <KanbanHeader name={status.name} color={status.color} />
            <KanbanCards>
              {features
                .filter((feature) => feature.status === status.id)
                .map((feature, index) => (
                  <KanbanCard
                    key={feature.id}
                    id={feature.id}
                    name={feature.name}
                    parent={status.name}
                    index={index}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="m-0 flex-1 font-medium text-sm">
                          {feature.name}
                        </p>
                        <p className="m-0 text-muted-foreground text-xs">
                          {feature.initiative.name}
                        </p>
                      </div>
                      {feature.owner && (
                        <Avatar className="h-4 w-4 shrink-0">
                          <AvatarImage src={feature.owner.image} />
                          <AvatarFallback>
                            {feature.owner.name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <p className="m-0 text-muted-foreground text-xs">
                      {format(feature.startAt, 'MMM d')} -{' '}
                      {format(feature.endAt, 'MMM d, yyyy')}
                    </p>
                  </KanbanCard>
                ))}
            </KanbanCards>
          </KanbanBoard>
        ))}
      </KanbanProvider>
    </div>
  )
}

const today = new Date()

export const exampleStatuses = [
  { id: '1', name: 'Planned', color: 'var(--gray-500)' },
  { id: '2', name: 'In Progress', color: 'var(--amber-500)' },
  { id: '3', name: 'Done', color: 'var(--emerald-500)' },
]

export const exampleFeatures = [
  {
    id: '1',
    name: 'AI Scene Analysis',
    startAt: startOfMonth(subMonths(today, 6)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[0].id,
    group: { id: '1', name: 'Core AI Features' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '1',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=1',
      name: 'Alice Johnson',
    },
    initiative: { id: '1', name: 'AI Integration' },
    release: { id: '1', name: 'v1.0' },
  },
  {
    id: '2',
    name: 'Collaborative Editing',
    startAt: startOfMonth(subMonths(today, 5)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[1].id,
    group: { id: '2', name: 'Collaboration Tools' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '2',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=2',
      name: 'Bob Smith',
    },
    initiative: { id: '2', name: 'Real-time Collaboration' },
    release: { id: '1', name: 'v1.0' },
  },
  {
    id: '3',
    name: 'AI-Powered Color Grading',
    startAt: startOfMonth(subMonths(today, 4)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[2].id,
    group: { id: '1', name: 'Core AI Features' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '3',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=3',
      name: 'Charlie Brown',
    },
    initiative: { id: '1', name: 'AI Integration' },
    release: { id: '2', name: 'v1.1' },
  },
  {
    id: '4',
    name: 'Real-time Video Chat',
    startAt: startOfMonth(subMonths(today, 3)),
    endAt: subDays(endOfMonth(today), 12),
    status: exampleStatuses[0].id,
    group: { id: '2', name: 'Collaboration Tools' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '4',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=4',
      name: 'Diana Prince',
    },
    initiative: { id: '2', name: 'Real-time Collaboration' },
    release: { id: '2', name: 'v1.1' },
  },
  {
    id: '5',
    name: 'AI Voice-to-Text Subtitles',
    startAt: startOfMonth(subMonths(today, 2)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[1].id,
    group: { id: '1', name: 'Core AI Features' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '5',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=5',
      name: 'Ethan Hunt',
    },
    initiative: { id: '1', name: 'AI Integration' },
    release: { id: '2', name: 'v1.1' },
  },
  {
    id: '6',
    name: 'Cloud Asset Management',
    startAt: startOfMonth(subMonths(today, 1)),
    endAt: endOfMonth(today),
    status: exampleStatuses[2].id,
    group: { id: '3', name: 'Cloud Infrastructure' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '6',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=6',
      name: 'Fiona Gallagher',
    },
    initiative: { id: '3', name: 'Cloud Migration' },
    release: { id: '3', name: 'v1.2' },
  },
  {
    id: '7',
    name: 'AI-Assisted Video Transitions',
    startAt: startOfMonth(today),
    endAt: endOfMonth(addMonths(today, 1)),
    status: exampleStatuses[0].id,
    group: { id: '1', name: 'Core AI Features' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '7',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=7',
      name: 'George Lucas',
    },
    initiative: { id: '1', name: 'AI Integration' },
    release: { id: '3', name: 'v1.2' },
  },
  {
    id: '8',
    name: 'Version Control System',
    startAt: startOfMonth(addMonths(today, 1)),
    endAt: endOfMonth(addMonths(today, 2)),
    status: exampleStatuses[1].id,
    group: { id: '2', name: 'Collaboration Tools' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '8',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=8',
      name: 'Hannah Montana',
    },
    initiative: { id: '2', name: 'Real-time Collaboration' },
    release: { id: '3', name: 'v1.2' },
  },
  {
    id: '9',
    name: 'AI Content-Aware Fill',
    startAt: startOfMonth(addMonths(today, 2)),
    endAt: endOfMonth(addMonths(today, 3)),
    status: exampleStatuses[2].id,
    group: { id: '1', name: 'Core AI Features' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '9',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=9',
      name: 'Ian Malcolm',
    },
    initiative: { id: '1', name: 'AI Integration' },
    release: { id: '4', name: 'v1.3' },
  },
  {
    id: '10',
    name: 'Multi-User Permissions',
    startAt: startOfMonth(addMonths(today, 3)),
    endAt: endOfMonth(addMonths(today, 4)),
    status: exampleStatuses[0].id,
    group: { id: '2', name: 'Collaboration Tools' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '10',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=10',
      name: 'Julia Roberts',
    },
    initiative: { id: '2', name: 'Real-time Collaboration' },
    release: { id: '4', name: 'v1.3' },
  },
  {
    id: '11',
    name: 'AI-Powered Audio Enhancement',
    startAt: startOfMonth(addMonths(today, 4)),
    endAt: endOfMonth(addMonths(today, 5)),
    status: exampleStatuses[1].id,
    group: { id: '1', name: 'Core AI Features' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '11',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=11',
      name: 'Kevin Hart',
    },
    initiative: { id: '1', name: 'AI Integration' },
    release: { id: '4', name: 'v1.3' },
  },
  {
    id: '12',
    name: 'Real-time Project Analytics',
    startAt: startOfMonth(addMonths(today, 5)),
    endAt: endOfMonth(addMonths(today, 6)),
    status: exampleStatuses[2].id,
    group: { id: '3', name: 'Cloud Infrastructure' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '12',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=12',
      name: 'Lara Croft',
    },
    initiative: { id: '3', name: 'Cloud Migration' },
    release: { id: '5', name: 'v1.4' },
  },
  {
    id: '13',
    name: 'AI Scene Recommendations',
    startAt: startOfMonth(addMonths(today, 6)),
    endAt: endOfMonth(addMonths(today, 7)),
    status: exampleStatuses[0].id,
    group: { id: '1', name: 'Core AI Features' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '13',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=13',
      name: 'Michael Scott',
    },
    initiative: { id: '1', name: 'AI Integration' },
    release: { id: '5', name: 'v1.4' },
  },
  {
    id: '14',
    name: 'Collaborative Storyboarding',
    startAt: startOfMonth(addMonths(today, 7)),
    endAt: endOfMonth(addMonths(today, 8)),
    status: exampleStatuses[1].id,
    group: { id: '2', name: 'Collaboration Tools' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '14',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=14',
      name: 'Natalie Portman',
    },
    initiative: { id: '2', name: 'Real-time Collaboration' },
    release: { id: '5', name: 'v1.4' },
  },
  {
    id: '15',
    name: 'AI-Driven Video Compression',
    startAt: startOfMonth(addMonths(today, 8)),
    endAt: endOfMonth(addMonths(today, 9)),
    status: exampleStatuses[2].id,
    group: { id: '1', name: 'Core AI Features' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '15',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=15',
      name: 'Oscar Isaac',
    },
    initiative: { id: '1', name: 'AI Integration' },
    release: { id: '6', name: 'v1.5' },
  },
  {
    id: '16',
    name: 'Global CDN Integration',
    startAt: startOfMonth(addMonths(today, 9)),
    endAt: endOfMonth(addMonths(today, 10)),
    status: exampleStatuses[0].id,
    group: { id: '3', name: 'Cloud Infrastructure' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '16',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=16',
      name: 'Penelope Cruz',
    },
    initiative: { id: '3', name: 'Cloud Migration' },
    release: { id: '6', name: 'v1.5' },
  },
  {
    id: '17',
    name: 'AI Object Tracking',
    startAt: startOfMonth(addMonths(today, 10)),
    endAt: endOfMonth(addMonths(today, 11)),
    status: exampleStatuses[1].id,
    group: { id: '1', name: 'Core AI Features' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '17',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=17',
      name: 'Quentin Tarantino',
    },
    initiative: { id: '1', name: 'AI Integration' },
    release: { id: '6', name: 'v1.5' },
  },
  {
    id: '18',
    name: 'Real-time Language Translation',
    startAt: startOfMonth(addMonths(today, 11)),
    endAt: endOfMonth(addMonths(today, 12)),
    status: exampleStatuses[2].id,
    group: { id: '2', name: 'Collaboration Tools' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '18',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=18',
      name: 'Rachel Green',
    },
    initiative: { id: '2', name: 'Real-time Collaboration' },
    release: { id: '7', name: 'v1.6' },
  },
  {
    id: '19',
    name: 'AI-Powered Video Summarization',
    startAt: startOfMonth(addMonths(today, 12)),
    endAt: endOfMonth(addMonths(today, 13)),
    status: exampleStatuses[0].id,
    group: { id: '1', name: 'Core AI Features' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '19',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=19',
      name: 'Samuel L. Jackson',
    },
    initiative: { id: '1', name: 'AI Integration' },
    release: { id: '7', name: 'v1.6' },
  },
  {
    id: '20',
    name: 'Blockchain-based Asset Licensing',
    startAt: startOfMonth(addMonths(today, 13)),
    endAt: endOfMonth(addMonths(today, 14)),
    status: exampleStatuses[1].id,
    group: { id: '3', name: 'Cloud Infrastructure' },
    product: { id: '1', name: 'Video Editor Pro' },
    owner: {
      id: '20',
      image: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=20',
      name: 'Tom Hanks',
    },
    initiative: { id: '3', name: 'Cloud Migration' },
    release: { id: '7', name: 'v1.6' },
  },
]
