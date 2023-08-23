import { useMemo } from 'react'

import { Category, Database, Game, Pool, Team } from '../types'

export function useScoresByCategory(database: Database): ScoresByCategory[] {
  return useMemo(
    () => {
      return database.categories.map<ScoresByCategory>((category) => ({
        category,
        scoresByPool: database.pools
          .filter((pool) => pool.category === category)
          .map<ScoresByPool>((pool) => ({
            pool,
            scores: getScoresForPool(pool, database.games),
          })),
      }))
    },
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

export function getScoresForPool(pool: Pool, games: Game[]): Score[] {
  const poolScores = computeScores(pool.teams, games)

  return rankScores(poolScores, games)
}

function computeScores(teams: Team[], games: Game[]): Score[] {
  const teamGames = games.filter(
    (game) =>
      game.homeTeam &&
      teams.includes(game.homeTeam) &&
      game.awayTeam &&
      teams.includes(game.awayTeam)
  )

  const scoreByTeam = teams.reduce<Record<string, Score>>((result, team) => {
    result[team.id] = {
      rank: 0,
      team,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      goals: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    }
    return result
  }, {})

  const addResult = (team: Team, homeScore: number, awayScore: number) => {
    const score = scoreByTeam[team.id]

    score.played++

    if (homeScore > awayScore) {
      score.wins++
    } else if (homeScore < awayScore) {
      score.losses++
    } else {
      score.draws++
    }

    score.points = 3 * score.wins + score.draws

    score.goals += homeScore
    score.goalsAgainst += awayScore

    score.goalDifference = score.goals - score.goalsAgainst
  }

  for (const game of teamGames) {
    if (!game.result) continue

    addResult(game.homeTeam!, game.result.homeScore, game.result.awayScore)
    addResult(game.awayTeam!, game.result.awayScore, game.result.homeScore)
  }

  return Object.values(scoreByTeam)
}

function rankScores(scores: Score[], games: Game[]): Score[] {
  scores.sort(compareScores)

  // Cluster by scores with same value in order to break ties
  const scoreGroups = scores.reduce<Score[][]>((result, score) => {
    const lastScore = result[result.length - 1]?.[0]
    if (compareScores(score, lastScore) === 0) {
      result[result.length - 1].push(score)
    } else {
      result.push([score])
    }
    return result
  }, [])

  let rank = 1
  for (const scoreGroup of scoreGroups) {
    if (scoreGroup.length === 1) {
      scoreGroup[0].rank = rank++
      continue
    }

    // Break ties based on games within the group
    const groupScores = computeScores(
      scoreGroup.map((score) => score.team),
      games
    )
    groupScores.sort(compareScores)
    let previous: Score | undefined = undefined
    for (const groupScore of groupScores) {
      const score = scoreGroup.find((s) => s.team === groupScore.team)!
      score.rank = groupScore.rank =
        previous && compareScores(groupScore, previous) === 0
          ? previous.rank
          : rank

      rank++
      previous = groupScore
    }
  }

  scores
    .sort((a, b) => a.team.name.localeCompare(b.team.name))
    .sort((a, b) => a.rank - b.rank)

  return scores
}

function compareScores(score: Score, other: Score | undefined): number {
  if (!other) return -1

  // From the tournament rules: The ranking is based on consecutively
  // - obtained points
  // - goal differences
  // - scored goals
  return (
    [
      other.points - score.points,
      other.goalDifference - score.goalDifference,
      other.goals - score.goals,
    ].find((x) => x) ?? 0
  )
}

export interface Score {
  rank: number
  team: Team
  played: number
  wins: number
  draws: number
  losses: number
  points: number
  goals: number
  goalsAgainst: number
  goalDifference: number
}

export type ScoresByCategory = {
  category: Category
  scoresByPool: ScoresByPool[]
}

export type ScoresByPool = {
  pool: Pool
  scores: Score[]
}
