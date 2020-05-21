import { useQuery } from '@apollo/react-hooks'
import { Trans, plural, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import gql from 'graphql-tag'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useHistory, useParams } from 'react-router'

import useTopBarLoading from '../../hooks/useTopBarLoading'
import BackButton from '../BackButton'
import DeleteDeckButton from '../DeleteDeckButton'
import { useHints } from '../HintsContext'
import NotesTable from '../NotesTable'
import Container from '../views/Container'
import Fab from '../views/Fab'
import Icon from '../views/Icon'
import {
  Body1,
  Body2,
  Headline1,
  Headline2,
  Headline3,
} from '../views/Typography'
import { DeckQuery, DeckQueryVariables } from './__generated__/DeckQuery'

const DECK_QUERY = gql`
  query DeckQuery($slug: String!) {
    deck(slug: $slug) {
      id
      slug
      title
      description
      totalNotes
      totalFlashcards
      notes {
        id
        values {
          id
          data {
            ...DraftContent
          }
          field {
            id
            name
          }
        }
        model {
          name
          primaryField {
            id
          }
        }
        flashCards {
          id
          active
          state
          due
          template {
            name
          }
        }
        deck {
          title
        }
      }
    }
  }

  fragment DraftContent on ContentState {
    id
    blocks {
      key
      type
      text
      depth
      inlineStyleRanges {
        style
        offset
        length
      }
      entityRanges {
        key
        length
        offset
      }
      data
    }
    entityMap
  }
`

const DeckPage: React.FunctionComponent = () => {
  const { isMobile } = useHints()
  const { i18n } = useLingui()
  const { slug } = useParams<{ slug: string }>()
  const history = useHistory()
  const { data, loading } = useQuery<DeckQuery, DeckQueryVariables>(
    DECK_QUERY,
    {
      variables: { slug },
    }
  )

  useTopBarLoading(loading)

  if (loading) {
    return null
  }

  const { deck } = data

  return (
    <>
      <Helmet title={deck.title} />
      <Container>
        <BackButton to="/decks" />

        <div className="flex flex-col mb-8">
          <div className="flex justify-between items-center">
            <Headline1>
              <Trans>Deck details</Trans>
            </Headline1>

            <DeleteDeckButton deckId={deck.id} />
          </div>
          <Headline2 className="mt-4">{deck.title}</Headline2>
          {deck.description && (
            <Body1 className="mt-1">{deck.description}</Body1>
          )}
          <Body2 className="mt-1">
            {i18n._(
              plural(deck.totalNotes, { one: '# note', other: '# notes' })
            )}
            <span className="inline-block mx-1">&middot;</span>
            {i18n._(
              plural(deck.totalFlashcards, {
                one: '# flashcard',
                other: '# flashcards',
              })
            )}
          </Body2>
        </div>

        <Headline3>
          <Trans>Notes</Trans>
        </Headline3>

        <div className="mt-4 mb-8">
          <NotesTable notes={deck.notes} deckSlug={deck.slug} />
        </div>

        {!isMobile && (
          <div className="fixed" style={{ bottom: 20, right: 20 }}>
            <Fab
              icon={<Icon icon="add" aria-hidden="true" />}
              aria-label={i18n._(t`Add Note`)}
              textLabel={i18n._(t`Add Note`)}
              onClick={() => history.push(`${location.pathname}/new-note`)}
            />
          </div>
        )}
      </Container>
    </>
  )
}

export default DeckPage
