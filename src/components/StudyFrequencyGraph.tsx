import { Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Popover, getCollisions } from '@reach/popover'
import type { Position } from '@reach/tooltip'
import classNames from 'classnames'
import { bisector, extent, max } from 'd3-array'
import { scaleLinear, scaleTime } from 'd3-scale'
import { pointer } from 'd3-selection'
import { line } from 'd3-shape'
import { differenceInDays } from 'date-fns'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as React from 'react'
import ResizeObserver from 'resize-observer-polyfill'

import Axis from './Axis'
import ChartGrid from './ChartGrid'
import { useTheme } from './Theme'
import type { DeckStatistics_deckStatistics_studyFrequency } from './pages/__generated__/DeckStatistics'
import { Card } from './views/Card'
import { Listbox, ListboxOption } from './views/Listbox'
import { Body1, Body2, Headline2 } from './views/Typography'

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

type TransformedStudyFrequency = Omit<
  DeckStatistics_deckStatistics_studyFrequency,
  'date'
> & {
  date: Date
}

interface StudyFrequencyGraphProps {
  className?: string
  interval: string
  onIntervalChange: (newInterval: string) => void
  studyFrequency: TransformedStudyFrequency[]
  today: Date
  startDate: Date
}

export function StudyFrequencyGraph({
  className,
  interval,
  onIntervalChange,
  studyFrequency,
  today,
  startDate,
}: StudyFrequencyGraphProps) {
  const { theme } = useTheme()
  const { i18n } = useLingui()

  const [isHidden, setHidden] = useState(true)

  const [tooltipData, setTooltipData] =
    useState<TransformedStudyFrequency | null>(null)

  const handleMouseMove: React.MouseEventHandler = (evt) => {
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

  const [width, setWidth] = useState(0)

  const chartContainerRef = useRef<HTMLDivElement>(null)

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

  const { height, margin } = getChartDimensions(width)
  const chartRef = useRef<SVGSVGElement>(null)

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

  const getTooltipPosition: Position = useCallback(
    (targetRect, popoverRect) => {
      if (!targetRect || !popoverRect) {
        return {}
      }

      const { directionRight, directionUp } = getCollisions(
        targetRect,
        popoverRect
      )

      const left = directionRight
        ? targetRect.right - popoverRect.width + window.pageXOffset
        : targetRect.left + window.pageXOffset

      const top = directionUp
        ? targetRect.top - popoverRect.height + window.pageYOffset
        : targetRect.top + targetRect.height + window.pageYOffset

      const style = {
        left: 0,
        top: 0,
      }

      style.left = left + frequencyX(tooltipData?.date ?? 0)

      style.top =
        top +
        frequencyY(
          Math.max(
            tooltipData?.review ?? 0,
            tooltipData?.learning ?? 0,
            tooltipData?.new ?? 0
          )
        )

      return style
    },
    [tooltipData, frequencyX, frequencyY]
  )

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

  const ticksX = interval === '7' ? 7 : width / 80
  const ticksY = 5
  const bisect = bisector<TransformedStudyFrequency, Date>((d) => d.date)

  return (
    <Card className={className}>
      <div className="border-b border-divider border-opacity-divider flex flex-wrap justify-between items-center p-2">
        <Headline2 className="m-2">
          <Trans>Study frequency</Trans>
        </Headline2>

        <label className="m-2 flex items-center">
          <Trans>Interval</Trans>
          <Listbox
            className="ml-3"
            value={interval}
            onChange={(value) => onIntervalChange(value)}
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
        {studyFrequency.length > 0 ? (
          <>
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
              </g>
            </svg>
            <Popover
              targetRef={chartRef}
              position={getTooltipPosition}
              className={classNames(
                'bg-surface rounded py-2 px-4 overlay text-txt text-opacity-text-primary flex flex-col',
                {
                  '__light-mode': theme === 'dark',
                  '__dark-mode': theme === 'light',
                  'hidden': isHidden,
                }
              )}
            >
              <span>
                <Trans>New: {tooltipData?.new}</Trans>
              </span>
              <span>
                <Trans>Learning: {tooltipData?.learning}</Trans>
              </span>
              <span>
                <Trans>Review: {tooltipData?.review}</Trans>
              </span>
            </Popover>
          </>
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
  )
}
