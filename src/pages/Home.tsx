import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <Link className="h-1/2 bg-sbcBlue-500" to="/games">
        Uitslagen
      </Link>
      <Link className="h-1/2 bg-sbcOrange-500" to="/tables">
        Standen
      </Link>
    </div>
  )
}
