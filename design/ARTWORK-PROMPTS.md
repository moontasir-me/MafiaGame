# Shitolpati illustrated game covers

Created with the built-in image generation tool (no API/CLI fallback), 15 November 2026. These are original generated illustrations. Kalidash is a stylized interpretation of the classical poet, with a dedicated portrait asset.

The 12 final covers live at `www/assets/<game>/cover-art.webp` (1200×800) and `cover-tile.webp` (600×400), where `<game>` is mafia, spy, kalidas, pen, fib, shotoronji, chor, ludo, carrom, dots, tinguti or rush. The poet portrait is `www/assets/kalidas/poet-art.webp` (960×960), with `poet-avatar.webp` (240×240) for small placements. Original PNG outputs remain in the image tool's generated-image directory. `artwork-manifest.json` records the source identifiers, export dimensions and byte sizes.

Only format conversion and Lanczos resizing were used for the production WebP exports. There was no compositing, repainting, or cropping of the generated illustrations. Existing SVG assets remain available for saved history entries that reference them. Home tiles have responsive image sources; covers are cached for offline use and served with the WebP MIME type on the web server and both Android asset paths.

## Shared cover prompt

Each cover request used this exact prefix followed by its subject prompt below:

> Use case: illustration-story. Create ONE final premium landscape game-cover illustration, aspect ratio about 3:2, for the Bengali social-game collection Shitolpati. Cohesive art direction: beautiful painterly gouache and polished storybook illustration, tactile materials, rich jewel-tone shadows, warm amber cinematic highlights, elegant depth, fine craft detail, playful but sophisticated. Main subject large and instantly recognizable at thumbnail size, strong readable silhouette, all important objects fully inside central 80% with breathing room. Fill the rectangular canvas with a scene, no border/frame, no app UI, no text, no lettering, no logos, no watermark.

## Subject prompts

### Mafia

A charismatic trio of adult Bangladeshi male conspirators at an intimate tea table, dramatic expressive caricature faces, one round-faced moustached leader in dark suit and fedora, another in an ivory kurta and waistcoat, third exchanging a secret sideways glance; a simple ivory theatrical eye mask and glass of amber tea on the foreground table. Evoke Mafia bluffing and secret identities. Burgundy, midnight navy, antique gold, soft lamplight. Medium close group portrait, inviting and witty, no weapons.

### Spy

Two adult Bangladeshi male detectives as expressive caricatures: a thoughtful bespectacled detective in a warm ochre trench coat holding a large brass magnifying glass, another sly mysterious man in charcoal coat and dark round sunglasses peeking from behind a rainy doorway. A notebook with abstract blank pages, umbrella and warm streetlamp. Evoke a secret-word spy game. Deep ink blue, petrol teal, amber lamplight. Face and magnifying glass prominent, witty charming noir, not scary.

### Kalidash cover

A charming caricature of classical South Asian poet Kalidasa: expressive enlarged head, knowing smiling eyes, dark hair in a topknot, small forehead tilak, ivory dhoti and saffron shawl, reed stylus poised over a palm-leaf manuscript. Seated beneath an elegant banyan branch beside a brass oil lamp and pink lotus, as if inviting friends into a clever riddle. Prominent upper-body portrait and hands, old Bengal atmosphere, warm saffron, forest green, parchment and dusky violet.

### Pen Fight

A dramatic close-up of two exquisitely detailed familiar school ballpoint pens, one glossy cherry-red capped pen and one cobalt-blue capped pen, colliding diagonally on a beautiful worn honey-colored wooden school bench. A small green and cream pen in background. Tiny curls of wood dust and dynamic warm highlights convey a playful pen-fight tabletop game. No visible brand labels. Very tactile polished plastic and brushed wood grain, jewel teal and warm amber accents.

### Fibonacci

An enchanting mathematical puzzle still life: a large elegant golden Fibonacci spiral made of glowing brass ribbon curling above a deep emerald chalkboard-textured surface, with luminous geometric wooden puzzle blocks, a nautilus-like spiral shell, a drafting compass and golden glass timer. Focus on the beautiful spiral and geometric shapes. Intellectual, magical yet sophisticated; emerald, teal, antique gold, ivory. No formulas, no lettering, no numbers.

### Chess / চতুরঙ্গ

A magnificent tactile chessboard on an old Bengali wooden veranda table, elegant hand-carved ivory and dark walnut chess pieces, a prominent heroic knight facing a regal king at the center with the other pieces softly arranged behind. Warm hurricane-lamp light from one side and cool moonlight from the other. Rich mahogany, moss green, ivory, brass. Low three-quarter view, balanced full piece silhouettes, clever strategic mood.

### চোর ডাকাত পুলিশ বাবু

Four folded little ivory khata-paper chits on a warm wooden courtyard table, surrounded by playful expressive caricatures of four adult Bengali male roles: a sly moustached thief peeking from a scarf, a comically bold bandit with a turban, a smart traditional policeman in khaki cap, and a cheerful scholarly babu with round glasses. Friendly storybook ensemble with distinct readable faces; lantern amber, parchment cream, muted coral, indigo. No guns, no text on paper.

### Ludo

A gorgeous classic four-color Ludo board in a handcrafted wooden frame viewed at a slight three-quarter angle, glossy ruby, emerald, golden-yellow and cobalt pawns, two beautifully rounded ivory dice tumbling above the center with properly arranged dark pip dots. Tactile lacquered board, cozy Bengali courtyard table, warm lamplight, appealing rich colors. Main board and pawns fully contained, no lettering or numbers, only dice pips.

### Carrom

A beautifully crafted polished maple carrom board with dark walnut rails and all four circular corner pockets visible, a glossy ivory striker sliding toward a cluster of black and ivory round coins with a single deep-red queen in the center. Low three-quarter tabletop view, very tactile grain and soft chalk dust, warm amber afternoon light, dark teal background accents. Complete rectangular board inside image, sophisticated cozy club-game mood.

### Dots & Boxes

An attractive close-up of an ivory squared Bengali school notebook on a warm wooden desk, a neat grid of dark ink dots connected by vivid cobalt and coral pen strokes, several completed softly blue and coral squares. A beautiful blue ballpoint pen lies diagonally beside the grid, with a small red pencil and brass paper clip. The game Dots and Boxes, clean composition, elegant paper texture, warm cream, indigo and coral; no handwriting, no words, no numbers.

### তিন গুটি

A beautifully tactile traditional Bengali three-piece alignment board: an earthy terracotta square scratched into the courtyard ground, the square has its two diagonals and central horizontal and vertical lines connecting nine points; three smooth ivory river pebbles and three glossy dark-brown tamarind seeds placed on different points. A hand-shaped edge of a clay tea cup and a soft banyan-leaf shadow at side. Top-down three-quarter view, forest green, terracotta, ivory and amber, inviting traditional play.

### Colour Rush

A lavish fan of beautifully illustrated generic color-matching playing cards in ruby red, sunny gold, emerald and cobalt blue, glossy thick card edges, bold simple white circles and clean geometric action symbols such as curved arrows, no lettering and no numerals. Two small stacks and one face-up card on deep emerald felt, cards sweeping dynamically upward as if freshly dealt, premium tabletop-game editorial illustration, warm brass light, crisp readable cards, joyful energy.

## Dedicated Kalidash portrait prompt

Use case: illustration-story. Create a high-quality original caricature portrait asset for a Bengali riddle game called Kohen Kobi Kalidash. Subject: the classical Sanskrit poet Kalidasa, interpreted as a charming wise South Asian male court poet, expressive large head and smiling knowing eyes, dark hair gathered in a topknot, a small traditional forehead tilak, simple ivory dhoti and warm saffron shawl, seated with a palm-leaf manuscript and reed stylus, amused as if about to tell a clever riddle. Mature adult, dignified and playful. Premium painterly editorial caricature, exquisitely shaded face, rich gouache and watercolor textures, warm cinematic lamplight, beautiful restrained jewel tones against muted parchment and deep indigo foliage. Square portrait composition, character fully contained with generous safe margins, face prominent and legible at small sizes, no frame, no text, no letters, no watermark. This is final production artwork for an elegant Bangladeshi social game app, not a UI mockup and not a flat vector icon.
