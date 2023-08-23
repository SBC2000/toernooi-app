import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Games from './pages/Games'
import Standings from './pages/Standings'
import { DatabaseContextProvider } from './contexts/DatabaseContext'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Games></Games>,
  },
  {
    path: '/standings',
    element: <Standings></Standings>,
  },
])

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <DatabaseContextProvider>
      <RouterProvider router={router} />
    </DatabaseContextProvider>
  </React.StrictMode>
)
