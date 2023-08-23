export interface Category {
  id: number
  name: string
  rank: number
}

export interface PoolRaw {
  id: number
  name: string
  abbreviation: string
  category: number
  rank: number
}

export interface Pool {
  id: number
  name: string
  abbreviation: string
  category: Category
  rank: number
  teams: Team[]
}

export interface Team {
  id: number
  name: string
}

export interface Field {
  id: number
  name: string
  rank: number
}

export interface Referee {
  id: number
  name: string
}

export interface GameRaw {
  id: number
  field: number
  date: string
  pool: number
  poolAbbreviation: string
  homeTeam: number
  homeTeamName: string
  awayTeam: number
  awayTeamName: string
  referee1: number
  referee1Name: string
  referee2: number
  referee2Name: string
}

export interface Game {
  id: number
  field: Field
  date: Date
  pool: Pool | undefined
  poolAbbreviation: string
  homeTeam: Team | undefined
  homeTeamName: string
  awayTeam: Team | undefined
  awayTeamName: string
  referee1: Referee | undefined
  referee2: Referee | undefined
  result: Result | undefined
}

export interface Result {
  gameId: number
  homeScore: number
  awayScore: number
}

export interface Metadata {
  databaseVersion: string
  dataVersion: number
  messageVersion: number
  resultVersion: number
  sponsorsVersion: number
  newDatabaseVersion: 'true' | 'false'
}

export type ApiResult = ApiResultWithDatabase | ApiResultWithoutDatabase

export type ApiResultWithDatabase = {
  categories: Category[]
  pools: PoolRaw[]
  teams: Team[]
  fields: Field[]
  referees: Referee[]
  games: GameRaw[]
  results: Result[]
} & Metadata

export type ApiResultWithoutDatabase = {
  results: Result[]
} & Metadata

export function hasData(
  apiResult: ApiResult
): apiResult is ApiResultWithDatabase {
  return (apiResult as ApiResultWithDatabase).categories !== undefined
}

export interface Database {
  categories: Category[]
  pools: Pool[]
  teams: Team[]
  fields: Field[]
  referees: Referee[]
  games: Game[]
  results: Result[]
  metadata: Metadata
}
