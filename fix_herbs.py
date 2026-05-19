#!/usr/bin/env python3
import re

# ============ FIX HERBS ============
with open('/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend/app/[locale]/herbs/page.tsx', 'r') as f:
    c = f.read()

# Add herbView state
c = c.replace(
    "const [selectedCat, setSelectedCat] = useState('')",
    "const [selectedCat, setSelectedCat] = useState('')\n  const [herbView, setHerbView] = useState<'home' | 'list'>('home')"
)

# Find the category pills section and wrap with conditional
old_cat_pills = '''        {/* Category pills */}
        <div style={{ padding: '10px 14px 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', gap: 6, minWidth: 'max-content' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setSelectedCat(cat.key)} style={{
                padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                backgroundColor: selectedCat === cat.key ? '#FFFEF9' : 'rgba(255,254,249,0.15)',
                color: selectedCat === cat.key ? '#1a3A2C' : 'rgba(255,254,249,0.85)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ padding: '8px 16px 0', fontSize: 12, color: 'rgba(255,254,249,0.65)' }}>
          {loading ? '載入中...' : `${filtered.length} 味中藥`}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px 100px' }}>
        {loading ? ('''

new_cat_pills = '''        {herbView === 'home' && (
          <div style={{ padding: '16px 14px 100px' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,254,249,0.65)', marginBottom: 12, padding: '0 2px' }}>🌿 按功效主治分類</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {CATEGORIES.filter(cc => cc.key !== '').map(cc => (
                <button key={cc.key} onClick={() => { setSelectedCat(cc.key); setHerbView('list') }} style={{
                  backgroundColor: '#FFFEF9', borderRadius: 16, padding: '16px 14px',
                  border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{cc.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1a2C24', marginBottom: 3 }}>{cc.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {herbView === 'list' && (
        <>
        {/* Category pills */}
        <div style={{ padding: '10px 14px 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', gap: 6, minWidth: 'max-content' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setSelectedCat(cat.key)} style={{
                padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                backgroundColor: selectedCat === cat.key ? '#FFFEF9' : 'rgba(255,254,249,0.15)',
                color: selectedCat === cat.key ? '#1a3A2C' : 'rgba(255,254,249,0.85)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ padding: '8px 16px 0', fontSize: 12, color: 'rgba(255,254,249,0.65)' }}>
          {loading ? '載入中...' : `${filtered.length} 味中藥`}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px 100px' }}>
        {loading ? ('''

if old_cat_pills not in c:
    print("HERBS: pattern not found")
    import sys; sys.exit(1)

c = c.replace(old_cat_pills, new_cat_pills)

# Close the herbView === 'list' block after content div
# Find the </div> that closes content div (before bottom sheet)
old_content_end = '''        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#7A7A6A' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>找不到符合的中藥</div>
            <div style={{ fontSize: 12 }}>試試其他關鍵字或分類</div>
          </div>
        )'''

# The content ends with: ...filtered.map... and then </div> closing the content div
# We need to close the fragment before selectedHerb bottom sheet
# Find: after the last </div> in content, before {selectedHerb && (
# Let's find the closing pattern in original - it should be the </div> closing the flex column
# The original ends with a bunch of </div> and then {selectedHerb &&
# Let me find where selectedHerb bottom sheet starts
# Actually, the content section ends with the closing </div> of the flex column
# Then there's another </div> closing padding:12px
# Then {selectedHerb && (
# We need to close the fragment </> )} after that final </div>

# Find the selectedHerb bottom sheet and insert a closing after the content divs
old_bottom_sheet_start = "      {selectedHerb && ("
idx = c.indexof(old_bottom_sheet_start)
# Insert closing before it
c = c[:idx] + "\n          </div>\n        </>\n        )}\n" + c[idx:]

with open('/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend/app/[locale]/herbs/page.tsx', 'w') as f:
    f.write(c)
print("herbs done")