/* Grade 11 Physics question bank — based on the Grade 11 course book, Chapters 1–3:
 *   Chapter 1: Motion in One Dimension (1-1 Displacement & Velocity, 1-2 Acceleration, 1-3 Falling Objects)
 *   Chapter 2: Vectors & Two-Dimensional Motion (2-1, 2-2 Vectors, 2-3 Projectile Motion, 2-4 Relative Motion)
 *   Chapter 3: Forces & the Laws of Motion (3-1 Changes in Motion, 3-2 First Law, 3-3 Second & Third Laws, 3-4 Everyday Forces)
 * All multiple choice; calculations use easy numbers (g = 10 m/s² where stated) so they can be done mentally.
 * Fields: c (topic), d (E/M/C), q, o (options), a (index of correct option), x (explanation).
 */
(function () {
  const topics = {
    1: { name: 'Displacement & Velocity', icon: '📍' },
    2: { name: 'Acceleration', icon: '🏎️' },
    3: { name: 'Falling Objects', icon: '🍎' },
    4: { name: 'Vectors', icon: '➡️' },
    5: { name: 'Projectile Motion', icon: '🏀' },
    6: { name: 'Relative Motion', icon: '🚆' },
    7: { name: 'Force & Newton’s Laws', icon: '💪' },
    8: { name: 'Weight, Normal Force & Friction', icon: '🧲' }
  };
  const Q = [
    // ───────── 1. Displacement & Velocity (Section 1-1) ─────────
    { c: 1, d: 'E', q: 'Displacement is:', o: ['The shortest directional distance from the start point to the end point', 'The total length of the path travelled', 'Speed multiplied by mass', 'The time taken for a trip'], a: 0, x: 'Δx = xf − xi, with a direction.' },
    { c: 1, d: 'E', q: 'Distance is:', o: ['The total length of the path followed by a moving object', 'The straight line from start to end, with direction', 'Velocity divided by time', 'Always zero for a round trip'], a: 0, x: 'Distance counts the whole path, regardless of direction.' },
    { c: 1, d: 'E', q: 'Which statement is correct?', o: ['Displacement is a vector; distance is a scalar', 'Displacement is a scalar; distance is a vector', 'Both are scalars', 'Both are vectors'], a: 0, x: 'Displacement has magnitude and direction; distance has magnitude only.' },
    { c: 1, d: 'E', q: 'Which equation gives average velocity?', o: ['v = Δx ÷ Δt', 'v = Δt ÷ Δx', 'v = Δx × Δt', 'v = Δv ÷ Δt'], a: 0, x: 'Average velocity = displacement ÷ time interval.' },
    { c: 1, d: 'E', q: 'What is the SI unit of displacement?', o: ['m', 'm/s', 's', 'm/s²'], a: 0, x: 'Displacement is a length, measured in metres.' },
    { c: 1, d: 'M', q: 'An object moves from x = 2 m to x = 10 m. What is its displacement?', o: ['+8 m', '+12 m', '+20 m', '−8 m'], a: 0, x: 'Δx = xf − xi = 10 − 2 = 8 m.' },
    { c: 1, d: 'M', q: 'An object moves from x = 10 m to x = 4 m. What is its displacement?', o: ['−6 m', '+6 m', '+14 m', '−14 m'], a: 0, x: 'Δx = 4 − 10 = −6 m (it moved in the negative direction).' },
    { c: 1, d: 'M', q: 'A runner moves 100 m east in 20 s. What is the average velocity?', o: ['5 m/s east', '2000 m/s east', '0.2 m/s east', '120 m/s east'], a: 0, x: 'v = 100 ÷ 20 = 5 m/s east.' },
    { c: 1, d: 'M', q: 'A car moves with an average velocity of 20 m/s east for 10 s. What is its displacement?', o: ['200 m east', '2 m east', '30 m east', '0.5 m east'], a: 0, x: 'Δx = v × Δt = 20 × 10 = 200 m east.' },
    { c: 1, d: 'M', q: 'The slope of a position–time graph represents:', o: ['Velocity', 'Acceleration', 'Distance', 'Force'], a: 0, x: 'Slope = Δx ÷ Δt = velocity.' },
    { c: 1, d: 'M', q: 'A horizontal (flat) line on a position–time graph means the object is:', o: ['At rest', 'Moving with constant velocity', 'Speeding up', 'Falling'], a: 0, x: 'The position does not change, so the velocity is zero.' },
    { c: 1, d: 'C', q: 'A car travels 120 km at an average velocity of 60 km/h. How long does the trip take?', o: ['2 h', '0.5 h', '7200 h', '180 h'], a: 0, x: 'Δt = Δx ÷ v = 120 ÷ 60 = 2 h.' },
    { c: 1, d: 'C', q: 'A swimmer swims 50 m to the end of a pool and back to the start. What is the swimmer’s displacement for the round trip?', o: ['0 m', '50 m', '100 m', '25 m'], a: 0, x: 'The swimmer ends where they started, so Δx = 0 (the distance is 100 m).' },
    { c: 1, d: 'C', q: 'If the average velocity of a duck over a time interval is zero, then its displacement is:', o: ['Zero — it ended where it started', 'Very large', 'Equal to the distance travelled', 'Negative'], a: 0, x: 'v = Δx ÷ Δt = 0 means Δx = 0.' },
    { c: 1, d: 'C', q: 'Instantaneous velocity is:', o: ['The velocity at a specific instant or point in the path', 'The average velocity for the whole trip', 'Always zero', 'The total distance ÷ total time'], a: 0, x: 'It is the velocity at one moment.' },

    // ───────── 2. Acceleration (Section 1-2) ─────────
    { c: 2, d: 'E', q: 'Acceleration is:', o: ['The rate at which velocity changes over time', 'The rate at which position changes', 'Force multiplied by mass', 'Distance divided by time'], a: 0, x: 'a = Δv ÷ Δt.' },
    { c: 2, d: 'E', q: 'What is the SI unit of acceleration?', o: ['m/s²', 'm/s', 'm', 'N'], a: 0, x: 'Δv (m/s) ÷ Δt (s) = m/s².' },
    { c: 2, d: 'E', q: 'An object moves with a constant velocity. Its acceleration is:', o: ['0 m/s²', '9.81 m/s²', 'Increasing', 'Always negative'], a: 0, x: 'If vf = vi, then a = 0.' },
    { c: 2, d: 'E', q: '“An object starts from rest” means:', o: ['vi = 0 m/s', 'vf = 0 m/s', 'a = 0 m/s²', 'Δt = 0 s'], a: 0, x: 'Its initial velocity is zero.' },
    { c: 2, d: 'M', q: 'A car speeds up from 0 to 20 m/s in 5 s. What is its acceleration?', o: ['4 m/s²', '100 m/s²', '25 m/s²', '0.25 m/s²'], a: 0, x: 'a = (20 − 0) ÷ 5 = 4 m/s².' },
    { c: 2, d: 'M', q: 'A bus moving at 9 m/s slows down with an acceleration of −3 m/s². How long does it take to stop?', o: ['3 s', '27 s', '6 s', '12 s'], a: 0, x: 'Δt = (0 − 9) ÷ (−3) = 3 s.' },
    { c: 2, d: 'M', q: 'Can an object accelerate while its speed stays constant?', o: ['Yes — if its direction changes (e.g. circular motion)', 'No, never', 'Only if it is at rest', 'Only when it is falling'], a: 0, x: 'Velocity includes direction, so changing direction is acceleration.' },
    { c: 2, d: 'M', q: 'An object has a NEGATIVE velocity and a NEGATIVE acceleration. It is:', o: ['Speeding up', 'Slowing down', 'At rest', 'Moving at constant velocity'], a: 0, x: 'When velocity and acceleration have the same sign, the object speeds up.' },
    { c: 2, d: 'M', q: 'An object has a POSITIVE velocity and a NEGATIVE acceleration. It is:', o: ['Slowing down', 'Speeding up', 'At rest', 'Moving at constant velocity'], a: 0, x: 'Opposite signs mean the object slows down.' },
    { c: 2, d: 'M', q: 'A horizontal line on a velocity–time graph shows:', o: ['Constant velocity (zero acceleration)', 'The object is at rest only', 'Constant positive acceleration', 'Free fall'], a: 0, x: 'The slope of a v–t graph is the acceleration; a flat line means a = 0.' },
    { c: 2, d: 'C', q: 'A car moving at 5 m/s accelerates at 2 m/s² for 3 s. What is its final velocity?', o: ['11 m/s', '6 m/s', '10 m/s', '30 m/s'], a: 0, x: 'vf = vi + aΔt = 5 + 2 × 3 = 11 m/s.' },
    { c: 2, d: 'C', q: 'A car speeds up uniformly from 10 m/s to 30 m/s in 4 s. How far does it travel?', o: ['80 m', '40 m', '160 m', '120 m'], a: 0, x: 'Δx = ½(vi + vf)Δt = ½ × 40 × 4 = 80 m.' },
    { c: 2, d: 'C', q: 'A car starts from rest and accelerates at 2 m/s² for 10 s. How far does it travel?', o: ['100 m', '20 m', '200 m', '10 m'], a: 0, x: 'Δx = viΔt + ½aΔt² = 0 + ½ × 2 × 10² = 100 m.' },
    { c: 2, d: 'C', q: 'A bike starts from rest and accelerates at 2 m/s² over 25 m. What is its final speed?', o: ['10 m/s', '50 m/s', '5 m/s', '100 m/s'], a: 0, x: 'vf² = vi² + 2aΔx = 0 + 2 × 2 × 25 = 100 → vf = 10 m/s.' },
    { c: 2, d: 'C', q: 'A plane starts from rest and accelerates at 4 m/s² for 15 s. What is its speed at take-off?', o: ['60 m/s', '19 m/s', '3.75 m/s', '450 m/s'], a: 0, x: 'vf = 0 + 4 × 15 = 60 m/s.' },
    { c: 2, d: 'C', q: 'A car moving at 20 m/s brakes with an acceleration of −5 m/s². How far does it travel before stopping?', o: ['40 m', '4 m', '100 m', '80 m'], a: 0, x: '0 = 20² + 2(−5)Δx → Δx = 400 ÷ 10 = 40 m.' },

    // ───────── 3. Falling Objects (Section 1-3) ─────────
    { c: 3, d: 'E', q: 'Free fall is the motion of an object under:', o: ['Gravity alone, with no air resistance', 'Air resistance only', 'A constant push from an engine', 'Magnetic force'], a: 0, x: 'Only the object’s weight acts on it.' },
    { c: 3, d: 'E', q: 'The free-fall acceleration on Earth is about:', o: ['9.81 m/s² downward', '0 m/s²', '1.6 m/s² downward', '98.1 m/s² upward'], a: 0, x: 'g ≈ 9.81 m/s², directed downward (the book writes −9.81 m/s²).' },
    { c: 3, d: 'E', q: 'On the Moon, an astronaut drops a hammer and a feather together. What happens?', o: ['They land at the same time', 'The hammer lands first', 'The feather lands first', 'They float'], a: 0, x: 'With no air, all objects fall with the same acceleration.' },
    { c: 3, d: 'E', q: 'A ball is thrown straight up. What is its velocity at the highest point?', o: ['0 m/s', 'Its maximum value', '9.81 m/s', 'The same as when it was thrown'], a: 0, x: 'It stops for an instant before falling back.' },
    { c: 3, d: 'M', q: 'A ball is thrown straight up. What is its acceleration at the highest point?', o: ['9.81 m/s² downward', '0 m/s²', '9.81 m/s² upward', 'It keeps changing'], a: 0, x: 'Gravity still acts at the top, so a = −9.81 m/s².' },
    { c: 3, d: 'M', q: 'While a ball rises after being thrown up, its velocity:', o: ['Decreases', 'Increases', 'Stays constant', 'Is always zero'], a: 0, x: 'Gravity slows it down until it stops at the top.' },
    { c: 3, d: 'M', q: 'One juggler throws a pin up while another drops a pin. How do their accelerations compare in the air?', o: ['They are the same (g downward)', 'The thrown pin’s is bigger', 'The dropped pin’s is bigger', 'The thrown pin has zero acceleration'], a: 0, x: 'Every freely falling object has acceleration g.' },
    { c: 3, d: 'M', q: 'Why is the free-fall acceleration written as −9.81 m/s² in the book?', o: ['The negative sign shows it points downward', 'The object loses mass', 'It is always slowing down', 'Gravity is repulsive'], a: 0, x: 'Upward is positive, so downward acceleration is negative.' },
    { c: 3, d: 'M', q: 'A stone is dropped from rest. What is its speed after 2 s? (take g = 10 m/s²)', o: ['20 m/s', '5 m/s', '10 m/s', '40 m/s'], a: 0, x: 'v = gΔt = 10 × 2 = 20 m/s.' },
    { c: 3, d: 'C', q: 'A pebble is dropped into a well and hits the water after 2 s. How deep is the well? (take g = 10 m/s²)', o: ['20 m', '10 m', '40 m', '5 m'], a: 0, x: 'Δy = ½gΔt² = ½ × 10 × 2² = 20 m.' },
    { c: 3, d: 'C', q: 'A stone is dropped from rest and falls for 3 s. How far does it fall? (take g = 10 m/s²)', o: ['45 m', '30 m', '90 m', '15 m'], a: 0, x: 'Δy = ½ × 10 × 3² = 45 m.' },
    { c: 3, d: 'C', q: 'A ball is thrown straight up at 20 m/s. How long does it take to reach the top? (take g = 10 m/s²)', o: ['2 s', '20 s', '1 s', '4 s'], a: 0, x: '0 = 20 − 10Δt → Δt = 2 s.' },
    { c: 3, d: 'C', q: 'A ball is thrown straight up at 20 m/s. What maximum height does it reach? (take g = 10 m/s²)', o: ['20 m', '40 m', '10 m', '200 m'], a: 0, x: '0 = 20² − 2 × 10 × Δy → Δy = 400 ÷ 20 = 20 m.' },
    { c: 3, d: 'C', q: 'A wrench is dropped from a tower 80 m tall. How fast is it moving when it hits the ground? (take g = 10 m/s²)', o: ['40 m/s', '80 m/s', '1600 m/s', '20 m/s'], a: 0, x: 'v² = 2gΔy = 2 × 10 × 80 = 1600 → v = 40 m/s.' },
    { c: 3, d: 'C', q: 'A tennis ball is thrown straight up at 8 m/s. With what speed does it return to its starting point (no air resistance)?', o: ['8 m/s', '0 m/s', '16 m/s', '4 m/s'], a: 0, x: 'It loses and then regains the same speed — it returns at 8 m/s, moving downward.' },

    // ───────── 4. Vectors (Sections 2-1, 2-2) ─────────
    { c: 4, d: 'E', q: 'A scalar quantity has:', o: ['Magnitude only', 'Direction only', 'Magnitude and direction', 'Neither magnitude nor direction'], a: 0, x: 'Examples: mass, time, temperature, distance, speed.' },
    { c: 4, d: 'E', q: 'Which of these is a VECTOR quantity?', o: ['Velocity', 'Mass', 'Time', 'Temperature'], a: 0, x: 'Velocity has magnitude and direction.' },
    { c: 4, d: 'E', q: 'Which of these is a SCALAR quantity?', o: ['Speed', 'Force', 'Acceleration', 'Displacement'], a: 0, x: 'Speed has no direction.' },
    { c: 4, d: 'E', q: 'A resultant vector is:', o: ['A vector that represents the sum of two or more vectors', 'The largest of the vectors', 'Always zero', 'A scalar'], a: 0, x: 'It has the same effect as all the vectors together.' },
    { c: 4, d: 'E', q: 'When a vector is drawn as an arrow, the length of the arrow shows the vector’s:', o: ['Magnitude', 'Direction', 'Units', 'Colour'], a: 0, x: 'The arrow’s length is proportional to the magnitude; its direction shows the direction.' },
    { c: 4, d: 'M', q: 'In the head-to-tail (graphical) method, the resultant is drawn from:', o: ['The tail of the first vector to the head of the last vector', 'The head of the first to the tail of the last', 'The middle of each vector', 'The origin to any point'], a: 0, x: 'Place vectors one after another, then join start to finish.' },
    { c: 4, d: 'M', q: 'What is the sum of 3 m east and 6 m east?', o: ['9 m east', '3 m west', '3 m east', '18 m east'], a: 0, x: 'Same direction → add: 3 + 6 = 9 m east.' },
    { c: 4, d: 'M', q: 'What is the sum of 2 m east and 5 m west?', o: ['3 m west', '7 m west', '3 m east', '7 m east'], a: 0, x: 'Opposite directions → subtract; the bigger vector gives the direction: 3 m west.' },
    { c: 4, d: 'M', q: 'A student walks 3 m east and then 4 m north. What is the size of the displacement?', o: ['5 m', '7 m', '1 m', '12 m'], a: 0, x: 'Perpendicular vectors: √(3² + 4²) = 5 m.' },
    { c: 4, d: 'M', q: 'Can a velocity vector be added to a displacement vector?', o: ['No — vectors must describe the same kind of quantity with the same units', 'Yes, always', 'Only if they point the same way', 'Only if both are zero'], a: 0, x: 'It is meaningless to add different kinds of quantities.' },
    { c: 4, d: 'C', q: 'A truck travels 8 km east, 3 km west, then 12 km east. What is its total displacement?', o: ['17 km east', '23 km east', '1 km east', '17 km west'], a: 0, x: '8 − 3 + 12 = 17 km east (the distance travelled is 23 km).' },
    { c: 4, d: 'C', q: 'A girl walks 3 blocks west, 4 blocks north, then 6 blocks east. What is her resultant displacement?', o: ['5 blocks', '13 blocks', '7 blocks', '1 block'], a: 0, x: 'Net: 3 blocks east and 4 blocks north → √(3² + 4²) = 5 blocks.' },
    { c: 4, d: 'C', q: 'A velocity of 10 m/s points 30° above the horizontal. What is its vertical component? (sin 30° = 0.5)', o: ['5 m/s', '10 m/s', '20 m/s', '0 m/s'], a: 0, x: 'vy = v sin θ = 10 × 0.5 = 5 m/s.' },
    { c: 4, d: 'C', q: 'A force of 20 N acts at 60° to the horizontal. What is its horizontal component? (cos 60° = 0.5)', o: ['10 N', '20 N', '40 N', '0 N'], a: 0, x: 'Fx = F cos θ = 20 × 0.5 = 10 N.' },
    { c: 4, d: 'C', q: 'A cat climbs 5 m straight up a tree. What are the components of its displacement?', o: ['Horizontal 0 m, vertical 5 m', 'Horizontal 5 m, vertical 0 m', 'Both 2.5 m', 'Both 5 m'], a: 0, x: 'The motion is entirely vertical.' },
    { c: 4, d: 'C', q: 'Two vectors have magnitudes 55 and 25 units. Which value could be their resultant?', o: ['55', '85', '20', '100'], a: 0, x: 'The resultant must be between 55 − 25 = 30 and 55 + 25 = 80.' },

    // ───────── 5. Projectile Motion (Section 2-3) ─────────
    { c: 5, d: 'E', q: 'Without air resistance, the path of a projectile is a:', o: ['Parabola', 'Straight line', 'Circle', 'Zig-zag'], a: 0, x: 'Gravity alone gives a parabolic trajectory.' },
    { c: 5, d: 'E', q: 'Which part of a projectile’s motion does gravity affect?', o: ['Only the vertical motion', 'Only the horizontal motion', 'Both equally', 'Neither'], a: 0, x: 'Gravity acts downward, so it changes only the vertical velocity.' },
    { c: 5, d: 'E', q: 'Without air resistance, the horizontal velocity of a projectile:', o: ['Stays constant', 'Increases', 'Decreases to zero', 'Changes direction'], a: 0, x: 'No horizontal force acts, so vx is constant.' },
    { c: 5, d: 'E', q: 'Which of these is a projectile?', o: ['An arrow shot through the air', 'A car driving on a flat road', 'A boat floating', 'A book on a table'], a: 0, x: 'Projectiles are thrown or launched and move under gravity.' },
    { c: 5, d: 'M', q: 'To reach the MAXIMUM horizontal range (no air resistance), a projectile should be launched at:', o: ['45°', '90°', '30°', '10°'], a: 0, x: 'The book notes the maximum range is at 45°.' },
    { c: 5, d: 'M', q: 'At the highest point of its path, a projectile’s vertical velocity is:', o: ['Zero', 'Maximum', 'Equal to its horizontal velocity', '9.81 m/s'], a: 0, x: 'vy = 0 at the top; vx keeps its value.' },
    { c: 5, d: 'M', q: 'A dart is fired horizontally and another is dropped from the same height at the same time. Which hits the ground first (no air resistance)?', o: ['They land at the same time', 'The fired dart', 'The dropped dart', 'It depends on their mass'], a: 0, x: 'Both start with zero vertical velocity and fall with g.' },
    { c: 5, d: 'M', q: 'With air resistance, a projectile’s path:', o: ['Is no longer a perfect parabola and its range is shorter', 'Becomes a perfect circle', 'Becomes longer', 'Becomes a straight line'], a: 0, x: 'Air resistance makes the path asymmetric and reduces the range.' },
    { c: 5, d: 'C', q: 'A rock is kicked horizontally off a cliff 20 m high. How long does it take to reach the water? (take g = 10 m/s²)', o: ['2 s', '4 s', '1 s', '20 s'], a: 0, x: 'Δy = ½gΔt² → 20 = 5Δt² → Δt = 2 s.' },
    { c: 5, d: 'C', q: 'The rock is kicked horizontally at 5 m/s and falls for 2 s. How far from the cliff does it land?', o: ['10 m', '2.5 m', '7 m', '20 m'], a: 0, x: 'Δx = vx Δt = 5 × 2 = 10 m.' },
    { c: 5, d: 'C', q: 'A ball is launched at 20 m/s at 30° above the horizontal. What is its initial vertical velocity? (sin 30° = 0.5)', o: ['10 m/s', '20 m/s', '17.3 m/s', '40 m/s'], a: 0, x: 'vy = 20 × sin 30° = 10 m/s.' },
    { c: 5, d: 'C', q: 'A ball leaves the ground with a vertical velocity of 10 m/s. How long until it reaches its highest point? (take g = 10 m/s²)', o: ['1 s', '10 s', '2 s', '0.5 s'], a: 0, x: '0 = 10 − 10Δt → Δt = 1 s.' },
    { c: 5, d: 'C', q: 'A plane flying horizontally at 30 m/s drops a package. What is the package’s horizontal velocity just after release?', o: ['30 m/s', '0 m/s', '10 m/s', '60 m/s'], a: 0, x: 'The package keeps the plane’s horizontal velocity.' },
    { c: 5, d: 'C', q: 'A package moving horizontally at 30 m/s falls for 5 s. How far does it travel horizontally?', o: ['150 m', '35 m', '6 m', '300 m'], a: 0, x: 'Δx = 30 × 5 = 150 m.' },
    { c: 5, d: 'C', q: 'A rock is dropped at the same instant a ball is thrown horizontally from the same height. Which is faster when it reaches the ground?', o: ['The thrown ball', 'The dropped rock', 'Both have the same speed', 'Neither moves'], a: 0, x: 'They have the same vertical speed, but the ball also has horizontal speed.' },

    // ───────── 6. Relative Motion (Section 2-4) ─────────
    { c: 6, d: 'E', q: 'A frame of reference is:', o: ['A coordinate system for specifying the location of objects', 'A type of force', 'The mass of an object', 'A unit of speed'], a: 0, x: 'Motion is always measured relative to a frame of reference.' },
    { c: 6, d: 'E', q: 'The velocity of an object measured by two observers can be different because:', o: ['They are in different frames of reference', 'Velocity is a scalar', 'Only one of them is correct', 'The object changes mass'], a: 0, x: 'Velocity depends on the observer’s frame of reference.' },
    { c: 6, d: 'M', q: 'A car moves at 90 km/h. How fast does it appear to move to a passenger in another car moving at 80 km/h in the same direction?', o: ['10 km/h', '170 km/h', '90 km/h', '0 km/h'], a: 0, x: 'vfs = vfe − vse = 90 − 80 = 10 km/h.' },
    { c: 6, d: 'M', q: 'A cyclist moves at 9 m/s and passes a boy moving at 1 m/s in the OPPOSITE direction. How fast does the boy appear to move to the cyclist?', o: ['10 m/s', '8 m/s', '9 m/s', '1 m/s'], a: 0, x: 'Opposite directions: 9 + 1 = 10 m/s.' },
    { c: 6, d: 'M', q: 'A passenger on a train moving at 15 m/s throws a ball backward at 15 m/s relative to the train. What is the ball’s velocity relative to the ground?', o: ['0 m/s', '30 m/s', '15 m/s', '−30 m/s'], a: 0, x: '15 + (−15) = 0 m/s.' },
    { c: 6, d: 'M', q: 'A boat moves at 18 m/s. A boy runs toward the back of the boat at 3 m/s. What is his speed relative to someone on the shore?', o: ['15 m/s', '21 m/s', '18 m/s', '3 m/s'], a: 0, x: '18 − 3 = 15 m/s in the boat’s direction.' },
    { c: 6, d: 'M', q: 'A plane flies at 50 m/s east and a wind of 20 m/s east starts to blow. What is the plane’s velocity relative to the ground?', o: ['70 m/s east', '30 m/s east', '50 m/s east', '20 m/s east'], a: 0, x: 'Same direction → add: 50 + 20 = 70 m/s east.' },
    { c: 6, d: 'C', q: 'A boat heads north at 4 m/s across a river flowing east at 3 m/s. What is its speed relative to the shore?', o: ['5 m/s', '7 m/s', '1 m/s', '12 m/s'], a: 0, x: 'Perpendicular: √(4² + 3²) = 5 m/s.' },
    { c: 6, d: 'C', q: 'A ferry heads north at 8 m/s relative to the water; the river flows east at 6 m/s. What is its speed relative to Earth?', o: ['10 m/s', '14 m/s', '2 m/s', '48 m/s'], a: 0, x: '√(8² + 6²) = 10 m/s.' },
    { c: 6, d: 'C', q: 'A boat crosses a river 100 m wide heading straight across at 10 m/s relative to the water. How long does the crossing take?', o: ['10 s', '1000 s', '1 s', '90 s'], a: 0, x: 'Only the cross-river velocity matters: 100 ÷ 10 = 10 s.' },
    { c: 6, d: 'C', q: 'During that 10 s crossing, the river flows downstream at 2 m/s. How far downstream does the boat land?', o: ['20 m', '5 m', '12 m', '200 m'], a: 0, x: '2 m/s × 10 s = 20 m downstream.' },
    { c: 6, d: 'C', q: 'A stunt dummy is dropped from a moving plane. How does its path look from inside the plane and from the ground?', o: ['Straight down from the plane; a parabola from the ground', 'A parabola from both', 'Straight down from both', 'A circle from the plane'], a: 0, x: 'The dummy keeps the plane’s horizontal velocity.' },
    { c: 6, d: 'C', q: 'A boy walking at 1 m/s drops a ball. How does the ball’s path look to the boy?', o: ['Straight down', 'A parabola moving backward', 'A circle', 'It does not move'], a: 0, x: 'In the boy’s frame, the ball has no horizontal velocity.' },

    // ───────── 7. Force & Newton’s Laws (Sections 3-1, 3-2, 3-3) ─────────
    { c: 7, d: 'E', q: 'What is the SI unit of force?', o: ['newton (N)', 'joule (J)', 'kilogram (kg)', 'watt (W)'], a: 0, x: 'Force is measured in newtons.' },
    { c: 7, d: 'E', q: '1 newton is equal to:', o: ['1 kg·m/s²', '1 kg·m/s', '1 kg/m²', '1 m/s²'], a: 0, x: 'The force that accelerates 1 kg by 1 m/s².' },
    { c: 7, d: 'E', q: 'Gravity pulling a falling apple is an example of a:', o: ['Field force', 'Contact force', 'Friction force', 'Normal force'], a: 0, x: 'Field forces act without direct contact.' },
    { c: 7, d: 'E', q: 'Which is a CONTACT force?', o: ['Pushing a box', 'Gravity', 'Magnetic force', 'Electric force'], a: 0, x: 'Contact forces come from physical contact between objects.' },
    { c: 7, d: 'E', q: 'Inertia is:', o: ['The tendency of an object to maintain its state of motion', 'A type of force', 'The speed of an object', 'The weight of an object'], a: 0, x: 'Objects resist changes in their motion.' },
    { c: 7, d: 'E', q: 'What measures an object’s inertia?', o: ['Its mass', 'Its speed', 'Its colour', 'Its height'], a: 0, x: 'The greater the mass, the harder it is to change its motion.' },
    { c: 7, d: 'M', q: 'According to Newton’s first law, an object moving at constant velocity keeps moving unless:', o: ['A net external force acts on it', 'It gets tired', 'Time passes', 'It is observed'], a: 0, x: 'Only a net external force changes its motion.' },
    { c: 7, d: 'M', q: 'A car moves west at a constant 20 m/s. What is the net force on it?', o: ['0 N', '20 N west', '20 N east', 'It depends on its mass'], a: 0, x: 'Constant velocity → a = 0 → net force = 0.' },
    { c: 7, d: 'M', q: 'A free-body diagram shows:', o: ['Only the forces acting on one object', 'All the forces in the room', 'The forces the object exerts on others', 'The path of the object'], a: 0, x: 'Forces the object exerts on others are not included.' },
    { c: 7, d: 'M', q: 'A net force of 20 N acts on a 4 kg trolley. What is its acceleration?', o: ['5 m/s²', '80 m/s²', '16 m/s²', '0.2 m/s²'], a: 0, x: 'a = F ÷ m = 20 ÷ 4 = 5 m/s².' },
    { c: 7, d: 'M', q: 'A 6 kg object accelerates at 2 m/s². What is the net force on it?', o: ['12 N', '3 N', '8 N', '4 N'], a: 0, x: 'F = ma = 6 × 2 = 12 N.' },
    { c: 7, d: 'M', q: 'Newton’s third law forces (action and reaction) are:', o: ['Equal in size, opposite in direction, and act on different objects', 'Equal and act on the same object', 'Unequal and in the same direction', 'Only present when objects move'], a: 0, x: 'For every action there is an equal and opposite reaction.' },
    { c: 7, d: 'C', q: 'Why don’t action and reaction forces cancel each other out?', o: ['They act on different objects', 'They are not equal', 'They act in the same direction', 'One of them is always zero'], a: 0, x: 'Only forces on the same object combine into a net force.' },
    { c: 7, d: 'C', q: 'Forces of 30 N east and 40 N north act on a box. What is the size of the net force?', o: ['50 N', '70 N', '10 N', '1200 N'], a: 0, x: 'Perpendicular forces: √(30² + 40²) = 50 N.' },
    { c: 7, d: 'C', q: 'The 12 N force that gives a 6 kg object 2 m/s² is applied to a 4 kg object. What acceleration does it produce?', o: ['3 m/s²', '2 m/s²', '48 m/s²', '8 m/s²'], a: 0, x: 'a = 12 ÷ 4 = 3 m/s².' },
    { c: 7, d: 'C', q: 'A small car collides head-on with a heavy truck. Which statement is correct?', o: ['Both feel the same force; the car has the greater acceleration', 'The truck feels the bigger force', 'The car feels the bigger force and smaller acceleration', 'Neither feels a force'], a: 0, x: 'Equal forces (third law), but a = F ÷ m is larger for the smaller mass.' },
    { c: 7, d: 'C', q: 'If the net force on an object doubles (same mass), its acceleration:', o: ['Doubles', 'Halves', 'Stays the same', 'Becomes zero'], a: 0, x: 'a is directly proportional to F when mass is constant.' },
    { c: 7, d: 'C', q: 'A book is at rest on a table. Does that mean no forces act on it?', o: ['No — the forces are balanced, so the net force is zero', 'Yes — no forces act on it', 'Yes — gravity switches off', 'No — the book is accelerating'], a: 0, x: 'Gravity and the normal force act, but they cancel.' },
    { c: 7, d: 'C', q: 'A 10 N force pulls at 30° above the horizontal. What is its vertical component? (sin 30° = 0.5)', o: ['5 N', '10 N', '20 N', '0 N'], a: 0, x: 'Fy = F sin θ = 10 × 0.5 = 5 N.' },

    // ───────── 8. Weight, Normal Force & Friction (Section 3-4) ─────────
    { c: 8, d: 'E', q: 'Weight is:', o: ['The force of gravity on an object', 'The amount of matter in an object', 'The volume of an object', 'The speed of an object'], a: 0, x: 'Fg = mg, measured in newtons.' },
    { c: 8, d: 'E', q: 'What is the weight of a 5 kg bag? (take g = 10 m/s²)', o: ['50 N', '5 N', '0.5 N', '15 N'], a: 0, x: 'Fg = mg = 5 × 10 = 50 N.' },
    { c: 8, d: 'E', q: 'Which one changes when you move to a different planet?', o: ['Weight', 'Mass', 'Both stay the same', 'Neither — both change'], a: 0, x: 'Mass is constant; weight depends on the local gravity.' },
    { c: 8, d: 'E', q: 'The normal force acts:', o: ['Perpendicular to the surface', 'Parallel to the surface', 'Always downward', 'In the direction of motion'], a: 0, x: 'It is the push of a surface, at 90° to it.' },
    { c: 8, d: 'E', q: 'In which direction does friction act?', o: ['Parallel to the surface, opposite to the motion', 'Perpendicular to the surface', 'Always downward', 'In the direction of motion'], a: 0, x: 'Friction opposes motion and acts along the surface.' },
    { c: 8, d: 'M', q: 'A 60 kg astronaut is on the Moon, where g = 1.6 m/s². What is the astronaut’s weight there?', o: ['96 N', '60 N', '600 N', '37.5 N'], a: 0, x: 'Fg = 60 × 1.6 = 96 N (the mass is still 60 kg).' },
    { c: 8, d: 'M', q: 'A book rests on a table. How does the normal force compare with its weight?', o: ['Equal in size and opposite in direction', 'Greater than the weight', 'Smaller than the weight', 'Zero'], a: 0, x: 'The forces balance, so the book stays in equilibrium.' },
    { c: 8, d: 'M', q: 'Friction depends on:', o: ['The nature of the surfaces and the normal force', 'The colour of the object', 'The speed of light', 'The temperature of the room only'], a: 0, x: 'Rougher surfaces and a larger normal force give more friction.' },
    { c: 8, d: 'M', q: 'For the same two surfaces, which is usually larger?', o: ['The coefficient of static friction (μs)', 'The coefficient of kinetic friction (μk)', 'They are always equal', 'It depends on the colour'], a: 0, x: 'It takes more force to start an object moving than to keep it moving.' },
    { c: 8, d: 'M', q: 'A box is pushed with 20 N but does not move. What is the static friction force?', o: ['20 N, opposite to the push', '0 N', 'More than 20 N', '20 N, in the direction of the push'], a: 0, x: 'Static friction matches the push until it reaches its maximum.' },
    { c: 8, d: 'M', q: 'Where does an object weigh more?', o: ['At the poles', 'At the equator', 'It weighs the same everywhere', 'In space'], a: 0, x: 'The book notes objects weigh more at the poles (closer to Earth’s centre).' },
    { c: 8, d: 'C', q: 'μk = 0.2 and the normal force is 100 N. What is the kinetic friction force?', o: ['20 N', '500 N', '0.002 N', '100 N'], a: 0, x: 'Fk = μk FN = 0.2 × 100 = 20 N.' },
    { c: 8, d: 'C', q: 'A 10 kg box slides on a level floor with μk = 0.3. What is the friction force? (take g = 10 m/s²)', o: ['30 N', '3 N', '100 N', '300 N'], a: 0, x: 'FN = mg = 100 N; Fk = 0.3 × 100 = 30 N.' },
    { c: 8, d: 'C', q: 'A 200 N crate needs an 80 N push to START moving. What is the coefficient of static friction?', o: ['0.4', '2.5', '0.8', '16 000'], a: 0, x: 'μs = Fs,max ÷ FN = 80 ÷ 200 = 0.4.' },
    { c: 8, d: 'C', q: 'Once moving, the 200 N crate needs only 50 N to keep a constant velocity. What is μk?', o: ['0.25', '4', '0.5', '250'], a: 0, x: 'μk = Fk ÷ FN = 50 ÷ 200 = 0.25.' },
    { c: 8, d: 'C', q: 'A 10 kg box is pushed with 50 N while friction is 30 N. What is its acceleration?', o: ['2 m/s²', '5 m/s²', '8 m/s²', '20 m/s²'], a: 0, x: 'Net force = 50 − 30 = 20 N; a = 20 ÷ 10 = 2 m/s².' },
    { c: 8, d: 'C', q: 'A falling object stops speeding up and reaches terminal speed when:', o: ['Air resistance equals its weight', 'Its weight becomes zero', 'Air resistance becomes zero', 'It reaches the ground'], a: 0, x: 'The net force becomes zero, so the speed stays constant.' },
    { c: 8, d: 'C', q: 'As a falling object speeds up, the air resistance on it:', o: ['Increases', 'Decreases', 'Stays the same', 'Disappears'], a: 0, x: 'Air resistance grows with speed.' },
  ];

  window.QUESTION_SETS = window.QUESTION_SETS || {};
  window.QUESTION_SETS.g11 = {
    label: 'Grade 11',
    book: 'Chapters 1–3',
    topics,
    questions: Q.map((q, i) => Object.assign({ id: 'k' + (i + 1), s: 'g11', t: 'mcq' }, q))
  };
})();
