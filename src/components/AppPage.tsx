export default function AppPage(props: {
  children?: React.ReactElement[] | React.ReactElement
}) {
  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="flex flex-col w-full max-w-md h-screen">
        {props.children}
      </div>
    </div>
  )
}
