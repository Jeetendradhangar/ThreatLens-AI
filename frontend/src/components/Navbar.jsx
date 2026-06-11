import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `font-body-md text-body-md transition-all duration-300 ease-in-out active:scale-95 pb-1 ${
      isActive
        ? 'border-b-2 border-primary text-primary font-semibold'
        : 'border-b-2 border-transparent text-on-surface-variant hover:text-primary'
    }`

  const mobileLinkClass = ({ isActive }) =>
    `text-xs font-semibold px-2 py-1 rounded transition-colors ${
      isActive ? 'bg-primary/15 text-primary border border-primary/30' : 'text-on-surface-variant hover:text-primary'
    }`

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 shadow-[0_0_15px_rgba(47,217,244,0.1)]">
      <div className="flex items-center justify-between px-6 h-16 w-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0 flex items-center">
            <span className="material-symbols-outlined text-primary text-[24px] mr-2">radar</span>
            <span className="font-display-lg text-[20px] lg:text-[24px] font-bold text-primary tracking-tighter">ThreatLens AI</span>
          </div>
          <div className="hidden sm:flex gap-6 items-center h-full">
            <NavLink to="/scan" className={linkClass}>
              Scanner
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              History
            </NavLink>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center">
            <span className="text-xs font-semibold text-primary/80 bg-primary/10 border border-primary/20 px-3 py-1 rounded font-mono uppercase tracking-wider">
              Active Audit Node
            </span>
          </div>
          
          <div className="flex sm:hidden space-x-2 items-center">
            <NavLink to="/scan" className={mobileLinkClass}>
              Scanner
            </NavLink>
            <NavLink to="/dashboard" className={mobileLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/history" className={mobileLinkClass}>
              History
            </NavLink>
          </div>

          <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/30 shadow-[0_0_8px_rgba(47,217,244,0.3)]">
            <img
              alt="Analyst Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzoWJjDrzyKrq53Gd85_vbI-YXPXI8Zw0xKasEXPp_F7sn-xnKFS0mLbkeo8gcEZIyjYucsM_21yUynV4rk2rq5oiulQx7x4SWeCJZPqqPv3ywEt82QmrYtmupVRgCJ1DhzyUKMEKf5727MDzVYQL_RMCIbc37b0xDINhJJKyo3pqor-N3FwE0-WYJkxQGWizOty_gbBHnTilTbcNpJYE1JX50n63q-CaiYfmoyjjMthCPxvFva0UGu2PeX-kOlbH0U6-ogBxKTy0"
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
