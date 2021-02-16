import { useQuery } from '@apollo/react-hooks'
import { Trans } from '@lingui/macro'
import classnames from 'classnames'
import gql from 'graphql-tag'
import { useCallback } from 'react'
import * as React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import { ReactComponent as LogoGray } from '../assets/logo-gray.svg'
import { ReactComponent as Logo } from '../assets/logo.svg'
import useDarkModePreferencesSync from '../hooks/useDarkModePreferencesSync'
import useOffline from '../hooks/useOffline'
import AppName from './AppName'
import NoSSR from './NoSSR'
import { useTheme } from './Theme'
import { UserContext, useCurrentUser } from './UserContext'
import type { TopBarLoadingQuery } from './__generated__/TopBarLoadingQuery'
import type { UserQuery } from './__generated__/UserQuery'
import { AnonymousIcon } from './icons/AnonymousIcon'
import DarkModeIcon from './icons/DarkModeIcon'
import LogoutIcon from './icons/LogoutIcon'
import OverflowMenuIcon from './icons/OverflowMenuIcon'
import SettingsIcon from './icons/SettingsIcon'
import StatisticsIcon from './icons/StatisticsIcon'
import USER_QUERY from './userQuery.gql'
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogLabel,
} from './views/AlertDialog'
import Button from './views/Button'
import Divider from './views/Divider'
import { Header, HeaderContent, HeaderSection } from './views/Header'
import { LoadingBar } from './views/LoadingBar'
import { Menu, MenuButton, MenuItem, MenuList } from './views/MenuButton'
import { Switch } from './views/Switch'

const TOP_BAR_LOADING_QUERY = gql`
  query TopBarLoadingQuery {
    topBar @client {
      loading
    }
  }
`

const DefaultMenuItems: React.FC = () => {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const me = useCurrentUser()

  const [showAnonLogoutModal, setShowAnonLogoutModal] = React.useState(false)

  const handleSettingsClick = useCallback(() => {
    navigate('/settings')
  }, [navigate])

  const handleLogout = useCallback(() => {
    if (me.anonymous && !showAnonLogoutModal) {
      setShowAnonLogoutModal(true)
      return
    }

    fetch('/_c/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => window.location.assign('/login'))
  }, [me.anonymous, showAnonLogoutModal])

  const cancelLogoutRef = React.useRef(null)

  const handleClose = () => {
    setShowAnonLogoutModal(false)
  }

  return (
    <>
      <AlertDialog
        isOpen={showAnonLogoutModal}
        onDismiss={handleClose}
        leastDestructiveRef={cancelLogoutRef}
      >
        <AlertDialogLabel>
          <Trans>Are you sure you want to logout?</Trans>
        </AlertDialogLabel>
        <AlertDialogDescription>
          <Trans>
            You are using an anonymous account, if you logout now you will lose
            all your study history and created decks and flashcards. If you want
            to keep all your data, go back and fill your profile information in
            the settings page.
          </Trans>
        </AlertDialogDescription>
        <div className="flex flex-col sm:flex-row flex-wrap justify-end items-stretch sm:items-center">
          <Button
            variation="secondary"
            onClick={handleClose}
            ref={cancelLogoutRef}
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button className="mt-3 sm:mt-0 sm:ml-3" onClick={handleLogout}>
            <Trans>Logout and delete account</Trans>
          </Button>
        </div>
      </AlertDialog>
      <MenuItem
        onSelect={handleSettingsClick}
        icon={<SettingsIcon className="text-txt text-opacity-text-secondary" />}
      >
        <Trans>Settings</Trans>
      </MenuItem>
      <Switch
        className="w-full px-4 justify-between"
        name="darkMode"
        checked={theme === 'dark'}
        onChange={({ target: { checked } }) =>
          setTheme(checked ? 'dark' : 'light')
        }
        reverse
      >
        <div className="flex items-center">
          <DarkModeIcon
            className="mr-4 text-txt text-opacity-text-secondary"
            aria-hidden
          />
          <Trans>Dark mode</Trans>
        </div>
      </Switch>
      <Divider className="my-3" />
      <MenuItem
        onSelect={handleLogout}
        icon={<LogoutIcon className="text-txt text-opacity-text-secondary" />}
      >
        <Trans>Log out</Trans>
      </MenuItem>
    </>
  )
}

const UserBanner: React.VFC = () => {
  const user = useCurrentUser()

  if (user.anonymous) {
    return (
      <div className="flex items-center px-5 mb-3">
        <div className="bg-secondary rounded-full flex items-center p-2">
          <AnonymousIcon className="text-txt text-opacity-text-secondary" />
        </div>

        <span className="text-txt text-opacity-text-primary text-base ml-3">
          <Trans>Anonymous user</Trans>
        </span>
      </div>
    )
  }
  return (
    <div className="flex flex-col px-5 mb-3">
      <span className="text-txt text-opacity-text-primary text-lg">
        {user.username}
      </span>
      <span className="text-txt text-opacity-text-secondary">{user.email}</span>
    </div>
  )
}

const MobileMenu: React.FC = () => {
  const navigate = useNavigate()

  const handleStatisticsClick = () => navigate('/statistics')

  return (
    <Menu>
      <MenuButton icon className="md:hidden text-txt text-opacity-text-primary">
        <OverflowMenuIcon />
      </MenuButton>
      <NoSSR>
        <MenuList
          portal={false}
          className="absolute z-10 right-0"
          style={{ top: '1.25rem' }}
        >
          <UserBanner />
          <MenuItem
            className="md:hidden"
            onSelect={handleStatisticsClick}
            icon={
              <StatisticsIcon className="text-txt text-opacity-text-secondary" />
            }
          >
            <Trans>Statistics</Trans>
          </MenuItem>
          <Divider className="my-3 md:hidden" />
          <DefaultMenuItems />
        </MenuList>
      </NoSSR>
    </Menu>
  )
}

const DefaultMenu: React.FC = () => {
  return (
    <Menu>
      <MenuButton
        icon
        className="hidden md:inline-block text-txt text-opacity-text-primary"
      >
        <OverflowMenuIcon />
      </MenuButton>
      <NoSSR>
        <MenuList
          portal={false}
          className="absolute z-10 right-0"
          style={{ top: '1.25rem' }}
        >
          <UserBanner />
          <Divider />
          <DefaultMenuItems />
        </MenuList>
      </NoSSR>
    </Menu>
  )
}

const Shell: React.FC = () => {
  const { data } = useQuery<TopBarLoadingQuery>(TOP_BAR_LOADING_QUERY)

  const loading = data?.topBar?.loading ?? false

  const isOffline = useOffline()

  const { data: userData } = useQuery<UserQuery>(USER_QUERY)

  const me = userData!.me!

  useDarkModePreferencesSync()

  return (
    <UserContext user={me}>
      <div className="w-full h-full flex flex-col relative">
        <Header className="relative">
          <HeaderContent>
            <HeaderSection>
              <Link className="flex items-center pl-1 link" to="/home">
                {!isOffline ? <Logo width="32" /> : <LogoGray width="32" />}
                <AppName className="ml-2" />
              </Link>
            </HeaderSection>
            <div
              id="header-portal-anchor"
              className="flex-auto hidden md:inline-block"
            />
            <HeaderSection align="end">
              <MobileMenu />
              <DefaultMenu />
            </HeaderSection>
          </HeaderContent>
          <div id="header-mobile-portal-anchor" />
          <LoadingBar
            className={classnames('absolute left-0 right-0 z-1', {
              hidden: !loading,
            })}
            style={{ top: 'calc(100% + 1px)' }}
          />
        </Header>
        <main className="flex-1 overflow-auto w-full relative bg-background bg-opacity-background">
          <Outlet />
          <div id="portal-anchor" />
        </main>
      </div>
    </UserContext>
  )
}

export default Shell
