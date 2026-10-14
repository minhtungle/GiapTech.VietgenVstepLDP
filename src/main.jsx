import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

// Thứ tự nạp CSS phải giữ đúng như bản HTML gốc: các quy tắc sau ghi đè quy tắc trước.
import './styles/bootstrap.min.css'
import './styles/font-awesome.min.css'
import './styles/animate.css'
import './styles/linea-fonts.css'
import './styles/flaticon.css'
import './styles/rsmenu-main.css'
import './styles/rs-spacing.css'
import './styles/style.css'
import './styles/responsive.css'
import './styles/vietgen-fix.css'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import './styles/app.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
