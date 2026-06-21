import { useState } from 'react'
import { User, Mail, Github, Code, Edit, Briefcase, Upload, AlertCircle } from 'lucide-react'
import { api } from '../api'

export default function UserProfile({ userProfile, setUserProfile }) {
  const [isEditing, setIsEditing] = useState(!userProfile || !userProfile.name)
  const [formData, setFormData] = useState(userProfile || { name: '', email: '', github: '', skills: [], domain: '', experience_years: 2 })
  const [skillInput, setSkillInput] = useState('')
  const [isParsing, setIsParsing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.updateProfile(formData)
      setUserProfile(res.user)
      setIsEditing(false)
      alert('Profile saved successfully!')
    } catch (err) {
      alert(err.message || 'Failed to save profile')
    }
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] })
      }
      setSkillInput('')
    }
  }

  const removeSkill = (index) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) })
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsParsing(true)
    try {
      const parsed = await api.uploadResume(file)
      setFormData(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...parsed.skills])],
        domain: parsed.domain || prev.domain,
        experience_years: parsed.experience_years || prev.experience_years
      }))
      alert(`Resume parsed successfully!\nAdded ${parsed.skills.length} skills and detected ${parsed.experience} of experience.`)
    } catch (err) {
      alert(err.message || 'Error parsing resume')
    } finally {
      setIsParsing(false)
    }
  }

  // Show professional profile view if profile exists and not editing
  if (!isEditing && userProfile && userProfile.name) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">My Profile</h1>
          <p className="text-lg text-gray-600">Your professional dashboard</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-primary-600 text-4xl font-bold">
                {userProfile.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{userProfile.name}</h2>
                <p className="text-white/90 text-lg mb-3">{userProfile.domain || 'Software Developer'}</p>
                <div className="flex items-center gap-4 text-sm">
                  {userProfile.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{userProfile.email}</span>
                    </div>
                  )}
                  {userProfile.github && (
                    <div className="flex items-center gap-1">
                      <Github className="w-4 h-4" />
                      <span>@{userProfile.github}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData(userProfile)
                setIsEditing(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-white/90 transition"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills Card */}
          <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-900">Technical Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills && userProfile.skills.length > 0 ? (
                userProfile.skills.map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills added yet</p>
              )}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-light-border p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Professional Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Preferred Domain</p>
                <p className="text-gray-900 text-lg font-semibold">{userProfile.domain || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Experience Level</p>
                <p className="text-gray-900 text-lg font-semibold">{userProfile.experience_years || 2} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Personality Type</p>
                <p className="text-gray-900 text-lg font-semibold capitalize">{userProfile.personality || 'Balanced'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Work Style</p>
                <p className="text-gray-900 text-lg font-semibold capitalize">{userProfile.workStyle || 'Collaborative'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show edit form
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{userProfile && userProfile.name ? 'Edit Profile' : 'Complete Your Profile'}</h1>
        <p className="text-gray-600">Build your professional AI profile to start matching</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="John Doe" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email Address *</label>
            <input type="email" name="email" required disabled value={formData.email} className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 outline-none cursor-not-allowed" placeholder="john@example.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">GitHub Username</label>
              <input type="text" name="github" value={formData.github || ''} onChange={(e) => setFormData({...formData, github: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="johndoe" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience</label>
              <input type="number" name="experience_years" min="0" max="40" value={formData.experience_years || 2} onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Personality Type</label>
              <select name="personality" value={formData.personality || 'balanced'} onChange={(e) => setFormData({...formData, personality: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="introvert">Introvert - Prefers independent work</option>
                <option value="balanced">Balanced - Flexible approach</option>
                <option value="extrovert">Extrovert - Thrives in collaboration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Work Style</label>
              <select name="workStyle" value={formData.workStyle || 'collaborative'} onChange={(e) => setFormData({...formData, workStyle: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="leader">Leader - Takes initiative</option>
                <option value="collaborative">Collaborative - Team player</option>
                <option value="independent">Independent - Self-driven</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preferred Domain</label>
            <input type="text" name="domain" value={formData.domain || ''} onChange={(e) => setFormData({...formData, domain: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g., Frontend Developer, DevOps Engineer" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Technical Skills *</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Add a skill (e.g., React, Python)" />
              <button type="button" onClick={addSkill} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills && formData.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(idx)} className="text-primary-900 hover:text-red-600 font-bold">×</button>
                </span>
              ))}
            </div>
            {(!formData.skills || formData.skills.length === 0) && (
              <p className="text-sm text-gray-500 mt-2">Add at least one skill to continue</p>
            )}
          </div>
          
          <div className="flex gap-4">
            <button type="submit" disabled={!formData.name || !formData.skills || formData.skills.length === 0} className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {userProfile && userProfile.name ? 'Update Profile' : 'Save Profile'}
            </button>
            {userProfile && userProfile.name && (
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-light-border text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Right Sidebar: AI Resume Parsing */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-600" />
              AI Resume Parser
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Have a resume? Drag or upload it in PDF format. Our NLP parser will automatically extract your skills, years of experience, and suggested job role.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 hover:border-primary-500 rounded-xl p-8 text-center cursor-pointer relative bg-gray-50 transition">
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                disabled={isParsing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {isParsing ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-2"></div>
                  <p className="text-sm text-primary-700 font-semibold">Parsing PDF content...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-700 font-medium">Select Resume PDF</p>
                  <p className="text-xs text-gray-500">Supports PDF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <span className="font-semibold">Note:</span> Completing your profile with accurate skills increases your team compatibility score and unlocks advanced role suggestions.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
