import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WeddingInfoProvider } from "@/context/WeddingInfoProvider.jsx";

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WeddingInfoProvider>
      <App />
    </WeddingInfoProvider>
  </React.StrictMode>
)
