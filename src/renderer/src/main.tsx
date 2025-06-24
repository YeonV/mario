import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from '@mui/material'
import theme from './styles/theme'
import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
