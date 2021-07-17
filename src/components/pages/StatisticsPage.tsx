import { useQuery } from '@apollo/react-hooks'
import { Trans, plural, select } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { endOfToday, startOfDay, subDays } from 'date-fns'
import gql from 'graphql-tag'
import type { ReactNode } from 'react'
import { useMemo, useRef, useState } from 'react'
import * as React from 'react'

import { useSearchParamsState } from '../../hooks/useSearchParamsState'
import { useTopBarLoading } from '../../hooks/useTopBarLoading'
import BackButton from '../BackButton'
import { StudyFrequencyGraph } from '../StudyFrequencyGraph'
import { Card, CardContent } from '../views/Card'
import { Container } from '../views/Container'
import { Listbox, ListboxOption } from '../views/Listbox'
import {
  Body1,
  Body2,
  Headline1,
  Headline2,
  Overline,
} from '../views/Typography'
import type {
  DeckStatistics,
  DeckStatisticsVariables,
} from './__generated__/DeckStatistics'

const STATISTICS_QUERY = gql`
  query DeckStatistics(
    $deckId: ID
    $startDate: String!
    $endDate: String!
    $zoneInfo: String!
  ) {
    deckStatistics(deckId: $deckId) {
      deck {
        id
        title
      }
      totalStudyTime
      totalTimesStudied
      totalFlashcardsStudied
      studyFrequency(
        startDate: $startDate
        endDate: $endDate
        zoneInfo: $zoneInfo
      ) {
        date
        learning
        new
        review
      }
    }
    decks {
      id
      title
    }
  }
`

const StatisticsCard: React.FC<{ label: ReactNode; value: ReactNode }> = ({
  label,
  value,
}) => {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col">
        <Overline className="text-txt text-opacity-text-secondary">
          {label}
        </Overline>
        <span className="mt-1 text-3xl md:text-4xl font-medium">{value}</span>
      </div>
    </Card>
  )
}

const StatisticsPage: React.FC = () => {
  const [interval, setIntervalValue] = useSearchParamsState('interval', '7')
  const [selectedDeck, setSelectedDeck] = useSearchParamsState('deck')

  const { current: today } = useRef(endOfToday())
  const startDate = startOfDay(subDays(today, parseInt(interval, 10) - 1))
  const [zoneInfo] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  )

  const { loading, data, error } = useQuery<
    DeckStatistics,
    DeckStatisticsVariables
  >(STATISTICS_QUERY, {
    variables: {
      deckId: selectedDeck,
      startDate: startDate.toISOString(),
      endDate: today.toISOString(),
      zoneInfo,
    },
    fetchPolicy: 'cache-and-network',
    partialRefetch: true,
  })

  const { i18n } = useLingui()

  useTopBarLoading(loading)

  const studyTime = useMemo(() => {
    let time = data?.deckStatistics?.totalStudyTime ?? 0
    let unit = 'millisecond'

    if (time > 1000) {
      time /= 1000
      unit = 'second'
    }
    if (time > 60 && unit === 'second') {
      time /= 60
      unit = 'minute'
    }
    if (time > 60 && unit === 'minute') {
      time /= 60
      unit = 'hour'
    }
    if (time > 24 && unit === 'hour') {
      time /= 24
      unit = 'day'
    }

    return {
      time,
      unit,
    }
  }, [data?.deckStatistics?.totalStudyTime])

  const studyFrequency = useMemo(
    () =>
      (data?.deckStatistics?.studyFrequency ?? []).map((frequency) => {
        return {
          ...frequency,
          date: new Date(frequency.date),
        }
      }),
    [data?.deckStatistics?.studyFrequency]
  )

  if (error) {
    return (
      <Container className="py-4">
        <BackButton to="/" />

        <Headline1 className="text-txt text-opacity-text-primary">
          <Trans>Deck Statistics</Trans>
        </Headline1>

        <Body1 className="mt-3 text-txt text-opacity-text-primary">
          <Trans>
            An error has occurred, try refreshing the page or wait a few minutes
            before trying again
          </Trans>
        </Body1>
      </Container>
    )
  }

  if (!data?.deckStatistics && !loading) {
    return (
      <Container className="py-4">
        <BackButton to="/" />

        <Headline1 className="text-txt text-opacity-text-primary">
          <Trans>Deck Statistics</Trans>
        </Headline1>

        <Body1 className="mt-6 text-txt text-opacity-text-primary">
          <Trans>We don't have anything to show to you right now.</Trans>
        </Body1>
        <Body2 className="mt-2">
          <Trans>
            Try creating a deck first and study it in order to see your study
            statistics here.
          </Trans>
        </Body2>
      </Container>
    )
  }

  const formattedStudyTime = i18n.number(studyTime.time, {
    style: 'decimal',
    maximumFractionDigits: 2,
  })

  if (!data?.deckStatistics) {
    return null
  }

  return (
    <Container className="py-4">
      <BackButton to="/" />

      <Headline1 className="text-txt text-opacity-text-primary">
        <Trans>Deck Statistics</Trans>
      </Headline1>

      <Card className="mt-6">
        <CardContent>
          <label
            className="text-txt text-opacity-text-primary inline-block"
            htmlFor="statistics-deck-listbox"
          >
            <Trans>Select your deck</Trans>
          </label>

          <Listbox
            id="statistics-deck-listbox"
            className="mt-2"
            value={data.deckStatistics.deck.id}
            onChange={setSelectedDeck}
          >
            {data.decks.map((deck) => (
              <ListboxOption key={deck.id} value={deck.id}>
                {deck.title}
              </ListboxOption>
            ))}
          </Listbox>
        </CardContent>
      </Card>

      <Headline2 className="text-txt text-opacity-text-primary mt-6">
        <Trans>Overview</Trans>
      </Headline2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mt-6">
        <StatisticsCard
          label={<Trans>Total study time</Trans>}
          value={select(studyTime.unit, {
            millisecond: plural(studyTime.time, {
              one: `${formattedStudyTime} millisecond`,
              other: `${formattedStudyTime} milliseconds`,
            }),
            second: plural(studyTime.time, {
              one: `${formattedStudyTime} second`,
              other: `${formattedStudyTime} seconds`,
            }),
            minute: plural(studyTime.time, {
              one: `${formattedStudyTime} minute`,
              other: `${formattedStudyTime} minutes`,
            }),
            hour: plural(studyTime.time, {
              one: `${formattedStudyTime} hour`,
              other: `${formattedStudyTime} hours`,
            }),
            day: plural(studyTime.time, {
              one: `${formattedStudyTime} day`,
              other: `${formattedStudyTime} days`,
            }),
          })}
        />
        <StatisticsCard
          label={<Trans>Number of times studied</Trans>}
          value={data.deckStatistics.totalTimesStudied}
        />
        <StatisticsCard
          label={<Trans>Number of flashcards studied</Trans>}
          value={data.deckStatistics.totalFlashcardsStudied}
        />
      </div>

      <StudyFrequencyGraph
        className="mt-12"
        studyFrequency={studyFrequency}
        interval={interval}
        onIntervalChange={setIntervalValue}
        today={today}
        startDate={startDate}
      />
    </Container>
  )
}

export default StatisticsPage
