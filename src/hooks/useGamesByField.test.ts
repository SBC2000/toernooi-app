import { Database, Field, Game, Pool, Team } from '../types'
import { GamesByField, getGamesByField } from './useGamesByField'

describe('getGamesByField', () => {
  const fields: Field[] = [
    {
      id: 1,
      name: 'Veld 1',
      rank: 1,
    },
    {
      id: 3,
      name: 'Veld 3',
      rank: 3,
    },
    {
      id: 2,
      name: 'Veld 2',
      rank: 2,
    },
  ]

  const pool: Pool = {
    id: 1,
    name: 'Heren 1',
    abbreviation: 'H1',
    category: { id: 1, name: 'Heren', rank: 1 },
    rank: 1,
  }
  const homeTeam: Team = { id: 1, name: 'Home' }
  const awayTeam: Team = { id: 2, name: 'Away' }

  const createGame = (id: number, fieldId: number, date: Date): Game => ({
    id,
    date,
    field: fields.find((x) => x.id === fieldId)!,
    pool,
    poolAbbreviation: pool.abbreviation,
    homeTeam,
    homeTeamName: homeTeam.name,
    awayTeam,
    awayTeamName: awayTeam.name,
    referee1: undefined,
    referee2: undefined,
    result: undefined,
  })

  const games: Game[] = [
    createGame(1, 1, new Date(2023, 8, 2, 10, 0, 0)),
    createGame(2, 1, new Date(2023, 8, 2, 10, 20, 0)),
    createGame(3, 1, new Date(2023, 8, 3, 10, 0, 0)),
    createGame(4, 2, new Date(2023, 8, 2, 10, 40, 0)),
    createGame(5, 2, new Date(2023, 8, 2, 10, 20, 0)),
    createGame(6, 2, new Date(2023, 8, 2, 10, 0, 0)),
    createGame(7, 3, new Date(2023, 8, 3, 10, 20, 0)),
    createGame(8, 3, new Date(2023, 8, 3, 10, 0, 0)),
    createGame(9, 3, new Date(2023, 8, 3, 10, 40, 0)),
  ]

  const act = (fields: Field[], games: Game[]) =>
    getGamesByField({ fields, games } as Database)

  it('returns correct game days per field', () => {
    const expectedGameDays = [
      ['Zaterdag 2 September', 'Zondag 3 September'],
      ['Zaterdag 2 September'],
      ['Zondag 3 September'],
    ]

    const actualGameDays = act(fields, games).map((x) =>
      x.gameDays.map((x) => x.date)
    )

    expect(actualGameDays).toStrictEqual(expectedGameDays)
  })

  it('returns games per field and day in correct order', () => {
    const expectedGameIds = [[[1, 2], [3]], [[6, 5, 4]], [[8, 7, 9]]]

    const actualGameIds = act(fields, games).map((x) =>
      x.gameDays.map((x) => x.games.map((x) => x.id))
    )

    expect(expectedGameIds).toStrictEqual(actualGameIds)
  })

  it('returns empty array when there are no fields', () => {
    expect(act([], games)).toStrictEqual([])
  })

  it('returns array with empty games when there are no games', () => {
    const expected: GamesByField[] = [
      {
        fieldName: 'Veld 1',
        gameDays: [],
      },
      {
        fieldName: 'Veld 2',
        gameDays: [],
      },
      {
        fieldName: 'Veld 3',
        gameDays: [],
      },
    ]

    expect(act(fields, [])).toStrictEqual(expected)
  })
})
