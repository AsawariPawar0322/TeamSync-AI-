import { useState, useEffect } from 'react'
import { Users, TrendingUp, Target, Brain, Plus, CheckCircle2, AlertTriangle, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Dashboard({ teams, userProfile }) {
  const hasProfile = userProfile && userProfile.skills && userProfile.skills.length > 0
  const hasTeam = teams && teams.length > 0
  const selectedTeam = teams?.[0]
  const teamSize = selectedTeam?.members?.length || 0
  
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedTeam && selectedTeam.members.length >= 2) {
      const fetchAnalysis = async () => {
        setLoading(true)
        try {
          const res = await api.getTeamAnalysis(selectedTeam.id)
          setAnalysis(res)
        } catch (err) {
          console.error("Error loading team analysis on dashboard:", err)
        } finally {
          setLoading(false)
        }
      }
      fetchAnalysis()
    } else {
      setAnalysis(null)
    }
  }, [selectedTeam])

  // Determine dynamic stats from backend analysis or fallbacks
  const teamCompatibility = analysis ? analysis.compatibility_score : (selectedTeam ? selectedTeam.compatibility : null)
  const projectSuccess = analysis ? analysis.success_probability : null
  const teamHealth = analysis ? intRangeAverage(analysis.compatibility_score, analysis.success_probability) : null

  function intRangeAverage(a, b) {
    return Math.round((a + b) / 2)
  }

  const getRecommendations = () => {
    if (!hasProfile) {
      return [
        'Complete your profile to unlock personalized recommendations',
        'Add your skills, interests, and GitHub profile',
        'Build your AI profile for better team matching'
      ]
    }
    if (!hasTeam) {
      return [
        'Create your first team to start getting AI insights',
        'Join an existing team to see compatibility analysis',
        'Team building is the first step to unlock predictions'
      ]
    }
    if (teamSize === 1) {
      return [
        'Add at least one more member to unlock compatibility analysis',
        'Invite team members to start getting AI insights',
        'Teams need multiple members for meaningful analysis'
      ]
    }
    
    // If we have recommendations from backend analysis, use them!
    if (analysis && analysis.recommendations && analysis.recommendations.length > 0) {
      return analysis.recommendations.map(r => r.reason)
    }

    // Default recommendations when team has members but no specific gaps
    return [
      'Team composition looks strong with balanced work styles',
      'No critical skill gaps detected. Project foundation is set.',
      'Check out the Predictions tab to see 6-month risk trend'
    ]
  }

  const recentRecommendations = getRecommendations()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Welcome back{userProfile?.name ? `, ${userProfile.name}` : ''}!
        </h1>
        <p className="text-lg text-gray-600">
          {teamSize >= 3 ? 'Your team insights and AI-powered recommendations' : 
           hasTeam ? 'Build your team to unlock AI analysis' :
           'Get started by creating your profile and building a team'}
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Team Compatibility */}
        <div className={`rounded-xl shadow-sm border p-8 ${teamCompatibility ? 'bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <Users className={`w-10 h-10 ${teamCompatibility ? 'text-primary-600' : 'text-gray-400'}`} />
            {teamCompatibility ? (
              <span className="text-sm font-medium text-primary-700 bg-primary-100 px-3 py-1 rounded-full">
                Active
              </span>
            ) : (
              <Lock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <p className={`text-5xl font-bold mb-2 ${teamCompatibility ? 'text-gray-900' : 'text-gray-400'}`}>
            {teamCompatibility ? `${teamCompatibility}%` : '--'}
          </p>
          <p className="text-gray-700 font-medium mb-2">Team Compatibility Score</p>
          <p className="text-sm text-gray-600">
            {teamCompatibility ? 'Strong team chemistry detected' :
             teamSize === 1 ? 'Add 1+ member to unlock' :
             !hasTeam ? 'Create a team to see your score' :
             'Insufficient team data'}
          </p>
        </div>

        {/* Project Success */}
        <div className={`rounded-xl shadow-sm border p-8 ${projectSuccess ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <Target className={`w-10 h-10 ${projectSuccess ? 'text-green-600' : 'text-gray-400'}`} />
            {projectSuccess ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <Lock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <p className={`text-5xl font-bold mb-2 ${projectSuccess ? 'text-gray-900' : 'text-gray-400'}`}>
            {projectSuccess ? `${projectSuccess}%` : '--'}
          </p>
          <p className="text-gray-700 font-medium mb-2">Project Success Prediction</p>
          <p className="text-sm text-gray-600">
            {projectSuccess ? 'High probability of success' :
             teamSize < 3 ? `Add ${3 - teamSize} more member${3 - teamSize > 1 ? 's' : ''} to unlock` :
             'Build your team to get predictions'}
          </p>
        </div>

        {/* Team Health */}
        <div className={`rounded-xl shadow-sm border p-8 ${teamHealth ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <Brain className={`w-10 h-10 ${teamHealth ? 'text-purple-600' : 'text-gray-400'}`} />
            {teamHealth ? (
              <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                AI Score
              </span>
            ) : (
              <Lock className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <p className={`text-5xl font-bold mb-2 ${teamHealth ? 'text-gray-900' : 'text-gray-400'}`}>
            {teamHealth ? `${teamHealth}%` : '--'}
          </p>
          <p className="text-gray-700 font-medium mb-2">Team Health Score</p>
          <p className="text-sm text-gray-600">
            {teamHealth ? 'Overall team performance is strong' :
             teamSize < 3 ? 'Requires 3+ members' :
             'Start building to see insights'}
          </p>
        </div>
      </div>

      {/* Quick Actions or Team Status */}
      {!hasProfile ? (
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Setup</h2>
          <p className="text-gray-600 mb-6">Start by building your AI profile to unlock team features</p>
          <Link
            to="/profile"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-600 transition shadow-sm"
          >
            <Users className="w-5 h-5 mr-2" />
            Complete Profile
          </Link>
        </div>
      ) : !hasTeam ? (
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your First Team</h2>
          <p className="text-gray-600 mb-6">
            Analysis will become available after joining or creating a team
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/team"
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg transition group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 p-3 rounded-lg text-white group-hover:scale-110 transition">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Create a Team</h3>
                  <p className="text-sm text-gray-700">
                    Start a new team and invite members to join
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/discover"
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl hover:shadow-lg transition group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-green-500 p-3 rounded-lg text-white group-hover:scale-110 transition">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Join a Team</h3>
                  <p className="text-sm text-gray-700">
                    Browse and request to join existing teams
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      ) : teamSize === 1 ? (
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Status: 1 Member Present</h2>
              <p className="text-gray-600">
                More members are required before compatibility analysis can be generated.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3">Current Team</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{selectedTeam.members[0].name} (You)</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-3">Suggested Roles to Add</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Frontend Developer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Backend Developer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">UI/UX Designer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Unlock Conditions:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• <strong>Compatibility Analysis:</strong> Requires at least 2 members</li>
              <li>• <strong>Conflict Analysis:</strong> Requires at least 3 members</li>
              <li>• <strong>Project Prediction:</strong> Requires 3+ members and project definition</li>
            </ul>
          </div>

          <Link
            to="/team"
            className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-600 transition shadow-sm"
          >
            <Users className="w-5 h-5 mr-2" />
            Add Team Members
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Team Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedTeam.members.map((member, idx) => (
              <div key={idx} className="border border-light-border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-xs text-gray-600">{member.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {member.skills && member.skills.slice(0, 2).map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                  {member.skills && member.skills.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{member.skills.length - 2}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {teamSize >= 3 ? 'AI Recommendations' : 'Getting Started'}
          </h2>
        </div>
        <div className="space-y-4">
          {recentRecommendations.map((recommendation, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-light-border">
              {teamSize >= 3 ? (
                idx === 0 ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                )
              ) : (
                <Target className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      {(!hasProfile || !hasTeam || teamSize < 3) && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-light-border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasProfile ? 'bg-green-500' : 'bg-gray-300'}`}>
                {hasProfile ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span className="text-white font-bold">1</span>}
              </div>
              <span className={`font-medium ${hasProfile ? 'text-green-600' : 'text-gray-600'}`}>
                Complete your profile
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasTeam ? 'bg-green-500' : 'bg-gray-300'}`}>
                {hasTeam ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span className="text-white font-bold">2</span>}
              </div>
              <span className={`font-medium ${hasTeam ? 'text-green-600' : 'text-gray-600'}`}>
                Create or join a team
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${teamSize >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}>
                {teamSize >= 2 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span className="text-white font-bold">3</span>}
              </div>
              <span className={`font-medium ${teamSize >= 2 ? 'text-green-600' : 'text-gray-600'}`}>
                Add team members (at least 2 total)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${teamSize >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}>
                {teamSize >= 3 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span className="text-white font-bold">4</span>}
              </div>
              <span className={`font-medium ${teamSize >= 3 ? 'text-green-600' : 'text-gray-600'}`}>
                Unlock full AI insights (3+ members)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
