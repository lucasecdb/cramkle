import React from 'react'
import { useHistory } from 'react-router'
import { Body2, Headline6 } from 'views/Typography'

import Card, { CardPrimaryContent } from 'views/Card'

interface Props {
  title: string
  description?: string | null
  slug: string
}

const DeckCard: React.FunctionComponent<Props> = ({
  title,
  description = null,
  slug,
}) => {
  const history = useHistory()
  const handleClick = () => history.push(`/d/${slug}`)

  return (
    <Card outlined className="h-100">
      <CardPrimaryContent
        className="pa2 h-100"
        tabIndex={0}
        role="article"
        onClick={handleClick}
        onKeyDown={(e: React.KeyboardEvent) =>
          e.key === 'Enter' && handleClick()
        }
      >
        <Headline6>{title}</Headline6>
        {description && <Body2>{description}</Body2>}
      </CardPrimaryContent>
    </Card>
  )
}

export default DeckCard