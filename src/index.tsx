import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Games from './pages/Games'
import Home from './pages/Home'
import Tables from './pages/Tables'
import { DatabaseContextProvider } from './contexts/DatabaseContext'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home></Home>,
  },
  {
    path: '/games',
    element: <Games></Games>,
  },
  {
    path: '/tables',
    element: <Tables></Tables>,
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
