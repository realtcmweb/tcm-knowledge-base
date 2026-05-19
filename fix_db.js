const fs = require('fs');
let c = fs.readFileSync('/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend/app/[locale]/db/page.tsx', 'utf8');

// 1. Add dbView state after existing state declarations
c = c.replace(
  "const [showCatSidebar, setShowCatSidebar] = useState(false)",
  "const [showCatSidebar, setShowCatSidebar] = useState(false)\n  const [dbView, setDbView] = useState<'home' | 'list'>('home')"
);

// 2. After the header/tabs close (before "Content"), insert the home view cards
// Find the "Category Pills" line and insert home cards before it
const marker = "        {/* Category Pills */}";
const catPillsIdx = c.indexOf(marker);

// Find the closing of the header div - it ends right before "      </div>" after the 3-tab
// Let's find the section: after 3-tab div closes, there's "      {/* Content */}"
const contentMarker = "      {/* Content */}";
const contentIdx = c.indexOf(contentMarker);

// Insert home view cards right before the Category Pills section (inside the header area)
// Actually, the cards should be in the content area when dbView === 'home'
// Let me replace the whole content section

const homeViewCards = `      {dbView === 'home' && (
        <div style={{ padding: '16px 14px 100px' }}>
          <div style={{ fontSize: '13px', color: '#8A8A7A', marginBottom: '12px', padding: '0 2px' }}>🍵 按主治功效分類</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {FORMULA_CATEGORIES.filter(fc => fc.key !== '').map(fc => (
              <button key={fc.key} onClick={() => { setSelectedCat(fc.key); setDbView('list'); setShowCatSidebar(false) }} style={{
                backgroundColor: '#FFFEF9', borderRadius: '16px', padding: '16px 14px',
                border: '1.5px solid #E8E4DC', cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{fc.emoji}</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a2C24', marginBottom: '3px' }}>{fc.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {dbView === 'list' && (
        <>
          {/* Category Pills */}
          <div style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowCatSidebar(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 13px', borderRadius: '20px',
                backgroundColor: 'rgba(255,254,249,0.15)',
                color: '#FFFEF9', border: '1.5px solid rgba(255,254,249,0.25)',
                cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '15px' }}>{activeCat.emoji}</span>
              <span>{activeCat.label}</span>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>▾</span>
            </button>
            <div style={{ fontSize: '11px', color: 'rgba(255,254,249,0.65)', whiteSpace: 'nowrap' }}>
              {loading ? '...' : filteredFormulas.length + ' 個方劑'}
            </div>
          </div>
        </>
      )}

      {/* Content */}
      {dbView === 'list' && (
      <div style={{ padding: '12px 14px 100px' }}>`;

const listClosing = `      {/* Content */}
      <div style={{ padding: '12px 14px 100px' }}>`;

const idx2 = c.indexOf(listClosing);
if (idx2 === -1) { console.log('Content marker not found'); process.exit(1); }
c = c.slice(0, idx2) + homeViewCards + c.slice(idx2 + listClosing.length);

// 3. Close the dbView === 'list' div around the content
// The content ends with a long section, we need to close the dbView condition after the content
// Find the "Category Sidebar" section and insert a closing div before it
const catSidebarMarker = "      {/* Category Sidebar */}";
const csIdx = c.indexOf(catSidebarMarker);

// The content block goes from the Content div start to before Category Sidebar
// We inserted "      {/* Content */}\n      {dbView === 'list' && (\n      <div style={{ padding: '12px 14px 100px' }}>"
// We need to close the dbView === 'list' block after the content
// The content block (original) ends with a sequence. Let me check what closes it.
// Looking at the original, the content ends at "      </div>" (after the list or loading/empty state)
// then "      {/* Category Sidebar */}"
// So after we insert our content, we need to close the dbView condition

// Find the </div> that closes the Content div (before Category Sidebar)
const sidebarSection = c.slice(csIdx);
// The sidebar always starts with a </div> before it... Actually let me check
// The structure was: <div style={{ padding: '12px 14px 100px' }}> (content)
// then more divs
// then </div> closing content
// then {/* Category Sidebar */}

// In our replacement, we need to close the dbView condition after the content div closes
// Let me find the </div> right before "      {/* Category Sidebar */}"
const catSidebarLineIdx = c.indexOf(catSidebarMarker);
const beforeSidebar = c.slice(0, catSidebarLineIdx);
// Find the last </div> in the beforeSidebar
const lastDivIdx = beforeSidebar.lastIndexOf('</div>');
// Insert a closing div before Category Sidebar to close the dbView === 'list' condition
c = c.slice(0, lastDivIdx + 6) + '\n          </div>\n        </>\n      )}\n\n' + c.slice(lastDivIdx + 6);

fs.writeFileSync('/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend/app/[locale]/db/page.tsx', c);
console.log('done');