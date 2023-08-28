import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'

import {
  ApiResult,
  ApiResultWithDatabase,
  Database,
  Game,
  Pool,
  Result,
  Team,
  hasData,
} from '../types'

const localStorageKey = 'apiResponse'

export interface DatabaseContext {
  database: Database
  refresh: () => void
}

const databaseContext = createContext<DatabaseContext>({
  database: getEmptyDatabase(),
  refresh: () => {},
})

export const DatabaseContextProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [database, setDatabase] = useState<Database>(() => {
    const emptyDatabase = getEmptyDatabase()

    const localApiResult = localStorage.getItem(localStorageKey)
    return localApiResult
      ? parseApiResult(JSON.parse(localApiResult) as ApiResult, emptyDatabase)
      : emptyDatabase
  })

  useEffect(() => {
    localStorage.setItem(
      localStorageKey,
      // Serializing the databse is hard because of all the internal references
      // We already know how to deserialize API results, so use that as an intermediate state
      JSON.stringify(toApiResult(database))
    )
  }, [database])

  const {
    databaseVersion,
    dataVersion,
    messageVersion,
    resultVersion,
    sponsorsVersion,
  } = database.metadata

  const refresh = useCallback(() => {
    const fetchData = async () => {
      const response = await fetchWithTimeout(
        `/getData.php?databaseversion=${databaseVersion}&dataversion=${dataVersion}&messageversion=${messageVersion}&resultversion=${resultVersion}&sponsorsversion=${sponsorsVersion}`,
        10000
      )

      if (!response.ok) throw new Error(response.statusText)

      const apiResult: ApiResult = await response.json()

      setDatabase((database) => {
        const newDatabase = parseApiResult(apiResult, database)

        const databaseHasChanged = (
          ['databaseVersion', 'dataVersion', 'resultVersion'] as const
        ).some((p) => newDatabase.metadata[p] !== database.metadata[p])

        return databaseHasChanged ? newDatabase : database
      })
    }

    fetchData().catch(console.error)
  }, [
    databaseVersion,
    dataVersion,
    messageVersion,
    resultVersion,
    sponsorsVersion,
  ])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])

  return (
    <databaseContext.Provider value={{ database, refresh }}>
      {children}
    </databaseContext.Provider>
  )
}

export function useDatabase(): DatabaseContext {
  return useContext(databaseContext)
}

function getEmptyDatabase(): Database {
  return {
    metadata: {
      databaseVersion: `${new Date().getFullYear()}`,
      dataVersion: 0,
      messageVersion: 0,
      resultVersion: 0,
      sponsorsVersion: 0,
      newDatabaseVersion: 'false',
    },
    categories: [],
    pools: [],
    teams: [],
    fields: [],
    referees: [],
    games: [],
    results: [],
  }
}

function parseApiResult(apiResult: ApiResult, database: Database): Database {
  const newDatabase = hasData(apiResult) ? parseDatabase(apiResult) : database
  const results =
    apiResult.newDatabaseVersion === 'true'
      ? apiResult.results
      : [...database.results, ...apiResult.results]
  applyResults(newDatabase, results)

  return newDatabase
}

function parseDatabase(apiResult: ApiResultWithDatabase): Database {
  const categoryById = byId(apiResult.categories)
  const fieldsById = byId(apiResult.fields)
  const refereesById = byId(apiResult.referees)
  const teamsById = byId(apiResult.teams)

  const pools: Pool[] = apiResult.pools.map(
    ({ id, name, abbreviation, category: categoryId, rank }) => ({
      id,
      name,
      abbreviation,
      category: categoryById[categoryId],
      rank,
      teams: [],
    })
  )

  const poolsById = byId(pools)

  const games: Game[] = apiResult.games.map(
    ({
      id,
      field: fieldId,
      date: dateString,
      pool: poolId,
      poolAbbreviation,
      homeTeam: homeTeamId,
      homeTeamName,
      awayTeam: awayTeamId,
      awayTeamName,
      referee1: referee1Id,
      referee2: referee2Id,
    }) => {
      const pool = poolsById[poolId]
      const homeTeam = teamsById[homeTeamId]
      const awayTeam = teamsById[awayTeamId]

      return {
        id,
        field: fieldsById[fieldId],
        date: parseDate(dateString),
        pool: pool,
        poolAbbreviation: pool?.abbreviation ?? poolAbbreviation,
        homeTeam,
        homeTeamName: homeTeam?.name ?? homeTeamName,
        awayTeam,
        awayTeamName: awayTeam?.name ?? awayTeamName,
        referee1: refereesById[referee1Id],
        referee2: refereesById[referee2Id],
        result: undefined,
      }
    }
  )

  const teamsByPool = games.reduce<Record<number, Set<Team>>>(
    (result, game) => {
      if (!game.pool) return result

      const poolTeams = (result[game.pool.id] ??= new Set())

      if (game.homeTeam) poolTeams.add(game.homeTeam)
      if (game.awayTeam) poolTeams.add(game.awayTeam)

      return result
    },
    {}
  )

  for (const pool of pools) {
    pool.teams = Array.from(teamsByPool[pool.id] ?? [])
  }

  return {
    metadata: {
      databaseVersion: apiResult.databaseVersion,
      dataVersion: apiResult.dataVersion,
      messageVersion: apiResult.messageVersion,
      resultVersion: apiResult.resultVersion,
      sponsorsVersion: apiResult.sponsorsVersion,
      newDatabaseVersion: apiResult.newDatabaseVersion,
    },
    categories: apiResult.categories,
    pools: pools,
    teams: apiResult.teams,
    fields: apiResult.fields,
    referees: apiResult.referees,
    games: games,
    results: [],
  }
}

function toApiResult(database: Database): ApiResultWithDatabase {
  return {
    categories: database.categories,
    pools: database.pools.map(({ id, name, abbreviation, category, rank }) => ({
      id,
      name,
      abbreviation,
      category: category.id,
      rank,
    })),
    teams: database.teams,
    fields: database.fields,
    referees: database.referees,
    games: database.games.map(
      ({
        id,
        field,
        date,
        pool,
        poolAbbreviation,
        homeTeam,
        homeTeamName,
        awayTeam,
        awayTeamName,
        referee1,
        referee2,
      }) => ({
        id,
        field: field?.id ?? -1,
        date: formatDate(date),
        pool: pool?.id ?? -1,
        poolAbbreviation,
        homeTeam: homeTeam?.id ?? -1,
        homeTeamName,
        awayTeam: awayTeam?.id ?? -1,
        awayTeamName,
        referee1: referee1?.id ?? -1,
        referee1Name: referee1?.name ?? '',
        referee2: referee2?.id ?? -1,
        referee2Name: referee2?.name ?? '',
      })
    ),
    results: database.results,
    ...database.metadata,
  }
}

function byId<T extends { id: number }>(ts: T[]): Record<number, T> {
  return ts.reduce<Record<number, T>>((r, t) => {
    r[t.id] = t
    return r
  }, {})
}

function applyResults(database: Database, results: Result[]) {
  const gamesById = byId(database.games)
  for (const result of results) {
    const game = gamesById[result.gameId]
    if (game) game.result = result
  }
  database.results = results
}

const dateRegex = /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/
function parseDate(dateString: string): Date {
  const match = dateString.match(dateRegex)
  if (!match) return new Date()

  const [, DD, MM, YYYY, HH, mm, ss] = match
  const sss = '000'
  const Z = '+02:00'

  return new Date(`${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${sss}${Z}`)
}

function formatDate(date: Date): string {
  const [DD, MM, HH, mm, ss] = [
    date.getDate(),
    date.getMonth() + 1,
    date.getUTCHours() + 2,
    date.getMinutes(),
    date.getSeconds(),
  ].map((x) => `0${x}`.slice(-2))

  return `${DD}-${MM}-${date.getFullYear()} ${HH}:${mm}:${ss}`
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  timeout: number = 30000
): Promise<Response> {
  const { signal, abort } = new AbortController()
  const timeoutId = setTimeout(() => abort(), timeout)

  try {
    return await fetch(input, { signal })
  } finally {
    clearTimeout(timeoutId)
  }
}
