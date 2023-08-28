import { useRef } from 'react'

import Footer from '../components/Footer'
import Header from '../components/Header'
import { useDatabase } from '../contexts/DatabaseContext'
import { useScoresByCategory, Score } from '../hooks/useScoresByCategory'

export default function Standings() {
  const { database } = useDatabase()
  const scoresByCategory = useScoresByCategory(database)

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
        <Header title="Standen"></Header>
        <div className="flex w-full border-t-2 border-sbcOrange-500">
          {scoresByCategory.map(({ category }, i) => (
            <h2
              className="flex-auto text-center text-sbcBlue-500 uppercase px-2 mt-2 mb-1 border-l first:border-l-0 border-sbcOrange-500"
              key={category.id}
              onClick={() =>
                tabRefs[i]?.current?.scrollIntoView({
                  behavior: 'smooth',
                })
              }
            >
              {category.name}
            </h2>
          ))}
        </div>
        <div className="flex overflow-x-auto no-scrollbar snap-mandatory snap-x">
          {scoresByCategory.map(({ category, scoresByPool }, i) => (
            <div
              className="snap-start h-screen shrink-0 w-full"
              key={category.id}
              ref={tabRefs[i]}
            >
              <div className="sticky top-0 bg-white w-full">
                <div
                  className="bg-sbcOrange-500 w-1/3 h-1"
                  style={{ marginLeft: `${i * 33.3333}%` }}
                ></div>
              </div>
              {scoresByPool.map(({ pool, scores }) => (
                <div key={pool.abbreviation}>
                  <h3 className="text-sbcBlue-500 text-lg leading-8 mt-2">
                    {pool.name}
                  </h3>
                  <PoolTable scores={scores}></PoolTable>
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
