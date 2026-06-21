import { useState, useEffect } from 'react'
import { Search, Users, TrendingUp, Send, CheckCircle2, RefreshCw } from 'lucide-react'
import { api } from '../api'

export default function TeamDiscovery({ userProfile }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [requestedTeams, setRequestedTeams] = useState(new Set())
  const [availableTeams, setAvailableTeams] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchDiscoverTeams = async () => {
    setLoading(true)
    try {
      const res = await api.getDiscoverTeams()
      setAvailableTeams(res)
    } catch (err) {
      console.error("Error loading discover teams:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscoverTeams()
  }, [])

  const handleRequestJoin = (teamId) => {
    setRequestedTeams(new Set([...requestedTeams, teamId]))
    alert(`Join request sent successfully! Team administrators will review your profile.`)
  }

  const filteredTeams = availableTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getMatchReason = (team) => {
    const userSkills = userProfile?.skills || []
    const matchingSkills = team.requiredSkills.filter(skill =>
      userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
    )

    if (matchingSkills.length > 0) {
      return `${matchingSkills.length} matching skill${matchingSkills.length > 1 ? 's' : ''}: ${matchingSkills.join(', ')}`
    }
    return 'Domain and interest match'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Teams</h1>
          <p className="text-lg text-gray-600">Find teams that match your skills and interests</p>
        </div>
        <button 
          onClick={fetchDiscoverTeams}
          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-semibold transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Teams
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teams by name, domain, or skills..."
            className="w-full pl-12 pr-4 py-4 border border-light-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none shadow-sm text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <RefreshCw className="animate-spin w-10 h-10 text-primary-600 mb-4" />
          <p className="text-gray-600 font-medium">Scanning network for active project teams...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
              <Users className="w-8 h-8 text-primary-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">{filteredTeams.length}</p>
              <p className="text-sm text-gray-600">Available Teams</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">
                {filteredTeams.length > 0 ? Math.round(filteredTeams.reduce((a, b) => a + b.compatibility, 0) / filteredTeams.length) : 0}%
              </p>
              <p className="text-sm text-gray-600">Avg Compatibility Match</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
              <Send className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-3xl font-bold text-gray-900">{requestedTeams.size}</p>
              <p className="text-sm text-gray-600">Requests Sent</p>
            </div>
          </div>

          {/* Team Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTeams.map((team) => {
              const hasRequested = requestedTeams.has(team.id)
              
              return (
                <div
                  key={team.id}
                  className="bg-white rounded-xl shadow-sm border border-light-border overflow-hidden hover:shadow-lg transition"
                >
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 border-b border-light-border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{team.name}</h3>
                        <p className="text-sm text-gray-600">{team.description}</p>
                      </div>
                      <div className="flex items-center bg-white px-3 py-1 rounded-full border border-primary-200">
                        <TrendingUp className="w-4 h-4 text-primary-600 mr-1" />
                        <span className="text-sm font-bold text-primary-600">{team.compatibility}%</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="w-4 h-4 mr-1" />
                      {team.members} members • {team.domain}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Looking for:</p>
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        {team.lookingFor}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {team.requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Match Reason:</span> {getMatchReason(team)}
                      </p>
                    </div>

                    {hasRequested ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center px-6 py-3 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Request Sent
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequestJoin(team.id)}
                        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-600 transition shadow-sm"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Request to Join
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredTeams.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Teams Found</h2>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
