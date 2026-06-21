import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, TrendingUp, Users, Shield, Brain, RefreshCw } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { api } from '../api'

export default function TeamAnalysis({ teams }) {
  const selectedTeam = teams?.[0]
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalysis = async () => {
    if (!selectedTeam || selectedTeam.members.length < 2) return
    setLoading(true)
    try {
      const res = await api.getTeamAnalysis(selectedTeam.id)
      setAnalysis(res)
    } catch (err) {
      console.error("Error loading team analysis:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [selectedTeam])

  // No team created yet
  if (!teams || teams.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Team Created Yet</h2>
          <p className="text-gray-600 mb-2">Create a team to unlock AI-powered analysis</p>
          <p className="text-sm text-gray-500">Go to Team page to get started</p>
        </div>
      </div>
    )
  }

  // Team exists but only 1 member
  if (selectedTeam.members.length < 2) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Team Analysis</h1>
          <p className="text-lg text-gray-600">Deep intelligence and AI-powered insights</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">More Members Required</h2>
          <p className="text-gray-600 mb-6">Team analysis requires at least 2 members to generate compatibility insights</p>
          
          <div className="max-w-md mx-auto text-left bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Current Team Status:</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Team Members:</span>
                <span className="font-semibold text-gray-900">{selectedTeam.members.length} / 2+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Member:</span>
                <span className="font-semibold text-gray-900">{selectedTeam.members[0]?.name}</span>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto text-left bg-primary-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Suggested Next Steps:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">→</span>
                <span>Invite team members from the Team Management page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 mt-0.5">→</span>
                <span>Once you have 2+ members, AI analysis will activate</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin w-10 h-10 text-primary-600 mb-4" />
        <p className="text-gray-600 font-medium">Running deep AI analysis on team profiles...</p>
      </div>
    )
  }

  // Calculate stats from dynamic analysis data
  const allSkills = selectedTeam.members.flatMap(m => m.skills || [])
  const uniqueSkills = new Set(allSkills)
  const avgSkillsPerMember = Math.round(allSkills.length / selectedTeam.members.length)

  // Competency Radar values mapped from skills count
  const radarData = [
    { skill: 'Technical', value: Math.min(95, uniqueSkills.size * 12) },
    { skill: 'Leadership', value: (analysis.leadership.leaders * 40) || 50 },
    { skill: 'Communication', value: analysis.compatibility_score },
    { skill: 'Collaboration', value: (analysis.leadership.collaborative * 30) || 60 },
    { skill: 'Independence', value: (analysis.leadership.independent * 30) || 50 }
  ]

  const skillCoverageList = [
    { area: 'Frontend', covered: analysis.skill_coverage.frontend },
    { area: 'Backend', covered: analysis.skill_coverage.backend },
    { area: 'AI/ML', covered: analysis.skill_coverage.ai_ml },
    { area: 'DevOps', covered: analysis.skill_coverage.devops },
    { area: 'UI/UX', covered: analysis.skill_coverage.ui_ux },
    { area: 'Mobile', covered: analysis.skill_coverage.mobile }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Team Analysis</h1>
          <p className="text-lg text-gray-600">Deep intelligence and AI-powered insights</p>
        </div>
        <button 
          onClick={fetchAnalysis}
          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-semibold transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Re-Analyze
        </button>
      </div>

      {/* Main Compatibility Score */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl shadow-sm border border-primary-200 p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Compatibility Score</h2>
            <p className="text-gray-600">Based on skills, personality diversity, and work style alignment</p>
          </div>
          <div className="text-6xl font-bold text-primary-600">{analysis.compatibility_score}%</div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              Stable
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{analysis.retention_forecast}%</p>
          <p className="text-gray-700 font-medium">Team Stability Forecast</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${analysis.conflict_risk < 30 ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'}`}>
              {analysis.conflict_risk < 30 ? 'Low Risk' : 'Medium Risk'}
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{analysis.conflict_risk}%</p>
          <p className="text-gray-700 font-medium">Conflict Risk Index</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              {selectedTeam.members.length} Members
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{avgSkillsPerMember}</p>
          <p className="text-gray-700 font-medium">Avg Skills per Member</p>
        </div>
      </div>

      {/* Radar Chart and Skill Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Team Competency Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Radar name="Team Strength" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Skill Coverage Analysis</h3>
          <div className="space-y-4">
            {skillCoverageList.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{item.area}</span>
                {item.covered ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Covered</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <AlertTriangle className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Missing</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-light-border p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Leadership Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUp className="w-10 h-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {analysis.leadership.leaders}
            </p>
            <p className="text-sm text-gray-600">Natural Leaders</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-10 h-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {analysis.leadership.collaborative}
            </p>
            <p className="text-sm text-gray-600">Collaborators</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Brain className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {analysis.leadership.independent}
            </p>
            <p className="text-sm text-gray-600">Independent Workers</p>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <div className="flex items-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">Team Strengths</h3>
          </div>
          <ul className="space-y-3">
            {analysis.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-gray-700">{str}</span>
              </li>
            ))}
            {analysis.strengths.length === 0 && (
              <p className="text-sm text-gray-500">No major strengths found yet. Add more skills.</p>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">Areas for Improvement</h3>
          </div>
          <ul className="space-y-3">
            {analysis.risks.map((risk, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-yellow-600 mr-2">⚠</span>
                <span className="text-gray-700">{risk}</span>
              </li>
            ))}
            {analysis.risks.length === 0 && (
              <p className="text-sm text-gray-500">No major risks detected! Excellent structure.</p>
            )}
          </ul>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900">AI Deep Summary</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          This team shows <strong>strong potential for success</strong> with a compatibility score of {analysis.compatibility_score}%. 
          The skill distribution matches key project scopes, and leadership dynamics are balanced with {analysis.leadership.leaders} leader(s) and {analysis.leadership.collaborative} team players. 
          Conflict risk remains low to moderate at {analysis.conflict_risk}%, and overall retention index stands at {analysis.retention_forecast}%, indicating excellent team culture. 
          {analysis.recommendations.length > 0 ? " To reach peak productivity, review the suggested recommendations and talent search to fill missing areas." : " Your team is optimally balanced."}
        </p>
      </div>
    </div>
  )
}
