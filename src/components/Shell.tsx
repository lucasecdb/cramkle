import { useQuery } from '@apollo/react-hooks'
import { Trans } from '@lingui/macro'
import gql from 'graphql-tag'
import React, { Suspense, useCallback } from 'react'
import { Link, useHistory } from 'react-router-dom'

import { ReactComponent as LogoGray } from '../assets/logo-gray.svg'
import { ReactComponent as Logo } from '../assets/logo.svg'
import useOffline from '../hooks/useOffline'
import AppName from './AppName'
import NoSSR from './NoSSR'
import { TopBarLoadingQuery } from './__generated__/TopBarLoadingQuery'
import { UserQuery } from './__generated__/UserQuery'
import LogoutIcon from './icons/LogoutIcon'
import MarketplaceIcon from './icons/MarketplaceIcon'
import OverflowMenuIcon from './icons/OverflowMenuIcon'
import SettingsIcon from './icons/SettingsIcon'
import StatisticsIcon from './icons/StatisticsIcon'
import USER_QUERY from './userQuery.gql'
import { Header, HeaderContent, HeaderSection } from './views/Header'
import { LoadingBar } from './views/LoadingBar'
import { Menu, MenuButton, MenuItem, MenuList } from './views/MenuButton'

const TOP_BAR_LOADING_QUERY = gql`
  query TopBarLoadingQuery {
    topBar @client {
      loading
    }
  }
`

const DefaultMenuItems: React.FC = () => {
  const history = useHistory()

  const handleSettingsClick = useCallback(() => {
    history.push('/settings')
  }, [history])

  const handleLogout = useCallback(() => {
    fetch('/_c/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => window.location.assign('/login'))
  }, [])

  return (
    <>
      <MenuItem
        onSelect={handleSettingsClick}
        icon={<SettingsIcon className="text-secondary" />}
      >
        <Trans>Settings</Trans>
      </MenuItem>
      <MenuItem
        onSelect={handleLogout}
        icon={<LogoutIcon className="text-secondary" />}
      >
        <Trans>Log out</Trans>
      </MenuItem>
    </>
  )
}

const MobileMenu: React.FC<{ username: string; email: string }> = ({
  username,
  email,
}) => {
  const history = useHistory()

  const handleStatisticsClick = () => history.push('/statistics')

  const handleMarketplaceClick = () => history.push('/marketplace')

  return (
    <Menu>
      <MenuButton icon className="md:hidden">
        <OverflowMenuIcon />
      </MenuButton>
      <MenuList
        portal={false}
        className="absolute z-10 right-0"
        style={{ top: '1.25rem' }}
      >
        <div className="flex flex-col px-5 mb-3 md:hidden">
          <span className="text-primary text-lg">{username}</span>
          <span className="text-secondary">{email}</span>
        </div>
        <MenuItem
          className="md:hidden"
          onSelect={handleMarketplaceClick}
          icon={<MarketplaceIcon className="text-secondary" />}
        >
          <Trans>Marketplace</Trans>
        </MenuItem>
        <MenuItem
          className="md:hidden"
          onSelect={handleStatisticsClick}
          icon={<StatisticsIcon className="text-secondary" />}
        >
          <Trans>Statistics</Trans>
        </MenuItem>
        <div className="my-3 h-px md:hidden bg-gray-1" />
        <DefaultMenuItems />
      </MenuList>
    </Menu>
  )
}

const DefaultMenu: React.FC = () => {
  return (
    <Menu>
      <MenuButton icon className="hidden md:inline-block">
        <OverflowMenuIcon />
      </MenuButton>
      <MenuList
        portal={false}
        className="absolute z-10 right-0"
        style={{ top: '1.25rem' }}
      >
        <DefaultMenuItems />
      </MenuList>
    </Menu>
  )
}

const Shell: React.FunctionComponent = ({ children }) => {
  const { data } = useQuery<TopBarLoadingQuery>(TOP_BAR_LOADING_QUERY)

  const topBar = data?.topBar
  const loading = topBar?.loading

  const isOffline = useOffline()

  const { data: userData } = useQuery<UserQuery>(USER_QUERY)

  const me = userData?.me

  if (React.Children.count(children) === 0) {
    return null
  }

  const loader = <LoadingBar className="absolute left-0 right-0 z-1" />

  return (
    <div className="w-full h-full flex flex-col relative">
      <Header>
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
            <span className="hidden md:inline-block mr-3">{me?.username}</span>
            <MobileMenu username={me?.username} email={me?.email} />
            <DefaultMenu />
          </HeaderSection>
        </HeaderContent>
        <div id="header-mobile-portal-anchor" />
        {loading && loader}
      </Header>
      <main className="flex-1 overflow-auto w-full relative bg-background">
        <NoSSR fallback={loader}>
          <Suspense fallback={loader}>
            {children}
            <div id="portal-anchor" />
          </Suspense>
        </NoSSR>
      </main>
    </div>
  )
}

export default Shell
