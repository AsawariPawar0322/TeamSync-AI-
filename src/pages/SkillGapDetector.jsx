import { useState, useEffect } from 'react'
import { AlertTriangle, Users, TrendingUp, UserPlus, RefreshCw, CheckCircle2 } from 'lucide-react'
import { api } from '../api'

export default function SkillGapDetector({ teams }) {
  const selectedTeam = teams?.[0]
  const [analysis, setAnalysis] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [invitedCandidates, setInvitedCandidates] = useState(new Set())
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    if (!selectedTeam) return
    setLoading(true)
    try {
      const analysisData = await api.getTeamAnalysis(selectedTeam.id)
      setAnalysis(analysisData)
      const talentData = await api.getTeamTalent(selectedTeam.id)
      setCandidates(talentData)
    } catch (err) {
      console.error("Error loading skill gap data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedTeam])

  if (!selectedTeam) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Skill Gap Detector</h1>
          <p className="text-lg text-gray-600">Identify missing expertise and find recommended candidates</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Team Data</h2>
          <p className="text-gray-600 mb-2">Create a team to check for skill gaps</p>
          <p className="text-sm text-gray-500">Go to Team page to get started</p>
        </div>
      </div>
    )
  }

  if (loading || !analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin w-10 h-10 text-primary-600 mb-4" />
        <p className="text-gray-600 font-medium">Analyzing team skills coverage and matching talent repository...</p>
      </div>
    )
  }

  // Derive missing skills from backend analysis flags
  const missingSkills = []
  if (!analysis.skill_coverage.devops) {
    missingSkills.push({
      skill: 'DevOps Engineer',
      priority: 'High',
      impact: 'Pipeline automation, CI/CD, cloud deployments (AWS/Azure/GCP)',
      color: 'red'
    })
  }
  if (!analysis.skill_coverage.ui_ux) {
    missingSkills.push({
      skill: 'UI/UX Designer',
      priority: 'High',
      impact: 'User interface design, Figma prototyping, usability testing',
      color: 'red'
    })
  }
  if (!analysis.skill_coverage.backend) {
    missingSkills.push({
      skill: 'Backend Developer',
      priority: 'Medium',
      impact: 'Server-side API logic, database optimization, backend architecture',
      color: 'yellow'
    })
  }
  if (!analysis.skill_coverage.frontend) {
    missingSkills.push({
      skill: 'Frontend Developer',
      priority: 'Medium',
      impact: 'User interface creation, React layout rendering, state flows',
      color: 'yellow'
    })
  }
  if (!analysis.skill_coverage.mobile) {
    missingSkills.push({
      skill: 'Mobile Developer',
      priority: 'Low',
      impact: 'Cross-platform app development (React Native / Flutter)',
      color: 'blue'
    })
  }

  // Group candidates by the missing roles
  const candidatesByRole = {}
  missingSkills.forEach(ms => {
    candidatesByRole[ms.skill] = candidates.filter(c => c.role === ms.skill).slice(0, 2)
  })

  const getPriorityColor = (color) => {
    const colors = {
      red: 'bg-red-50 text-red-700 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200'
    }
    return colors[color] || colors.blue
  }

  const getPriorityBadge = (color) => {
    const colors = {
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800'
    }
    return colors[color] || colors.blue
  }

  const handleInvite = async (candidate) => {
    try {
      await api.inviteTeamMember(selectedTeam.id, {
        email: `${candidate.github || 'candidate'}@teamsync.ai`,
        role: candidate.role,
        skills: candidate.skills,
        personality: candidate.personality,
        workStyle: candidate.workStyle
      })
      setInvitedCandidates(prev => new Set([...prev, candidate.id]))
      alert(`Invitation sent to ${candidate.name}! They have been added to your team.`)
    } catch (err) {
      alert(err.message || 'Failed to send invitation')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Skill Gap Detector</h1>
          <p className="text-lg text-gray-600">Identify missing team expertise and find matching candidate solutions</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-semibold transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Re-Analyze Gaps
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{missingSkills.filter(s => s.priority === 'High').length}</p>
          <p className="text-sm text-gray-600">Critical Gaps</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <Users className="w-8 h-8 text-yellow-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{missingSkills.length}</p>
          <p className="text-sm text-gray-600">Total Skill Gaps Identified</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">
            {Object.values(candidatesByRole).flat().length}
          </p>
          <p className="text-sm text-gray-600">Matching Candidates Found</p>
        </div>
      </div>

      {/* Missing Skills */}
      <div className="bg-white rounded-xl shadow-sm border border-light-border p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Missing Skills Analysis</h2>
        <div className="space-y-4">
          {missingSkills.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${getPriorityColor(item.color)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-gray-900">{item.skill}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(item.color)}`}>
                  {item.priority} Priority
                </span>
              </div>
              <p className="text-sm text-gray-700 ml-8">{item.impact}</p>
            </div>
          ))}
          {missingSkills.length === 0 && (
            <div className="p-4 text-center text-green-600 font-semibold">
              ✓ All major tech domains covered! No skill gaps detected.
            </div>
          )}
        </div>
      </div>

      {/* Recommended Candidates */}
      <div className="space-y-8">
        {Object.entries(candidatesByRole).map(([skill, candidatesList]) => {
          if (!candidatesList || candidatesList.length === 0) return null;
          return (
            <div key={skill} className="bg-white rounded-xl shadow-sm border border-light-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 border-b border-light-border">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Recommended Candidates for: {skill}</h3>
                <p className="text-gray-600">AI-recommended matches to fill this specific gap</p>
              </div>

              <div className="p-6 space-y-6">
                {candidatesList.map((candidate, idx) => {
                  const hasInvited = invitedCandidates.has(candidate.id)
                  return (
                    <div
                      key={idx}
                      className="border border-light-border rounded-lg p-6 hover:shadow-md transition bg-white"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-1">{candidate.name}</h4>
                          <p className="text-sm text-gray-600">{candidate.experience} of experience</p>
                        </div>
                        <div className="text-right">
                          <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-lg">
                            <p className="text-sm font-medium">Match Score</p>
                            <p className="text-2xl font-bold">{candidate.skillMatch}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((s, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg mb-4">
                        <p className="text-sm font-semibold text-blue-900 mb-1">AI Recommendation:</p>
                        <p className="text-sm text-blue-800">{candidate.reason}</p>
                      </div>

                      {hasInvited ? (
                        <button
                          disabled
                          className="w-full flex items-center justify-center px-6 py-3 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Invitation Sent & Added
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleInvite(candidate)}
                          className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-600 transition"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Send Invitation & Add to Team
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
