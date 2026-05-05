'use client'
import React, { useState } from 'react'

interface Experience { title: string; company: string; period: string; description: string }
interface Education { degree: string; school: string; year: string }

export default function ResumeClient() {
  const [name, setName] = useState('John Doe')
  const [title, setTitle] = useState('Full Stack Developer')
  const [email, setEmail] = useState('john@example.com')
  const [phone, setPhone] = useState('+91 98765 43210')
  const [location, setLocation] = useState('Mumbai, India')
  const [website, setWebsite] = useState('github.com/johndoe')
  const [summary, setSummary] = useState('Passionate full-stack developer with 5+ years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture.')
  const [skills, setSkills] = useState('JavaScript, TypeScript, React, Next.js, Node.js, Python, PostgreSQL, MongoDB, AWS, Docker, Git')
  const [experience, setExperience] = useState<Experience[]>([
    { title: 'Senior Developer', company: 'TechCorp', period: '2022 - Present', description: 'Led development of microservices architecture. Improved API response times by 40%. Mentored junior developers.' },
    { title: 'Full Stack Developer', company: 'StartupXYZ', period: '2020 - 2022', description: 'Built React frontend and Node.js backend for SaaS platform. Implemented CI/CD pipelines with GitHub Actions.' },
  ])
  const [education, setEducation] = useState<Education[]>([
    { degree: 'B.Tech Computer Science', school: 'IIT Delhi', year: '2020' },
  ])
  const [accentColor, setAccentColor] = useState('#F97316')

  const addExp = () => setExperience([...experience, { title: '', company: '', period: '', description: '' }])
  const removeExp = (i: number) => setExperience(experience.filter((_, idx) => idx !== i))
  const updateExp = (i: number, field: keyof Experience, value: string) => {
    const n = [...experience]; n[i] = { ...n[i], [field]: value }; setExperience(n)
  }
  const addEdu = () => setEducation([...education, { degree: '', school: '', year: '' }])
  const removeEdu = (i: number) => setEducation(education.filter((_, idx) => idx !== i))
  const updateEdu = (i: number, field: keyof Education, value: string) => {
    const n = [...education]; n[i] = { ...n[i], [field]: value }; setEducation(n)
  }

  const printResume = () => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>Resume - ${name}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;color:#333;max-width:800px;margin:0 auto;padding:40px}
    .header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid ${accentColor}}
    .header h1{font-size:28px;color:${accentColor};margin-bottom:4px}.header .title{font-size:16px;color:#666;margin-bottom:12px}
    .header .contact{font-size:12px;color:#888;display:flex;justify-content:center;gap:16px;flex-wrap:wrap}
    .section{margin-bottom:24px}.section h2{font-size:14px;text-transform:uppercase;letter-spacing:3px;color:${accentColor};border-bottom:1px solid #ddd;padding-bottom:6px;margin-bottom:12px}
    .summary{font-size:13px;line-height:1.6;color:#555}.skills{font-size:13px;color:#555;line-height:1.8}
    .exp-item{margin-bottom:16px}.exp-item .exp-header{display:flex;justify-content:space-between;align-items:baseline}
    .exp-item h3{font-size:15px}.exp-item .company{color:${accentColor};font-size:13px}.exp-item .period{font-size:12px;color:#888}
    .exp-item .desc{font-size:13px;color:#555;line-height:1.6;margin-top:4px}
    .edu-item{display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px}
    .edu-item .degree{font-weight:bold}.edu-item .school{color:#666}.edu-item .year{color:#888}
    @media print{body{padding:20px}}</style></head><body>
    <div class="header"><h1>${name}</h1><div class="title">${title}</div>
    <div class="contact"><span>📧 ${email}</span><span>📞 ${phone}</span><span>📍 ${location}</span>${website ? `<span>🌐 ${website}</span>` : ''}</div></div>
    ${summary ? `<div class="section"><h2>Summary</h2><p class="summary">${summary}</p></div>` : ''}
    ${experience.length > 0 ? `<div class="section"><h2>Experience</h2>${experience.map(e => `<div class="exp-item"><div class="exp-header"><div><h3>${e.title}</h3><span class="company">${e.company}</span></div><span class="period">${e.period}</span></div><p class="desc">${e.description}</p></div>`).join('')}</div>` : ''}
    ${education.length > 0 ? `<div class="section"><h2>Education</h2>${education.map(e => `<div class="edu-item"><div><span class="degree">${e.degree}</span> — <span class="school">${e.school}</span></div><span class="year">${e.year}</span></div>`).join('')}</div>` : ''}
    ${skills ? `<div class="section"><h2>Skills</h2><p class="skills">${skills}</p></div>` : ''}
    </body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  const Input = ({ label, value, onChange, className = '' }: { label: string; value: string; onChange: (v: string) => void; className?: string }) => (
    <div className={className}>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
    </div>
  )

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-card border border-border p-5 rounded-[2rem] shadow-sm space-y-3">
          <h3 className="font-bold font-syne">Personal Info</h3>
          <Input label="Full Name" value={name} onChange={setName} />
          <Input label="Job Title" value={title} onChange={setTitle} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" value={email} onChange={setEmail} />
            <Input label="Phone" value={phone} onChange={setPhone} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Location" value={location} onChange={setLocation} />
            <Input label="Website" value={website} onChange={setWebsite} />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-[2rem] shadow-sm space-y-3">
          <h3 className="font-bold font-syne">Summary</h3>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
        </div>

        <div className="bg-card border border-border p-5 rounded-[2rem] shadow-sm space-y-3">
          <div className="flex justify-between items-center"><h3 className="font-bold font-syne">Experience</h3><button onClick={addExp} className="text-xs px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-lg font-bold">+ Add</button></div>
          {experience.map((exp, i) => (
            <div key={i} className="p-3 bg-muted/10 rounded-xl border border-border space-y-2 group relative">
              <button onClick={() => removeExp(i)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 text-sm">×</button>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Title" value={exp.title} onChange={(v) => updateExp(i, 'title', v)} />
                <Input label="Company" value={exp.company} onChange={(v) => updateExp(i, 'company', v)} />
              </div>
              <Input label="Period" value={exp.period} onChange={(v) => updateExp(i, 'period', v)} />
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={exp.description} onChange={(e) => updateExp(i, 'description', e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm h-16 resize-none focus:outline-none" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border p-5 rounded-[2rem] shadow-sm space-y-3">
          <div className="flex justify-between items-center"><h3 className="font-bold font-syne">Education</h3><button onClick={addEdu} className="text-xs px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-lg font-bold">+ Add</button></div>
          {education.map((edu, i) => (
            <div key={i} className="p-3 bg-muted/10 rounded-xl border border-border space-y-2 group relative">
              <button onClick={() => removeEdu(i)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 text-sm">×</button>
              <Input label="Degree" value={edu.degree} onChange={(v) => updateEdu(i, 'degree', v)} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="School" value={edu.school} onChange={(v) => updateEdu(i, 'school', v)} />
                <Input label="Year" value={edu.year} onChange={(v) => updateEdu(i, 'year', v)} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border p-5 rounded-[2rem] shadow-sm space-y-3">
          <h3 className="font-bold font-syne">Skills</h3>
          <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Comma separated skills..." className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
        </div>

        <div className="flex gap-3 items-center">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Accent Color</label>
            <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
          </div>
          <button onClick={printResume} className="flex-1 py-4 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-2xl transition-all shadow-md shadow-brand-orange/20 text-lg">📄 Download / Print PDF</button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-7">
        <div className="bg-white text-gray-800 p-10 rounded-[2rem] shadow-xl border border-border sticky top-8 max-h-[85vh] overflow-auto" style={{ fontFamily: 'Georgia, serif' }}>
          {/* Header */}
          <div className="text-center pb-6 mb-6" style={{ borderBottom: `3px solid ${accentColor}` }}>
            <h2 className="text-3xl font-bold" style={{ color: accentColor }}>{name}</h2>
            <p className="text-gray-500 mt-1">{title}</p>
            <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-400">
              {email && <span>📧 {email}</span>}
              {phone && <span>📞 {phone}</span>}
              {location && <span>📍 {location}</span>}
              {website && <span>🌐 {website}</span>}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-[3px] font-bold pb-1 mb-3" style={{ color: accentColor, borderBottom: '1px solid #e5e5e5' }}>Summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-[3px] font-bold pb-1 mb-3" style={{ color: accentColor, borderBottom: '1px solid #e5e5e5' }}>Experience</h3>
              {experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-sm">{exp.title}</span>
                      {exp.company && <span className="text-sm ml-2" style={{ color: accentColor }}>— {exp.company}</span>}
                    </div>
                    <span className="text-xs text-gray-400">{exp.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-[3px] font-bold pb-1 mb-3" style={{ color: accentColor, borderBottom: '1px solid #e5e5e5' }}>Education</h3>
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between text-sm mb-2">
                  <div><span className="font-bold">{edu.degree}</span> — <span className="text-gray-500">{edu.school}</span></div>
                  <span className="text-gray-400">{edu.year}</span>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills && (
            <div>
              <h3 className="text-xs uppercase tracking-[3px] font-bold pb-1 mb-3" style={{ color: accentColor, borderBottom: '1px solid #e5e5e5' }}>Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.split(',').map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
