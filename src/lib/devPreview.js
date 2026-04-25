import useAppStore from '../store/useAppStore'
import useLeagueStore from '../stores/useLeagueStore'

const DEV_LEAGUE_ID = 'dev-league-preview'

function isLocalPreviewHost() {
  if (typeof window === 'undefined') return false
  return ['localhost', '127.0.0.1'].includes(window.location.hostname)
}

export function canUseDevPreview() {
  return import.meta.env.DEV || isLocalPreviewHost()
}

export function enableDevPreviewSession() {
  useAppStore.setState((state) => ({
    ...state,
    user: {
      id: 'dev-preview-user',
      email: 'preview@fantabrain.local',
      name: 'Preview',
      plan: 'gold',
      token: 'dev-preview-token',
      league: 'Lega Demo',
    },
    aiCrediti: 3,
    resetAt: null,
  }))

  useLeagueStore.setState((state) => ({
    ...state,
    currentLeagueId: DEV_LEAGUE_ID,
    leagues: [
      {
        id: DEV_LEAGUE_ID,
        nome: 'Lega Demo',
        inviteCode: 'FBRAIN-DEMO',
        inviteUrl: 'https://fantabrain.app/lega/FBRAIN-DEMO',
        createdAt: new Date().toISOString(),
        isAdmin: true,
        participants: [],
        myRoster: [],
        standings: [],
        settings: {
          nome: 'Lega Demo',
          tipo: 'privata',
          modalitaGioco: 'mantra',
        },
      },
      ...state.leagues.filter((league) => league.id !== DEV_LEAGUE_ID),
    ],
  }))
}
