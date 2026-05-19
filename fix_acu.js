const fs = require('fs');
let content = fs.readFileSync('/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend/app/[locale]/acu/page.tsx', 'utf8');

const oldSection = `      {/* ===== POINTS VIEW ===== */}
      {view === 'points' && (
        <>
          {/* Category Banner */}
          <div style={{ padding: '10px 14px 0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => { setSelectedCategory(cat.key); setSelectedMeridian(''); setSelectedPointType('') }} style={{
                padding: '6px 13px', borderRadius: '16px', border: 'none', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap',
                backgroundColor: selectedCategory === cat.key ? '#1a3A2C' : '#FFFEF9',
                color: selectedCategory === cat.key ? '#FFFEF9' : '#1a2C24', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Meridian Pills */}
          {(selectedCategory === 'all' || selectedCategory === 'regular') && (
            <div style={{ padding: '8px 14px 0', display: 'flex', gap: '5px', overflowX: 'auto' }}>
              <button onClick={() => setSelectedMeridian('')} style={{ padding: '5px 12px', borderRadius: '16px', border: 'none', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: !selectedMeridian ? '#2C4A3E' : '#E8E4DC', color: !selectedMeridian ? '#FFFEF9' : '#1a2C24', fontWeight: 600 }}>全部</button>
              {MERIDIANS.map(m => (
                <button key={m.code} onClick={() => setSelectedMeridian(m.code === selectedMeridian ? '' : m.code)} style={{ padding: '5px 10px', borderRadius: '16px', border: 'none', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: selectedMeridian === m.code ? '#2C4A3E' : '#E8E4DC', color: selectedMeridian === m.code ? '#FFFEF9' : '#1a2C24', fontWeight: 600 }}>
                  {m.code}
                </button>
              ))}
            </div>
          )}

          {/* Point Type Pills */}
          <div style={{ padding: '8px 14px 0', display: 'flex', gap: '5px', overflowX: 'auto' }}>
            <button onClick={() => setSelectedPointType('')} style={{ padding: '4px 10px', borderRadius: '14px', border: 'none', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: !selectedPointType ? '#8B4513' : '#E8E4DC', color: !selectedPointType ? '#FFFEF9' : '#5A3A2A', fontWeight: 600 }}>全部穴性</button>
            {POINT_TYPES.map(pt => (
              <button key={pt.key} onClick={() => setSelectedPointType(pt.key === selectedPointType ? '' : pt.key)} style={{ padding: '4px 10px', borderRadius: '14px', border: 'none', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: selectedPointType === pt.key ? '#8B4513' : '#E8E4DC', color: selectedPointType === pt.key ? '#FFFEF9' : '#5A3A2A', fontWeight: 600 }}>
                {pt.label}
              </button>
            ))}
          </div>

          {/* Result count */}
          <div style={{ padding: '8px 16px 4px', fontSize: '11px', color: '#8A8A7A' }}>
            {loading ? '...' : \`\${filteredAcupoints.length} 個穴位\`}
            {selectedMeridian && \` · \${MERIDIANS.find(m=>m.code===selectedMeridian)?.name}\`}
            {selectedPointType && \` · \${selectedPointType}\`}
          </div>

          {/* List */}
          <div style={{ padding: '0 0 80px' }}>
            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#7A7A6A', fontSize: '14px' }}>載入中...</div>
            ) : filteredAcupoints.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#7A7A6A' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>找不到符合的穴位</div>
              </div>
            ) : (
              filteredAcupoints.slice(0, 200).map(a => (
                <button key={a.code} onClick={() => setSelectedAcupoint(a)} style={{
                  width: '100%', padding: '12px 16px',
                  backgroundColor: selectedAcupoint?.code === a.code ? '#F0EDE6' : '#FFFEF9',
                  border: 'none', borderBottom: '1px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24' }}>{a.name}</span>
                    <span style={{ fontSize: '11px', color: '#8A8A7A', backgroundColor: '#F0EDE5', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{a.code}</span>
                    {a.specialType && <span style={{ fontSize: '10px', color: '#8B4513', backgroundColor: '#FDF3E7', padding: '2px 8px', borderRadius: '10px' }}>{a.specialType}</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8A8A7A' }}>
                    {getMeridianName(a.code)} · {a.indications?.slice(0, 35) || ''}...
                  </div>
                </button>
              ))
            )}
            {!loading && filteredAcupoints.length > 200 && (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#8A8A7A' }}>搜尋取得更多結果</div>
            )}
          </div>
        </>
      )}`;

const newSection = `      {/* ===== POINTS VIEW ===== */}
      {view === 'points' && (
        <>
          {acuView === 'home' && (
            <>
              <div style={{ padding: '16px 14px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => { setAcuView('category') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '18px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>💉</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24', marginBottom: '4px' }}>穴位查詢</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>十二經脈 · 督脈 · 任脈 · 經外奇穴</div>
                </button>
                <button onClick={() => { setSelectedCategory('regular'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '18px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🫁</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24', marginBottom: '4px' }}>十二經脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>手三陰三陽 · 足三陰三陽</div>
                </button>
                <button onClick={() => { setSelectedCategory('GV'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '18px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24', marginBottom: '4px' }}>督脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>陽脈之海 · 28穴</div>
                </button>
                <button onClick={() => { setSelectedCategory('CV'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '18px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌊</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24', marginBottom: '4px' }}>任脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>陰脈之海 · 24穴</div>
                </button>
              </div>
              <div style={{ padding: '8px 14px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => { setSelectedCategory('EX'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>⭐</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a2C24', marginBottom: '3px' }}>經外奇穴</div>
                  <div style={{ fontSize: '10px', color: '#8A8A7A' }}>不歸經 · 新穴</div>
                </button>
              </div>
            </>
          )}

          {acuView === 'category' && (
            <>
              <div style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setAcuView('home')} style={{
                  background: 'rgba(255,254,249,0.15)', border: 'none', borderRadius: '12px',
                  padding: '6px 10px', cursor: 'pointer', fontSize: '11px', color: '#FFFEF9', fontWeight: 700,
                }}>← 返回</button>
              </div>
              <div style={{ padding: '12px 14px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => { setSelectedCategory('regular'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🫁</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24' }}>十二經脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>肺經 · 大腸經 · 胃經 · 脾經...</div>
                </button>
                <button onClick={() => { setSelectedCategory('GV'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24' }}>督脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>陽脈之海</div>
                </button>
                <button onClick={() => { setSelectedCategory('CV'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌊</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24' }}>任脈</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>陰脈之海</div>
                </button>
                <button onClick={() => { setSelectedCategory('EX'); setSelectedMeridian(''); setSelectedPointType(''); setAcuView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24' }}>經外奇穴</div>
                  <div style={{ fontSize: '11px', color: '#8A8A7A' }}>新穴</div>
                </button>
              </div>
            </>
          )}

          {acuView === 'list' && (
            <>
              <button onClick={() => setAcuView('home')} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '8px 14px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '11px', color: '#8A8A7A', fontWeight: 600,
              }}>← 返回首頁</button>

              {/* Category Banner */}
              <div style={{ padding: '10px 14px 0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.key} onClick={() => { setSelectedCategory(cat.key); setSelectedMeridian(''); setSelectedPointType('') }} style={{
                    padding: '6px 13px', borderRadius: '16px', border: 'none', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap',
                    backgroundColor: selectedCategory === cat.key ? '#1a3A2C' : '#FFFEF9',
                    color: selectedCategory === cat.key ? '#FFFEF9' : '#1a2C24', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    <span>{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>

              {/* Meridian Pills */}
              {(selectedCategory === 'all' || selectedCategory === 'regular') && (
                <div style={{ padding: '8px 14px 0', display: 'flex', gap: '5px', overflowX: 'auto' }}>
                  <button onClick={() => setSelectedMeridian('')} style={{ padding: '5px 12px', borderRadius: '16px', border: 'none', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: !selectedMeridian ? '#2C4A3E' : '#E8E4DC', color: !selectedMeridian ? '#FFFEF9' : '#1a2C24', fontWeight: 600 }}>全部</button>
                  {MERIDIANS.map(m => (
                    <button key={m.code} onClick={() => setSelectedMeridian(m.code === selectedMeridian ? '' : m.code)} style={{ padding: '5px 10px', borderRadius: '16px', border: 'none', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: selectedMeridian === m.code ? '#2C4A3E' : '#E8E4DC', color: selectedMeridian === m.code ? '#FFFEF9' : '#1a2C24', fontWeight: 600 }}>
                      {m.code}
                    </button>
                  ))}
                </div>
              )}

              {/* Point Type Pills */}
              <div style={{ padding: '8px 14px 0', display: 'flex', gap: '5px', overflowX: 'auto' }}>
                <button onClick={() => setSelectedPointType('')} style={{ padding: '4px 10px', borderRadius: '14px', border: 'none', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: !selectedPointType ? '#8B4513' : '#E8E4DC', color: !selectedPointType ? '#FFFEF9' : '#5A3A2A', fontWeight: 600 }}>全部穴性</button>
                {POINT_TYPES.map(pt => (
                  <button key={pt.key} onClick={() => setSelectedPointType(pt.key === selectedPointType ? '' : pt.key)} style={{ padding: '4px 10px', borderRadius: '14px', border: 'none', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', backgroundColor: selectedPointType === pt.key ? '#8B4513' : '#E8E4DC', color: selectedPointType === pt.key ? '#FFFEF9' : '#5A3A2A', fontWeight: 600 }}>
                    {pt.label}
                  </button>
                ))}
              </div>

              {/* Result count */}
              <div style={{ padding: '8px 16px 4px', fontSize: '11px', color: '#8A8A7A' }}>
                {loading ? '...' : filteredAcupoints.length + ' 個穴位'}
                {selectedMeridian && (' · ' + MERIDIANS.find(m => m.code === selectedMeridian)?.name)}
                {selectedPointType && (' · ' + selectedPointType)}
              </div>

              {/* List */}
              <div style={{ padding: '0 0 80px' }}>
                {loading ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#7A7A6A', fontSize: '14px' }}>載入中...</div>
                ) : filteredAcupoints.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#7A7A6A' }}>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>找不到符合的穴位</div>
                  </div>
                ) : (
                  filteredAcupoints.slice(0, 200).map(a => (
                    <button key={a.code} onClick={() => setSelectedAcupoint(a)} style={{
                      width: '100%', padding: '12px 16px',
                      backgroundColor: selectedAcupoint?.code === a.code ? '#F0EDE6' : '#FFFEF9',
                      border: 'none', borderBottom: '1px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a2C24' }}>{a.name}</span>
                        <span style={{ fontSize: '11px', color: '#8A8A7A', backgroundColor: '#F0EDE5', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{a.code}</span>
                        {a.specialType && <span style={{ fontSize: '10px', color: '#8B4513', backgroundColor: '#FDF3E7', padding: '2px 8px', borderRadius: '10px' }}>{a.specialType}</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8A8A7A' }}>
                        {getMeridianName(a.code)} · {(a.indications || '').slice(0, 35)}...
                      </div>
                    </button>
                  ))
                )}
                {!loading && filteredAcupoints.length > 200 && (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#8A8A7A' }}>搜尋取得更多結果</div>
                )}
              </div>
            </>
          )}
        </>
      )}`;

const idx = content.indexOf(oldSection);
if (idx === -1) {
  console.log('NOT FOUND');
  console.log('Looking for POINTS VIEW marker...');
  const marker = '==== POINTS VIEW =====';
  const m2 = content.indexOf(marker);
  console.log('Marker at:', m2);
  // Print around marker
  if (m2 > 0) {
    console.log(content.slice(m2 - 5, m2 + 200));
  }
} else {
  content = content.replace(oldSection, newSection);
  fs.writeFileSync('/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend/app/[locale]/acu/page.tsx', content);
  console.log('SUCCESS');
}