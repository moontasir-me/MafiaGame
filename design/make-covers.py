"""Draws the ten home-page tile pictures in one style.
Every cover: 640x420, a deep colour, a faint dot texture, a soft halo and one flat emblem in the middle on a ground shadow.
Run from the repo root:  python3 design/make-covers.py"""

CREAM, INK = '#fff4dc', '#1c1a17'

def cover(bg, bg2, accent, emblem):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
<defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{bg}"/><stop offset="1" stop-color="{bg2}"/></linearGradient>
<radialGradient id="h" cx=".5" cy=".46" r=".5"><stop offset="0" stop-color="{accent}" stop-opacity=".32"/><stop offset="1" stop-color="{accent}" stop-opacity="0"/></radialGradient>
<pattern id="p" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.4" fill="#fff" fill-opacity=".07"/></pattern></defs>
<rect width="640" height="420" fill="url(#b)"/><rect width="640" height="420" fill="url(#p)"/><circle cx="320" cy="196" r="190" fill="url(#h)"/>
<ellipse cx="320" cy="346" rx="150" ry="16" fill="#000" fill-opacity=".22"/>
<g transform="translate(320 200)">{emblem}</g></svg>'''

E = {}
# Mafia: fedora over a masked face
E['mafia'] = f'''<path d="M-120 34c40 18 200 18 240 0l-14 22c-60 20-152 20-212 0Z" fill="{INK}"/><path d="M-74 30c4-60 18-96 74-96s70 36 74 96c-40 10-108 10-148 0Z" fill="{INK}"/><path d="M-76 8c48 10 104 10 152 0v14c-48 10-104 10-152 0Z" fill="#c43a2f"/>
<path d="M-80 70c30-12 130-12 160 0l-10 46c-18 30-46 40-70 22-24 18-52 8-70-22Z" fill="{CREAM}"/><path d="M-58 86l40 6-20 18Zm116 0-40 6 20 18Z" fill="{INK}"/>'''
# Spy: magnifying glass over a question mark
E['spy'] = f'''<circle cx="-20" cy="-14" r="92" fill="{CREAM}" fill-opacity=".12" stroke="{CREAM}" stroke-width="22"/><path d="M50 56l70 70" stroke="#e8c26b" stroke-width="30" stroke-linecap="round"/>
<path d="M-48 -40c0-34 56-34 56 0 0 22-28 22-28 48" fill="none" stroke="#e8c26b" stroke-width="18" stroke-linecap="round"/><circle cx="-20" cy="40" r="10" fill="#e8c26b"/>'''
# Kalidas: palm-leaf manuscript and stylus under a monsoon cloud (মেঘদূত)
E['kalidas'] = '''<g transform="translate(-196 -126) scale(.62)" fill="#fff4dc" fill-opacity=".85"><path d="M-40 10a28 28 0 0 1 26-30 38 38 0 0 1 70-4 30 30 0 0 1 54 16 22 22 0 0 1-2 44H-24a24 24 0 0 1-16-26Z"/></g><g transform="translate(150 -120) scale(.5)" fill="#fff4dc" fill-opacity=".6"><path d="M-40 10a28 28 0 0 1 26-30 38 38 0 0 1 70-4 30 30 0 0 1 54 16 22 22 0 0 1-2 44H-24a24 24 0 0 1-16-26Z"/></g><g transform="translate(0 -6) scale(.92)"><g id="poet">
<path d="M-118 150c4-64 50-96 118-96s114 32 118 96Z" fill="#e8892c"/>
<path d="M-118 150c4-64 50-96 118-96 -40 30-56 70-58 96Z" fill="#c96a17"/>
<path d="M-26 58h52l-6 26h-40Z" fill="#d9a06f"/>
<ellipse cx="0" cy="-10" rx="64" ry="72" fill="#e5b483"/>
<ellipse cx="-62" cy="-6" rx="11" ry="16" fill="#d9a06f"/><ellipse cx="62" cy="-6" rx="11" ry="16" fill="#d9a06f"/>
<circle cx="-64" cy="12" r="5" fill="#f0b64b"/><circle cx="64" cy="12" r="5" fill="#f0b64b"/>
<path d="M-64 -30c0-50 28-78 64-78s64 28 64 78c-10-26-32-40-64-40s-54 14-64 40Z" fill="#2b2118"/>
<ellipse cx="0" cy="-112" rx="26" ry="22" fill="#2b2118"/><rect x="-28" y="-104" width="56" height="9" rx="4" fill="#f0b64b"/>
<path d="M-6 -66h12v22h-12Z" fill="#c62f2f"/><path d="M-12 -70h24" stroke="#fff4dc" stroke-width="4" stroke-linecap="round"/>
<path d="M-36 -18c6-6 16-6 22 0M14 -18c6-6 16-6 22 0" stroke="#2b2118" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M-40 -36c8-4 18-4 26 0M14 -36c8-4 18-4 26 0" stroke="#2b2118" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M-4 -12c-4 12-4 18 4 20" stroke="#b97e4b" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M-50 20c6 46 32 62 50 62s44-16 50-62c-14 14-32 18-50 18s-36-4-50-18Z" fill="#2b2118"/>
<path d="M-18 26c10 8 26 8 36 0" stroke="#e5b483" stroke-width="5" fill="none" stroke-linecap="round"/>
<circle cx="-34" cy="6" r="8" fill="#e8892c" fill-opacity=".35"/><circle cx="34" cy="6" r="8" fill="#e8892c" fill-opacity=".35"/>
<g transform="translate(-6 118) rotate(-8)"><rect x="-96" y="-16" width="192" height="32" rx="9" fill="#e3b866"/><path d="M-84 -6h160M-84 4h120" stroke="#8a5a1e" stroke-width="3.5" stroke-linecap="round" opacity=".75"/><circle cx="-88" cy="0" r="4" fill="#8a5a1e"/><circle cx="88" cy="0" r="4" fill="#8a5a1e"/></g>
<ellipse cx="72" cy="112" rx="16" ry="12" fill="#e5b483"/><path d="M66 118 112 52" stroke="#fff4dc" stroke-width="7" stroke-linecap="round"/><path d="M108 58l9-14-1 16Z" fill="#f0b64b"/>
</g></g>'''
# Pen fight: two crossed pens
E['pen'] = f'''<g transform="rotate(-28)"><rect x="-150" y="-12" width="250" height="24" rx="12" fill="{CREAM}"/><rect x="100" y="-12" width="44" height="24" rx="6" fill="#2a64c9"/><path d="M-150 -12-182 0-150 12Z" fill="#e3b341"/></g>
<g transform="rotate(28)"><rect x="-100" y="-12" width="250" height="24" rx="12" fill="{CREAM}"/><rect x="-144" y="-12" width="44" height="24" rx="6" fill="#c43a2f"/><path d="M150 -12 182 0 150 12Z" fill="#e3b341"/></g>
<circle cx="0" cy="0" r="16" fill="#e3b341"/>'''
# Fibonacci: golden rectangles and spiral
E['fib'] = f'''<g transform="translate(-150 -94) scale(3.36)" fill="none" stroke="{CREAM}" stroke-opacity=".35" stroke-width="1.2"><rect width="55" height="55"/><rect x="55" width="34" height="34"/><rect x="68" y="34" width="21" height="21"/><rect x="55" y="42" width="13" height="13"/><rect x="55" y="34" width="8" height="8"/></g>
<path transform="translate(-150 -94) scale(3.36)" d="M0 55A55 55 0 0 1 55 0A34 34 0 0 1 89 34A21 21 0 0 1 68 55A13 13 0 0 1 55 42A8 8 0 0 1 63 34" fill="none" stroke="#f3c55a" stroke-width="4" stroke-linecap="round"/>'''
# Chaturanga: a knight on a small checkered plinth
E['shotoronji'] = f'''<g transform="translate(-96 60)">{''.join(f'<rect x="{c*48}" y="{r*24}" width="48" height="24" fill="{"#e6d2a2" if (r+c)%2==0 else "#7a4a28"}"/>' for r in range(2) for c in range(4))}</g>
<path d="M-56 56c0-40 18-62 40-80l-30-10-20 12-18-18 40-50 8-30 12 18c48 0 84 34 84 104v54Z" fill="{CREAM}"/><circle cx="2" cy="-74" r="7" fill="{INK}"/><path d="M-62 56h132" stroke="#d6b47a" stroke-width="10" stroke-linecap="round"/>'''
# চোর ডাকাত পুলিশ বাবু: four folded chits
E['chor'] = ''.join(f'''<g transform="translate({x} {y}) rotate({a})"><rect x="-44" y="-58" width="88" height="116" rx="6" fill="{CREAM}"/><path d="M-30 -30h60M-30 -10h60M-30 10h40" stroke="{col}" stroke-width="6" stroke-linecap="round"/><path d="M-44 20h88" stroke="#0002" stroke-width="3"/></g>''' for x, y, a, col in [(-132, 8, -12, '#b8860b'), (-44, -6, -3, '#1f4e8c'), (44, -2, 5, '#8b1e1e'), (132, 10, 13, '#3d3d3d')])
# Ludo: a die on the four colour quarters
E['ludo'] = f'''<g transform="rotate(45)"><rect x="-96" y="-96" width="96" height="96" fill="#d63a3a"/><rect x="0" y="-96" width="96" height="96" fill="#2e9b57"/><rect x="0" y="0" width="96" height="96" fill="#f2b705"/><rect x="-96" y="0" width="96" height="96" fill="#2f6fd1"/></g>
<rect x="-52" y="-52" width="104" height="104" rx="22" fill="{CREAM}"/><g fill="{INK}"><circle cx="-24" cy="-24" r="9"/><circle cx="24" cy="-24" r="9"/><circle cx="0" cy="0" r="9"/><circle cx="-24" cy="24" r="9"/><circle cx="24" cy="24" r="9"/></g>'''
# Carrom: board corner with pockets, coins and the striker
E['carrom'] = f'''<rect x="-128" y="-128" width="256" height="256" rx="10" fill="#ecd3a0" transform="scale(1 .62) rotate(45)"/><g transform="scale(1 .62)"><circle cx="0" cy="0" r="56" fill="none" stroke="#5a2f14" stroke-width="5"/></g>
<circle cx="0" cy="-2" r="14" fill="#c43a2f"/><g fill="{CREAM}" stroke="#bda57a" stroke-width="2"><circle cx="-30" cy="-6" r="13"/><circle cx="28" cy="10" r="13"/><circle cx="6" cy="-30" r="13"/></g><g fill="{INK}"><circle cx="30" cy="-18" r="13"/><circle cx="-26" cy="20" r="13"/><circle cx="-4" cy="28" r="13"/></g>
<circle cx="0" cy="96" r="20" fill="#eef2ff" stroke="#2f5fbf" stroke-width="5"/>'''
# জায়গা দখল: dots with two claimed boxes
E['dots'] = ''.join(f'<circle cx="{-105+c*70}" cy="{-105+r*70}" r="9" fill="{CREAM}"/>' for r in range(4) for c in range(4)) + f'''<rect x="-105" y="-105" width="70" height="70" fill="#5b8cff" fill-opacity=".45"/><rect x="-35" y="-35" width="70" height="70" fill="#ff6b5b" fill-opacity=".45"/>
<path d="M-105 -105h70v70h-70Z" fill="none" stroke="#8fb0ff" stroke-width="8" stroke-linejoin="round"/><path d="M-35 -35h70v70h-70Z" fill="none" stroke="#ff8a7a" stroke-width="8" stroke-linejoin="round"/><path d="M35 35h70M-105 35v70" stroke="{CREAM}" stroke-width="8" stroke-linecap="round" opacity=".7"/>'''

PALETTE = {
    'mafia': ('#4a1c1f', '#24100f', '#d6a14a'), 'spy': ('#22344a', '#111b27', '#e8c26b'), 'kalidas': ('#2f2a5c', '#17142e', '#f0b64b'),
    'pen': ('#2c4f43', '#152a23', '#e3b341'), 'fib': ('#174b47', '#0b2928', '#f3c55a'), 'shotoronji': ('#4a2614', '#21110a', '#d6b47a'),
    'chor': ('#a8432c', '#5e2214', '#ffd27a'), 'ludo': ('#263a7a', '#121c40', '#f2b705'), 'carrom': ('#6b3c1a', '#2b1a0e', '#ecd3a0'), 'dots': ('#2a3a6e', '#141c38', '#8fb0ff'),
}
for key, (a, b, c) in PALETTE.items():
    open(f'www/assets/{key}/cover.svg', 'w').write(cover(a, b, c, E[key]))
print('wrote', len(PALETTE), 'covers')
