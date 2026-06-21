import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, LogOut, Menu, X } from 'lucide-react'

export default function Header({ setIsAuthenticated, hasTeam, hasCompleteTeam }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  // Core navigation - always visible
  const coreNavLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/profile', label: 'Profile' },
    { to: '/team', label: 'Team' },
    { to: '/discover', label: 'Discover Teams' }
  ]

  // Show Analysis & Predictions when user has a team
  const teamNavLinks = hasTeam ? [
    { to: '/analysis', label: 'Analysis' },
    { to: '/predictions', label: 'Predictions' },
    { to: '/roles', label: 'AI Roles' },
    { to: '/gaps', label: 'Skill Gaps' },
    { to: '/talent', label: 'Find Talent' }
  ] : []

  // Show Reports only when team is complete (3+ members)
  const reportNavLinks = hasCompleteTeam ? [
    { to: '/reports', label: 'Reports' }
  ] : []

  const allNavLinks = [...coreNavLinks, ...teamNavLinks, ...reportNavLinks]

  return (
    <header className="bg-white border-b border-light-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              TeamSync AI
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {allNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-600 hover:text-primary-600 transition font-medium"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-600 transition font-medium ml-4"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-primary-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-light-border">
          <nav className="px-4 py-4 space-y-2">
            {allNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-600 hover:text-primary-600 transition font-medium"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout()
                setMobileMenuOpen(false)
              }}
              className="flex items-center py-2 text-red-600 hover:text-red-700 transition font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
