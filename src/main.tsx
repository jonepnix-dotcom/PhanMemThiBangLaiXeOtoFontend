import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'

const container = document.getElementById('root')!
const root = createRoot(container)

import App from './app/App'

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
