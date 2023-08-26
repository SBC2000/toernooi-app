import { Link } from 'react-router-dom'

export default function Header(props: { title: string }) {
  const { title } = props

  return (
    <>
      <Link
        className="absolute  text-sbcOrange-500 text-3xl font-medium px-2"
        to="/"
      >
        {'\u2039'}
      </Link>
      <h1 className="w-full text-xl leading-10 text-sbcBlue-500 text-center border-b-4 border-sbcBlue-500 mb-0.5">
        {title}
      </h1>
    </>
  )
}
