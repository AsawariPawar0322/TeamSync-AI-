import { useState } from 'react'
import { Users, Plus, UserPlus, UserMinus, Mail, TrendingUp, HelpCircle } from 'lucide-react'
import { api } from '../api'

export default function TeamManagement({ teams, setTeams, userProfile }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(null)
  
  // Member invite inputs
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Backend Developer')
  const [invitePersonality, setInvitePersonality] = useState('balanced')
  const [inviteWorkStyle, setInviteWorkStyle] = useState('collaborative')

  const createTeam = async () => {
    if (!newTeamName.trim()) return

    try {
      const created = await api.createTeam(newTeamName)
      // Re-fetch all teams to synchronize database state
      const allTeams = await api.getTeams()
      setTeams(allTeams)
      setNewTeamName('')
      setShowCreateModal(false)
      alert(`Team "${created.name}" created successfully!`)
    } catch (err) {
      alert(err.message || 'Failed to create team')
    }
  }

  const removeMember = async (teamId, userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return
    
    try {
      await api.removeTeamMember(teamId, userId)
      const allTeams = await api.getTeams()
      setTeams(allTeams)
      alert("Member removed from team.")
    } catch (err) {
      alert(err.message || 'Failed to remove member')
    }
  }

  const inviteMember = async (teamId) => {
    if (!inviteEmail.trim()) return

    // Pre-populate skills based on role to make compatibility scores realistic
    const skillsMap = {
      'Frontend Developer': ['React', 'JavaScript', 'Tailwind CSS', 'CSS', 'HTML'],
      'Backend Developer': ['Python', 'FastAPI', 'PostgreSQL', 'SQL', 'REST API'],
      'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
      'UI/UX Designer': ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      'AI/ML Engineer': ['Python', 'Machine Learning', 'PyTorch', 'NumPy', 'Pandas'],
      'Mobile Developer': ['React Native', 'Flutter', 'Firebase', 'iOS', 'Android']
    }
    const skills = skillsMap[inviteRole] || ['JavaScript', 'Python']

    try {
      await api.inviteTeamMember(teamId, {
        email: inviteEmail,
        role: inviteRole,
        personality: invitePersonality,
        workStyle: inviteWorkStyle,
        skills: skills
      })
      const allTeams = await api.getTeams()
      setTeams(allTeams)
      setInviteEmail('')
      alert(`Invitation sent to ${inviteEmail}. Added successfully for demo!`)
    } catch (err) {
      alert(err.message || 'Failed to invite member')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Team Management</h1>
          <p className="text-lg text-gray-600">Create and manage your teams</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-600 transition shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Teams Yet</h2>
          <p className="text-gray-600 mb-6">Create your first team to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-600 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Team
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-xl shadow-sm border border-light-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 border-b border-light-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{team.name}</h2>
                    <p className="text-gray-600">Created by {team.creator}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-primary-600 mb-1">
                      <TrendingUp className="w-5 h-5 mr-1" />
                      <span className="text-2xl font-bold">{team.compatibility}%</span>
                    </div>
                    <p className="text-sm text-gray-600">Compatibility</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Team Members ({team.members.length})
                  </h3>
                  <button
                    onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    {selectedTeam === team.id ? 'Hide Invite Form' : 'Invite Member'}
                  </button>
                </div>

                {selectedTeam === team.id && (
                  <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-primary-600" />
                      Invite Member Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email address</label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="e.g. user@domain.com"
                          className="w-full px-3 py-2 border border-light-border bg-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned Role</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="w-full px-3 py-2 border border-light-border bg-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                          <option value="Frontend Developer">Frontend Developer</option>
                          <option value="Backend Developer">Backend Developer</option>
                          <option value="DevOps Engineer">DevOps Engineer</option>
                          <option value="UI/UX Designer">UI/UX Designer</option>
                          <option value="AI/ML Engineer">AI/ML Engineer</option>
                          <option value="Mobile Developer">Mobile Developer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Personality</label>
                        <select
                          value={invitePersonality}
                          onChange={(e) => setInvitePersonality(e.target.value)}
                          className="w-full px-3 py-2 border border-light-border bg-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                          <option value="introvert">Introvert (Independent)</option>
                          <option value="balanced">Balanced (Flexible)</option>
                          <option value="extrovert">Extrovert (Collaborative)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Work Style</label>
                        <select
                          value={inviteWorkStyle}
                          onChange={(e) => setInviteWorkStyle(e.target.value)}
                          className="w-full px-3 py-2 border border-light-border bg-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                          <option value="leader">Leader</option>
                          <option value="collaborative">Collaborative</option>
                          <option value="independent">Independent</option>
                        </select>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => inviteMember(team.id)}
                      disabled={!inviteEmail.trim()}
                      className="w-full flex items-center justify-center py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invite & Add Member
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="border border-light-border rounded-lg p-4 hover:shadow-md transition bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <div className="flex gap-1 mt-1 text-[10px] text-gray-400 capitalize">
                            <span>{member.personality}</span> • <span>{member.workStyle}</span>
                          </div>
                        </div>
                        {!member.isCreator && (
                          <button
                            onClick={() => removeMember(team.id, member.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3 border-t border-gray-50 pt-2">
                        {member.skills && member.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills && member.skills.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{member.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Team</h3>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter team name"
              className="w-full px-4 py-3 border border-light-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={createTeam}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-600 transition"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-light-border text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
