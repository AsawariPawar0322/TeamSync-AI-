import { FileText, Download, Mail, Share2, CheckCircle2, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Reports({ teams }) {
  const selectedTeam = teams?.[0]
  const [generatedReports, setGeneratedReports] = useState(new Set())
  const [activePreview, setActivePreview] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generatingId, setGeneratingId] = useState(null)

  useEffect(() => {
    if (selectedTeam && selectedTeam.members.length >= 3) {
      const fetchAnalysis = async () => {
        setLoading(true)
        try {
          const res = await api.getTeamAnalysis(selectedTeam.id)
          setAnalysis(res)
        } catch (err) {
          console.error("Error loading analysis for reports:", err)
        } finally {
          setLoading(false)
        }
      }
      fetchAnalysis()
    }
  }, [selectedTeam])

  if (!selectedTeam || selectedTeam.members.length < 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Reports & Analytics</h1>
          <p className="text-lg text-gray-600">Generate and export professional team reports</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-light-border p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Team Data</h2>
          <p className="text-gray-600 mb-2">Reports require a complete team with at least 3 members</p>
          <p className="text-sm text-gray-500">Go to Team page to invite more members</p>
        </div>
      </div>
    )
  }

  const reportTypes = [
    {
      id: 'team-evaluation',
      title: 'Team Evaluation Report',
      description: 'Comprehensive analysis of team composition, skills, and compatibility',
      icon: FileText,
      color: 'from-blue-400 to-blue-600',
      includes: [
        'Team member profiles',
        'Skill distribution analysis',
        'Compatibility scores',
        'Role assignments',
        'Team dynamics overview'
      ]
    },
    {
      id: 'compatibility',
      title: 'Compatibility Report',
      description: 'Detailed compatibility analysis with heatmaps and interaction patterns',
      icon: FileText,
      color: 'from-purple-400 to-purple-600',
      includes: [
        'Compatibility matrix',
        'Personality match analysis',
        'Communication style assessment',
        'Working style compatibility',
        'Conflict risk indicators'
      ]
    },
    {
      id: 'skill-gap',
      title: 'Skill Gap Report',
      description: 'Identifies missing expertise and provides candidate recommendations',
      icon: FileText,
      color: 'from-yellow-400 to-yellow-600',
      includes: [
        'Current skill inventory',
        'Identified gaps and priorities',
        'Impact assessment',
        'Recommended candidates',
        'Hiring roadmap'
      ]
    },
    {
      id: 'prediction',
      title: 'Prediction Report',
      description: 'AI-powered predictions for project success, retention, and risks',
      icon: FileText,
      color: 'from-green-400 to-green-600',
      includes: [
        'Project success probability',
        'Team retention forecast',
        'Conflict risk assessment',
        '6-month trend analysis',
        'AI recommendations'
      ]
    }
  ]

  const handleGenerate = (reportId) => {
    setGeneratingId(reportId)
    // Simulate report generation
    setTimeout(() => {
      setGeneratedReports(new Set([...generatedReports, reportId]))
      setActivePreview(reportId)
      setGeneratingId(null)
    }, 1500)
  }

  const handleDownload = (reportTitle) => {
    alert(`Downloading ${reportTitle} PDF...\nGenerating print layout...`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Reports & Analytics</h1>
        <p className="text-lg text-gray-600">Generate and export professional team reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <FileText className="w-8 h-8 text-primary-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{reportTypes.length}</p>
          <p className="text-sm text-gray-600">Report Types Available</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <Download className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{generatedReports.size}</p>
          <p className="text-sm text-gray-600">Generated Reports</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <Mail className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600">Shared Links</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-6">
          <Share2 className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">PDF</p>
          <p className="text-sm text-gray-600">Download Format</p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const isGenerated = generatedReports.has(report.id)
          const isGenerating = generatingId === report.id
          
          return (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-sm border border-light-border overflow-hidden hover:shadow-lg transition"
            >
              <div className={`bg-gradient-to-r ${report.color} p-6 text-white`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8" />
                    <div>
                      <h3 className="text-2xl font-bold">{report.title}</h3>
                      <p className="text-white/90 text-sm mt-1">{report.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Includes:</h4>
                <ul className="space-y-2 mb-6">
                  {report.includes.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3">
                  {isGenerating ? (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                    >
                      <RefreshCw className="animate-spin w-5 h-5 mr-2" />
                      Generating Report...
                    </button>
                  ) : !isGenerated ? (
                    <button
                      onClick={() => handleGenerate(report.id)}
                      className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-50 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-600 transition"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Generate Report
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDownload(report.title)}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-600 transition"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download PDF
                      </button>
                      <button 
                        onClick={() => setActivePreview(report.id)}
                        className={`px-4 py-3 border rounded-lg font-medium transition ${activePreview === report.id ? 'bg-primary-50 text-primary-600 border-primary-200' : 'border-light-border text-gray-700 hover:bg-gray-50'}`}
                        title="View Preview"
                      >
                        Preview
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sample Report Preview */}
      {analysis && (
        <div className="bg-white rounded-xl shadow-sm border border-light-border p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            Live Report Preview Panel
          </h3>
          
          {activePreview ? (
            <div className="border border-gray-200 rounded-xl p-8 bg-gray-50 shadow-inner max-w-4xl mx-auto font-serif">
              <div className="text-center border-b border-gray-300 pb-6 mb-6">
                <h4 className="text-3xl font-bold text-gray-800 tracking-wider">TEAMSOCK AI EVALUATION REPORT</h4>
                <p className="text-sm text-gray-500 mt-2">GENERATED ON: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">TARGET TEAM: {selectedTeam.name.toUpperCase()}</p>
              </div>

              {activePreview === 'team-evaluation' && (
                <div className="space-y-6 text-gray-800">
                  <div>
                    <h5 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">1. EXECUTIVE SUMMARY</h5>
                    <p className="text-sm leading-relaxed">
                      This report evaluates the operational readiness and performance score of team <strong>{selectedTeam.name}</strong>. 
                      With {selectedTeam.members.length} members, the team achieves an overall compatibility index of <strong>{analysis.compatibility_score}%</strong>.
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">2. TEAM ROSTER</h5>
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300 text-gray-600">
                          <th className="py-2">Name</th>
                          <th className="py-2">Role</th>
                          <th className="py-2">Personality</th>
                          <th className="py-2">Work Style</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTeam.members.map((m, i) => (
                          <tr key={i} className="border-b border-gray-200">
                            <td className="py-2 font-semibold">{m.name}</td>
                            <td className="py-2">{m.role}</td>
                            <td className="py-2 capitalize">{m.personality}</td>
                            <td className="py-2 capitalize">{m.workStyle}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activePreview === 'compatibility' && (
                <div className="space-y-6 text-gray-800">
                  <div>
                    <h5 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">1. COMPATIBILITY METRICS</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div className="bg-white p-3 border border-gray-200 rounded">
                        <strong>Chemistry Index:</strong> {analysis.compatibility_score}%
                      </div>
                      <div className="bg-white p-3 border border-gray-200 rounded">
                        <strong>Stability Index:</strong> {analysis.retention_forecast}%
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">2. LEADERSHIP & COLLABORATION</h5>
                    <p className="text-sm">
                      The team contains <strong>{analysis.leadership.leaders}</strong> leader-profile member(s), 
                      <strong>{analysis.leadership.collaborative}</strong> collaborative member(s), and 
                      <strong>{analysis.leadership.independent}</strong> independent member(s).
                    </p>
                  </div>
                </div>
              )}

              {activePreview === 'skill-gap' && (
                <div className="space-y-6 text-gray-800">
                  <div>
                    <h5 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">1. DETECTED GAPS</h5>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {!analysis.skill_coverage.devops && <li><strong>DevOps Specialist:</strong> Missing. CI/CD automation is not covered.</li>}
                      {!analysis.skill_coverage.ui_ux && <li><strong>UI/UX Designer:</strong> Missing. User interface optimization is not covered.</li>}
                      {!analysis.skill_coverage.backend && <li><strong>Backend Engineer:</strong> Missing. API server-side architecture is not covered.</li>}
                      {!analysis.skill_coverage.frontend && <li><strong>Frontend Developer:</strong> Missing. Client interface development is not covered.</li>}
                    </ul>
                  </div>
                </div>
              )}

              {activePreview === 'prediction' && (
                <div className="space-y-6 text-gray-800">
                  <div>
                    <h5 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">1. PREDICTIVE INSIGHTS</h5>
                    <p className="text-sm">
                      Machine learning models project a project success probability of <strong>{analysis.success_probability}%</strong> and a conflict risk indicator of <strong>{analysis.conflict_risk}%</strong>.
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold border-b border-gray-300 pb-1 mb-2">2. RISK FACTORS & MITIGATION</h5>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {analysis.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="text-center mt-8 border-t border-gray-300 pt-4 text-xs text-gray-400">
                TeamSync AI • Proprietary Machine Learning Evaluation System
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Click "Preview" on a generated report card above to view details</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
