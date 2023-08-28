import { useRef } from 'react'

export interface TabViewProps {
  children?: React.ReactElement<TabProps>[] | React.ReactElement<TabProps>
}

export interface TabProps {
  title: string
  children?: React.ReactElement<any>[] | React.ReactElement<any>
}

export function TabView(props: TabViewProps): JSX.Element {
  const children = props.children
    ? Array.isArray(props.children)
      ? props.children
      : [props.children]
    : []

  // Number of refs cannot change between calls. Initialize to 6 to have plenty.
  const tabRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  const indicatorWidth = children.length ? 100 / children.length : 100

  return (
    <>
      <div className="flex w-full border-t-2 border-sbcOrange-500">
        {children.map(({ props: { title } }, i) => (
          <h2
            className="flex-auto text-center text-sbcBlue-500 uppercase px-2 mt-2 mb-1 border-l first:border-l-0 border-sbcOrange-500"
            key={i}
            onClick={() =>
              tabRefs[i]?.current?.scrollIntoView({
                behavior: 'smooth',
              })
            }
          >
            {title}
          </h2>
        ))}
      </div>
      <div className="flex overflow-x-auto no-scrollbar snap-mandatory snap-x">
        {children.map((child, i) => (
          <div
            className="snap-start h-screen shrink-0 w-full"
            key={i}
            ref={tabRefs[i]}
          >
            <div className="sticky top-0 bg-white w-full">
              <div
                className="bg-sbcOrange-500 h-1"
                style={{
                  width: `${indicatorWidth}%`,
                  marginLeft: `${i * indicatorWidth}%`,
                }}
              ></div>
            </div>
            {child}
          </div>
        ))}
      </div>
    </>
  )
}

export function Tab({ children }: TabProps): JSX.Element | null {
  return children ? Array.isArray(children) ? <>{children}</> : children : null
}
