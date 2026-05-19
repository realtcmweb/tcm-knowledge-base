const fs = require('fs');
let c = fs.readFileSync('/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend/app/[locale]/symptoms/page.tsx', 'utf8');

// 1. Add symptomView state
c = c.replace(
  "const [mode, setMode] = useState<'expert' | 'popular'>('expert')",
  "const [mode, setMode] = useState<'expert' | 'popular'>('expert')\n  const [symptomView, setSymptomView] = useState<'home' | 'list'>('home')"
);

// 2. Find the section after 3-Tab Nav, before the expert/popular toggle
// The structure: after 3-tab div closes, there's the expert/popular toggle
// Replace everything between that toggle and the mode === 'expert' section with conditional rendering
const toggleMarker = "            <button onClick={() => setMode('expert')}";
const toggleIdx = c.indexOf(toggleMarker);

// Insert home cards + wrapper before the toggle
const homeInsert = `        {symptomView === 'home' && (
          <div style={{ padding: '16px 14px 100px' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,254,249,0.65)', marginBottom: 12, padding: '0 2px' }}>🩺 按專科分類</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {specialtyTabs.map(sp => (
                <button key={sp.key} onClick={() => { setSelectedSpecialty(sp.key); setSelectedSub(sp.subKeys[0]); setSymptomView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: 16, padding: '18px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{sp.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1a2C24', marginBottom: 4 }}>{sp.key}</div>
                  <div style={{ fontSize: 11, color: '#8A8A7A' }}>{sp.subKeys.slice(0, 3).join(' · ')}{sp.subKeys.length > 3 ? '...' : ''}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {symptomView === 'list' && (
        <>
          <button onClick={() => setSymptomView('home')} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '8px 14px 0', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, color: 'rgba(255,254,249,0.65)', fontWeight: 600,
          }}>← 返回首頁</button>
`;

// Find the closing </div> that closes the header div
// The header div ends right before "      {/* Expert mode */}" or "      {mode === 'expert'"
// Let's find the marker
const expertMarker = "      {mode === 'expert' && (";
const expertIdx = c.indexOf(expertMarker);

// Insert the home section + wrapper before the expert mode toggle
c = c.slice(0, toggleIdx) + homeInsert + c.slice(toggleIdx);

// 3. Close the symptomView === 'list' block
// It needs to wrap everything from the expert/popular toggle through the content div
// Find the </div> that closes the content div (before selectedDisease bottom sheet)
const bottomSheetMarker = "      {selectedDisease && (";
const bsIdx = c.indexOf(bottomSheetMarker);
const beforeBS = c.slice(0, bsIdx);
const lastDivIdx = beforeBS.lastIndexOf('</div>');

// Insert closing tags before the bottom sheet
c = c.slice(0, lastDivIdx + 6) + '\n          </div>\n        </>\n        )}\n' + c.slice(lastDivIdx + 6);

fs.writeFileSync('/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend/app/[locale]/symptoms/page.tsx', c);
console.log('done');