import { useState, useEffect } from 'react'
import { Target, Users, Brain, CheckCircle2, RefreshCw } from 'lucide-react'
import { api } from '../api'

export default function AIRoleAssignment({ teams }) {
  const selectedTeam = teams?.[0]
  const [roleAssignments, setRoleAssignments] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchRoleAssignments = async () => {
    if (!selectedTeam) return
    setLoading(true)
    try {
      const res = await api.getAIRoleAssignment(selectedTeam.id)
      setRoleAssignments(res)
    } catch (err) {
      console.error("Error loading role assignments:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoleAssignments()
  }, [selectedTeam])

  if (!selectedTeam) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Role Assignment</h1>
          <p className="text-lg text-gray-600">Intelligent role recommendations based on skills and experience</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Team Data</h2>
          <p className="text-gray-600 mb-2">Create a team to see role assignments</p>
          <p className="text-sm text-gray-500">Go to Team page to get started</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin w-10 h-10 text-primary-600 mb-4" />
        <p className="text-gray-600 font-medium">Running role assignment optimization matching algorithm...</p>
      </div>
    )
  }

  const colors = [
    'from-purple-400 to-purple-600',
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600',
    'from-indigo-400 to-indigo-600'
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Role Assignment</h1>
          <p className="text-lg text-gray-600">Intelligent role recommendations based on skills and experience</p>
        </div>
        <button 
          onClick={fetchRoleAssignments}
          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-semibold transition"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Re-Assign Roles
        </button>
      </div>

      {/* AI Info Card */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl shadow-sm border border-primary-200 p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-lg flex-shrink-0">
            <Brain className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">How AI Assigns Roles</h2>
            <p className="text-gray-700">
              Our AI analyzes each team member's technical skills, soft skills, leadership potential, 
              communication abilities, and past experience to determine the optimal role assignment. 
              Each recommendation includes a detailed explanation and confidence score.
            </p>
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-light-border p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedTeam.name}</h3>
            <p className="text-gray-600">{selectedTeam.members.length} team members</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">{selectedTeam.compatibility}%</p>
            <p className="text-sm text-gray-600">Team Compatibility</p>
          </div>
        </div>
      </div>

      {/* Role Assignments */}
      <div className="space-y-6">
        {roleAssignments.map((assignment, idx) => {
          const color = colors[idx % colors.length]
          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-light-border overflow-hidden hover:shadow-lg transition"
            >
              <div className={`bg-gradient-to-r ${color} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8" />
                    <div>
                      <h3 className="text-2xl font-bold">{assignment.role}</h3>
                      <p className="text-white/90">Assigned to: {assignment.assignedTo}</p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium">Match Score</p>
                    <p className="text-3xl font-bold">{assignment.score}%</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI Recommendation Explanation:</h4>
                    <p className="text-gray-700">{assignment.reason}</p>
                  </div>
                </div>

                {/* Competency Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Technical Skills Match</span>
                      <span className="font-medium text-gray-900">{assignment.skills_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${color} h-2 rounded-full`}
                        style={{ width: `${assignment.skills_score}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Experience Alignment</span>
                      <span className="font-medium text-gray-900">{assignment.experience_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${color} h-2 rounded-full`}
                        style={{ width: `${assignment.experience_score}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Team Alignment Fit</span>
                      <span className="font-medium text-gray-900">{assignment.fit_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${color} h-2 rounded-full`}
                        style={{ width: `${assignment.fit_score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {roleAssignments.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No role assignments generated. Add members to see assignments.
          </div>
        )}
      </div>
    </div>
  )
}
