import { Tab, Table, TabList, TabPanel, Tabs } from '@mui/joy'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import Leaderboard from '@mui/icons-material/Leaderboard'

import './Games.css'
import { useDatabase } from '../contexts/DatabaseContext'
import { useGamesByField } from '../hooks/useGamesByField'

export default function Games() {
  const { database } = useDatabase()
  const gamesByField = useGamesByField(database)

  return (
    <div className="App">
      <Tabs>
        {gamesByField.map(({ gameDays }, i) => (
          <TabPanel value={i} key={i}>
            {gameDays.map(({ date, games }) => (
              <Fragment key={date}>
                <div
                  style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    padding: 'var(--Tabs-spacing)',
                  }}
                >
                  {date}
                </div>
                <Table>
                  <thead>
                    <tr>
                      <th style={{ height: 0, width: '10%' }}></th>
                      <th style={{ height: 0 }}></th>
                      <th style={{ height: 0, width: '10%' }}></th>
                      <th style={{ height: 0 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game) => (
                      <tr key={game.id}>
                        <td>
                          <div>{formatTime(game.date)}</div>
                          <div>{game.poolAbbreviation}</div>
                        </td>
                        <td>
                          <div className="game-table-cell">
                            {game.homeTeamName}
                          </div>
                          <div className="game-table-cell">
                            {game.referee1?.name ?? '\u00A0'}
                          </div>
                        </td>
                        <td>
                          {game.result?.homeScore ?? ''} -{' '}
                          {game.result?.awayScore ?? ''}
                        </td>
                        <td>
                          <div className="game-table-cell">
                            {game.awayTeamName}
                          </div>
                          <div className="game-table-cell">
                            {game.referee2?.name ?? '\u00A0'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Fragment>
            ))}
          </TabPanel>
        ))}
        <TabPanel value={gamesByField.length}></TabPanel>
        <TabList sticky="bottom" underlinePlacement="top">
          {gamesByField.map(({ fieldName }) => (
            <Tab
              variant="plain"
              color="warning"
              indicatorPlacement="top"
              key={fieldName}
            >
              {fieldName}
            </Tab>
          ))}
        </TabList>
      </Tabs>
      <Link
        to="/standings"
        style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          width: '40px',
          height: '40px',
          color: 'red',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Leaderboard></Leaderboard>
      </Link>
    </div>
  )
}

function formatTime(date: Date) {
  return [date.getHours(), date.getMinutes()]
    .map((x) => `0${x}`.slice(-2))
    .join(':')
}
