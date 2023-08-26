import { useDatabase } from '../contexts/DatabaseContext'
import { useScoresByCategory } from '../hooks/useScoresByCategory'

export default function Standings() {
  const { database } = useDatabase()
  const scoresByCategory = useScoresByCategory(database)

  return (
    <div className="h-screen flex overflow-x-auto no-scrollbar snap-mandatory snap-x">
      <div className="snap-start h-screen shrink-0 w-full md:w-1/2 xl:w-1/4 bg-red-400"></div>
      <div className="snap-start h-screen shrink-0 w-full md:w-1/2 xl:w-1/4 bg-orange-400"></div>
      <div className="snap-start h-screen shrink-0 w-full md:w-1/2 xl:w-1/4 bg-yellow-400"></div>
      <div className="snap-start h-screen shrink-0 w-full md:w-1/2 xl:w-1/4 bg-green-400"></div>
    </div>

    // <div>
    //   {scoresByCategory.map(({ category, scoresByPool }) => (
    //     <div key={category.id}>
    //       <div>{category.name}</div>
    //       <div>
    //         {scoresByPool.map(({ pool, scores }) => (
    //           <div key={pool.id}>
    //             <div>{pool.name}</div>
    //             <div>
    //               {scores.map(({ rank, team }) => (
    //                 <div key={team.id}>
    //                   {rank}. {team.name}
    //                 </div>
    //               ))}
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   ))}
    // </div>
  )
}
