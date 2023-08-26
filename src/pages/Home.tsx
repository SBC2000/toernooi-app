import { Link } from 'react-router-dom'

import './Home.css'

import Footer from '../components/Footer'
import Header from '../components/Header'

export default function Home() {
  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="flex flex-col w-full max-w-md h-screen">
        <Header title="Home" hideBackButton={true}></Header>
        <div className="h-full p-4 home-background text-sbcBlue-500 text-center text-lg">
          <div className="h-full flex flex-col justify-evenly items-center home-player">
            <BlockLink
              to="/games"
              title="Wedstrijden"
              className="home-icon-games"
            ></BlockLink>
            <BlockLink
              to="/tables"
              title="Standen"
              className="home-icon-tables"
            ></BlockLink>
          </div>
        </div>
        <Footer></Footer>
      </div>
    </div>
  )
}

function BlockLink(props: { to: string; title: string; className: string }) {
  const { to, title, className } = props

  return (
    <Link to={to} className="w-2/3 bg-slate-50/80 rounded-lg aspect-square">
      <div
        className={`w-full h-full flex flex-col justify-end items-center p-4 ${className}`}
      >
        {title}
      </div>
    </Link>
  )
}
