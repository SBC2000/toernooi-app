import { useMemo } from 'react'

import { Database, Game } from '../types'

export function useGamesByField(database: Database): GamesByField[] {
  return useMemo(
    () => getGamesByField(database),
    // These 3 metadata props uniquely determine database
    /* eslint-disable react-hooks/exhaustive-deps */
    [
      database.metadata.databaseVersion,
      database.metadata.dataVersion,
      database.metadata.resultVersion,
    ]
    /* eslint-enable */
  )
}

export function getGamesByField(database: Database) {
  return orderByRank(database.fields).map<GamesByField>((field) => {
    const fieldGames = database.games
      .filter((game) => game.field?.id === field.id)
      .sort((a, b) => a.date.toISOString().localeCompare(b.date.toISOString()))

    const gameDays = fieldGames.reduce<GamesByField['gameDays']>(
      (gameDays, game) => {
        let previousDay = gameDays[gameDays.length - 1]
        const currentDate = formatDate(game.date)

        if (previousDay?.date !== currentDate) {
          previousDay = { date: currentDate, games: [] }
          gameDays.push(previousDay)
        }

        previousDay.games.push(game)

        return gameDays
      },
      []
    )

    return {
      fieldName: field.name,
      gameDays: gameDays,
    }
  })
}

function orderByRank<T extends { rank: number }>(ts: T[]) {
  return ts.sort((a, b) => a.rank - b.rank)
}

const dayStrings = [
  'Zondag',
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
]

const monthStrings = [
  'Januari',
  'Februari',
  'Maart',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Augustus',
  'September',
  'Oktober',
  'November',
  'December',
]

function formatDate(date: Date) {
  return `${dayStrings[date.getDay()]} ${date.getDate()} ${
    monthStrings[date.getMonth()]
  }`
}

export type GamesByField = {
  fieldName: string
  gameDays: Array<{
    date: string
    games: Game[]
  }>
}
