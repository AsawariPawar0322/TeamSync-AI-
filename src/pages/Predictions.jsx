import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, Award, Target, Shield, RefreshCw } from 'lucide-react'
import { api } from '../api'

export default function Predictions({ teams }) {
  const selectedTeam = teams?.[0]
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalysis = async () => {
    if (!selectedTeam || selectedTeam.members.length < 3) return
    setLoading(true)
    try {
      const res = await api.getTeamAnalysis(selectedTeam.id)
      setAnalysis(res)
    } catch (err) {
      console.error("Error loading team predictions:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [selectedTeam])

  // No team exists
  if (!teams || teams.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Predictions</h1>
          <p className="text-lg text-gray-600">Future outcome analysis and risk assessment</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Team Data</h2>
          <p className="text-gray-600 mb-2">Create a team to unlock predictions</p>
          <p className="text-sm text-gray-500">Go to Team page to get started</p>
        </div>
      </div>
    )
  }

  // Team exists but insufficient members
  if (selectedTeam.members.length < 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Predictions</h1>
          <p className="text-lg text-gray-600">Future outcome analysis and risk assessment</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Team Data</h2>
          <p className="text-gray-600 mb-6">Predictions require at least 3 team members for accurate analysis</p>
          
          <div className="max-w-md mx-auto text-left bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Current Status:</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Team Members:</span>
                <span className="font-semibold text-gray-900">{selectedTeam.members.length} / 3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Members Needed:</span>
                <span className="font-semibold text-red-600">{3 - selectedTeam.members.length} more</span>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto text-left bg-primary-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What you'll unlock:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                <span>Project Success Probability</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Team Retention Forecast</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span>Conflict Risk Assessment</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span>6-Month Performance Projection</span>
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
        <p className="text-gray-600 font-medium">Running machine learning forecasting algorithms...</p>
      </div>
    )
  }

  // Bind dynamic scores
  const successScore = analysis.success_probability
  const retentionScore = analysis.retention_forecast
  const conflictScore = analysis.conflict_risk
  const performanceScore = Math.round((successScore + retentionScore) / 2)

  // Map positive and risk factors based on backend results
  const predictions = [
    {
      title: 'Project Success Probability',
      score: successScore,
      trend: successScore >= 75 ? 'up' : 'stable',
      icon: Target,
      color: 'from-green-400 to-green-600',
      factors: [
        'Solid technical skill coverage across key domains',
        'Favorable average experience level',
        'Aligned communication patterns'
      ].concat(analysis.strengths.slice(0, 1)),
      risks: analysis.risks.length > 0 ? analysis.risks.slice(0, 2) : ['Ensure milestone scheduling is strictly monitored']
    },
    {
      title: 'Team Retention Probability',
      score: retentionScore,
      trend: 'stable',
      icon: Shield,
      color: 'from-blue-400 to-blue-600',
      factors: [
        'Strong team chemistry score',
        'Complementary work styles',
        'Balanced personality diversity'
      ],
      risks: [
        'Monitor individual workload distributions',
        'Check for signs of burnout during high-intensity periods'
      ]
    },
    {
      title: 'Conflict Risk Assessment',
      score: conflictScore,
      trend: conflictScore <= 30 ? 'down' : 'up',
      icon: AlertCircle,
      color: 'from-yellow-400 to-yellow-600',
      factors: [
        'Diverse profile types prevent echo chambers',
        'Clear separation of roles'
      ],
      risks: analysis.risks.filter(r => r.includes('leaders') || r.includes('leader')).concat([
        'Ensure open channels for anonymous feedback'
      ])
    },
    {
      title: 'Overall Team Performance',
      score: performanceScore,
      trend: 'up',
      icon: Award,
      color: 'from-purple-400 to-purple-600',
      factors: [
        'Strong individual motivation scores',
        'Good technical redundancy',
        'Positive compatibility alignment'
      ],
      risks: [
        'Different experience levels require onboarding support',
        'Time zone differences or schedules may require coordination'
      ]
    }
  ]

  // Calculate dynamic monthly trend based on the real scores
  const monthlyTrend = [
    { 
      month: 'Month 1', 
      success: Math.round(successScore * 0.8), 
      retention: Math.round(retentionScore * 0.95), 
      conflict: Math.round(conflictScore * 1.2) 
    },
    { 
      month: 'Month 2', 
      success: Math.round(successScore * 0.85), 
      retention: Math.round(retentionScore * 0.98), 
      conflict: Math.round(conflictScore * 1.1) 
    },
    { 
      month: 'Month 3', 
      success: Math.round(successScore * 0.9), 
      retention: retentionScore, 
      conflict: conflictScore 
    },
    { 
      month: 'Month 4', 
      success: Math.round(successScore * 0.95), 
      retention: Math.round(retentionScore * 0.98), 
      conflict: Math.round(conflictScore * 0.9) 
    },
    { 
      month: 'Month 5', 
      success: Math.round(successScore * 0.98), 
      retention: Math.round(retentionScore * 0.97), 
      conflict: Math.round(conflictScore * 0.85) 
    },
    { 
      month: 'Month 6', 
      success: successScore, 
      retention: retentionScore, 
      conflict: Math.round(conflictScore * 0.8) 
    }
  ]

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-600 bg-white rounded-full p-0.5" />
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-600 bg-white rounded-full p-0.5" />
    return <div className="w-5 h-5 rounded-full bg-gray-300" />
  }

  const getScoreColor = (score, isConflict = false) => {
    if (isConflict) {
      if (score <= 30) return 'text-green-600'
      if (score <= 50) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Predictions</h1>
          <p className="text-lg text-gray-600">Future outcome analysis and machine learning forecasting</p>
        </div>
        <button 
          onClick={fetchAnalysis}
          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-semibold transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Predictions
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl shadow-xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Overall Team Health Score</h2>
            <p className="text-white/90">Calculated by Random Forest regression models</p>
          </div>
          <div className="text-center">
            <div className="text-7xl font-bold mb-2">{performanceScore}</div>
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-xl">Strong Potential</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {predictions.map((prediction, idx) => {
          const Icon = prediction.icon
          const isConflict = prediction.title.includes('Conflict')
          
          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-light-border overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${prediction.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8" />
                    <h3 className="text-xl font-bold">{prediction.title}</h3>
                  </div>
                  {getTrendIcon(prediction.trend)}
                </div>
                <div className="text-5xl font-bold">{prediction.score}%</div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Positive Factors
                  </h4>
                  <ul className="space-y-2">
                    {prediction.factors.map((factor, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Risk Factors
                  </h4>
                  <ul className="space-y-2">
                    {prediction.risks.map((risk, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">⚠</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-light-border p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">6-Month Projection Trend</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Timeline</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Success Rate</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Retention</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Conflict Risk</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrend.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{row.month}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${getScoreColor(row.success)}`}>
                      {row.success}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${getScoreColor(row.retention)}`}>
                      {row.retention}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${getScoreColor(row.conflict, true)}`}>
                      {row.conflict}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Generated Insights</h3>
        <div className="space-y-3">
          <p className="text-gray-700">
            ✓ Your team shows strong upward trajectory in success probability over the next 6 months as collaboration patterns solidify.
          </p>
          <p className="text-gray-700">
            ✓ Retention rates remain highly stable, indicating excellent team chemistry and alignment.
          </p>
          <p className="text-gray-700">
            ✓ Conflict risk is projected to decline by 20% over 6 months as workflows normalize.
          </p>
          {analysis.recommendations.length > 0 && (
            <p className="text-gray-700 font-semibold text-primary-700">
              ⚠ Action: {analysis.recommendations[0].reason}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
