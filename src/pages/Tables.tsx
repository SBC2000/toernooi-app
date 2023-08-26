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
              className="flex-auto text-center text-sbcBlue-500 uppercase px-2 my-2 border-l first:border-l-0 border-sbcOrange-500"
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
              {scoresByPool.map(({ pool, scores }) => (
                <div key={pool.abbreviation}>
                  <h3 className="sticky top-0 bg-sbcOrange-500 text-sbcBlue-500 text-center text-xl leading-10">
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
  return <div>Test</div>
}
