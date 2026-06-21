import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Github, Upload } from 'lucide-react'

export default function MemberInput({ teamMembers, setTeamMembers }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    skills: '',
    github: '',
    personality: 'balanced',
    workStyle: 'collaborative'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newMember = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()),
      id: Date.now()
    }
    
    setTeamMembers([...teamMembers, newMember])
    navigate('/')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-sm border border-light-border p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Team Member</h1>
          <p className="text-gray-600">Enter member details for AI analysis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-light-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Role
            </label>
            <input
              type="text"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-light-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              required
              value={formData.skills}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-light-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="React, JavaScript, Tailwind CSS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Github className="inline w-4 h-4 mr-1" />
              GitHub Username
            </label>
            <input
              type="text"
              name="github"
              value={formData.github}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-light-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personality Type
            </label>
            <select
              name="personality"
              value={formData.personality}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-light-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="introvert">Introvert - Prefers independent work</option>
              <option value="balanced">Balanced - Flexible approach</option>
              <option value="extrovert">Extrovert - Thrives in collaboration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Style
            </label>
            <select
              name="workStyle"
              value={formData.workStyle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-light-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="leader">Leader - Takes initiative</option>
              <option value="collaborative">Collaborative - Team player</option>
              <option value="independent">Independent - Self-driven</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-light-border rounded-lg p-6 text-center hover:border-primary-400 transition cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Upload Resume (Optional)</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-600 transition shadow-sm"
            >
              <UserPlus className="inline w-5 h-5 mr-2" />
              Add Member
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-light-border text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
