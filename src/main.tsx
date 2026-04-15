import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'

const container = document.getElementById('root')!
const root = createRoot(container)

import App from './app/App'
import AdminApp from './app/AdminApp'

const path = window.location.pathname;
const isAdminRoute = path.startsWith('/admin');

root.render(
  <React.StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </React.StrictMode>
)
