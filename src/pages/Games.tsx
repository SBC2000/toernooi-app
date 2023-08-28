import { useRef } from 'react'

import Footer from '../components/Footer'
import Header from '../components/Header'
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

  console.log('Render games')

  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="flex flex-col w-full max-w-md">
        <Header title="Wedstrijden"></Header>
        <div className="flex w-full border-t-2 border-sbcOrange-500">
          {gamesByField.map(({ fieldName }, i) => (
            <h2
              className="flex-auto text-center text-sbcBlue-500 uppercase px-2 mt-2 mb-1 border-l first:border-l-0 border-sbcOrange-500"
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
              <div className="sticky top-0 bg-white w-full">
                <div
                  className="bg-sbcOrange-500 w-1/4 h-1"
                  style={{ marginLeft: `${i * 25}%` }}
                ></div>
              </div>
              {gameDays.map(({ date, games }) => (
                <div key={date}>
                  <h3 className="text-sbcBlue-500 text-center text-lg leading-10 mt-2">
                    {/* <h3 className="bg-sbcOrange-500 text-sbcBlue-500 text-center text-lg leading-10"> */}
                    {date}
                  </h3>
                  <GameTable games={games}></GameTable>
                </div>
              ))}
            </div>
          ))}
        </div>
        <Footer></Footer>
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
    <div className="flex flex-col w-full border-t border-sbcBlue-500">
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
