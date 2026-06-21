import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import TeamAnalysis from './pages/TeamAnalysis'
import Login from './pages/Login'
import UserProfile from './pages/UserProfile'
import TeamManagement from './pages/TeamManagement'
import Predictions from './pages/Predictions'
import Reports from './pages/Reports'

// Import newly integrated pages
import AIRoleAssignment from './pages/AIRoleAssignment'
import SkillGapDetector from './pages/SkillGapDetector'
import FindTalent from './pages/FindTalent'
import TeamDiscovery from './pages/TeamDiscovery'

import { api } from './api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  // Check auth token on startup
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    } else {
      setLoading(false)
    }
  }, [])

  // Fetch user data and teams from backend when logged in
  const refreshData = async () => {
    try {
      const profile = await api.getProfile()
      setUserProfile(profile)
      const fetchedTeams = await api.getTeams()
      setTeams(fetchedTeams)
    } catch (err) {
      console.error("Error fetching data:", err)
      if (err.message.includes("validate credentials") || err.message.includes("401")) {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      refreshData()
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    api.logout()
    setIsAuthenticated(false)
    setUserProfile(null)
    setTeams([])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Determine which nav items to show based on user state
  const hasTeam = teams.length > 0
  const hasCompleteTeam = teams.some(team => team.members.length >= 3)

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        </Routes>
      ) : (
        <div className="min-h-screen bg-light-bg">
          <Header 
            setIsAuthenticated={handleLogout} 
            hasTeam={hasTeam}
            hasCompleteTeam={hasCompleteTeam}
          />
          <Routes>
            <Route path="/" element={<Dashboard teams={teams} userProfile={userProfile} />} />
            
            <Route path="/profile" element={
              <UserProfile 
                userProfile={userProfile} 
                setUserProfile={(profile) => {
                  setUserProfile(profile)
                  refreshData()
                }} 
              />
            } />
            
            <Route path="/team" element={
              <TeamManagement 
                teams={teams} 
                setTeams={(updatedTeams) => {
                  setTeams(updatedTeams)
                  refreshData()
                }} 
                userProfile={userProfile} 
              />
            } />
            
            <Route path="/analysis" element={<TeamAnalysis teams={teams} />} />
            <Route path="/predictions" element={<Predictions teams={teams} />} />
            <Route path="/reports" element={<Reports teams={teams} />} />
            
            {/* Newly mapped pages */}
            <Route path="/roles" element={<AIRoleAssignment teams={teams} />} />
            <Route path="/gaps" element={<SkillGapDetector teams={teams} />} />
            <Route path="/talent" element={<FindTalent teams={teams} />} />
            <Route path="/discover" element={<TeamDiscovery userProfile={userProfile} teams={teams} />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}
    </BrowserRouter>
  )
}

export default App
