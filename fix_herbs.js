const fs = require('fs');
let c = fs.readFileSync('/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend/app/[locale]/herbs/page.tsx', 'utf8');

// 1. Add herbView state
c = c.replace(
  "const [selectedCat, setSelectedCat] = useState('')",
  "const [selectedCat, setSelectedCat] = useState('')\n  const [herbView, setHerbView] = useState<'home' | 'list'>('home')"
);

// 2. Replace the category pills section with a conditional
// Insert herbView === 'home' cards before category pills
const catPillsMarker = "        {/* Category pills */}";
const catPillsIdx = c.indexOf(catPillsMarker);

const homeSection = `        {herbView === 'home' && (
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
`;

const listCloseSection = `
        </>
        )}
`;

c = c.slice(0, catPillsIdx) + homeSection + c.slice(catPillsIdx);

// 3. After the content block, close the herbView === 'list' condition
// Find the last </div> before something that follows the content (like a modal or footer)
// The content div ends, then the herb detail bottom sheet or other UI
// Let me find a good closing point - after the content div's closing tag
const contentDivIdx = c.indexOf("      {/* Content */}");
// Find the </div> that closes the content div - it's the </div> right before the next top-level JSX element
// The structure after content is: {selectedHerb && ( bottom sheet }
// So we need to find the </div> that ends the content div
// Count the divs... Actually let me use a simpler approach - find the closing </div> right after the list/loading block

// After replacement the structure is:
// <div style={{ padding: '12px 14px 100px' }}>  (content)
//   ... list items
//   {loading ? ... : ...}
// </div>
// {selectedHerb && (... bottom sheet ...)}

// So we need to insert "        </>\n        )}\n" after the content </div>
// Let's find the last occurrence of the content closing div pattern
const contentClosing = "<div style={{ padding: '12px 14px 100px' }}>";
// Search for the last one - there should be only one (the one we inserted before)
const lastContentDiv = c.lastIndexOf(contentClosing);
// Find the </div> after it
const afterLastContent = c.slice(lastContentDiv + contentClosing.length);
const closeDivIdx = afterLastContent.indexOf('</div>');
const fullCloseIdx = lastContentDiv + contentClosing.length + closeDivIdx + 6; // +6 for </div>

c = c.slice(0, fullCloseIdx) + '\n          </div>\n        </>\n        )}\n' + c.slice(fullCloseIdx);

fs.writeFileSync('/home/justin/.openclaw/workspace/tcm_ai/vercel_tcm_frontend/app/[locale]/herbs/page.tsx', c);
console.log('done');