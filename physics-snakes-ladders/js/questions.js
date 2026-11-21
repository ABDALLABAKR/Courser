/* Grade 10 Physics question bank — 100 questions, 8 categories, 3 difficulty levels.
 * Fields: id, c (category 1-8), d (E/M/C), t (type), q (question),
 *         o (options, for mcq/tf), a (index of correct option),
 *         ans (model answer for open questions), x (explanation).
 * g is stated in every question that needs it.
 */
window.DEFAULT_QUESTIONS = (function () {
  const TF = ['True', 'False'];
  const Q = [
    // ───────── 1. Physical Quantities and Measurement ─────────
    { c: 1, d: 'E', t: 'mcq', q: 'What is the SI base unit of mass?', o: ['gram (g)', 'kilogram (kg)', 'newton (N)', 'pound (lb)'], a: 1, x: 'The kilogram is one of the seven SI base units. The newton is a unit of force.' },
    { c: 1, d: 'E', t: 'mcq', q: 'What is the SI unit of time?', o: ['minute', 'hour', 'second', 'millisecond'], a: 2, x: 'The second (s) is the SI base unit of time.' },
    { c: 1, d: 'E', t: 'mcq', q: 'Which instrument measures the diameter of a thin wire most precisely?', o: ['Metre rule', 'Measuring tape', 'Micrometer screw gauge', 'Measuring cylinder'], a: 2, x: 'A micrometer screw gauge reads to 0.01 mm, much finer than a ruler (1 mm).' },
    { c: 1, d: 'E', t: 'tf', q: 'True or False: The newton (N) is an SI base unit.', o: TF, a: 1, x: 'False. The newton is a derived unit: 1 N = 1 kg·m/s².' },
    { c: 1, d: 'M', t: 'short', q: 'How many significant figures are in the measurement 0.00450 m?', ans: '3 significant figures', x: 'Leading zeros are not significant. The 4, the 5 and the trailing zero after the decimal point are significant.' },
    { c: 1, d: 'M', t: 'num', q: 'Convert 72 km/h into m/s.', ans: '20 m/s', x: '72 km/h × (1000 m ÷ 3600 s) = 20 m/s. (Shortcut: divide by 3.6.)' },
    { c: 1, d: 'M', t: 'mcq', q: 'Which of the following is a DERIVED quantity?', o: ['Length', 'Time', 'Velocity', 'Electric current'], a: 2, x: 'Velocity = displacement ÷ time, so it is derived from base quantities length and time.' },
    { c: 1, d: 'M', t: 'mistake', q: 'Identify the mistake: “The length of the classroom table is 1.5 kg.”', ans: 'The unit is wrong — kg measures mass. Length should be in metres: 1.5 m.', x: 'Every measurement needs the correct unit for its physical quantity.' },
    { c: 1, d: 'M', t: 'mcq', q: 'A typical school vernier caliper can measure to a precision (least count) of:', o: ['1 mm', '0.1 mm', '0.001 mm', '1 cm'], a: 1, x: 'A standard vernier caliper reads to 0.1 mm (0.01 cm). A micrometer reads to 0.01 mm.' },
    { c: 1, d: 'C', t: 'num', q: 'Convert a density of 2.5 g/cm³ into kg/m³.', ans: '2500 kg/m³', x: '1 g/cm³ = 1000 kg/m³, so 2.5 g/cm³ = 2.5 × 1000 = 2500 kg/m³.' },
    { c: 1, d: 'C', t: 'short', q: 'Add these measurements and give the answer to the correct precision: 12.52 cm + 3.1 cm', ans: '15.6 cm', x: '12.52 + 3.1 = 15.62. When adding, round to the fewest decimal places (one decimal place) → 15.6 cm.' },
    { c: 1, d: 'C', t: 'reason', q: 'A ruler cannot measure the thickness of ONE sheet of paper accurately. Using the same ruler, how could you find it more accurately?', ans: 'Measure the thickness of a large stack (e.g. 100 sheets) and divide by the number of sheets.', x: 'Measuring many sheets makes the reading larger, so the ruler’s ±1 mm uncertainty becomes a much smaller percentage error.' },
    { c: 1, d: 'C', t: 'num', q: 'Write 0.000052 m in scientific notation, then express it in micrometres (µm).', ans: '5.2 × 10⁻⁵ m = 52 µm', x: '1 µm = 10⁻⁶ m, so 5.2 × 10⁻⁵ m ÷ 10⁻⁶ = 52 µm.' },

    // ───────── 2. Scalars and Vectors ─────────
    { c: 2, d: 'E', t: 'mcq', q: 'Which of the following is a VECTOR quantity?', o: ['Mass', 'Temperature', 'Displacement', 'Energy'], a: 2, x: 'Displacement has magnitude and direction. The others have magnitude only.' },
    { c: 2, d: 'E', t: 'tf', q: 'True or False: Speed is a vector quantity.', o: TF, a: 1, x: 'False. Speed is a scalar. Velocity (speed in a stated direction) is the vector.' },
    { c: 2, d: 'E', t: 'mcq', q: 'A vector quantity is described by:', o: ['Magnitude only', 'Direction only', 'Both magnitude and direction', 'Neither magnitude nor direction'], a: 2, x: 'Vectors need both a size (magnitude) and a direction.' },
    { c: 2, d: 'E', t: 'tf', q: 'True or False: Temperature has no direction, so it is a scalar quantity.', o: TF, a: 0, x: 'True. Temperature has magnitude only.' },
    { c: 2, d: 'M', t: 'num', q: 'Two forces act on a box: 6 N east and 8 N east. What is the resultant force?', ans: '14 N east', x: 'Forces in the same direction add: 6 + 8 = 14 N east.' },
    { c: 2, d: 'M', t: 'num', q: 'Two forces act on a box: 6 N east and 8 N west. What is the resultant force?', ans: '2 N west', x: 'Opposite forces subtract: 8 − 6 = 2 N, in the direction of the larger force (west).' },
    { c: 2, d: 'M', t: 'num', q: 'Forces of 3 N north and 4 N east act on the same object. What is the magnitude of the resultant force?', ans: '5 N', x: 'The forces are perpendicular, so use Pythagoras: √(3² + 4²) = √25 = 5 N.' },
    { c: 2, d: 'M', t: 'mcq', q: 'Which list contains ONLY scalar quantities?', o: ['Distance, speed, time', 'Displacement, velocity, force', 'Mass, force, energy', 'Acceleration, time, work'], a: 0, x: 'Distance, speed and time have no direction. Displacement, velocity, force and acceleration are vectors.' },
    { c: 2, d: 'M', t: 'mistake', q: 'Identify the mistake: “The car’s VELOCITY is 60 km/h.”', ans: 'No direction is given — that is only a speed. A velocity needs a direction, e.g. 60 km/h north.', x: 'Velocity is a vector: it must include direction.' },
    { c: 2, d: 'C', t: 'num', q: 'A student walks 30 m east and then 40 m north. Find (a) the distance travelled and (b) the size of the displacement.', ans: '(a) 70 m  (b) 50 m (about 53° north of east)', x: 'Distance = 30 + 40 = 70 m. Displacement = √(30² + 40²) = 50 m.' },
    { c: 2, d: 'C', t: 'reason', q: 'Two forces of 5 N and 12 N act on one object. What are the largest and smallest possible resultant forces?', ans: 'Largest 17 N (same direction); smallest 7 N (opposite directions).', x: 'The resultant of two forces always lies between their difference and their sum.' },
    { c: 2, d: 'C', t: 'mcq', q: 'Can two forces of 4 N and 7 N have a resultant of 2 N?', o: ['Yes, always', 'No — the smallest possible resultant is 3 N', 'Yes, if they are perpendicular', 'Only if both forces are equal'], a: 1, x: 'The minimum resultant is 7 − 4 = 3 N (opposite directions), so 2 N is impossible.' },
    { c: 2, d: 'C', t: 'num', q: 'A boat points north at 4 m/s across a river that flows east at 3 m/s. What is the magnitude of the boat’s resultant velocity?', ans: '5 m/s (about 37° east of north)', x: '√(4² + 3²) = 5 m/s.' },

    // ───────── 3. Motion and Kinematics ─────────
    { c: 3, d: 'E', t: 'mcq', q: 'The rate of change of velocity is called:', o: ['Speed', 'Displacement', 'Acceleration', 'Distance'], a: 2, x: 'Acceleration = change in velocity ÷ time taken.' },
    { c: 3, d: 'E', t: 'num', q: 'A car travels 150 km in 3 hours. What is its average speed?', ans: '50 km/h', x: 'Average speed = total distance ÷ total time = 150 ÷ 3 = 50 km/h.' },
    { c: 3, d: 'E', t: 'tf', q: 'True or False: An object moving in a circle at constant speed has a constant velocity.', o: TF, a: 1, x: 'False. Its direction keeps changing, so its velocity changes (it is accelerating).' },
    { c: 3, d: 'E', t: 'num', q: 'A cyclist moves 100 m east in 20 s. What is the average velocity?', ans: '5 m/s east', x: 'Velocity = displacement ÷ time = 100 ÷ 20 = 5 m/s, east.' },
    { c: 3, d: 'M', t: 'mcq', q: 'On a distance–time graph, a horizontal (flat) line means the object is:', o: ['Moving at constant speed', 'At rest', 'Accelerating', 'Decelerating'], a: 1, x: 'The distance is not changing, so the object is stationary.' },
    { c: 3, d: 'M', t: 'mcq', q: 'The gradient (slope) of a velocity–time graph gives:', o: ['Distance travelled', 'Acceleration', 'Displacement', 'Position'], a: 1, x: 'Gradient = change in velocity ÷ change in time = acceleration.' },
    { c: 3, d: 'M', t: 'short', q: 'What does the AREA under a velocity–time graph represent?', ans: 'The displacement (distance travelled, if the object does not change direction).', x: 'Area = velocity × time = displacement.' },
    { c: 3, d: 'M', t: 'num', q: 'A runner completes exactly one lap of a 400 m track and finishes at the starting line. What are the distance and the displacement?', ans: 'Distance = 400 m; displacement = 0 m', x: 'The runner ends where they started, so the displacement is zero.' },
    { c: 3, d: 'M', t: 'num', q: 'A car speeds up from 10 m/s to 30 m/s in 5 s. What is its acceleration?', ans: '4 m/s²', x: 'a = (v − u) ÷ t = (30 − 10) ÷ 5 = 4 m/s².' },
    { c: 3, d: 'C', t: 'reason', q: 'A ball is thrown straight up. At its highest point, what are its velocity and its acceleration? (g = 9.8 m/s²)', ans: 'Velocity = 0 m/s; acceleration = 9.8 m/s² downward.', x: 'The ball stops for an instant, but gravity still acts, so the acceleration is still g downward.' },
    { c: 3, d: 'C', t: 'mistake', q: 'Identify the mistake: “If an object’s acceleration is negative, it must be slowing down.”', ans: 'Negative acceleration only gives a direction. If the velocity is also negative, the object speeds up. It slows down only when acceleration is opposite to velocity.', x: 'The signs of velocity and acceleration must be compared.' },
    { c: 3, d: 'C', t: 'num', q: 'A car accelerates uniformly from rest to 20 m/s in 10 s. Using the velocity–time graph, how far does it travel?', ans: '100 m', x: 'Area of triangle = ½ × 10 s × 20 m/s = 100 m.' },
    { c: 3, d: 'C', t: 'mcq', q: 'Which distance–time graph shape shows an object that is SPEEDING UP?', o: ['A straight line through the origin', 'A horizontal line', 'A curve that gets steeper', 'A curve that gets flatter'], a: 2, x: 'The gradient (speed) increases, so the curve gets steeper.' },

    // ───────── 4. Equations of Motion ─────────
    { c: 4, d: 'E', t: 'mcq', q: 'In the equation v = u + at, what does u represent?', o: ['Final velocity', 'Initial velocity', 'Acceleration', 'Time'], a: 1, x: 'u = initial velocity, v = final velocity, a = acceleration, t = time.' },
    { c: 4, d: 'E', t: 'num', q: 'A car starts from rest and accelerates at 2 m/s² for 5 s. What is its final velocity?', ans: '10 m/s', x: 'v = u + at = 0 + 2 × 5 = 10 m/s.' },
    { c: 4, d: 'E', t: 'tf', q: 'True or False: Ignoring air resistance, a heavy ball and a light ball dropped from the same height reach the ground at the same time.', o: TF, a: 0, x: 'True. All objects in free fall have the same acceleration g, whatever their mass.' },
    { c: 4, d: 'E', t: 'num', q: 'An object accelerates uniformly from rest to 12 m/s in 4 s. What is its acceleration?', ans: '3 m/s²', x: 'a = (v − u) ÷ t = (12 − 0) ÷ 4 = 3 m/s².' },
    { c: 4, d: 'M', t: 'num', q: 'A stone is dropped from rest and falls freely for 3 s. What is its speed then? (g = 9.8 m/s²)', ans: '29.4 m/s', x: 'v = u + gt = 0 + 9.8 × 3 = 29.4 m/s.' },
    { c: 4, d: 'M', t: 'num', q: 'A stone is dropped from rest and falls freely for 3 s. How far does it fall? (g = 9.8 m/s²)', ans: '44.1 m', x: 's = ut + ½gt² = 0 + ½ × 9.8 × 3² = 44.1 m.' },
    { c: 4, d: 'M', t: 'num', q: 'A car moving at 20 m/s brakes uniformly and stops in 4 s. What is its deceleration?', ans: '5 m/s² (acceleration = −5 m/s²)', x: 'a = (v − u) ÷ t = (0 − 20) ÷ 4 = −5 m/s².' },
    { c: 4, d: 'M', t: 'num', q: 'A car moving at 20 m/s brakes with a deceleration of 5 m/s². What is its stopping distance?', ans: '40 m', x: 'v² = u² + 2as → 0 = 20² + 2(−5)s → s = 400 ÷ 10 = 40 m.' },
    { c: 4, d: 'M', t: 'mcq', q: 'The equations of motion (v = u + at, s = ut + ½at², v² = u² + 2as) are valid only when:', o: ['Velocity is constant', 'Acceleration is constant (uniform)', 'Acceleration keeps increasing', 'The object starts at rest'], a: 1, x: 'They are derived assuming uniform acceleration.' },
    { c: 4, d: 'C', t: 'num', q: 'A ball is thrown straight up at 19.6 m/s. What maximum height does it reach? (g = 9.8 m/s², no air resistance)', ans: '19.6 m (reached after 2 s)', x: 'At the top v = 0: 0 = 19.6² − 2 × 9.8 × h → h = 384.16 ÷ 19.6 = 19.6 m.' },
    { c: 4, d: 'C', t: 'num', q: 'A car moving at 10 m/s accelerates at 2 m/s² for 5 s. How far does it travel in that time?', ans: '75 m', x: 's = ut + ½at² = 10 × 5 + ½ × 2 × 5² = 50 + 25 = 75 m.' },
    { c: 4, d: 'C', t: 'mistake', q: 'Identify the mistake: For a stone dropped from rest for 2 s, a student writes s = ½ × 9.8 × 2 = 9.8 m.', ans: 'The time was not squared. s = ½ × 9.8 × 2² = 19.6 m.', x: 'The equation is s = ut + ½at² — time is squared.' },
    { c: 4, d: 'C', t: 'reason', q: 'Predict: If a car’s speed is doubled, what happens to its braking distance (same deceleration)?', ans: 'It becomes 4 times as long.', x: 'From v² = u² + 2as with v = 0, s = u² ÷ 2a. Braking distance is proportional to u², so 2² = 4×.' },

    // ───────── 5. Newton’s Laws ─────────
    { c: 5, d: 'E', t: 'mcq', q: 'Newton’s first law of motion is also called the law of:', o: ['Acceleration', 'Inertia', 'Gravitation', 'Action and reaction'], a: 1, x: 'An object stays at rest or moves at constant velocity unless a net force acts — this is inertia.' },
    { c: 5, d: 'E', t: 'num', q: 'What is the weight of a 5 kg mass on Earth? (g = 9.8 N/kg)', ans: '49 N', x: 'W = mg = 5 × 9.8 = 49 N.' },
    { c: 5, d: 'E', t: 'tf', q: 'True or False: Mass and weight are the same physical quantity.', o: TF, a: 1, x: 'False. Mass (kg) is the amount of matter; weight (N) is the gravitational force on that mass.' },
    { c: 5, d: 'E', t: 'mcq', q: 'What is the SI unit of force?', o: ['Joule', 'Watt', 'Newton', 'Pascal'], a: 2, x: '1 N is the force that gives a 1 kg mass an acceleration of 1 m/s².' },
    { c: 5, d: 'M', t: 'num', q: 'A net force of 20 N acts on a 4 kg trolley. What is its acceleration?', ans: '5 m/s²', x: 'a = F ÷ m = 20 ÷ 4 = 5 m/s².' },
    { c: 5, d: 'M', t: 'reason', q: 'When a bus brakes suddenly, the standing passengers lurch forward. Explain why.', ans: 'Because of inertia — their bodies tend to keep moving forward at the original velocity while the bus slows down.', x: 'Newton’s first law: no force acted to stop the passengers at the same rate as the bus.' },
    { c: 5, d: 'M', t: 'mcq', q: 'A 60 kg astronaut travels to the Moon. What is the astronaut’s MASS on the Moon?', o: ['10 kg', '60 kg', '360 kg', '0 kg'], a: 1, x: 'Mass does not change with location. Only weight changes (it is about 1/6 on the Moon).' },
    { c: 5, d: 'M', t: 'mistake', q: 'Identify the mistake: “Action and reaction forces are equal and opposite, so they cancel out and nothing can ever move.”', ans: 'Action and reaction act on DIFFERENT objects, so they cannot cancel each other.', x: 'Only forces acting on the same object can be added to find a net force.' },
    { c: 5, d: 'M', t: 'short', q: 'A swimmer pushes the water backwards. What is the reaction force (Newton’s third law)?', ans: 'The water pushes the swimmer forwards with an equal force.', x: 'Third-law pairs are equal in size, opposite in direction, and act on different objects.' },
    { c: 5, d: 'C', t: 'mcq', q: 'A horse pulls a cart forward. According to Newton’s third law, the force of the cart on the horse is:', o: ['Greater than the horse’s pull', 'Smaller than the horse’s pull', 'Equal in size and opposite in direction', 'Zero'], a: 2, x: 'The pair is always equal and opposite. The system moves because of the ground’s friction on the horse’s hooves.' },
    { c: 5, d: 'C', t: 'num', q: 'A force gives a 2 kg object an acceleration of 6 m/s². What acceleration would the SAME force give a 3 kg object?', ans: '4 m/s²', x: 'F = ma = 2 × 6 = 12 N. Then a = 12 ÷ 3 = 4 m/s².' },
    { c: 5, d: 'C', t: 'reason', q: 'A book rests on a table. Earth pulls the book down (its weight). What is the Newton’s third-law PARTNER of the book’s weight?', ans: 'The book pulls the Earth upward with an equal gravitational force.', x: 'The table’s normal force is NOT the partner: it acts on the same object (the book) and is a different type of force.' },

    // ───────── 6. Forces and Friction ─────────
    { c: 6, d: 'E', t: 'mcq', q: 'When the forces on an object are balanced, the object:', o: ['Must be at rest', 'Accelerates', 'Is at rest or moves at constant velocity', 'Always slows down'], a: 2, x: 'Balanced forces mean zero net force, so there is no acceleration.' },
    { c: 6, d: 'E', t: 'tf', q: 'True or False: Friction acts opposite to the direction of motion (or attempted motion) between two surfaces.', o: TF, a: 0, x: 'True. Friction opposes relative motion between surfaces.' },
    { c: 6, d: 'E', t: 'num', q: 'A box is pulled with 10 N to the right and 4 N to the left. What is the net force?', ans: '6 N to the right', x: '10 − 4 = 6 N, in the direction of the larger force.' },
    { c: 6, d: 'M', t: 'mcq', q: 'A 2 kg book rests on a horizontal table. What is the normal force on it? (g = 9.8 N/kg)', o: ['2 N', '9.8 N', '19.6 N', '0 N'], a: 2, x: 'In equilibrium the normal force balances the weight: N = mg = 2 × 9.8 = 19.6 N.' },
    { c: 6, d: 'M', t: 'mcq', q: 'For the same two surfaces, which force is usually LARGER?', o: ['Kinetic (sliding) friction', 'Maximum static friction', 'They are always equal', 'It depends only on speed'], a: 1, x: 'It takes more force to start an object sliding than to keep it sliding.' },
    { c: 6, d: 'M', t: 'num', q: 'A 10 kg box is pushed with 50 N while friction is 30 N. What is its acceleration?', ans: '2 m/s²', x: 'Net force = 50 − 30 = 20 N; a = 20 ÷ 10 = 2 m/s².' },
    { c: 6, d: 'M', t: 'short', q: 'Give TWO ways to reduce friction between moving parts.', ans: 'Any two: lubrication (oil/grease), ball bearings or wheels, smoother surfaces, streamlining (for air resistance).', x: 'These reduce the contact or roughness between surfaces.' },
    { c: 6, d: 'M', t: 'tf', q: 'True or False: An object can be moving even when the net force on it is zero.', o: TF, a: 0, x: 'True. With zero net force, a moving object keeps moving at constant velocity (Newton’s first law).' },
    { c: 6, d: 'C', t: 'num', q: 'A 5 kg block slides on a horizontal floor. The coefficient of kinetic friction is 0.2. What is the friction force? (g = 9.8 N/kg)', ans: '9.8 N', x: 'N = mg = 49 N; f = μN = 0.2 × 49 = 9.8 N.' },
    { c: 6, d: 'C', t: 'reason', q: 'A heavy box is pushed with 20 N but does not move. What is the static friction force on it?', ans: '20 N, acting opposite to the push.', x: 'The box is in equilibrium, so static friction exactly balances the applied force (up to its maximum value).' },
    { c: 6, d: 'C', t: 'mistake', q: 'Identify the mistake: “A car moving at a constant 25 m/s on a straight road must have a net forward force on it.”', ans: 'At constant velocity the NET force is zero — the engine’s driving force is balanced by friction and air resistance.', x: 'A net force would make the car accelerate.' },
    { c: 6, d: 'C', t: 'num', q: 'A 1000 kg car has a driving force of 3000 N and total resistive forces of 1000 N. What is its acceleration?', ans: '2 m/s²', x: 'Net force = 3000 − 1000 = 2000 N; a = 2000 ÷ 1000 = 2 m/s².' },

    // ───────── 7. Work, Energy and Power ─────────
    { c: 7, d: 'E', t: 'mcq', q: 'What is the SI unit of work and energy?', o: ['Watt', 'Joule', 'Newton', 'Pascal'], a: 1, x: '1 J = 1 N × 1 m.' },
    { c: 7, d: 'E', t: 'num', q: 'A 10 N force moves a box 5 m in the direction of the force. How much work is done?', ans: '50 J', x: 'W = F × d = 10 × 5 = 50 J.' },
    { c: 7, d: 'E', t: 'tf', q: 'True or False: Power is the rate of doing work.', o: TF, a: 0, x: 'True. P = W ÷ t, measured in watts (1 W = 1 J/s).' },
    { c: 7, d: 'E', t: 'short', q: 'State the law of conservation of energy.', ans: 'Energy cannot be created or destroyed; it can only be transformed from one form to another (total energy stays constant).', x: 'In a closed system the total energy is constant.' },
    { c: 7, d: 'M', t: 'num', q: 'What is the kinetic energy of a 2 kg ball moving at 3 m/s?', ans: '9 J', x: 'KE = ½mv² = ½ × 2 × 3² = 9 J.' },
    { c: 7, d: 'M', t: 'num', q: 'How much gravitational potential energy is gained when a 5 kg box is lifted 2 m? (g = 9.8 N/kg)', ans: '98 J', x: 'GPE = mgh = 5 × 9.8 × 2 = 98 J.' },
    { c: 7, d: 'M', t: 'num', q: 'A motor does 1200 J of work in 4 s. What is its power?', ans: '300 W', x: 'P = W ÷ t = 1200 ÷ 4 = 300 W.' },
    { c: 7, d: 'M', t: 'mcq', q: 'As a ball falls freely (no air resistance), the main energy transformation is:', o: ['Kinetic → gravitational potential', 'Gravitational potential → kinetic', 'Chemical → gravitational potential', 'Thermal → kinetic'], a: 1, x: 'The ball loses height (GPE) and gains speed (KE).' },
    { c: 7, d: 'C', t: 'reason', q: 'You carry a heavy bag while walking horizontally at constant velocity. How much work does your upward holding force do on the bag? Explain.', ans: 'Zero — the upward force is perpendicular to the horizontal displacement.', x: 'Work is done only by the component of force in the direction of displacement (W = Fd cos 90° = 0).' },
    { c: 7, d: 'C', t: 'num', q: 'A ball is dropped from 5 m. Ignoring air resistance, what is its speed just before it hits the ground? (g = 9.8 m/s²)', ans: 'About 9.9 m/s', x: 'mgh = ½mv² → v = √(2gh) = √(2 × 9.8 × 5) = √98 ≈ 9.9 m/s.' },
    { c: 7, d: 'C', t: 'mistake', q: 'Identify the mistake: “If a car’s speed doubles, its kinetic energy also doubles.”', ans: 'KE = ½mv², so doubling the speed makes the kinetic energy 4 times larger.', x: 'Kinetic energy is proportional to the square of the speed.' },
    { c: 7, d: 'C', t: 'num', q: 'A machine takes in 500 J of energy and gives out 400 J of useful energy. What is its efficiency?', ans: '80 %', x: 'Efficiency = useful output ÷ total input × 100 % = 400 ÷ 500 × 100 % = 80 %.' },

    // ───────── 8. Momentum ─────────
    { c: 8, d: 'E', t: 'mcq', q: 'Linear momentum is defined as:', o: ['Mass × acceleration', 'Mass × velocity', 'Force × distance', '½ × mass × velocity²'], a: 1, x: 'p = mv.' },
    { c: 8, d: 'E', t: 'num', q: 'What is the momentum of a 0.5 kg ball moving at 4 m/s?', ans: '2 kg·m/s', x: 'p = mv = 0.5 × 4 = 2 kg·m/s.' },
    { c: 8, d: 'E', t: 'tf', q: 'True or False: Momentum is a vector quantity.', o: TF, a: 0, x: 'True. Momentum has the same direction as velocity.' },
    { c: 8, d: 'E', t: 'mcq', q: 'What is the SI unit of momentum?', o: ['kg·m/s', 'N/m', 'J/s', 'kg·m/s²'], a: 0, x: 'p = mv, so the unit is kg × m/s = kg·m/s (equivalent to N·s).' },
    { c: 8, d: 'M', t: 'num', q: 'A force of 20 N acts on a ball for 0.5 s. What impulse does it give the ball?', ans: '10 N·s', x: 'Impulse = F × t = 20 × 0.5 = 10 N·s (= change in momentum).' },
    { c: 8, d: 'M', t: 'reason', q: 'Explain how airbags reduce injuries in a car crash.', ans: 'They increase the time over which the person stops, so the force on the person is smaller for the same change in momentum.', x: 'F = Δp ÷ t: a longer stopping time means a smaller force.' },
    { c: 8, d: 'M', t: 'num', q: 'What is the momentum of a 1000 kg car moving at 20 m/s?', ans: '20 000 kg·m/s', x: 'p = mv = 1000 × 20 = 20 000 kg·m/s.' },
    { c: 8, d: 'M', t: 'mcq', q: 'In a collision with no external forces, the TOTAL momentum of the system:', o: ['Increases', 'Decreases', 'Stays the same', 'Becomes zero'], a: 2, x: 'Law of conservation of momentum.' },
    { c: 8, d: 'C', t: 'num', q: 'A 2 kg trolley moving at 3 m/s hits a stationary 1 kg trolley and they stick together. What is their common velocity?', ans: '2 m/s', x: 'Momentum before = 2 × 3 = 6 kg·m/s = (2 + 1) × v → v = 2 m/s.' },
    { c: 8, d: 'C', t: 'num', q: 'A 0.2 kg ball hits a wall at 10 m/s and bounces straight back at 10 m/s. What is the size of its change in momentum?', ans: '4 kg·m/s', x: 'Δp = m(v − u) = 0.2 × (−10 − 10) = −4 kg·m/s. The direction reversed, so the change is 4 kg·m/s, not zero!' },
    { c: 8, d: 'C', t: 'mistake', q: 'Identify the mistake: “When a gun fires, the bullet and the gun move off with equal speeds in opposite directions.”', ans: 'They get equal and opposite MOMENTA, not speeds. The gun is much heavier, so its recoil speed is much smaller.', x: 'Total momentum stays zero: m₁v₁ = −m₂v₂.' },
    { c: 8, d: 'C', t: 'num', q: 'Two skaters stand at rest. A 60 kg skater pushes a 40 kg skater, who moves away at 3 m/s. What is the velocity of the 60 kg skater?', ans: '2 m/s in the opposite direction', x: '0 = 40 × 3 + 60 × v → v = −2 m/s.' },
  ];
  return Q.map((q, i) => Object.assign({ id: 'q' + (i + 1) }, q));
})();
