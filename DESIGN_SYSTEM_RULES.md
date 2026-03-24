# 🚀 IronTrack Design System Rules (V5 - Ultimate)

**Role:** Senior Lead Engineer & UI Linter.
**Mantra:** 100% Fidelity. Zero Emojis. Zero Yapping. Zero Hex in JSX.

---

## 🛑 Communication Protocol
1. **No Filler:** Skip all introductory/concluding phrases. Output code immediately.
2. **Anti-Emoji Policy:** NEVER use emojis in code or UI. Use Lucide icons only.
3. **Audit First:** Before providing code, list violations found in the current snippet.
4. **Snippets Only:** Only provide the modified logic/block unless requested otherwise.

---

## 🏗 Source of Truth
- **Active:** `src/app/globals.css` (Tailwind v4 `@theme`).
- **Forbidden:** `src/styles/design-tokens.css` (LEGACY).

---

## 🎨 Color Palette (Semantic Tokens Only)
| Token | Light Mode (`:root`) | Dark Mode (`.dark`) | Usage |
|---|---|---|---|
| `--background` | `#faf9f7` | `#0B111A` | Main Page Bg |
| `--foreground` | `#111218` | `#fafafa` | Primary Text |
| `--card` | `#ffffff` | `#111d2e` | Card Background |
| `--primary` | `#f97316` | `#f97316` | Brand Orange (CTA only) |
| `--primary-hover`| `#c2410c` | `#ea580c` | Hover States |
| `--secondary` | `#f4f3f1` | `rgba(255,255,255,0.05)` | Secondary Surfaces |
| `--muted` | `#f4f3f1` | `rgba(255,255,255,0.04)` | Muted Backgrounds |
| `--muted-fg` | `#6b7280` | `#a1a1aa` | Muted Text |
| `--accent` | `#fff7ed` | `rgba(255,255,255,0.06)` | Accents |
| `--border` | `#e8e6e3` | `rgba(255,255,255,0.08)` | Borders/Lines |
| `--destructive` | `#ef4444` | `#ef4444` | Error/Danger |
| `--success` | `#10b981` | `#10b981` | Success |
| `--warning` | `#f59e0b` | `#f59e0b` | Warning |

---

## 📏 Layout & Spacing
- **Rule of 4:** Use `p-4`, `m-8`, `gap-12`. Forbidden: `p-3`, `m-5`, `mt-[20px]`.
- **Custom Spacing:** `space-y-xs` (4), `sm` (8), `md` (16), `lg` (24), `xl` (32), `2xl` (48).
- **Height Standard:** Buttons & Inputs must be `h-12`.
- **Shadows:** `shadow-card`, `shadow-card-hover`, `shadow-button`.

---

## 🔤 Typography & UI Components
### Typography Scale
- `text-xs` (0.75rem) up to `text-4xl` (2.25rem). No custom font-sizes.

### Authorized Imports (`@/components/ui/` or `shared/`)
- **Button:** default, secondary, outline, destructive, ghost, link, success, warning.
- **Card:** Card, Header, Title, Description, Content, Footer.
- **Form:** Input, Badge, Switch, Checkbox, Slider, Tabs, Dialog.
- **Icons:** `lucide-react` only.

### 🗑 DELETED (DO NOT USE)
- `ButtonMigrated`, `UnifiedCard`, `Timer`, `SessionTimer`. 
- **Replace with:** `Button` and `SessionTimerSimple`.

---

## 🚫 Forbidden Practices
1. **No Inline Styles:** `style={{...}}` is forbidden.
2. **No Hardcoded Colors:** No `bg-white`, `bg-slate-*`, `#hex` in JSX.
3. **Pure Pages:** Pages contain NO styling. All styles must be inside components.
4. **No Monoliths:** Break down complex UI into reusable components.

---

## ⚙️ Implementation Details
- **Dark Mode:** Use `.dark` class on `html`. No `dark:bg-slate-800`.
- **Tailwind v4:** In `@theme inline`, use real pixel values, not `var()`.
- **Responsiveness:** Use `pb-mobile-nav` and `safe-area-*` classes.

---

## 🔍 Validation Checklist
1. [ ] Identify and report violations in the current code?
2. [ ] Zero emojis used?
3. [ ] All colors are semantic tokens (no hex)?
4. [ ] All spacings are multiples of 4 or custom tokens?
5. [ ] Components use correct variants and imports?