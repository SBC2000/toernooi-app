import { Field, Game, Pool, Team } from '../types'
import { getScoresForPool } from './useScoresByCategory'

describe('getScoresByPool', () => {
  const teams: Team[] = [
    {
      id: 1,
      name: 'A team',
    },
    {
      id: 2,
      name: 'C team',
    },
    {
      id: 3,
      name: 'B team 2',
    },
    {
      id: 4,
      name: 'B team 1',
    },
  ]
  const otherTeam: Team = { id: 5, name: 'Other team' }

  const field: Field = { id: 1, name: 'Field', rank: 1 }
  const pool: Pool = {
    id: 1,
    name: 'Heren 1',
    abbreviation: 'H1',
    category: { id: 1, name: 'Heren', rank: 1 },
    rank: 1,
    teams,
  }

  const createGame = (homeTeamId: number, awayTeamId: number): Game => {
    const homeTeam = [...teams, otherTeam].find((x) => x.id === homeTeamId)!
    const awayTeam = [...teams, otherTeam].find((x) => x.id === awayTeamId)!

    return {
      id: 10 * homeTeamId + awayTeamId,
      date: new Date(),
      field,
      pool,
      poolAbbreviation: pool.abbreviation,
      homeTeam,
      homeTeamName: homeTeam.name,
      awayTeam,
      awayTeamName: awayTeam.name,
      referee1: undefined,
      referee2: undefined,
      result: undefined,
    }
  }

  const games: Game[] = [
    createGame(1, 2),
    createGame(3, 4),
    createGame(3, 1),
    createGame(4, 2),
    createGame(1, 4),
    createGame(2, 3),
    createGame(5, 1),
    createGame(3, 5),
  ]

  describe('when no games have been played yet', () => {
    const actualScores = getScoresForPool(pool, games)

    it('returns a score for each team', () => {
      expect(actualScores).toHaveLength(4)
      const scoreTeams = actualScores.map((x) => x.team)
      for (const team of teams) {
        expect(scoreTeams).toContain(team)
      }
    })

    it('ranks all teams as first place', () => {
      for (const score of actualScores) {
        expect(score.rank).toBe(1)
      }
    })

    it('sorts teams by name', () => {
      expect(actualScores.map((x) => x.team.name)).toStrictEqual([
        'A team',
        'B team 1',
        'B team 2',
        'C team',
      ])
    })
  })

  describe('when some games have been played', () => {
    const actualScores = getScoresForPool(pool, [
      withScore(games[0], 3, 1),
      withScore(games[1], 2, 2),
      withScore(games[2], 6, 4),
      ...games.slice(3),
    ])

    it('returns correct scores', () => {
      const expectedScores = [
        {
          rank: 1,
          team: teams[2],
          played: 2,
          wins: 1,
          draws: 1,
          losses: 0,
          points: 4,
          goals: 8,
          goalsAgainst: 6,
          goalDifference: 2,
        },
        {
          rank: 2,
          team: teams[0],
          played: 2,
          wins: 1,
          draws: 0,
          losses: 1,
          points: 3,
          goals: 7,
          goalsAgainst: 7,
          goalDifference: 0,
        },
        {
          rank: 3,
          team: teams[3],
          played: 1,
          wins: 0,
          draws: 1,
          losses: 0,
          points: 1,
          goals: 2,
          goalsAgainst: 2,
          goalDifference: 0,
        },
        {
          rank: 4,
          team: teams[1],
          played: 1,
          wins: 0,
          draws: 0,
          losses: 1,
          points: 0,
          goals: 1,
          goalsAgainst: 3,
          goalDifference: -2,
        },
      ]

      expect(actualScores).toStrictEqual(expectedScores)
    })
  })

  describe('when ties need to be broken', () => {
    it('ranks teams correctly by goal difference', () => {
      const actualScores = getScoresForPool(pool, [
        withScore(games[0], 3, 0),
        withScore(games[1], 3, 1),
        ...games.slice(2),
      ])

      const expectedTeamRanks = [
        { rank: 1, team: teams[0], points: 3, goalDifference: 3 },
        { rank: 2, team: teams[2], points: 3, goalDifference: 2 },
        { rank: 3, team: teams[3], points: 0, goalDifference: -2 },
        { rank: 4, team: teams[1], points: 0, goalDifference: -3 },
      ]

      expect(
        actualScores.map(({ rank, team, points, goalDifference }) => ({
          rank,
          team,
          points,
          goalDifference,
        }))
      ).toStrictEqual(expectedTeamRanks)
    })

    it('ranks teams correctly by goal', () => {
      const actualScores = getScoresForPool(pool, [
        withScore(games[0], 3, 0),
        withScore(games[1], 4, 1),
        ...games.slice(2),
      ])

      const expectedTeamRanks = [
        { rank: 1, team: teams[2], points: 3, goals: 4 },
        { rank: 2, team: teams[0], points: 3, goals: 3 },
        { rank: 3, team: teams[3], points: 0, goals: 1 },
        { rank: 4, team: teams[1], points: 0, goals: 0 },
      ]

      expect(
        actualScores.map(({ rank, team, points, goals }) => ({
          rank,
          team,
          points,
          goals,
        }))
      ).toStrictEqual(expectedTeamRanks)
    })

    it('ranks teams correctly by own games', () => {
      const actualScores = getScoresForPool(pool, [
        withScore(games[0], 3, 1),
        withScore(games[1], 4, 0),
        withScore(games[2], 2, 1),
        withScore(games[3], 0, 3),
        withScore(games[4], 3, 1),
        withScore(games[5], 3, 1),
        ...games.slice(6),
      ])

      // First 3 teams have same points, goalDifference, and goals
      // Ranking based on games between those teams
      const expectedScores = [
        {
          rank: 1,
          team: teams[0],
          played: 3,
          wins: 2,
          draws: 0,
          losses: 1,
          points: 6,
          goals: 7,
          goalsAgainst: 4,
          goalDifference: 3,
        },
        {
          rank: 2,
          team: teams[1],
          played: 3,
          wins: 2,
          draws: 0,
          losses: 1,
          points: 6,
          goals: 7,
          goalsAgainst: 4,
          goalDifference: 3,
        },
        {
          rank: 3,
          team: teams[2],
          played: 3,
          wins: 2,
          draws: 0,
          losses: 1,
          points: 6,
          goals: 7,
          goalsAgainst: 4,
          goalDifference: 3,
        },
        {
          rank: 4,
          team: teams[3],
          played: 3,
          wins: 0,
          draws: 0,
          losses: 3,
          points: 0,
          goals: 1,
          goalsAgainst: 10,
          goalDifference: -9,
        },
      ]

      expect(actualScores).toStrictEqual(expectedScores)
    })

    it('all equal', () => {
      const actualScores = getScoresForPool(pool, [
        withScore(games[0], 2, 0),
        withScore(games[1], 1, 0),
        withScore(games[2], 2, 0),
        withScore(games[3], 0, 1),
        withScore(games[4], 1, 0),
        withScore(games[5], 2, 0),
        withScore(games[6], 1, 0),
        withScore(games[7], 1, 0),
      ])

      const expectedScores = [
        {
          rank: 1,
          team: teams[0],
          played: 3,
          wins: 2,
          draws: 0,
          losses: 1,
          points: 6,
          goals: 3,
          goalsAgainst: 2,
          goalDifference: 1,
        },
        {
          rank: 1,
          team: teams[2],
          played: 3,
          wins: 2,
          draws: 0,
          losses: 1,
          points: 6,
          goals: 3,
          goalsAgainst: 2,
          goalDifference: 1,
        },
        {
          rank: 1,
          team: teams[1],
          played: 3,
          wins: 2,
          draws: 0,
          losses: 1,
          points: 6,
          goals: 3,
          goalsAgainst: 2,
          goalDifference: 1,
        },
        {
          rank: 4,
          team: teams[3],
          played: 3,
          wins: 0,
          draws: 0,
          losses: 3,
          points: 0,
          goals: 0,
          goalsAgainst: 3,
          goalDifference: -3,
        },
      ]

      expect(actualScores).toStrictEqual(expectedScores)
    })
  })

  function withScore(game: Game, homeScore: number, awayScore: number): Game {
    return { ...game, result: { gameId: game.id, homeScore, awayScore } }
  }
})
