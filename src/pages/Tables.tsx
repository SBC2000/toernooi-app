import AppPage from '../components/AppPage'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { Tab, TabView } from '../components/TabView'
import { useDatabase } from '../contexts/DatabaseContext'
import { useScoresByCategory, Score } from '../hooks/useScoresByCategory'

export default function Standings() {
  const { database } = useDatabase()
  const scoresByCategory = useScoresByCategory(database)

  return (
    <AppPage>
      <Header title="Standen"></Header>
      <TabView>
        {scoresByCategory.map(({ category, scoresByPool }, i) => (
          <Tab title={category.name} key={i}>
            {scoresByPool.map(({ pool, scores }) => (
              <div key={pool.abbreviation}>
                <h3 className="text-sbcBlue-500 text-lg leading-8 mt-2">
                  {pool.name}
                </h3>
                <PoolTable scores={scores}></PoolTable>
              </div>
            ))}
          </Tab>
        ))}
      </TabView>
      <Footer></Footer>
    </AppPage>
  )
}

function PoolTable(props: { scores: Score[] }) {
  const { scores } = props

  const numberClass = 'w-6 flex-none text-center'
  const highlightClass = 'bg-sbcOrange-500 font-medium'

  return (
    <div className="flex flex-col w-full divide-y divide-sbcBlue-500 border border-sbcBlue-500 text-sm text-sbcBlue-500">
      <div className="flex divide-x divide-sbcBlue-500">
        <div className="flex-auto"></div>
        <div className={`${numberClass} ${highlightClass}`}>#</div>
        <div className={numberClass}>W</div>
        <div className={numberClass}>G</div>
        <div className={numberClass}>V</div>
        <div className={`${numberClass} ${highlightClass}`}>P</div>
        <div className={numberClass}>DV</div>
        <div className={numberClass}>DS</div>
        <div className={`${numberClass} ${highlightClass}`}>S</div>
      </div>
      {scores.map((score, i) => (
        <div key={i} className="flex divide-x divide-sbcBlue-500">
          <div className="flex-auto truncate">
            {score.rank}. {score.team.name}
          </div>
          <div className={`${numberClass} ${highlightClass}`}>
            {score.played}
          </div>
          <div className={numberClass}>{score.wins}</div>
          <div className={numberClass}>{score.draws}</div>
          <div className={numberClass}>{score.losses}</div>
          <div className={`${numberClass} ${highlightClass}`}>
            {score.points}
          </div>
          <div className={numberClass}>{score.goals}</div>
          <div className={numberClass}>{score.goalsAgainst}</div>
          <div className={`${numberClass} ${highlightClass}`}>
            {score.goalDifference}
          </div>
        </div>
      ))}
    </div>
  )
}
