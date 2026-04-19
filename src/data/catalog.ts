import { Assignment, SlideContent } from '../types';

export const TEMPLATE_METADATA: Record<string, { category: string, summary: string, keyword: string }> = {
  // Mathematics
  'Algebra': { category: 'Mathematics', summary: 'Linear equations, Polynomials, and Quadratics', keyword: 'algebra-math' },
  'Geometry': { category: 'Mathematics', summary: 'Euclidean geometry, Circle properties, Triangles', keyword: 'geometry-shapes' },
  'Trigonometry': { category: 'Mathematics', summary: 'Sin, Cos, Tan ratios and Identity proofs', keyword: 'trigonometry' },
  'Mensuration': { category: 'Mathematics', summary: 'Surface Area and Volume of 3D shapes', keyword: 'measurement' },
  'Statistics': { category: 'Mathematics', summary: 'Mean, Median, Mode and Data representation', keyword: 'statistics-chart' },
  'Probability': { category: 'Mathematics', summary: 'Events, Outcomes and Theoretical Probability', keyword: 'dice' },

  // Science: Physics
  'Physics: Motion': { category: 'Science', summary: 'Laws of motion, Speed, Velocity, Acceleration', keyword: 'motion-physics' },
  'Force & Laws': { category: 'Science', summary: 'Newton\'s laws and Momentum', keyword: 'force-energy' },
  'Electricity': { category: 'Science', summary: 'Circuits, Ohms Law, and Heating effects', keyword: 'electricity-volt' },
  'Magnetism': { category: 'Science', summary: 'Magnetic fields and Electromagnetic induction', keyword: 'magnet' },
  'Light': { category: 'Science', summary: 'Reflection, Refraction and Human Eye', keyword: 'light-optics' },

  // Science: Chemistry
  'Atoms & Molecules': { category: 'Science', summary: 'Atomic structure, Valency and Isotopes', keyword: 'atom' },
  'Chemical Reactions': { category: 'Science', summary: 'Types of reactions and Equation balancing', keyword: 'chemistry-beaker' },
  'Acids & Bases': { category: 'Science', summary: 'pH scale, Salts and Indicators', keyword: 'acid-base' },
  'Periodic Table': { category: 'Science', summary: 'Trends in groups and periods', keyword: 'periodic-table' },

  // Science: Biology
  'Cell Structure': { category: 'Science', summary: 'Plant vs Animal cells and Organelles', keyword: 'biology-cell' },
  'Human Body': { category: 'Science', summary: 'Digestive, Circulatory and Nervous systems', keyword: 'human-anatomy' },
  'Plants': { category: 'Science', summary: 'Photosynthesis and Plant tissues', keyword: 'leaf-plant' },
  'Reproduction': { category: 'Science', summary: 'Sexual and Asexual reproduction', keyword: 'dna' },
  'Ecology': { category: 'Science', summary: 'Ecosystems, Food chains and Environment', keyword: 'forest-ecology' },

  // Social Science
  'Ancient India': { category: 'Social Science', summary: 'Indus Valley, Vedic Age and Maurya Empire', keyword: 'ancient-india' },
  'Medieval India': { category: 'Social Science', summary: 'Delhi Sultanate and Mughal Empire', keyword: 'medieval-fort' },
  'Freedom Struggle': { category: 'Social Science', summary: '1857 Revolt to 1947 Independence', keyword: 'indian-flag' },
  'World Wars': { category: 'Social Science', summary: 'Causes and Impacts of WWI and WWII', keyword: 'world-war' },
  'Climate': { category: 'Social Science', summary: 'Monsoon, Weather patterns and Seasons', keyword: 'cloud-weather' },
  'Resources': { category: 'Social Science', summary: 'Natural, Human and Land resources', keyword: 'earth-resource' },
  'Agriculture': { category: 'Social Science', summary: 'Farming types and Major crops of India', keyword: 'agriculture-field' },
  'Industries': { category: 'Social Science', summary: 'Manufacturing, Location factors and IT', keyword: 'factory' },
  'Constitution of India': { category: 'Social Science', summary: 'Preamble, Rights, and Duties', keyword: 'law-book' },
  'Judiciary': { category: 'Social Science', summary: 'Supreme Court, High Courts and Legal System', keyword: 'gavel' },
  'Sound': { category: 'Science', summary: 'Propagation, Frequency and Human Hearing', keyword: 'sound-wave' },
  'Heat': { category: 'Science', summary: 'Conduction, Convection and Radiation', keyword: 'thermometer' },
  'Chemical Bonding': { category: 'Science', summary: 'Ionic, Covalent bonds and Lewis structures', keyword: 'molecule' },
  'Diversity in Organisms': { category: 'Science', summary: 'Classification of Plant and Animal Kingdoms', keyword: 'microscope' },
  'Democracy': { category: 'Social Science', summary: 'Elections, Participation and Institutions', keyword: 'voting-india' },
  'Money & Banking': { category: 'Social Science', summary: 'RBI, Commercial banks and Credit', keyword: 'bank-notes' },
  'Poverty': { category: 'Social Science', summary: 'Challenges and Poverty alleviation schemes', keyword: 'village-poverty' },
  'Development': { category: 'Social Science', summary: 'HDI, Per capita income and Sustainability', keyword: 'growth-chart' },
  'Rights & Duties': { category: 'Social Science', summary: 'Fundamental rights and civic responsibilities', keyword: 'human-rights' },
  'Globalisation': { category: 'Social Science', summary: 'MNCs, World Trade Organization and impact', keyword: 'globe' },

  // India Specific Topics
  'The Great Himalayas': { category: 'India Topics', summary: 'Mountain ranges, Peaks and Significance', keyword: 'mountains-india' },
  'Rivers of India': { category: 'India Topics', summary: 'Ganga, Indus, Brahmaputra and Peninsular rivers', keyword: 'river-india' },
  'Indian Monsoon': { category: 'India Topics', summary: 'Mechanism of Monsoon and Rainfall distribution', keyword: 'rain-india' },
  'Indus Valley': { category: 'India Topics', summary: 'Harappa, Mohenjo-Daro and Urban planning', keyword: 'harappa' },
  'Mughal Legacy': { category: 'India Topics', summary: 'Architecture, Taj Mahal and Administration', keyword: 'taj-mahal' },
  'Gandhi Era': { category: 'India Topics', summary: 'Non-Cooperation, Civil Disobedience and Salt Satyagraha', keyword: 'gandhi-charkha' },
  'Panchayati Raj': { category: 'India Topics', summary: 'Village level democracy and 73rd Amendment', keyword: 'village-council' },
  'ISRO Missions': { category: 'India Topics', summary: 'Chandrayaan, Mangalyaan and Space research', keyword: 'rocket-india' },
  'Sectors of India': { category: 'India Topics', summary: 'Primary, Secondary and Tertiary sectors', keyword: 'india-economy' },
  'Indian Scientists': { category: 'India Topics', summary: 'C.V. Raman, Jagadish Chandra Bose and APJ Abdul Kalam', keyword: 'scientist-india' },
  'Indian Wildlife': { category: 'India Topics', summary: 'National Parks, Tiger reserves and Biodiversity hotspots', keyword: 'tiger-india' },
  'Indian Festivals': { category: 'India Topics', summary: 'Diwali, Holi, Eid, Christmas and regional harvest festivals', keyword: 'festival-india' },
  'Indian Dances': { category: 'India Topics', summary: 'Kathak, Bharatanatyam and folk dances like Bhangra', keyword: 'dance-india' },
  'Ancient Science': { category: 'India Topics', summary: 'Aryabhatta, Sushruta and Charaka legacy', keyword: 'ancient-science' },
  '1857 Revolt': { category: 'India Topics', summary: 'Causes, Leaders and impact of First War of Independence', keyword: 'revolt-india' },

  // Languages
  'English Grammar': { category: 'Languages', summary: 'Tenses, Parts of speech and Formatting', keyword: 'alphabet-abc' },
  'Hindi Grammar': { category: 'Languages', summary: 'हिंदी व्याकरण: वर्णमाला, स्वर, व्यंजन', keyword: 'hindi-devnagari' },
  'Regional Languages': { category: 'Languages', summary: 'Marathi, Gujarati, Bengali basics', keyword: 'languages-india' },

  // Skills & Career
  'Artificial Intelligence': { category: 'Skills & Career', summary: 'Basics of Machine Learning', keyword: 'robot' },
  'Financial Literacy': { category: 'Skills & Career', summary: 'Saving, Investing, and Budgeting', keyword: 'money' },
  'Stock Market Basics': { category: 'Skills & Career', summary: 'IPOs, Nifty, Sensex overview', keyword: 'stocks' },
  'Cyber Security': { category: 'Skills & Career', summary: 'Online safety, Passwords and Hacking reality', keyword: 'lock' },
};

export const CATEGORY_LIST = [
  'All', 'Mathematics', 'Science', 'Social Science', 'Languages', 'Skills & Career', 'India Topics'
];
