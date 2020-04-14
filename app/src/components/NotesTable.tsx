import { Trans, t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { RawDraftContentState, convertFromRaw } from 'draft-js'
import React from 'react'

import Card from 'views/Card'
import { Body2 } from 'views/Typography'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuLink,
  MenuList,
} from 'views/MenuButton'
import { DeckQuery_deck_notes } from 'pages/__generated__/DeckQuery'
import Icon from './views/Icon'
import { Table, TableBody, TableCell, TableHead, TableRow } from './views/Table'

interface Props {
  notes: DeckQuery_deck_notes[]
  deckSlug: string
}

const NotesTable: React.FC<Props> = ({ notes, deckSlug }) => {
  const { i18n } = useLingui()

  if (!notes.length) {
    return (
      <Card className="w-100 mt2 pv3 ph2 flex flex-row justify-center" outlined>
        <Body2>
          <Trans>You haven't created any notes on this deck yet</Trans>
        </Body2>
      </Card>
    )
  }

  return (
    <Table className="w-100">
      <TableHead>
        <TableRow>
          <TableCell>
            <Trans>Note</Trans>
          </TableCell>
          <TableCell>
            <Trans>Model type</Trans>
          </TableCell>
          <TableCell>
            <Trans>Flashcards</Trans>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {notes.map((note) => {
          let noteIdentifier = note.id

          if (note.model.primaryField) {
            const contentState = convertFromRaw(
              note.values.find(
                (value) => value.field?.id === note.model.primaryField?.id
              )?.data as RawDraftContentState
            )

            noteIdentifier = contentState.getPlainText()
          }

          return (
            <TableRow key={note.id}>
              <TableCell>{noteIdentifier}</TableCell>
              <TableCell>{note.model.name}</TableCell>
              <TableCell>{note.cards.length}</TableCell>
              <TableCell>
                <Menu>
                  <MenuButton icon className="flex items-center">
                    <Icon aria-label={i18n._(t`Actions`)} icon="more_vert" />
                  </MenuButton>
                  <MenuList>
                    <MenuLink to={`/d/${deckSlug}/note/${note.id}`}>
                      <Trans>Edit</Trans>
                    </MenuLink>
                    <MenuItem onSelect={() => console.log('delete')}>
                      <Trans>Delete</Trans>
                    </MenuItem>
                  </MenuList>
                </Menu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default NotesTable
