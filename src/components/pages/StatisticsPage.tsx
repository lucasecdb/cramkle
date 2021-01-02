import { useQuery } from '@apollo/react-hooks'
import { Trans, plural, select } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import classNames from 'classnames'
import { bisector, extent, max } from 'd3-array'
import { scaleLinear, scaleTime } from 'd3-scale'
import { pointer } from 'd3-selection'
import { line } from 'd3-shape'
import { differenceInDays, endOfToday, startOfDay, subDays } from 'date-fns'
import gql from 'graphql-tag'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as React from 'react'
import ResizeObserver from 'resize-observer-polyfill'

import { useSearchParamsState } from '../../hooks/useSearchParamsState'
import { useTopBarLoading } from '../../hooks/useTopBarLoading'
import Axis from '../Axis'
import BackButton from '../BackButton'
import ChartGrid from '../ChartGrid'
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
  DeckStatistics_deckStatistics_studyFrequency,
} from './__generated__/DeckStatistics'

type TransformedStudyFrequency = Omit<
  DeckStatistics_deckStatistics_studyFrequency,
  'date'
> & {
  date: Date
}

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

const getChartDimensions = (width: number) => {
  if (width > 480) {
    return {
      height: 500,
      margin: {
        left: 32,
        right: 32,
        top: 32,
        bottom: 32,
      },
    }
  }

  return {
    height: 300,
    margin: {
      left: 32,
      right: 16,
      top: 16,
      bottom: 32,
    },
  }
}

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

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  const { height, margin } = getChartDimensions(width)

  const chartContainerNode = chartContainerRef.current

  useEffect(() => {
    if (!chartContainerNode) {
      return
    }

    const chartContainerRect = chartContainerNode.getBoundingClientRect()

    setWidth(chartContainerRect.width)

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })

    observer.observe(chartContainerNode)

    return () => observer.unobserve(chartContainerNode)
  }, [chartContainerNode])

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

  const [isHidden, setHidden] = useState(true)

  const [tooltipData, setTooltipData] =
    useState<TransformedStudyFrequency | null>(null)

  const chartRef = useRef<SVGSVGElement>(null)

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

  const frequencyX = scaleTime<number, number>()
    .domain(extent(studyFrequency, (data) => data.date) as [Date, Date])
    .range([margin.left, width - margin.right])

  const frequencyY = scaleLinear()
    .domain([
      0,
      Math.max(
        max(studyFrequency, (d) => d.learning) as number,
        max(studyFrequency, (d) => d.new) as number,
        max(studyFrequency, (d) => d.review) as number
      ),
    ])
    .nice()
    .range([height - margin.bottom, margin.top])

  const reviewLineShape = line<TransformedStudyFrequency>()
    .x((d) => frequencyX(d.date)!)
    .y((d) => frequencyY(d.review)!)
  const learningLineShape = line<TransformedStudyFrequency>()
    .x((d) => frequencyX(d.date)!)
    .y((d) => frequencyY(d.learning)!)
  const newLineShape = line<TransformedStudyFrequency>()
    .x((d) => frequencyX(d.date)!)
    .y((d) => frequencyY(d.new)!)

  const reviewLine = reviewLineShape(studyFrequency) ?? ''
  const learningLine = learningLineShape(studyFrequency) ?? ''
  const newLine = newLineShape(studyFrequency) ?? ''

  const daysInterval = differenceInDays(today, startDate)

  const formattedStudyTime = i18n.number(studyTime.time, {
    style: 'decimal',
    maximumFractionDigits: 2,
  })

  const ticksX = interval === '7' ? 7 : width / 80
  const ticksY = 5
  const bisect = bisector<TransformedStudyFrequency, Date>((d) => d.date)

  if (!data?.deckStatistics) {
    return null
  }

  const handleMouseMove: React.MouseEventHandler<SVGGElement> = (evt) => {
    const [x] = pointer(evt, chartRef.current)

    const date = frequencyX.invert(x)

    const index = bisect.left(studyFrequency, date, 1)

    const a = studyFrequency[index - 1]
    const b = studyFrequency[index]

    setTooltipData(
      b && date.getTime() - a.date.getTime() > b.date.getTime() - date.getTime()
        ? b
        : a
    )
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

      <Card className="mt-12">
        <div className="border-b border-divider border-opacity-divider flex flex-wrap justify-between items-center p-2">
          <Headline2 className="m-2">
            <Trans>Study frequency</Trans>
          </Headline2>

          <label className="m-2 flex items-center">
            <Trans>Interval</Trans>
            <Listbox
              className="ml-3"
              value={interval}
              onChange={(value) => setIntervalValue(value)}
            >
              <ListboxOption value="7">
                <Trans>7 days</Trans>
              </ListboxOption>
              <ListboxOption value="30">
                <Trans>1 month</Trans>
              </ListboxOption>
              <ListboxOption value="365">
                <Trans>1 year</Trans>
              </ListboxOption>
            </Listbox>
          </label>
        </div>

        <div className="w-100" ref={chartContainerRef}>
          {data.deckStatistics.studyFrequency.length > 0 ? (
            <svg
              ref={chartRef}
              className="relative w-full py-2 px-4"
              viewBox={`0 0 ${width} ${height}`}
              height={height}
              onMouseOver={() => {
                setHidden(false)
              }}
              onMouseOut={() => {
                setHidden(true)
              }}
              onMouseMove={handleMouseMove}
            >
              <Axis
                fontSize="10px"
                orientation="left"
                offset={margin.left}
                scaler={frequencyY}
                tickSizeOuter={1}
                ticks={ticksY}
                textAnchor="end"
                domainLineProps={{
                  stroke: 'currentColor',
                  strokeOpacity: 0.1,
                  fill: 'none',
                }}
                prefix={
                  <>
                    <text
                      x={-margin.left}
                      y={width > 480 ? 12 : 6}
                      fill="currentColor"
                      textAnchor="start"
                    >
                      <Trans>Flashcards studied</Trans>
                    </text>
                  </>
                }
              />
              <Axis
                fontSize="10px"
                orientation="bottom"
                offset={height - margin.bottom}
                scaler={frequencyX}
                ticks={ticksX}
                tickKeyFn={(tick) => tick.getTime()}
                tickLabel={(tick) =>
                  i18n.date(tick, {
                    day: daysInterval <= 30 ? 'numeric' : undefined,
                    month:
                      daysInterval <= 30
                        ? 'short'
                        : daysInterval <= 365
                        ? 'long'
                        : undefined,
                    year: daysInterval > 365 ? 'numeric' : undefined,
                  })
                }
                tickSizeOuter={0}
                domainLineProps={{
                  stroke: 'currentColor',
                  strokeOpacity: 0.1,
                  fill: 'none',
                }}
              />
              <ChartGrid
                orientation="horizontal"
                scaler={frequencyX}
                ticks={ticksX}
                inlineStart={margin.top}
                inlineEnd={height - margin.bottom}
              />
              <ChartGrid
                orientation="vertical"
                scaler={frequencyY}
                ticks={ticksY}
                inlineStart={margin.left}
                inlineEnd={width - margin.right}
              />
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path className="text-violet-1" d={learningLine} />
                <path className="text-green-1" d={newLine} />
                <path
                  className="text-txt text-opacity-text-primary"
                  d={reviewLine}
                />
              </g>
              <g
                className={classNames({
                  hidden: isHidden,
                })}
                transform={`translate(${frequencyX(
                  tooltipData?.date ?? 0
                )}, ${frequencyY(
                  Math.max(
                    tooltipData?.review ?? 0,
                    tooltipData?.learning ?? 0,
                    tooltipData?.new ?? 0
                  )
                )})`}
              >
                <circle r={5} fill="currentColor" className="text-primary" />
                <rect
                  className="overlay"
                  fill="var(--surface)"
                  x={6}
                  y={-50}
                  rx={10}
                  ry={10}
                  width={140}
                  height={70}
                />
                <text
                  className="text-txt-inverted"
                  fill="currentColor"
                  x={18}
                  y={-30}
                >
                  New: {tooltipData?.new}
                </text>
                <text
                  x={18}
                  y={-10}
                  className="text-txt-inverted"
                  fill="currentColor"
                >
                  Learning: {tooltipData?.learning}
                </text>
                <text
                  x={18}
                  y={10}
                  className="text-txt-inverted"
                  fill="currentColor"
                >
                  Review: {tooltipData?.review}
                </text>
              </g>
            </svg>
          ) : (
            <div className="py-6 px-2 text-center flex flex-col items-center justify-center">
              <Body1>
                <Trans>
                  We don't have enough data to display in the supplied period.
                </Trans>
              </Body1>
              <Body2 className="mt-2">
                <Trans>Try selecting a broader interval above.</Trans>
              </Body2>
            </div>
          )}
        </div>
      </Card>
    </Container>
  )
}

export default StatisticsPage
