import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'border-blue-600 text-blue-600 font-semibold'
        : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-gray-300'
    }`

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center mr-8">
              <span className="text-2xl mr-2" role="img" aria-label="shield">🛡️</span>
              <span className="font-bold text-xl text-gray-900 tracking-tight">ThreatLens AI</span>
            </div>
            <div className="hidden sm:flex sm:space-x-8">
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
          <div className="flex sm:hidden space-x-4 items-center">
            <NavLink
              to="/scan"
              className={({ isActive }) =>
                `text-xs font-semibold px-2 py-1 rounded ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`
              }
            >
              Scanner
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-xs font-semibold px-2 py-1 rounded ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `text-xs font-semibold px-2 py-1 rounded ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`
              }
            >
              History
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}
