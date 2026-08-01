import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import './theme.css'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './fronrend/componets/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)

function initScrollAnimations(){
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
      } else {
        // optional: keep animated elements visible after they enter
        // entry.target.classList.remove('in-view');
      }
    })
  },{ root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  const observe = ()=>{
    document.querySelectorAll('.animate-on-scroll').forEach(el=> io.observe(el));
  };

  // run on tick to allow React to render initial DOM
  setTimeout(observe, 100);

  // also observe dynamically added content
  const mo = new MutationObserver(()=> observe());
  mo.observe(document.body, { childList: true, subtree: true });
}

if (typeof window !== 'undefined') {
  try{ initScrollAnimations(); }catch { /* ignore */ }
}
