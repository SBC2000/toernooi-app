import { useRef } from 'react'
import { Link } from 'react-router-dom'

import './Games.css'
import footer from './footer.png'

import { useDatabase } from '../contexts/DatabaseContext'
import { useGamesByField } from '../hooks/useGamesByField'
import { Game } from '../types'

export default function Games() {
  const { database } = useDatabase()
  const gamesByField = useGamesByField(database)

  // Number of refs cannot change between calls. Initialize to 6 to have plenty.
  const tabRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="flex flex-col w-full max-w-md">
        <Link
          className="absolute  text-sbcOrange-500 text-3xl font-medium px-2"
          to="/"
        >
          {'\u2039'}
        </Link>
        <h1 className="w-full text-xl leading-10 text-sbcBlue-500 text-center border-b-4 border-sbcBlue-500 mb-0.5">
          Wedstrijden
        </h1>
        <div className="flex w-full border-t-2 border-sbcOrange-500">
          {gamesByField.map(({ fieldName }, i) => (
            <h2
              className="flex-auto text-center text-sbcBlue-500 uppercase px-2 my-2 border-l first:border-l-0 border-sbcOrange-500"
              key={fieldName}
              onClick={() =>
                tabRefs[i]?.current?.scrollIntoView({
                  behavior: 'smooth',
                })
              }
            >
              {fieldName}
            </h2>
          ))}
        </div>
        <div className="flex overflow-x-auto no-scrollbar snap-mandatory snap-x">
          {gamesByField.map(({ fieldName, gameDays }, i) => (
            <div
              className="snap-start h-screen shrink-0 w-full"
              key={fieldName}
              ref={tabRefs[i]}
            >
              {gameDays.map(({ date, games }) => (
                <div key={date}>
                  <h3 className="sticky top-0 bg-sbcOrange-500 text-sbcBlue-500 text-center text-xl leading-10">
                    {date}
                  </h3>
                  <GameTable games={games}></GameTable>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="w-full border-t-2 border-sbcOrange-500 h-10">
          <div className="h-full border-t-4 border-sbcBlue-500 mt-0.5 flex justify-center">
            <img src={footer} alt="SBC2000" className="h-full p-2"></img>
          </div>
        </div>
      </div>
    </div>
  )
}

function GameTable(props: { games: Game[] }) {
  const { games } = props

  const gameColomns = games.map((game) => ({
    game,
    columns: [
      {
        top: formatTime(game.date),
        bottom: game.poolAbbreviation,
        className: '',
      },
      {
        top: game.homeTeamName,
        bottom: game.referee1?.name ?? '\u00A0',
        className: 'w-1/3',
      },
      { top: '-', bottom: '\u00A0', className: '' },
      {
        top: game.awayTeamName,
        bottom: game.referee2?.name ?? '\u00A0',
        className: 'w-1/3',
      },
      {
        top: `${game.result?.homeScore ?? '\u00A0'}`,
        bottom: '\u00A0',
        className: 'w-6',
      },
      { top: game.result ? '-' : '\u00A0', bottom: '\u00A0', className: '' },
      {
        top: `${game.result?.awayScore ?? '\u00A0'}`,
        bottom: '\u00A0',
        className: 'w-6',
      },
    ],
  }))

  return (
    <div className="flex flex-col w-full">
      {gameColomns.map(({ game, columns }) => (
        <div className="flex pb-1 border-b border-sbcBlue-500" key={game.id}>
          {columns.map(({ top, bottom, className }, i) => (
            <div className={`${className} shrink-0 px-1`} key={i}>
              <div className="text-sbcBlue-500 text-sm text-center truncate">
                {top}
              </div>
              <div className="text-sbcBlue-500 text-xs text-center truncate">
                {bottom}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function formatTime(date: Date) {
  return [date.getHours(), date.getMinutes()]
    .map((x) => `0${x}`.slice(-2))
    .join(':')
}
