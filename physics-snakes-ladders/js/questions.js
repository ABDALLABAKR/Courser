/* Grade 10 Physics question bank — based on the course book
 *   Chapter 2: Strength of Solids (Sections 2-1 and 2-2, Chapter 2 Review)
 *   Chapter 3, Section 3-1: Fluids and Buoyant Force
 * All multiple choice (4 options). The game shuffles the options every time.
 * Fields: id, c (topic 1-8), d (E/M/C), q (question), o (options), a (index of correct option), x (explanation).
 * Symbols follow the book: T tension, σ stress, ε strain, E Young's modulus, l − l₀ elongation,
 * Mm molar mass, Vm molar volume, NA = 6.02 × 10²³ mol⁻¹, g = 9.81 m/s².
 */
window.BANK_TOPICS = {
  1: { name: 'Phases of Matter', icon: '🧊' },
  2: { name: 'Moles & Molecular Quantities', icon: '⚛️' },
  3: { name: 'Interatomic Forces & Bonds', icon: '🔗' },
  4: { name: 'Solids, Rigidity & Elasticity', icon: '🧱' },
  5: { name: 'Tension, Stress & Strain', icon: '🪢' },
  6: { name: 'Young’s Modulus', icon: '📏' },
  7: { name: 'Fluids & Density', icon: '💧' },
  8: { name: 'Buoyant Force & Archimedes', icon: '🚢' }
};

window.DEFAULT_QUESTIONS = (function () {
  const Q = [
    // ───────── 1. Phases of Matter (Section 2-1) ─────────
    { c: 1, d: 'E', q: 'How many phases (states) of matter are there?', o: ['2', '3', '4', '5'], a: 2, x: 'Solid, liquid, gas and plasma.' },
    { c: 1, d: 'E', q: 'Which phase of matter is reached at very high temperatures?', o: ['Solid', 'Liquid', 'Gas', 'Plasma'], a: 3, x: 'Plasma is a phase of matter achieved at very high temperatures.' },
    { c: 1, d: 'E', q: 'Plasma consists of:', o: ['Atomic nuclei and electrons moving at very high speed', 'Neutral atoms at rest', 'Molecules locked in a fixed pattern', 'Water vapour only'], a: 0, x: 'In plasma, atoms are split into nuclei and electrons that move very fast.' },
    { c: 1, d: 'E', q: 'Which of these is an example of plasma?', o: ['Ice', 'Steam', 'Lightning', 'Sand'], a: 2, x: 'Lightning, the aurora and the stars are examples of plasma.' },
    { c: 1, d: 'E', q: 'Which phase has a fixed shape AND a fixed volume?', o: ['Solid', 'Liquid', 'Gas', 'Plasma'], a: 0, x: 'Solid particles are closely bound, so solids keep their shape and volume.' },
    { c: 1, d: 'M', q: 'Which phase has a fixed volume but takes the shape of its container?', o: ['Solid', 'Liquid', 'Gas', 'Plasma'], a: 1, x: 'Liquid particles slide over each other, so the shape changes but the volume does not.' },
    { c: 1, d: 'M', q: 'Which phase can be compressed most easily?', o: ['Solid', 'Liquid', 'Gas', 'They are all equally easy'], a: 2, x: 'Gas particles are far apart (low density), so a gas can be compressed easily.' },
    { c: 1, d: 'M', q: 'How can a material be changed from one phase into another?', o: ['By changing its mass', 'By changing its electric charge', 'By giving it energy — changing its temperature and pressure', 'By changing its colour'], a: 2, x: 'Phase changes happen by exchanging mechanical and thermal energy (temperature and pressure).' },
    { c: 1, d: 'M', q: 'Why is it difficult to compress a solid?', o: ['Its particles are far apart', 'Its particles are closely packed together', 'It has no particles', 'It has a very low density'], a: 1, x: 'The closely packed particles resist being pushed closer.' },
    { c: 1, d: 'M', q: 'Why is most of the matter in the universe in the plasma phase?', o: ['Most of the mass is in stars, which are at very high temperatures', 'Planets are very cold', 'Space is full of liquid', 'Gases turn into solids in space'], a: 0, x: 'Stars contain most of the mass in the universe and are hot enough to form plasma.' },
    { c: 1, d: 'C', q: 'Arrange the three common phases from HIGHEST to LOWEST density (in general).', o: ['Gas > liquid > solid', 'Solid > liquid > gas', 'Liquid > solid > gas', 'All have the same density'], a: 1, x: 'Particles are most tightly packed in solids and furthest apart in gases.' },
    { c: 1, d: 'C', q: 'In which phase do the molecules have the most organised (ordered) positions?', o: ['Gas', 'Liquid', 'Solid', 'Plasma'], a: 2, x: 'In solids, atoms are arranged in regular arrays around fixed positions.' },
    { c: 1, d: 'C', q: 'Why does a liquid not fill its whole container, while a gas does?', o: ['A liquid has a greater density — its particles stay close together', 'A liquid has no mass', 'Gas particles are heavier', 'A liquid can be compressed easily'], a: 0, x: 'Gas particles move freely and fill all the space; liquid particles stay close together.' },

    // ───────── 2. Moles & Molecular Quantities (Section 2-1) ─────────
    { c: 2, d: 'E', q: 'What is the value of the Avogadro constant (NA)?', o: ['6.02 × 10²³ mol⁻¹', '1.66 × 10⁻²⁷ mol⁻¹', '9.81 mol⁻¹', '3.0 × 10⁸ mol⁻¹'], a: 0, x: 'NA = 6.02 × 10²³ mol⁻¹, the number of atoms in 0.012 kg of carbon-12.' },
    { c: 2, d: 'E', q: 'What is the unit of molar mass (Mm)?', o: ['kg', 'kg/mol', 'mol/kg', 'm³/mol'], a: 1, x: 'Molar mass is mass per mole: kg mol⁻¹.' },
    { c: 2, d: 'E', q: 'What is the unit of molar volume (Vm)?', o: ['m³', 'kg/m³', 'm³/mol', 'mol/m³'], a: 2, x: 'Molar volume is volume per mole: m³ mol⁻¹.' },
    { c: 2, d: 'E', q: 'One mole contains as many entities as there are atoms in:', o: ['1 kg of hydrogen', '0.012 kg of carbon-12', '1 g of oxygen', '1 m³ of air'], a: 1, x: 'This is the definition of the mole.' },
    { c: 2, d: 'M', q: 'One atomic mass unit (1 u) is equal to:', o: ['1.66 × 10⁻²⁷ kg', '6.02 × 10²³ kg', '1 kg', '0.012 kg'], a: 0, x: '1 u is one-twelfth of the mass of a carbon-12 atom = 1.66 × 10⁻²⁷ kg.' },
    { c: 2, d: 'M', q: 'Dividing molar mass by molar volume (Mm ÷ Vm) gives:', o: ['The mass of one atom', 'The density', 'Avogadro’s number', 'The volume of one atom'], a: 1, x: 'ρ = Mm / Vm, in kg/m³.' },
    { c: 2, d: 'M', q: 'Which equation gives the mass of ONE atom (M)?', o: ['M = Mm × NA', 'M = Mm ÷ NA', 'M = NA ÷ Mm', 'M = Vm ÷ NA'], a: 1, x: 'Mass of one atom = molar mass ÷ Avogadro’s number.' },
    { c: 2, d: 'M', q: 'Which equation gives the volume of ONE atom (V)?', o: ['V = Vm ÷ NA', 'V = Vm × NA', 'V = Mm ÷ NA', 'V = ρ ÷ NA'], a: 0, x: 'Volume of one atom = molar volume ÷ Avogadro’s number.' },
    { c: 2, d: 'M', q: 'The distance between two neighbouring atoms (l) is found from the volume of one atom (V) using:', o: ['l = V²', 'l = ∛V (cube root)', 'l = √V (square root)', 'l = V ÷ NA'], a: 1, x: 'l = ∛V — each atom is treated as occupying a small cube.' },
    { c: 2, d: 'M', q: 'Copper has Mm = 0.064 kg/mol and density 8000 kg/m³. What is its molar volume?', o: ['8.0 × 10⁻⁶ m³/mol', '512 m³/mol', '1.25 × 10⁵ m³/mol', '8.0 × 10⁻³ m³/mol'], a: 0, x: 'Vm = Mm ÷ ρ = 0.064 ÷ 8000 = 8.0 × 10⁻⁶ m³/mol.' },
    { c: 2, d: 'C', q: 'Sodium has Mm = 23 × 10⁻³ kg/mol and Vm = 23.78 × 10⁻⁶ m³/mol. What is its density?', o: ['About 9.7 kg/m³', 'About 967 kg/m³', 'About 1.03 × 10⁻³ kg/m³', 'About 5.5 × 10⁻⁷ kg/m³'], a: 1, x: 'ρ = Mm ÷ Vm = 23 × 10⁻³ ÷ 23.78 × 10⁻⁶ ≈ 967 kg/m³.' },
    { c: 2, d: 'C', q: 'What is the mass of ONE sodium atom? (Mm = 23 × 10⁻³ kg/mol, NA = 6.02 × 10²³ mol⁻¹)', o: ['3.82 × 10⁻²⁶ kg', '1.38 × 10²² kg', '3.82 × 10⁻²³ kg', '2.6 × 10⁻²⁵ kg'], a: 0, x: 'M = Mm ÷ NA = 23 × 10⁻³ ÷ 6.02 × 10²³ ≈ 3.82 × 10⁻²⁶ kg.' },
    { c: 2, d: 'C', q: 'For copper, Vm = 8.0 × 10⁻⁶ m³/mol. Estimate the distance between two copper atoms. (NA = 6.02 × 10²³ mol⁻¹)', o: ['1.33 × 10⁻²⁹ m', '2.37 × 10⁻¹⁰ m', '3.65 × 10⁻¹⁵ m', '2.0 × 10⁻³ m'], a: 1, x: 'V = Vm ÷ NA = 1.33 × 10⁻²⁹ m³, then l = ∛V ≈ 2.37 × 10⁻¹⁰ m.' },
    { c: 2, d: 'C', q: 'Silicon has Mm = 28.0855 × 10⁻³ kg/mol and Vm = 1.206 × 10⁻⁵ m³/mol. Estimate its density.', o: ['About 2.33 × 10³ kg/m³', 'About 4.29 × 10⁻⁴ kg/m³', 'About 3.39 × 10⁻⁷ kg/m³', 'About 23.3 kg/m³'], a: 0, x: 'ρ = Mm ÷ Vm = 0.0280855 ÷ 1.206 × 10⁻⁵ ≈ 2.33 × 10³ kg/m³.' },

    // ───────── 3. Interatomic Forces & Bonds (Section 2-1) ─────────
    { c: 3, d: 'E', q: 'What are the three types of bonds between atoms?', o: ['Ionic, covalent and metallic', 'Gravitational, magnetic and nuclear', 'Ionic, gravitational and friction', 'Covalent, nuclear and elastic'], a: 0, x: 'The book lists ionic, covalent and metallic bonding.' },
    { c: 3, d: 'E', q: 'Bonds between atoms are caused by:', o: ['Gravitational forces', 'Electric forces between charges', 'Friction', 'Air pressure'], a: 1, x: 'A bond is an attraction due to the interaction of positive and negative charges.' },
    { c: 3, d: 'E', q: 'In which type of bond does one atom GIVE electrons to another atom?', o: ['Covalent bond', 'Metallic bond', 'Ionic bond', 'No bond does this'], a: 2, x: 'In ionic bonding the donor becomes a positive ion and the receiver a negative ion.' },
    { c: 3, d: 'E', q: 'Crystals of sodium chloride (NaCl) are held together by:', o: ['Ionic bonds', 'Covalent bonds', 'Metallic bonds', 'Gravitational bonds'], a: 0, x: 'Sodium gives an electron to chlorine: Na⁺ and Cl⁻ ions attract.' },
    { c: 3, d: 'M', q: 'In a covalent bond, atoms:', o: ['Give away all their electrons', 'Share electrons', 'Share protons', 'Lose their nuclei'], a: 1, x: 'Shared electrons act as a bond between the atoms.' },
    { c: 3, d: 'M', q: 'The oxygen molecule (O₂) is held together by:', o: ['An ionic bond', 'A covalent bond', 'A metallic bond', 'Gravity'], a: 1, x: 'Each O atom shares two electrons to complete its outer shell.' },
    { c: 3, d: 'M', q: 'In metallic bonding, the metal ions are held in place by:', o: ['Shared protons', 'The electric force between positive ions and free electrons', 'Gravity', 'Magnetic poles'], a: 1, x: 'Metal atoms lose their outer electrons, which move freely among the positive ions.' },
    { c: 3, d: 'M', q: 'Which type of bond exists among LEAD atoms?', o: ['Ionic', 'Covalent', 'Metallic', 'No bond'], a: 2, x: 'Lead is a metal, so its atoms are held by metallic bonding.' },
    { c: 3, d: 'M', q: 'When the distance between two atoms is LESS than the equilibrium distance (r < r₀), the force between them is:', o: ['Attractive', 'Repulsive', 'Zero', 'Gravitational only'], a: 1, x: 'r < r₀ → repulsive force.' },
    { c: 3, d: 'M', q: 'When the distance between two atoms equals the equilibrium distance (r = r₀), the force between them is:', o: ['Maximum attraction', 'Maximum repulsion', 'Zero — the atoms are in equilibrium', 'Infinite'], a: 2, x: 'At r = r₀ the force is zero and the atoms are in equilibrium.' },
    { c: 3, d: 'C', q: 'The equilibrium distance between two atoms is 1.2 × 10⁻¹⁰ m. What is the force when they are 1.4 × 10⁻¹⁰ m apart?', o: ['Repulsive', 'Attractive', 'Zero', 'It cannot be known'], a: 1, x: 'r > r₀, so the force is attractive.' },
    { c: 3, d: 'C', q: 'The equilibrium distance between two atoms is 1.2 × 10⁻¹⁰ m. What is the force when they are 1.0 × 10⁻¹⁰ m apart?', o: ['Attractive', 'Zero', 'Repulsive', 'It cannot be known'], a: 2, x: 'r < r₀, so the force is repulsive.' },
    { c: 3, d: 'C', q: 'Why is the interaction between helium (or neon) atoms very weak?', o: ['They have full outer electron shells', 'They are very heavy', 'They carry a large charge', 'They are metals'], a: 0, x: 'With full outer shells they cannot attract each other strongly.' },
    { c: 3, d: 'C', q: 'At very small distances, the repulsion between atoms comes from their electron clouds. It is due to the electrons’:', o: ['Small size', 'Electric charge', 'Mass', 'Colour'], a: 1, x: 'Like (negative) charges repel each other.' },
    { c: 3, d: 'C', q: 'Silicon has atomic number 14. How many electrons are in its outer shell, and what bond holds silicon atoms together?', o: ['4 electrons — covalent bond', '2 electrons — ionic bond', '8 electrons — metallic bond', '4 electrons — ionic bond'], a: 0, x: 'Silicon is 2, 8, 4: it shares its 4 outer electrons in covalent bonds.' },

    // ───────── 4. Solids, Rigidity & Elasticity (Section 2-2) ─────────
    { c: 4, d: 'E', q: 'A rigid body is a body that:', o: ['Changes shape easily', 'Preserves its shape when forces are applied on it', 'Flows like a liquid', 'Has no mass'], a: 1, x: 'This is the book’s definition of a rigid body.' },
    { c: 4, d: 'E', q: 'Elasticity is the ability of a body to:', o: ['Flow', 'Restore its original shape after being deformed', 'Conduct heat', 'Be magnetised'], a: 1, x: 'An elastic body returns to its shape when the force is removed.' },
    { c: 4, d: 'E', q: 'Which of these is an ELASTIC body?', o: ['Clay', 'Slime', 'A tennis ball', 'Dough'], a: 2, x: 'Springs, tennis balls and rubber are elastic.' },
    { c: 4, d: 'E', q: 'Which of these is an INELASTIC body?', o: ['A spring', 'A rubber band', 'A tennis ball', 'Clay'], a: 3, x: 'Clay and slime keep the new shape — the change is permanent.' },
    { c: 4, d: 'E', q: 'Which statement is correct?', o: ['All solids are rigid', 'All rigid bodies are solids, but not all solids are rigid', 'Liquids are rigid bodies', 'Gases are rigid bodies'], a: 1, x: 'Rigidity is a property of some solids only.' },
    { c: 4, d: 'M', q: 'Why do solids have a definite shape?', o: ['Their particles move freely', 'Their atoms are arranged regularly and keep fixed positions', 'Their particles are far apart', 'There are no forces between their particles'], a: 1, x: 'The regular arrangement of atoms keeps the shape fixed.' },
    { c: 4, d: 'M', q: 'On the atomic scale, the atoms in a solid:', o: ['Move freely from place to place', 'Vibrate around their equilibrium positions', 'Are completely at rest', 'Move as fast as in a plasma'], a: 1, x: 'Atoms in solids are arranged in regular arrays and vibrate around equilibrium positions.' },
    { c: 4, d: 'M', q: 'Which factors influence how molecules are arranged in a material?', o: ['Shape of the molecules, inter-atomic forces and temperature', 'Colour, smell and taste', 'Only the mass', 'Only the volume'], a: 0, x: 'These three factors are listed in Section 2-2.' },
    { c: 4, d: 'M', q: 'The density of a solid depends on:', o: ['Its colour', 'How closely its molecules are packed', 'Its electric charge', 'How fast it moves'], a: 1, x: 'Closer packing means more mass in the same volume.' },
    { c: 4, d: 'M', q: 'The change in shape of an ELASTIC body is:', o: ['Permanent', 'Temporary', 'Impossible', 'Always destructive'], a: 1, x: 'An elastic body goes back to its original shape.' },
    { c: 4, d: 'C', q: 'Which of these is a RIGID solid?', o: ['A sponge', 'A plastic sheet', 'A railway track', 'A rubber band'], a: 2, x: 'Railway tracks and bricks preserve their shape; sponges and plastic sheets deform.' },
    { c: 4, d: 'C', q: 'Two wooden blocks are connected by an elastic spring. This system is:', o: ['Solid and rigid', 'Solid but not rigid', 'Neither solid nor rigid — its parts can move relative to each other', 'Rigid but not solid'], a: 2, x: 'It is made of separate parts, and the spring lets the blocks move.' },
    { c: 4, d: 'C', q: 'Two masses are connected by a light rod of fixed length. Is this a rigid body?', o: ['Yes — the distance between the masses cannot change', 'No — the masses can move apart', 'Only if the masses are equal', 'Only in a vacuum'], a: 0, x: 'A rigid body keeps the distances between its parts fixed.' },
    { c: 4, d: 'C', q: 'You press a ball and then a piece of dough against a wall. What happens?', o: ['Both keep their new shape', 'The ball returns to its shape (elastic); the dough stays deformed (inelastic)', 'The dough returns to its shape; the ball stays deformed', 'Neither changes shape'], a: 1, x: 'The ball is elastic; the dough is inelastic.' },
    { c: 4, d: 'C', q: 'A large force is applied to a rigid body. What happens on the atomic scale?', o: ['The particles come closer and repulsive forces between them help keep the shape', 'The particles disappear', 'The particles become plasma', 'The bonds become ionic'], a: 0, x: 'Pushing particles closer than r₀ creates repulsive forces that resist the change.' },

    // ───────── 5. Tension, Stress & Strain (Section 2-2) ─────────
    { c: 5, d: 'E', q: 'Tension (T) is the force that arises in a body while it is:', o: ['Stretched or compressed', 'Heated', 'Floating', 'At rest on a table'], a: 0, x: 'This is the book’s definition of tension.' },
    { c: 5, d: 'E', q: 'Stress is defined as:', o: ['The force applied on a unit area of a cross section', 'Elongation ÷ initial length', 'Mass ÷ volume', 'Force × distance'], a: 0, x: 'σ = T ÷ A.' },
    { c: 5, d: 'E', q: 'What is the unit of stress?', o: ['N', 'N/m² (pascal)', 'm', 'It has no unit'], a: 1, x: 'σ = T/A, so the unit is N/m² = Pa.' },
    { c: 5, d: 'E', q: 'Strain is defined as:', o: ['Force ÷ area', 'The ratio of elongation to initial length', 'Mass ÷ volume', 'Tension × length'], a: 1, x: 'ε = (l − l₀) ÷ l₀.' },
    { c: 5, d: 'E', q: 'What is the unit of strain?', o: ['N/m²', 'Pa', 'm', 'It has no unit — it is a ratio'], a: 3, x: 'Strain is length ÷ length, so it is unitless.' },
    { c: 5, d: 'M', q: 'Which equation is Hooke’s law?', o: ['T = k(l − l₀)', 'ρ = m ÷ V', 'σ = l ÷ l₀', 'E = T × A'], a: 0, x: 'The tension in a spring is directly proportional to its elongation.' },
    { c: 5, d: 'M', q: 'Stress depends on:', o: ['The tension and the cross-sectional area', 'The length only', 'The mass and the volume', 'The temperature only'], a: 0, x: 'σ = T ÷ A.' },
    { c: 5, d: 'M', q: 'When the applied force is PERPENDICULAR to the cross section of a wire, the stress is called:', o: ['Shear stress', 'Tensile or compressive stress', 'Buoyant stress', 'Density'], a: 1, x: 'Shear stress is when the force is along (tangent to) the cross section.' },
    { c: 5, d: 'M', q: 'In SHEAR stress, the applied force is:', o: ['Perpendicular to the cross section', 'Tangent (parallel) to the cross section', 'Always upward', 'Zero'], a: 1, x: 'Shear stress acts in the tangent direction of the cross section.' },
    { c: 5, d: 'M', q: 'A wire of length 0.4 m is compressed by 0.05 m. What is the strain?', o: ['0.125', '8', '0.02', '0.45'], a: 0, x: 'ε = 0.05 ÷ 0.4 = 0.125 (no unit).' },
    { c: 5, d: 'M', q: 'A wire is under a stress of 2 × 10⁷ N/m². Its cross-sectional area is 1.5 × 10⁻⁶ m². What force causes this stress?', o: ['3 N', '30 N', '300 N', '1.33 × 10¹³ N'], a: 1, x: 'T = σ × A = 2 × 10⁷ × 1.5 × 10⁻⁶ = 30 N.' },
    { c: 5, d: 'M', q: 'Which factors affect the elongation of a metal wire under tension?', o: ['Tension, radius of the cross section, length and type of material', 'Colour and temperature only', 'Only the mass of the wire', 'Only the shape of the support'], a: 0, x: 'These four factors are listed in Section 2-2.' },
    { c: 5, d: 'C', q: 'A 5.0 N weight stretches a spring by 450 mm. What is the spring constant k?', o: ['2.25 N/m', 'About 11.1 N/m', '0.09 N/m', '22.2 N/m'], a: 1, x: 'k = T ÷ (l − l₀) = 5.0 ÷ 0.450 ≈ 11.1 N/m.' },
    { c: 5, d: 'C', q: 'The spring has k ≈ 11.1 N/m. What weight would stretch it by only 50 mm?', o: ['About 0.56 N', '5.0 N', '4.5 N', '55 N'], a: 0, x: 'T = k(l − l₀) = 11.1 × 0.050 ≈ 0.56 N.' },
    { c: 5, d: 'C', q: 'Two identical springs (k = 400 N/m each) are connected in SERIES and hold 10 N. What is the elongation?', o: ['0.025 m', '0.05 m', '0.0125 m', '0.1 m'], a: 1, x: '1/k = 1/400 + 1/400 → k = 200 N/m; l − l₀ = 10 ÷ 200 = 0.05 m.' },
    { c: 5, d: 'C', q: 'Two identical springs (k = 400 N/m each) are connected in PARALLEL and hold 10 N. What is the elongation?', o: ['0.05 m', '0.025 m', '0.0125 m', '0.1 m'], a: 2, x: 'k = 400 + 400 = 800 N/m; l − l₀ = 10 ÷ 800 = 0.0125 m.' },
    { c: 5, d: 'C', q: 'What happens to a spring if a large force exceeds its limit of elasticity?', o: ['It returns to its original length', 'It is permanently deformed and cannot return to its initial length', 'It becomes rigid', 'It becomes stronger'], a: 1, x: 'Beyond the elastic limit the deformation becomes permanent.' },

    // ───────── 6. Young’s Modulus (Section 2-2) ─────────
    { c: 6, d: 'E', q: 'Young’s modulus (E) is the ratio of:', o: ['Stress to strain', 'Strain to stress', 'Mass to volume', 'Force to length'], a: 0, x: 'E = σ ÷ ε.' },
    { c: 6, d: 'E', q: 'What is the SI unit of Young’s modulus?', o: ['m', 'N/m² (pascal)', 'It has no unit', 'kg'], a: 1, x: 'Stress (Pa) ÷ strain (no unit) = Pa.' },
    { c: 6, d: 'M', q: 'Which formula gives Young’s modulus?', o: ['E = T l₀ ÷ A(l − l₀)', 'E = A(l − l₀) ÷ T l₀', 'E = T A ÷ l₀', 'E = l₀ ÷ T A'], a: 0, x: 'E = (T/A) ÷ ((l − l₀)/l₀) = T l₀ ÷ A(l − l₀).' },
    { c: 6, d: 'M', q: 'Young’s modulus mainly depends on:', o: ['The type of material', 'The length of the wire', 'The load hung on the wire', 'The colour of the wire'], a: 0, x: 'E is a property of the material itself.' },
    { c: 6, d: 'M', q: 'Two wires of the same material and length carry the same weight. One is thinner. Which elongates more?', o: ['The thinner wire', 'The thicker wire', 'Both elongate equally', 'Neither elongates'], a: 0, x: 'l − l₀ = T l₀ ÷ (E A): a smaller area gives a bigger elongation.' },
    { c: 6, d: 'M', q: 'If a wire’s length is doubled (same material, area and load), its elongation:', o: ['Halves', 'Doubles', 'Stays the same', 'Becomes 4 times bigger'], a: 1, x: 'l − l₀ = T l₀ ÷ (E A) is proportional to l₀.' },
    { c: 6, d: 'M', q: 'In a stress–strain graph, the region where stress is directly proportional to strain is called the:', o: ['Elastic (proportional) limit region', 'Breaking point', 'Buoyant region', 'Plasma region'], a: 0, x: 'Beyond this region the curve is no longer a straight line.' },
    { c: 6, d: 'C', q: 'A material with a LARGER Young’s modulus is:', o: ['Harder to stretch (stiffer)', 'Easier to stretch', 'Always lighter', 'Always a liquid'], a: 0, x: 'A larger E means less strain for the same stress.' },
    { c: 6, d: 'C', q: 'A steel wire (diameter 0.40 mm, length 2.0 m) carries 80 N and stretches 6.4 mm. What is Young’s modulus of steel?', o: ['2.0 × 10¹¹ Pa', '1.0 × 10⁸ Pa', '6.4 × 10⁻³ Pa', '5.0 × 10⁹ Pa'], a: 0, x: 'A = π(2 × 10⁻⁴)² = 1.26 × 10⁻⁷ m²; E = 80 × 2.0 ÷ (1.26 × 10⁻⁷ × 6.4 × 10⁻³) ≈ 2.0 × 10¹¹ Pa.' },
    { c: 6, d: 'C', q: 'What is the cross-sectional area of a wire with a diameter of 1.0 mm?', o: ['7.85 × 10⁻⁷ m²', '3.14 × 10⁻⁶ m²', '1.0 × 10⁻³ m²', '2.5 × 10⁻⁷ m²'], a: 0, x: 'r = 5 × 10⁻⁴ m; A = πr² = 7.85 × 10⁻⁷ m².' },
    { c: 6, d: 'C', q: 'A copper wire 2.3 m long stretches by 0.85 mm. What is the strain?', o: ['3.7 × 10⁻⁴', '2.7 × 10³', '0.85', '1.96 × 10⁻³'], a: 0, x: 'ε = 8.5 × 10⁻⁴ ÷ 2.3 ≈ 3.7 × 10⁻⁴.' },
    { c: 6, d: 'C', q: 'A copper wire (E = 1.1 × 10¹¹ Pa) has a strain of 3.7 × 10⁻⁴. What is the stress?', o: ['About 4.1 × 10⁷ Pa', 'About 3.0 × 10¹⁴ Pa', 'About 3.4 × 10⁻¹⁵ Pa', '1.1 × 10¹¹ Pa'], a: 0, x: 'σ = E × ε = 1.1 × 10¹¹ × 3.7 × 10⁻⁴ ≈ 4.1 × 10⁷ Pa.' },
    { c: 6, d: 'C', q: 'A bronze wire (l₀ = 2.5 m, A = 6.5 × 10⁻⁷ m², E = 2.0 × 10¹¹ Pa) is stretched by a force of 10³ N. What is its elongation?', o: ['About 1.9 × 10⁻² m', 'About 1.9 × 10⁻⁵ m', 'About 5.2 m', 'About 0.19 m'], a: 0, x: 'l − l₀ = T l₀ ÷ (E A) = 1000 × 2.5 ÷ (2.0 × 10¹¹ × 6.5 × 10⁻⁷) ≈ 0.019 m.' },
    { c: 6, d: 'C', q: 'Rod 1: force F, area A, elongation ΔL, length L. Rod 4: force 2F, area A, elongation ΔL, length 2L. How do their Young’s moduli compare?', o: ['E₄ = 4 × E₁', 'E₄ = 2 × E₁', 'E₄ = E₁', 'E₄ = ½ × E₁'], a: 0, x: 'E = T l₀ ÷ A(l − l₀): E₄ = (2F × 2L) ÷ (A ΔL) = 4 FL/(A ΔL) = 4 E₁.' },

    // ───────── 7. Fluids & Density (Section 3-1) ─────────
    { c: 7, d: 'E', q: 'A fluid is:', o: ['A non-solid state of matter whose particles move past each other, like a liquid or a gas', 'Only a liquid', 'Only a solid', 'Any object that is heavy'], a: 0, x: 'Both liquids and gases are fluids.' },
    { c: 7, d: 'E', q: 'What are the two properties of fluids?', o: ['They can flow and they can change shape', 'They have a fixed shape and cannot flow', 'They are always hot and light', 'They have no mass and no volume'], a: 0, x: 'Fluids flow and alter their shape.' },
    { c: 7, d: 'E', q: 'Why are solids NOT considered fluids?', o: ['They cannot flow or change their shape', 'They are too heavy', 'They are always cold', 'They contain no atoms'], a: 0, x: 'Fluids must be able to flow.' },
    { c: 7, d: 'E', q: 'Which equation defines mass density?', o: ['ρ = m ÷ V', 'ρ = V ÷ m', 'ρ = m × V', 'ρ = F ÷ A'], a: 0, x: 'Density is mass per unit volume.' },
    { c: 7, d: 'E', q: 'What is the SI unit of density?', o: ['kg/m³', 'N/m²', 'm³/kg', 'kg·m'], a: 0, x: 'ρ = m (kg) ÷ V (m³).' },
    { c: 7, d: 'M', q: 'What is the difference between a liquid and a gas?', o: ['A liquid has a definite volume; a gas does not', 'A gas has a definite volume; a liquid does not', 'Both have a definite shape', 'A liquid cannot flow'], a: 0, x: 'Both flow and take the container’s shape, but only the liquid keeps a fixed volume.' },
    { c: 7, d: 'M', q: 'Which two factors affect the density of a gas?', o: ['Temperature and pressure', 'Colour and smell', 'Container shape only', 'Mass only'], a: 0, x: 'Gases can be compressed or expand, so their density changes.' },
    { c: 7, d: 'M', q: 'Why does pressure NOT change the density of solids and liquids significantly?', o: ['Their atoms are already very close together', 'They have no particles', 'They are always hot', 'They are both gases'], a: 0, x: 'There is little space between the particles to squeeze.' },
    { c: 7, d: 'M', q: 'Why do gases NOT have a definite density?', o: ['They can be compressed or spread out to fill any space', 'They have no mass', 'They are always hot', 'They are solids'], a: 0, x: 'The same mass of gas can fill different volumes.' },
    { c: 7, d: 'M', q: 'Using the book’s density table, which substance is the DENSEST?', o: ['Iron (7.86 × 10³ kg/m³)', 'Mercury (13.6 × 10³ kg/m³)', 'Gold (19.3 × 10³ kg/m³)', 'Sea water (1.025 × 10³ kg/m³)'], a: 2, x: 'Gold has the highest density in the table.' },
    { c: 7, d: 'C', q: 'What is the mass of 2.0 m³ of fresh water? (ρ = 1.00 × 10³ kg/m³)', o: ['500 kg', '2000 kg', '0.002 kg', '1000 kg'], a: 1, x: 'm = ρV = 1000 × 2.0 = 2000 kg.' },
    { c: 7, d: 'C', q: 'A metal block has a volume of 0.50 m³ and a mass of 3930 kg. Which metal is it? (use the book’s table)', o: ['Iron', 'Gold', 'Mercury', 'Ice'], a: 0, x: 'ρ = 3930 ÷ 0.50 = 7860 kg/m³ = iron.' },
    { c: 7, d: 'C', q: 'What volume do 27.2 kg of mercury occupy? (ρ = 13.6 × 10³ kg/m³)', o: ['2.0 × 10⁻³ m³', '370 m³', '0.5 m³', '2.0 m³'], a: 0, x: 'V = m ÷ ρ = 27.2 ÷ 13 600 = 2.0 × 10⁻³ m³.' },

    // ───────── 8. Buoyant Force & Archimedes (Section 3-1) ─────────
    { c: 8, d: 'E', q: 'In which direction does the buoyant force act?', o: ['Downward', 'Upward', 'Sideways', 'It has no direction'], a: 1, x: 'The buoyant force acts upward, opposite to gravity.' },
    { c: 8, d: 'E', q: 'According to Archimedes’ principle, the buoyant force equals:', o: ['The weight of the object', 'The weight of the fluid displaced by the object', 'The volume of the object', 'The density of the fluid'], a: 1, x: 'FB = weight of the displaced fluid.' },
    { c: 8, d: 'E', q: 'Why do things feel lighter under water?', o: ['Their mass decreases', 'The water exerts an upward buoyant force', 'Gravity stops under water', 'Water pulls them down'], a: 1, x: 'The buoyant force reduces the net downward force.' },
    { c: 8, d: 'E', q: 'The weight of an object while it is immersed in a fluid is called its:', o: ['Apparent weight', 'Mass', 'Buoyant force', 'Density'], a: 0, x: 'Apparent weight = Fg − FB for a sinking object.' },
    { c: 8, d: 'M', q: 'An object SINKS in a fluid when:', o: ['Its density is greater than the fluid’s density', 'Its density is less than the fluid’s density', 'Its density equals the fluid’s density', 'It is large'], a: 0, x: 'If ρ₀ > ρf, the weight is greater than the buoyant force.' },
    { c: 8, d: 'M', q: 'For a FLOATING object, the buoyant force is:', o: ['Equal to the object’s weight', 'Zero', 'Twice the object’s weight', 'Less than the object’s weight'], a: 0, x: 'FB = Fg = m₀g for a floating object.' },
    { c: 8, d: 'M', q: 'Mercury has a density of 13.6 × 10³ kg/m³. Which object will SINK in mercury?', o: ['An ice cube', 'An iron bolt', 'A solid gold bead', '5 mL of water'], a: 2, x: 'Only gold (19.3 × 10³ kg/m³) is denser than mercury.' },
    { c: 8, d: 'M', q: 'A piece of metal weighs 50.0 N in air and 36.0 N in water. What is the buoyant force?', o: ['86.0 N', '14.0 N', '36.0 N', '50.0 N'], a: 1, x: 'FB = Fg − F(apparent) = 50.0 − 36.0 = 14.0 N.' },
    { c: 8, d: 'M', q: 'Why don’t ships sink?', o: ['The ship is filled with air, so its average density is less than water and the buoyant force balances its weight', 'Ships are made of wood only', 'Water pulls ships upward by magnetism', 'Ships have no weight'], a: 0, x: 'The hull displaces a large weight of water.' },
    { c: 8, d: 'M', q: 'A fully submerged object has Fg ÷ FB = 3. How does its density compare with the fluid’s density?', o: ['3 times the fluid’s density', '⅓ of the fluid’s density', 'Equal to it', '9 times the fluid’s density'], a: 0, x: 'Fg ÷ FB = ρ₀ ÷ ρf.' },
    { c: 8, d: 'C', q: 'A “gold” crown weighs 7.84 N in air and 6.86 N in water. What is its density, and is it pure gold? (ρ gold = 19.3 × 10³ kg/m³)', o: ['8.0 × 10³ kg/m³ — not pure gold', '19.3 × 10³ kg/m³ — pure gold', '1.0 × 10³ kg/m³ — not gold', '0.98 × 10³ kg/m³ — not gold'], a: 0, x: 'FB = 0.98 N; ρ₀ = Fg ρf ÷ FB = 7.84 × 1000 ÷ 0.98 = 8.0 × 10³ kg/m³.' },
    { c: 8, d: 'C', q: 'A metal weighs 50.0 N in air and 36.0 N in water. What is the density of the metal?', o: ['About 3.6 × 10³ kg/m³', 'About 1.4 × 10³ kg/m³', 'About 7.0 × 10³ kg/m³', 'About 0.72 × 10³ kg/m³'], a: 0, x: 'FB = 14.0 N; ρ₀ = 50.0 × 1000 ÷ 14.0 ≈ 3.6 × 10³ kg/m³.' },
    { c: 8, d: 'C', q: 'The same metal (50.0 N in air, 14.0 N buoyant force in water) weighs 41.0 N in an unknown liquid. What is the liquid’s density?', o: ['About 6.4 × 10² kg/m³', 'About 1.6 × 10³ kg/m³', 'About 8.2 × 10² kg/m³', 'About 9.0 × 10³ kg/m³'], a: 0, x: 'FB in the liquid = 9.0 N; ρf = (9.0 ÷ 14.0) × 1000 ≈ 643 kg/m³.' },
    { c: 8, d: 'C', q: 'A ferry 4.0 m wide and 6.0 m long sinks 4.00 cm deeper when a truck drives on. What is the truck’s weight? (g = 9.81 m/s²)', o: ['About 9.4 × 10³ N', '960 N', 'About 9.4 × 10⁴ N', '96 N'], a: 0, x: 'Displaced water = 4.0 × 6.0 × 0.04 = 0.96 m³ → 960 kg → W = 960 × 9.81 ≈ 9.4 × 10³ N.' },
    { c: 8, d: 'C', q: 'A 2.8 kg air mattress is 2.00 m × 0.500 m × 0.100 m. What extra mass can it support in water before sinking?', o: ['97.2 kg', '100 kg', '102.8 kg', '2.8 kg'], a: 0, x: 'V = 0.100 m³ → it can displace 100 kg of water; 100 − 2.8 = 97.2 kg.' },
    { c: 8, d: 'C', q: 'A helium balloon of radius 0.500 m floats in air (ρ air = 1.29 kg/m³). What is the buoyant force on it? (g = 9.81 m/s²)', o: ['About 6.6 N', 'About 1.0 N', 'About 0.66 N', 'About 66 N'], a: 0, x: 'V = ⁴⁄₃π(0.5)³ = 0.524 m³; FB = ρair V g = 1.29 × 0.524 × 9.81 ≈ 6.6 N.' },
    { c: 8, d: 'C', q: 'Many kayaks are made of materials denser than water. How can they float?', o: ['Their hollow shape holds air, so their average density is less than water', 'The material becomes lighter in water', 'Water is always denser than any plastic', 'Kayaks have no weight'], a: 0, x: 'The kayak displaces a weight of water equal to its own weight.' },
  ];
  return Q.map((q, i) => Object.assign({ id: 'b' + (i + 1), t: 'mcq' }, q));
})();
