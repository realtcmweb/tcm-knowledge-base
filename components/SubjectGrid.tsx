const SUBJECTS = [
  { code: '01', name: '中醫眼科學', icon: '👁', color: 'bg-blue-50 border-blue-200' },
  { code: '02', name: '中醫婦科學', icon: '🤰', color: 'bg-pink-50 border-pink-200' },
  { code: '03', name: '中醫外科學', icon: '🩺', color: 'bg-red-50 border-red-200' },
  { code: '04', name: '中醫內科學', icon: '💊', color: 'bg-orange-50 border-orange-200' },
  { code: '05', name: '中醫骨傷科學', icon: '🦴', color: 'bg-amber-50 border-amber-200' },
  { code: '06', name: '中醫診斷學', icon: '📋', color: 'bg-yellow-50 border-yellow-200' },
  { code: '07', name: '中醫兒科學', icon: '👶', color: 'bg-sky-50 border-sky-200' },
  { code: '08', name: '中醫基礎理論', icon: '🔮', color: 'bg-purple-50 border-purple-200' },
  { code: '09', name: '針灸醫籍選讀', icon: '📿', color: 'bg-teal-50 border-teal-200' },
  { code: '10', name: '方劑學', icon: '⚗️', color: 'bg-emerald-50 border-emerald-200' },
  { code: '11', name: '中藥學', icon: '🌿', color: 'bg-green-50 border-green-200' },
  { code: '12', name: '針灸學', icon: '💉', color: 'bg-cyan-50 border-cyan-200' },
  { code: '13', name: '溫病學', icon: '🔥', color: 'bg-rose-50 border-rose-200' },
  { code: '14', name: '推拿學', icon: '👐', color: 'bg-lime-50 border-lime-200' },
  { code: '15', name: '傷寒論', icon: '📜', color: 'bg-amber-50 border-amber-200' },
  { code: '16', name: '金匱要略', icon: '📖', color: 'bg-yellow-50 border-yellow-200' },
  { code: '17', name: '內經選讀', icon: '🕮', color: 'bg-stone-50 border-stone-200' },
]

export default function SubjectGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {SUBJECTS.map(s => (
        <button
          key={s.code}
          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2
                      ${s.color} hover:shadow-md transition text-center`}
        >
          <span className="text-2xl mb-1">{s.icon}</span>
          <span className="text-xs font-medium text-gray-700 leading-tight">
            {s.name}
          </span>
        </button>
      ))}
    </div>
  )
}
