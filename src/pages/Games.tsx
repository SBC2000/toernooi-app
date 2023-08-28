import AppPage from '../components/AppPage'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { Tab, TabView } from '../components/TabView'
import { useDatabase } from '../contexts/DatabaseContext'
import { useGamesByField } from '../hooks/useGamesByField'
import { Game } from '../types'

export default function Games() {
  const { database } = useDatabase()
  const gamesByField = useGamesByField(database)

  return (
    <AppPage>
      <Header title="Wedstrijden"></Header>
      <TabView>
        {gamesByField.map(({ fieldName, gameDays }, i) => (
          <Tab title={fieldName} key={i}>
            {gameDays.map(({ date, games }) => (
              <div key={date}>
                <h3 className="text-sbcBlue-500 text-center text-lg leading-10 mt-2">
                  {date}
                </h3>
                <GameTable games={games}></GameTable>
              </div>
            ))}
          </Tab>
        ))}
      </TabView>
      <Footer></Footer>
    </AppPage>
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
