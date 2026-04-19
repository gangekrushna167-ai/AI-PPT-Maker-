import { Assignment, SlideContent } from '../types';

const generateTemplate = (topic: string, slides: SlideContent[]): Assignment => ({
  id: `tpl-${topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
  topic,
  tone: 'Professional',
  language: 'English',
  marks: 10,
  teacherMode: 'Average',
  versions: [
    { mode: 'Normal', slides },
    { mode: 'Simplified', slides: slides.map(s => ({ ...s, points: s.points.slice(0, 2) })) },
    { mode: 'Detailed', slides: slides.map(s => ({ ...s, points: [...s.points, 'Added technical depth and case studies.'] })) },
    { mode: 'Handwritten', slides }
  ],
  createdAt: Date.now()
});

export const TEMPLATE_DATA: Record<string, Assignment> = {
  // --- Mathematics ---
  'Algebra': generateTemplate('Algebra Basics', [
    { title: 'Variables & Constants', points: ['x, y, z are variables.', 'Numbers are constants.', 'Expressions vs Equations.'], speech: 'Algebra uses symbols to represent unknown numbers, allowing us to solve complex problems easily.' },
    { title: 'Linear Equations', points: ['Balancing the equation.', 'Transposition method.', 'Finding the value of x.'], speech: 'The goal of solving an equation is to isolate the variable on one side to find its value.' }
  ]),
  'Geometry': generateTemplate('Basics of Geometry', [
    { title: 'Points, Lines & Planes', points: ['Definitions and symbols.', 'Types of Angles.', 'Parallel and Perpendicular lines.'], speech: 'Geometry is the study of shapes, sizes, and the properties of space around us.' },
    { title: 'Properties of Polygons', points: ['Triangles and Quadrilaterals.', 'Sum of internal angles.', 'Pythagoras Theorem.'], speech: 'Understanding the properties of simple polygons is fundamental to architectural and engineering designs.' }
  ]),
  'Trigonometry': generateTemplate('Basics of Trigonometry', [
    { title: 'Trigonometric Ratios', points: ['Sine (Opposite/Hypotenuse).', 'Cosine (Adjacent/Hypotenuse).', 'Tangent (Opposite/Adjacent).'], speech: 'Trigonometry is the study of relationships between side lengths and angles of triangles.' },
    { title: 'Standard Angles', points: ['Values at 0°, 30°, 45°, 60°, 90°.', 'Trigonometric Table usage.', 'Pythagorean Identities.'], speech: 'Knowing basic values and identities helps in solving complex geometry and physics problems.' }
  ]),
  'Mensuration': generateTemplate('Mensuration: Area & Volume', [
    { title: '2D Shapes', points: ['Area of Circle (πr²).', 'Perimeter of Rectangle 2(l+b).', 'Area of Triangle (½ × b × h).'], speech: 'Mensuration deals with the measurement of geometric figures and their parameters like length and area.' },
    { title: '3D Solids', points: ['Volume of Cylinder (πr²h).', 'Surface area of Sphere (4πr²).', 'Volume of Cone (⅓πr²h).'], speech: 'Calculating volumes of 3D objects is essential in engineering and manufacturing.' }
  ]),
  'Statistics': generateTemplate('Statistics & Data Handling', [
    { title: 'Measures of Central Tendency', points: ['Mean (Average).', 'Median (Middle value).', 'Mode (Most frequent value).'], speech: 'Statistics helps us summarize large amounts of data into simple, understandable numbers.' },
    { title: 'Data Representation', points: ['Frequency distribution tables.', 'Bar charts and Histograms.', 'Pie charts.'], speech: 'Visualizing data makes it much easier to identify patterns and trends.' }
  ]),
  'Probability': generateTemplate('Theory of Probability', [
    { title: 'Theoretical Probability', points: ['Total number of outcomes.', 'Favorable outcomes.', 'Range (0 to 1).'], speech: 'Probability is the branch of math that measures the likelihood of an event occurring.' },
    { title: 'Types of Events', points: ['Certain and Impossible events.', 'Complementary events.', 'Mutually exclusive events.'], speech: 'Understanding probability is key to making informed decisions in science and business.' }
  ]),

  // --- Science: Physics ---
  'Physics: Motion': generateTemplate('Physics: Motion', [
    { title: 'Basic Concepts', points: ['Distance vs Displacement.', 'Scalar vs Vector quantities.', 'Uniform vs Non-uniform motion.'], speech: 'Understanding motion starts with distinguishing between distance, the total path covered, and displacement, the shortest path.' },
    { title: 'Equations of Motion', points: ['v = u + at', 's = ut + 1/2 at^2', 'v^2 = u^2 + 2as'], speech: 'These three equations are fundamental to describing motion under constant acceleration.' }
  ]),
  'Force & Laws': generateTemplate('Force & Laws of Motion', [
    { title: 'Newton\'s First Law', points: ['Concept of Inertia.', 'State of rest or motion.', 'External unbalanced force.'], speech: 'An object remains in its state of rest or uniform motion unless acted upon by an external force.' },
    { title: 'Momentum & 2nd Law', points: ['F = ma (Force = Mass × Acceleration).', 'Conservation of Momentum.', 'Rate of change of momentum.'], speech: 'Newton\'s second law gives us a way to calculate the exact force needed to calculate the impact of a force.' }
  ]),
  'Electricity': generateTemplate('Electricity & Ohms Law', [
    { title: 'Electric Current', points: ['Flow of electrons.', 'S.I unit: Ampere.', 'Ammeter connection.'], speech: 'Electricity is the flow of electric charge, which powers almost everything in our modern lives.' },
    { title: 'Ohm\'s Law', points: ['V = IR relationship.', 'Resistance and Resistivity.', 'Factors affecting resistance.'], speech: 'Ohm\'s Law describes how voltage, current, and resistance are related in an electrical circuit.' }
  ]),
  'Magnetism': generateTemplate('Magnetism', [
    { title: 'Magnetic Fields', points: ['Field lines and properties.', 'Right-hand thumb rule.', 'Solenoid basics.'], speech: 'A current-carrying conductor produces a magnetic field around it, a discovery that revolutionized technology.' },
    { title: 'Electromagnetic Induction', points: ['Electric Motor basics.', 'AC and DC current.', 'Safety measures (fuse, grounding).'], speech: 'Understanding magnetism is crucial for everything from power generation to your computer hard drive.' }
  ]),
  'Light': generateTemplate('Light: Reflection & Refraction', [
    { title: 'Reflection of Light', points: ['Laws of reflection.', 'Plane and Spherical mirrors.', 'Real and Virtual images.'], speech: 'Reflection is the bouncing back of light when it hits a smooth surface like a mirror.' },
    { title: 'Refraction & Lenses', points: ['Snell\'s Law.', 'Convex and Concave lenses.', 'Power of Lens.'], speech: 'Refraction is the bending of light as it passes from one medium to another, such as from air to water.' }
  ]),

  // --- Science: Chemistry ---
  'Atoms & Molecules': generateTemplate('Atoms & Molecules', [
    { title: 'Law of Conservation of Mass', points: ['Mass can neither be created nor destroyed.', 'Atoms are indivisible.', 'Constant proportions law.'], speech: 'Chemistry begins with the absolute laws of matter, ensuring that mass remains constant in chemical reactions.' },
    { title: 'Atomic Structure', points: ['Protons, Neutrons, Electrons.', 'Valency and Shells.', 'Isotopes and Isobars.'], speech: 'The identity of an element is determined by its atomic structure, specifically the number of protons.' }
  ]),
  'Chemical Reactions': generateTemplate('Chemical Reactions & Equations', [
    { title: 'Types of Reactions', points: ['Combination and Decomposition.', 'Displacement and Double Displacement.', 'Redox reactions.'], speech: 'Chemical reactions are processes where old bonds break and new bonds form to create new substances.' },
    { title: 'Equation Balancing', points: ['The Hit and Trial method.', 'Balancing atoms of each element.', 'Writing balanced equations.'], speech: 'A balanced equation accurately represents the law of conservation of mass in a reaction.' }
  ]),
  'Acids & Bases': generateTemplate('Acids, Bases & Salts', [
    { title: 'Chemical Properties', points: ['Sour vs Bitter taste.', 'Reaction with metals.', 'The pH scale (0 to 14).'], speech: 'Acids and bases are substances that react differently with indicators and each other.' },
    { title: 'Neutralization', points: ['Acid + Base -> Salt + Water.', 'Everyday applications.', 'Importance of pH in life.'], speech: 'Neutralization is a key reaction used in medicine, agriculture, and industry.' }
  ]),
  'Periodic Table': generateTemplate('Periodic Classification', [
    { title: 'Mendeleev vs Modern', points: ['Atomic mass vs Atomic number.', 'Groups and Periods.', 'Position of Hydrogen.'], speech: 'The periodic table is the most important tool for chemists, organizing all known elements.' },
    { title: 'Trends in Table', points: ['Atomic size trends.', 'Valency and Metallic character.', 'Electronegativity.'], speech: 'Trends in the periodic table help us predict the behavior of elements across rows and columns.' }
  ]),

  // --- Science: Biology ---
  'Cell Structure': generateTemplate('Cell: The Unit of Life', [
    { title: 'Plant vs Animal Cells', points: ['Cell wall and Chloroplasts.', 'Large vs Small vacuoles.', 'Shape differences.'], speech: 'While all cells are basic units of life, plant and animal cells have specialized structures.' },
    { title: 'Cell Organelles', points: ['Nucleus (The Brain).', 'Mitochondria (Powerhouse).', 'Ribosomes and ER.'], speech: 'Organelles are tiny "organs" inside cells that perform specific tasks to keep the cell alive.' }
  ]),
  'Human Body': generateTemplate('Life Processes: Human Body', [
    { title: 'Digestive System', points: ['Ingestion to Egestion.', 'Enzymes and Bile.', 'Small intestine absorption.'], speech: 'The digestive system breaks down food into nutrients that the body can use for energy.' },
    { title: 'Circulatory System', points: ['Heart structure.', 'Arteries and Veins.', 'Blood and Lymph.'], speech: 'Circulation is the transport system of the human body, delivering oxygen and removing wastes.' }
  ]),
  'Plants': generateTemplate('Plant Physiology', [
    { title: 'Photosynthesis', points: ['Chlorophyll and Sunlight.', 'Stomata and Transpiration.', 'Glucose and Oxygen production.'], speech: 'Plants are autotrophs, meaning they create their own food using the suns energy.' },
    { title: 'Plant Tissues', points: ['Meristematic vs Permanent.', 'Xylem and Phloem.', 'Sclerenchyma vs Collenchyma.'], speech: 'Plant tissues are specialized for growth, support, and the transport of nutrients.' }
  ]),
  'Reproduction': generateTemplate('Reproduction in Organisms', [
    { title: 'Asexual vs Sexual', points: ['Binary fission and Budding.', 'Spore formation.', 'Advantages of variation.'], speech: 'Reproduction ensures the continuity of species and introduces variations essential for evolution.' },
    { title: 'Human Reproduction', points: ['Male and Female systems.', 'The Gestation period.', 'Reproductive health.'], speech: 'Sexual reproduction in humans involves specialized systems and processes designed for offspring creation.' }
  ]),
  'Ecology': generateTemplate('Our Environment & Ecology', [
    { title: 'Ecosystem Components', points: ['Biotic vs Abiotic.', 'Food chains and webs.', 'Trophic levels.'], speech: 'Ecology is the study of how living things interact with each other and their environment.' },
    { title: 'Environmental Issues', points: ['Ozone depletion.', 'Waste management.', 'Biodiversity loss.'], speech: 'Human activities are putting pressure on global ecosystems, requiring urgent sustainable solutions.' }
  ]),

  // --- Social Science ---
  'Ancient India': generateTemplate('Ancient Indian History', [
    { title: 'Indus Valley Civilization', points: ['Town planning and Drainage.', 'Trade and Agriculture.', 'Mystery of decline.'], speech: 'The Indus Valley Civilization was one of the worlds first urban cultures, known for its advanced planning.' },
    { title: 'Mauryan Empire', points: ['Chandragupta and Chanakya.', 'Ashoka the Great.', 'Dhamma and Pillars.'], speech: 'The Mauryan Empire unified the Indian subcontinent for the first time under a centralized rule.' }
  ]),
  'Medieval India': generateTemplate('Medieval Indian History', [
    { title: 'Delhi Sultanate', points: ['Slave, Khilji, Tughlaq dynasties.', 'Administrative reforms.', 'Art and Architecture.'], speech: 'Medieval India saw the rise of the Delhi Sultanate, which brought new cultural and political influences.' },
    { title: 'Mughal Empire', points: ['Babur to Aurangzeb.', 'Akbars administration.', 'Golden age of Taj Mahal.'], speech: 'The Mughal Empire is famous for its administrative strength and magnificent architectural legacy.' }
  ]),
  'Freedom Struggle': generateTemplate('India\'s Struggle for Independence', [
    { title: 'The 1857 Revolt', points: ['Causes and Leaders.', 'Sepoy Mutiny.', 'Impact on British policy.'], speech: 'The 1857 Revolt was the first major challenge to British rule in India, paving the way for future movements.' },
    { title: 'Gandhian Era', points: ['Non-cooperation and Civil Disobedience.', 'Salt Satyagraha.', 'Quit India Movement.'], speech: 'Mahatma Gandhi transformed the independence struggle into a mass movement through the philosophy of Ahimsa.' }
  ]),
  'World Wars': generateTemplate('The World Wars', [
    { title: 'First World War', points: ['Causes (MANIA).', 'Trench warfare.', 'Treaty of Versailles.'], speech: 'World War I changed the map of the world and led to the collapse of major empires.' },
    { title: 'Second World War', points: ['Rise of Dictators.', 'Axis vs Allies.', 'The United Nations.'], speech: 'World War II was the deadliest conflict in human history, leading to a new world order.' }
  ]),
  'Climate': generateTemplate('Climate of India', [
    { title: 'The Monsoon Pattern', points: ['S.W and N.E monsoons.', 'Factors affecting climate.', 'Cyclonic disturbances.'], speech: 'India\'s climate is dominated by the monsoon, which affects everything from agriculture to the economy.' },
    { title: 'Climatic Regions', points: ['Himalayan to Tropical.', 'Rainfall distribution.', 'The Thar Desert.'], speech: 'Due to its vast size, India has diverse climatic zones ranging from alpine to tropical.' }
  ]),
  'Resources': generateTemplate('Resources & Development', [
    { title: 'Types of Resources', points: ['Natural, Human and Man-made.', 'Renewable vs Non-renewable.', 'Sustainable development.'], speech: 'Resources are everything available in our environment that can be used to satisfy our needs.' },
    { title: 'Resource Planning', points: ['Identification and Inventory.', 'Conservation techniques.', 'National forest policy.'], speech: 'Global planning and conservation are necessary to ensure resources are available for future generations.' }
  ]),
  'Industries': generateTemplate('Industries in India', [
    { title: 'Classification', points: ['Agro-based (Textiles, Sugar).', 'Mineral-based (Iron, Steel).', 'IT/Service sector growth.'], speech: 'Industries are the backbone of a countrys economic development, converting raw materials into utility products.' },
    { title: 'Industrial Location', points: ['Raw material proximity.', 'Labor and Power supply.', 'Market accessibility.'], speech: 'Several physical and human factors decide where an industry will be successfully established.' }
  ]),
  'Agriculture': generateTemplate('Agriculture in India', [
    { title: 'Types of Farming', points: ['Subsistence Farming.', 'Commercial Farming.', 'Plantation Agriculture.'], speech: 'Agriculture is the primary occupation for more than half of India\'s population.' },
    { title: 'Major Crops', points: ['Food Crops (Rice, Wheat).', 'Cash Crops (Cotton, Jute).', 'Horticulture (Fruits, Vegetables).'], speech: 'India is one of the world\'s largest producers of rice and wheat.' }
  ]),
  'Constitution of India': generateTemplate('Indian Constitution', [
    { title: 'Preamble', points: ['Sovereign, Socialist, Secular.', 'Democratic Republic.', 'Justice, Liberty, Equality.'], speech: 'The Preamble is the introductory statement that sets the core values of our nation.' },
    { title: 'The Three Pillars', points: ['Legislature (Law making).', 'Executive (Implementation).', 'Judiciary (Justice).'], speech: 'Our democracy is supported by three independent pillars that ensure a check and balance system.' }
  ]),
  'Judiciary': generateTemplate('The Indian Judiciary', [
    { title: 'Court Hierarchy', points: ['Supreme Court of India (Highest).', 'High Courts (State level).', 'District & Subordinate Courts.'], speech: 'The Indian Judiciary is an independent body that interprets laws and delivers justice.' },
    { title: 'Legal Procedures', points: ['Civil cases vs Criminal cases.', 'Public Interest Litigation (PIL).', 'Fundamental Rights protection.'], speech: 'Any citizen can approach the court if their rights are violated, through mechanisms like PIL.' }
  ]),
  'Sound': generateTemplate('Basics of Sound', [
    { title: 'Production & Propagation', points: ['Vibration of objects.', 'Requires a medium (Solid, Liquid, Gas).', 'Cannot travel in Vacuum.'], speech: 'Sound is a form of energy that travels as waves through matter.' },
    { title: 'Characteristics', points: ['Frequency (Pitch).', 'Amplitude (Loudness).', 'Speed of Sound.'], speech: 'High frequency makes a sound high-pitched, while high amplitude makes it louder.' }
  ]),
  'Heat': generateTemplate('Heat & Temperature', [
    { title: 'Transfer of Heat', points: ['Conduction (Solids).', 'Convection (Liquids/Gases).', 'Radiation (No medium needed).'], speech: 'Heat always flows from a hotter object to a colder one until they reach the same temperature.' },
    { title: 'Measurement', points: ['Clinical vs Laboratory Thermometers.', 'Celsius, Fahrenheit, and Kelvin scales.', 'Thermal expansion.'], speech: 'Temperature is a measure of the degree of hotness or coldness of an object.' }
  ]),
  'Chemical Bonding': generateTemplate('Chemical Bonding', [
    { title: 'Ionic & Covalent', points: ['Transfer of electrons (Ionic).', 'Sharing of electrons (Covalent).', 'Noble gas configuration (Octet rule).'], speech: 'Atoms bond together to become stable, usually by completing their outer electron shell.' },
    { title: 'Molecular Structures', points: ['Lewis Dot structures.', 'Polar vs Non-polar bonds.', 'Hydrogen bonding.'], speech: 'The way atoms are bonded determines the physical and chemical properties of the substance.' }
  ]),
  'Diversity in Organisms': generateTemplate('Classification of Life', [
    { title: 'The Five Kingdoms', points: ['Monera, Protista, Fungi.', 'Plantae (Plants).', 'Animalia (Animals).'], speech: 'Scientists classify living things into kingdoms based on their cell structure and how they get food.' },
    { title: 'Animal Kingdom', points: ['Invertebrates (Insects, Snails).', 'Vertebrates (Fish, Mammals).', 'Evolutionary hierarchy.'], speech: 'The animal kingdom is diverse, ranging from simple sponges to highly complex mammals like humans.' }
  ]),
  'The Great Himalayas': generateTemplate('The Great Himalayas', [
    { title: 'Geological Structure', points: ['Young fold mountains.', 'Formed by Tectonic plate collision.', 'Greater, Lesser, and Outer Himalayas.'], speech: 'The Himalayas are the highest mountain range in the world, acting as a natural barrier for India.' },
    { title: 'Significance', points: ['Source of Major Rivers.', 'Climate regulator.', 'High Peaks like Mt. Everest and K2.'], speech: 'Apart from being a majestic range, the Himalayas are crucial for India\'s climate and water supply.' }
  ]),
  'Rivers of India': generateTemplate('Major Rivers of India', [
    { title: 'Himalayan Rivers', points: ['Perennial (Flow all year).', 'Ganga, Indus, Brahmaputra.', 'Deep Gorges and Valleys.'], speech: 'The Himalayan rivers are fed by melting glaciers and are sacred to millions of Indians.' },
    { title: 'Peninsular Rivers', points: ['Seasonal flow.', 'Narmada, Tapi, Godavari, Krishna.', 'Hard-rock beds.'], speech: 'The peninsular rivers flow through older geological structures and depend on rainfall.' }
  ]),
  'Indian Monsoon': generateTemplate('Indian Monsoon Mechanism', [
    { title: 'Seasonal Reversal', points: ['Differential heating of Land and Sea.', 'S.W. Monsoon (Rainy season).', 'N.E. Monsoon (Retreating monsoon).'], speech: 'The Monsoon is the lifeblood of Indian agriculture, bringing the essential rains.' },
    { title: 'Distribution of Rain', points: ['Western Ghats (High rainfall).', 'Rajasthan (Low rainfall).', 'Impact on Economy.'], speech: 'Rainfall in India is highly uneven, affecting crop patterns and regional prosperity.' }
  ]),
  'Indus Valley': generateTemplate('Indus Valley Civilization', [
    { title: 'Urban Planning', points: ['Grid-based road system.', 'Advanced Drainage system.', 'Use of baked bricks.'], speech: 'The Indus Valley Civilization was famous for its incredible urban engineering and cleanliness.' },
    { title: 'Daily Life', points: ['Granaries for food storage.', 'Trade with Mesopotamia.', 'Unique Seals and jewelry.'], speech: 'The people of this civilization were advanced traders and skilled craftsmen.' }
  ]),
  'Mughal Legacy': generateTemplate('Mughal Art & Architecture', [
    { title: 'Grand Structures', points: ['Taj Mahal (White marble).', 'Red Fort and Jama Masjid.', 'Persian and Indian fusion.'], speech: 'The Mughals left behind a rich architectural legacy that still defines India\'s landscape.' },
    { title: 'Administration', points: ['Mansabdari system.', 'Revenues from Land.', 'Din-e-Ilahi of Akbar.'], speech: 'Beyond art, the Mughals built a sophisticated administrative system for their vast empire.' }
  ]),
  'Gandhi Era': generateTemplate('The Gandhian Era', [
    { title: 'Satyagraha Philosophy', points: ['Truth and Non-violence (Ahimsa).', 'Champaran and Kheda SATYAGRAHA.', 'Civil Disobedience.'], speech: 'Mahatma Gandhi led India to independence using the unique spiritual weapon of Satyagraha.' },
    { title: 'Major Movements', points: ['Non-Cooperation Movement (1920).', 'Dandi March (Salt Satyagraha).', 'Quit India Movement (1942).'], speech: 'These mass movements unified millions of Indians against British colonial rule.' }
  ]),
  'Panchayati Raj': generateTemplate('Panchayati Raj System', [
    { title: 'Grassroots Democracy', points: ['Gram Panchayat (Village level).', 'Panchayat Samiti (Block level).', 'Zila Parishad (District level).'], speech: 'Panchayati Raj brings power directly to the people at the village level.' },
    { title: 'The 73rd Amendment', points: ['Constitutional status.', 'Reservation for women.', 'Regular elections.'], speech: 'This landmark amendment ensured that local governance is a mandatory part of Indian democracy.' }
  ]),
  'ISRO Missions': generateTemplate('India in Space: ISRO', [
    { title: 'Chandrayaan Program', points: ['Lunar exploration missions.', 'Soft landing on Moon\'s South Pole.', 'Indigenous technology.'], speech: 'ISRO\'s Chandrayaan missions have put India in the elite club of space-faring nations.' },
    { title: 'Mangalyaan (MOM)', points: ['Mars Orbiter Mission.', 'Successful in first attempt.', 'Most cost-effective mission.'], speech: 'The success of Mangalyaan proved India\'s capability to reach deep space on a budget.' }
  ]),
  'Sectors of India': generateTemplate('Sectors of Indian Economy', [
    { title: 'Primary vs Secondary', points: ['Agriculture (Primary).', 'Manufacturing (Secondary).', 'Shift from farms to factories.'], speech: 'The Indian economy is transitioning from being primarily agricultural to a more industrial one.' },
    { title: 'The Tertiary Sector', points: ['Service sector (IT, Banking).', 'Fastest growing sector.', 'Largest contributor to GDP.'], speech: 'The service sector is now the powerhouse of the Indian economy, led by IT and finance.' }
  ]),
  'Indian Scientists': generateTemplate('Great Indian Scientists', [
    { title: 'Modern Pioneers', points: ['C.V. Raman (Raman Effect).', 'Homi J. Bhabha (Nuclear energy).', 'Vikram Sarabhai (Space research).'], speech: 'India has produced world-class scientists who laid the foundation for its modern technological progress.' },
    { title: 'APJ Abdul Kalam', points: ['People\'s President.', 'Missile Man of India.', 'Inspiration for students.'], speech: 'Dr. Kalam was a visionary scientist who dreamed of making India a developed nation through science.' }
  ]),
  'Indian Wildlife': generateTemplate('Wildlife & Nature in India', [
    { title: 'Biodiversity Hotspots', points: ['Western Ghats and Himalayas.', 'Endemic species (Lion-tailed Macaque).', 'Rich flora and fauna.'], speech: 'India is one of the world\'s megadiverse countries, boasting incredible wildlife variety.' },
    { title: 'Conservation Efforts', points: ['Project Tiger (1973).', 'Wildlife Protection Act.', 'National Parks and Sanctuaries.'], speech: 'Protecting our natural heritage is vital for ecological balance and future generations.' }
  ]),
  'Indian Festivals': generateTemplate('Festivals of India', [
    { title: 'Cultural Unity', points: ['Diwali (Festival of Lights).', 'Holi (Festival of Colors).', 'Eid-ul-Fitr and Christmas.'], speech: 'Indian festivals are a vibrant celebration of our "Unity in Diversity".' },
    { title: 'Harvest Festivals', points: ['Pongal (Tamil Nadu).', 'Bihu (Assam).', 'Makar Sankranti.'], speech: 'Harvest festivals reflect our deep-rooted connection with nature and agriculture.' }
  ]),
  'Indian Dances': generateTemplate('Indian Classical & Folk Dances', [
    { title: 'Classical Traditions', points: ['Kathak (North India).', 'Bharatanatyam (Tamil Nadu).', 'Kathakali (Kerala).'], speech: 'Indian classical dances are an ancient art form combining rhythm, expression, and story-telling.' },
    { title: 'Vibrant Folk Dances', points: ['Bhangra (Punjab).', 'Garba (Gujarat).', 'Lavani (Maharashtra).'], speech: 'Folk dances celebrate the local culture and joyous spirit of the Indian states.' }
  ]),
  'Ancient Science': generateTemplate('Science in Ancient India', [
    { title: 'Mathematics & Astronomy', points: ['Aryabhatta (Concept of Zero).', 'Decimal system origin.', 'Planetary motion theories.'], speech: 'Ancient Indian mathematicians made groundbreaking discoveries that changed the world forever.' },
    { title: 'Medicine & Surgery', points: ['Sushruta (Father of Surgery).', 'Ayurveda (Traditional medicine).', 'Charaka Samhita.'], speech: 'Ancient India was a global leader in medical knowledge and surgical procedures.' }
  ]),
  '1857 Revolt': generateTemplate('The 1857 Revolt', [
    { title: 'The First War of Independence', points: ['Outbreak at Meerut.', 'Mangal Pandey and Rani Lakshmi Bai.', 'Causes: Political, Social, Religious.'], speech: 'The Revolt of 1857 was the first large-scale uprising against British East India Company rule.' },
    { title: 'Consequences', points: ['End of Company rule.', 'Indian administration under the Crown.', 'Growth of modern Nationalism.'], speech: 'Though suppressed, the revolt sowed the seeds of the long struggle for Indian independence.' }
  ]),
  'Democracy': generateTemplate('Democratic Politics', [
    { title: 'Power Sharing', points: ['Belgium vs Sri Lanka model.', 'Horizontal and Vertical sharing.', 'Why sharing is desirable.'], speech: 'Power sharing is the spirit of democracy, ensuring that no single group holds absolute control.' },
    { title: 'Electoral Process', points: ['Constituencies and Voter lists.', 'Election Commission role.', 'Model Code of Conduct.'], speech: 'Free and fair elections are the pillar of a functioning democracy, allowing people to choose their leaders.' }
  ]),
  'Money & Banking': generateTemplate('Money & Credit', [
    { title: 'Role of Money', points: ['Double coincidence of wants.', 'Medium of exchange.', 'Modern forms: Currency, Deposits.'], speech: 'Money eliminated the difficulties of the barter system, acting as a universal medium of exchange.' },
    { title: 'Banking in India', points: ['RBI (Reserve Bank of India).', 'Loans and Interest.', 'SHGs (Self Help Groups).'], speech: 'Banks bridge the gap between savers and borrowers, providing the credit needed for growth.' }
  ]),
  'Poverty': generateTemplate('Poverty as a Challenge', [
    { title: 'Poverty Line', points: ['Calorie and Income measures.', 'Rural vs Urban poverty.', 'Global comparisons.'], speech: 'Poverty is a multi-dimensional problem that goes beyond just low income to include lack of health and education.' },
    { title: 'Anti-Poverty Measures', points: ['MGNREGA and PMGY.', 'Economic growth focus.', 'Targeted specific programs.'], speech: 'The Indian government uses a two-pronged strategy: promoting economic growth and targeted poverty alleviation.' }
  ]),
  'Development': generateTemplate('Development & Sustainability', [
    { title: 'What is Development?', points: ['Different people, different goals.', 'Income and Other goals.', 'Human Development Index (HDI).'], speech: 'Development is not just about wealth; it is about improving the quality of human life and freedoms.' },
    { title: 'Sustainability', points: ['Groundwater depletion.', 'Renewable energy transition.', 'Equity for future generations.'], speech: 'Sustainable development ensures that we meet our needs without compromising the ability of future generations to meet theirs.' }
  ]),
  'Rights & Duties': generateTemplate('Fundamental Rights & Duties', [
    { title: 'Fundamental Rights', points: ['Right to Equality.', 'Right to Freedom of Religion.', 'Cultural and Educational Rights.'], speech: 'The Constitution of India provides six fundamental rights which are essential for the dignity of every citizen.' },
    { title: 'Fundamental Duties', points: ['Respect for the Constitution and Flag.', 'Promoting harmony and brotherhood.', 'Protecting the environment.'], speech: 'Rights come with responsibilities; our fundamental duties remind us of our commitment to our nation and society.' }
  ]),
  'Globalisation': generateTemplate('Globalisation & Economy', [
    { title: 'Integration of Markets', points: ['Role of MNCs.', 'Trade barriers removal.', 'Technological boost.'], speech: 'Globalisation is the process of rapid integration or interconnection between countries.' },
    { title: 'Impact on India', points: ['Better quality products.', 'Increased competition.', 'Job creation in Service sector.'], speech: 'Globalisation has brought both opportunities and challenges to the Indian markets.' }
  ]),
  'Artificial Intelligence': generateTemplate('Basics of AI', [
    { title: 'What is AI?', points: ['Machine learning basics.', 'Automation of tasks.', 'Neural networks concept.'], speech: 'AI aims to create machines that can perform tasks that would normally require human intelligence.' },
    { title: 'AI in daily life', points: ['Recommendation systems.', 'Face recognition.', 'Voice assistants (Alexa, Siri).'], speech: 'You are already using AI every day, from social media filters to movie recommendations.' }
  ]),
  'Financial Literacy': generateTemplate('Financial Literacy', [
    { title: 'Smart Saving', points: ['Budgeting (50/30/20 rule).', 'Emergency funds.', 'Needs vs Wants.'], speech: 'Financial literacy is the ability to understand and effectively use various financial skills.' },
    { title: 'Investment Basics', points: ['Fixed Deposits (FD).', 'Mutual Funds.', 'Power of Compounding.'], speech: 'Starting early is the key to building wealth over the long term through compounding.' }
  ]),
  'Stock Market Basics': generateTemplate('Stock Market Overview', [
    { title: 'What are Stocks?', points: ['IPO (Initial Public Offering).', 'Shares and Ownership.', 'NSE & BSE (Exchanges).'], speech: 'Buying a stock means you are buying a small piece of ownership in a company.' },
    { title: 'Indices', points: ['NIFTY 50.', 'SENSEX.', 'Bull vs Bear markets.'], speech: 'Indices like Nifty and Sensex help us track the overall performance of the stock market.' }
  ]),
  'Cyber Security': generateTemplate('Cyber Security Basics', [
    { title: 'Digital Safety', points: ['Strong password habits.', 'Two-factor authentication (2FA).', 'Phishing awareness.'], speech: 'Protecting your digital identity is just as important as protecting your physical home.' },
    { title: 'Cyber Crimes', points: ['Identity theft.', 'Financial fraud.', 'Social engineering tactics.'], speech: 'Cyber security involves using tools and habits to defend against malicious attacks online.' }
  ]),

  // --- Languages ---
  'English Grammar': generateTemplate('English Grammar Essentials', [
    { title: 'Tenses and Voices', points: ['Present, Past, Future mastery.', 'Active vs Passive voice.', 'Direct and Indirect speech.'], speech: 'Grammar is the system and structure of a language that helps us communicate clearly and effectively.' },
    { title: 'Creative Writing', points: ['Paragraph structuring.', 'Descriptive vs Argumentative.', 'Email/Letter formal styles.'], speech: 'Writing is a skill that improves with practice, focusing on clarity, flow, and vocabulary.' }
  ]),
  'Hindi Grammar': generateTemplate('Hindi Grammar (हिंदी व्याकरण)', [
    { title: 'वर्णमाला और वर्तनी', points: ['स्वर और व्यंजन.', 'अनुस्वार और अनुनासिक.', 'शुद्ध वर्तनी के नियम.'], speech: 'हिंदी व्याकरण भाषा को शुद्ध रूप में बोलने और लिखने का मार्ग प्रशस्त करता है।' },
    { title: 'संधि और समास', points: ['शब्दों का मेल.', 'तत्पुरुष, द्वंद्व, बहुव्रीहि.', 'मुहावरे और लोकोक्तियाँ.'], speech: 'संधि और समास भाषा को संक्षिप्त और प्रभावशाली बनाने में सहायक होते हैं।' }
  ]),
  'Regional Languages': generateTemplate('Regional Languages of India', [
    { title: 'Unity in Diversity', points: ['Scheduled Languages (8th Schedule).', 'Linguistic States.', 'Preserving mother tongues.'], speech: 'India\'s linguistic diversity is a source of national pride, with each language carrying its own culture.' },
    { title: 'Basic Phrases', points: ['Greetings in Marathi/Bengali.', 'Common nouns in Gujarati.', 'Script identification.'], speech: 'Learning basic regional language phrases fosters respect and understanding across different states.' }
  ]),

  // --- Legacy / Others ---
  'Programming in Python': generateTemplate('Programming in Python', [
    { title: 'Introduction', points: ['High-level, interpreted language.', 'Readable syntax.', 'Dynamically typed.'], speech: 'Python is a powerful yet easy-to-learn programming language used in web development, AI, and data science.' },
    { title: 'Data Types', points: ['Integers and Floats.', 'Strings and Booleans.', 'Lists, Tuples, and Dictionaries.'], speech: 'Every piece of data in Python belongs to a specific type, which determines what you can do with it.' }
  ]),
  'Marathi Grammar': generateTemplate('Marathi Grammar', [
    { title: 'नाम आणि उपप्रकार', points: ['सामान्य नाम.', 'विशेष नाम.', 'भाववाचक नाम.'], speech: 'आज आपण नामाचे विविध प्रकार अभ्यासणार आहोत, जे वाक्यात महत्त्वाची भूमिका बजावतात.' },
    { title: 'विभक्ती प्रत्यय', points: ['प्रथमा (प्रत्यय नाही).', 'द्वितीया (स, ला, ते).', 'तृतीया (ने, ए, शी).'], speech: 'विभक्तीमुळे शब्दांचा एकमेकांशी असलेला संबंध स्पष्ट होतो.' }
  ])
};

export const findOfflineTemplate = (topic: string): Assignment | null => {
  const t = topic.toLowerCase().trim();
  for (const key in TEMPLATE_DATA) {
    if (t.includes(key.toLowerCase()) || key.toLowerCase().includes(t)) {
      return { ...TEMPLATE_DATA[key], id: `tpl-${Date.now()}` };
    }
  }
  return null;
};
