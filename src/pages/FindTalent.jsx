import { useState, useEffect } from 'react'
import { Search, Users, Mail, TrendingUp, Star, CheckCircle2, RefreshCw } from 'lucide-react'
import { api } from '../api'

export default function FindTalent({ teams }) {
  const [selectedTeamId, setSelectedTeamId] = useState(teams?.[0]?.id || '')
  const [candidates, setCandidates] = useState([])
  const [invitedCandidates, setInvitedCandidates] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCandidates = async () => {
    if (!selectedTeamId) return
    setLoading(true)
    try {
      const res = await api.getTeamTalent(selectedTeamId)
      setCandidates(res)
    } catch (err) {
      console.error("Error loading candidates:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [selectedTeamId])

  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id)
    }
  }, [teams])

  const selectedTeam = teams?.find(t => t.id === parseInt(selectedTeamId))

  const handleInvite = async (candidate) => {
    try {
      // Invite user to the team in the backend database
      await api.inviteTeamMember(selectedTeamId, {
        email: `${candidate.github || 'candidate'}@teamsync.ai`,
        role: candidate.role,
        skills: candidate.skills,
        personality: candidate.personality,
        workStyle: candidate.workStyle
      })
      setInvitedCandidates(prev => new Set([...prev, candidate.id]))
      alert(`Invitation sent to ${candidate.name}! They have been added to your team.`)
      // Refresh teams list
      if (window.location.reload) {
        // Trigger page refresh or a global update if necessary, but simply alerting is enough for demo
      }
    } catch (err) {
      alert(err.message || 'Failed to send invitation')
    }
  }

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!teams || teams.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Team Found</h2>
          <p className="text-gray-600 mb-2">Create a team to unlock talent search</p>
          <p className="text-sm text-gray-500">Go to Team page to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Find Talent</h1>
          <p className="text-lg text-gray-600">Discover candidates who match your team's gaps and needs</p>
        </div>
        <button 
          onClick={fetchCandidates}
          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-semibold transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Matches
        </button>
      </div>

      {/* Team Selector and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-light-border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Team to Match:
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="w-full px-4 py-2.5 border border-light-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white text-sm"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.members.length} members)
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-light-border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search candidates:
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, or specific skills..."
              className="w-full pl-10 pr-4 py-2 border border-light-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <RefreshCw className="animate-spin w-10 h-10 text-primary-600 mb-4" />
          <p className="text-gray-600 font-medium">Running compatibility matchmaking algorithms...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          {filteredCandidates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
                <Users className="w-8 h-8 text-primary-600 mb-2" />
                <p className="text-3xl font-bold text-gray-900">{filteredCandidates.length}</p>
                <p className="text-sm text-gray-600">Matched Candidates</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(filteredCandidates.reduce((sum, c) => sum + c.skillMatch, 0) / filteredCandidates.length)}%
                </p>
                <p className="text-sm text-gray-600">Avg Skill Match</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
                <Star className="w-8 h-8 text-yellow-600 mb-2" />
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(filteredCandidates.reduce((sum, c) => sum + c.compatibilityScore, 0) / filteredCandidates.length)}%
                </p>
                <p className="text-sm text-gray-600">Avg Compatibility</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
                <Mail className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-3xl font-bold text-gray-900">{invitedCandidates.size}</p>
                <p className="text-sm text-gray-600">Invites Accepted</p>
              </div>
            </div>
          )}

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCandidates.map((candidate) => {
              const hasInvited = invitedCandidates.has(candidate.id)
              
              return (
                <div
                  key={candidate.id}
                  className="bg-white rounded-xl shadow-sm border border-light-border overflow-hidden hover:shadow-lg transition"
                >
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 border-b border-light-border">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {candidate.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{candidate.name}</h3>
                        <p className="text-sm text-gray-700 mb-2">{candidate.role}</p>
                        <p className="text-xs text-gray-600">@{candidate.github} • {candidate.experience} experience</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Match Scores */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{candidate.skillMatch}%</p>
                        <p className="text-sm text-gray-600">Skill Match</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600">{candidate.compatibilityScore}%</p>
                        <p className="text-sm text-gray-600">Compatibility</p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Key Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">AI Recommendation Match:</p>
                      <p className="text-sm text-blue-800">
                        {candidate.reason} Personality profile is "{candidate.personality}" and work style is "{candidate.workStyle}".
                      </p>
                    </div>

                    {/* Action Button */}
                    {hasInvited ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center px-6 py-3 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Added to Team
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInvite(candidate)}
                        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-600 transition shadow-sm"
                      >
                        <Mail className="w-5 h-5 mr-2" />
                        Invite and Add to Team
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredCandidates.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Candidates Found</h2>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
