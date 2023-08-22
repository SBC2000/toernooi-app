import {
  ApiResult,
  ApiResultWithDatabase,
  Database,
  Game,
  Pool,
  Result,
  hasData,
} from '../types'
import { useEffect, useState } from 'react'

const localStorageKey = 'apiResponse'

export function useDatabase(counter: number): Database {
  const [database, setDatabase] = useState<Database>(() => {
    const emptyDatabase: Database = {
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

    const localApiResult = localStorage.getItem(localStorageKey)
    return localApiResult
      ? parseApiResult(JSON.parse(localApiResult) as ApiResult, emptyDatabase)
      : emptyDatabase
  })

  useEffect(
    () => {
      const fetchData = async () => {
        const {
          databaseVersion,
          dataVersion,
          messageVersion,
          resultVersion,
          sponsorsVersion,
        } = database.metadata

        const response = await fetch(
          `/getData.php?databaseversion=${databaseVersion}&dataversion=${dataVersion}&messageversion=${messageVersion}&resultversion=${resultVersion}&sponsorsversion=${sponsorsVersion}`
        )

        if (!response.ok) throw new Error(response.statusText)

        const apiResult: ApiResult = await response.json()

        localStorage.setItem(localStorageKey, JSON.stringify(apiResult))

        setDatabase(parseApiResult(apiResult, database))
      }

      fetchData().catch(console.error)
    },
    /* eslint-disable react-hooks/exhaustive-deps */
    [
      counter,
      database.metadata.databaseVersion,
      database.metadata.dataVersion,
      database.metadata.resultVersion,
    ]
    /* eslint-enable */
  )

  return database
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
