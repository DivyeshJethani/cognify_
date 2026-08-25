/**
 * COGNIFY — Per-class curriculum variants
 *
 * The main mockData.ts keeps one rich Class-10 Subject per core subject.
 * This file adds genuinely different Chapter/Topic content for Classes 8
 * and 9 (real CBSE syllabi), plus lighter variants for English/Hindi, so
 * that a judge switching class sees real curriculum differences.
 *
 * Topic ids are unique per class+subject (slug includes class id) to avoid
 * collisions with the Class-10 TOPIC_ALIASES inventory.
 */
import type { Subject, Topic, TopicState } from "./types";

/* ---------- helpers ---------- */

type TI = {
  title: string;
  mastery: number;
  due: number | null; // revision due in days, null = none
  id?: string;
};
const mkChapter = (index: number, title: string, topics: TI[]) => ({
  id: `ch-${title.toLowerCase().replace(/\s+/g, "-")}`,
  index,
  title,
  topics: topics.map((t, i) => {
    const state: TopicState =
      t.mastery >= 90
        ? "mastered"
        : t.mastery >= 70
          ? "proficient"
          : t.mastery >= 45
            ? "developing"
            : t.mastery > 0
              ? "weak"
              : "new";
    const revisionStatus: Topic["revisionStatus"] =
      t.due === null
        ? "not-started"
        : t.due <= 0
          ? "overdue"
          : t.due <= 3
            ? "due"
            : "on-track";
    return {
    id:
      t.id ??
      `t-${i}-${t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`,
    title: t.title,
    objectives: [],
    mastery: t.mastery,
    state:
      t.mastery >= 90
        ? "mastered"
        : t.mastery >= 70
          ? "proficient"
          : t.mastery >= 45
            ? "developing"
            : t.mastery > 0
              ? "weak"
              : "new",
    lastStudied: null,
    revisionDueInDays: t.due,
    revisionStatus:
      t.due === null
        ? "not-started"
        : t.due <= 0
          ? "overdue"
          : t.due <= 3
            ? "due"
            : "on-track",
    recommendedAction: t.due !== null && t.due <= 3 ? "revise" : null,
    actionReason: null,
    resources: [],
    estimatedMinutes: 20,
    } as Topic;
  }),
});

const mkSubject = (
  id: string,
  name: string,
  code: string,
  color: Subject["color"],
  chapters: ReturnType<typeof mkChapter>[]
): Subject => ({ id, name, code, color, chapters });

/* ==================================================================
   MATHEMATICS
   ================================================================== */
export const MATH_9 = mkSubject(
  "math-9",
  "Mathematics",
  "MATH",
  "teal",
  [
    mkChapter(1, "Number Systems", [
      { title: "Irrational Numbers", mastery: 68, due: 6 },
      { title: "Real Numbers and Decimal Expansions", mastery: 55, due: null },
    ]),
    mkChapter(2, "Polynomials", [
      { title: "Polynomials in One Variable", mastery: 42, due: 2 },
      { title: "Zeroes of a Polynomial", mastery: 38, due: null },
      { title: "Factorisation of Polynomials", mastery: 31, due: null },
    ]),
    mkChapter(3, "Coordinate Geometry", [
      { title: "Cartesian System and Plotting Points", mastery: 76, due: 9 },
    ]),
    mkChapter(4, "Linear Equations in Two Variables", [
      { title: "Linear Equations and Their Solutions", mastery: 59, due: null },
      { title: "Graph of a Linear Equation", mastery: 51, due: 1 },
    ]),
    mkChapter(5, "Introduction to Euclid's Geometry", [
      { title: "Euclid's Axioms and Postulates", mastery: 71, due: 12 },
    ]),
    mkChapter(6, "Lines and Angles", [
      { title: "Basic Terms and Definitions", mastery: 66, due: 8 },
      { title: "Intersecting and Non-intersecting Lines", mastery: 60, due: null },
      { title: "Pairs of Angles", mastery: 54, due: null },
    ]),
    mkChapter(7, "Triangles", [
      { title: "Congruence of Triangles", mastery: 35, due: null },
      { title: "Criteria for Congruence of Triangles", mastery: 30, due: 3 },
      { title: "Properties of a Triangle", mastery: 44, due: null },
    ]),
    mkChapter(8, "Quadrilaterals", [
      { title: "Angle Sum Property of a Quadrilateral", mastery: 62, due: 5 },
      { title: "Properties of a Parallelogram", mastery: 57, due: null },
    ]),
    mkChapter(9, "Areas of Parallelograms and Triangles", [
      { title: "Figures on the Same Base and Between the Same Parallels", mastery: 49, due: null },
    ]),
    mkChapter(10, "Circles", [
      { title: "Circles and Its Related Terms", mastery: 40, due: null },
      { title: "Angle Subtended by a Chord at a Point", mastery: 36, due: 4 },
      { title: "Cyclic Quadrilaterals", mastery: 33, due: null },
    ]),
    mkChapter(11, "Constructions", [
      { title: "Basic Constructions", mastery: 64, due: 10 },
    ]),
    mkChapter(12, "Heron's Formula", [
      { title: "Area of a Triangle Using Heron's Formula", mastery: 52, due: null },
    ]),
    mkChapter(13, "Surface Areas and Volumes", [
      { title: "Surface Area of a Right Circular Cylinder", mastery: 47, due: null },
      { title: "Volume of a Sphere", mastery: 43, due: 2 },
    ]),
    mkChapter(14, "Statistics", [
      { title: "Presentation of Data", mastery: 70, due: 7 },
      { title: "Mean of Grouped Data", mastery: 58, due: null },
    ]),
    mkChapter(15, "Probability", [
      { title: "Experimental Probability", mastery: 65, due: 9 },
    ]),
  ]
);

export const MATH_8 = mkSubject(
  "math-8",
  "Mathematics",
  "MATH",
  "teal",
  [
    mkChapter(1, "Rational Numbers", [
      { title: "Properties of Rational Numbers", mastery: 72, due: 7 },
      { title: "Representation on Number Line", mastery: 66, due: null },
    ]),
    mkChapter(2, "Linear Equations in One Variable", [
      { title: "Solving Equations with Variable on Both Sides", mastery: 58, due: 2 },
      { title: "Some Applications", mastery: 50, due: null },
    ]),
    mkChapter(3, "Understanding Quadrilaterals", [
      { title: "A Quadrilateral and Its Properties", mastery: 69, due: 8 },
      { title: "Special Parallelograms", mastery: 61, due: null },
    ]),
    mkChapter(4, "Data Handling", [
      { title: "Organising Data and Bar Graphs", mastery: 77, due: 11 },
      { title: "Drawing a Pie Chart", mastery: 64, due: null },
      { title: "Chance and Probability", mastery: 59, due: null },
    ]),
    mkChapter(5, "Squares and Square Roots", [
      { title: "Square of a Number and Finding Square Roots", mastery: 54, due: 1 },
      { title: "Square Roots of Decimals and Estimation", mastery: 47, due: null },
    ]),
    mkChapter(6, "Cubes and Cube Roots", [
      { title: "Cubes and Cube Roots", mastery: 63, due: 6 },
    ]),
    mkChapter(7, "Comparing Quantities", [
      { title: "Ratios and Percentages", mastery: 71, due: 9 },
      { title: "Discount and Simple Interest", mastery: 55, due: null },
    ]),
    mkChapter(8, "Algebraic Expressions and Identities", [
      { title: "Terms, Factors and Coefficients", mastery: 60, due: null },
      { title: "Operations on Algebraic Expressions", mastery: 52, due: 3 },
      { title: "Identities", mastery: 44, due: null },
    ]),
    mkChapter(9, "Mensuration", [
      { title: "Area of a Trapezium and a Polygon", mastery: 49, due: null },
      { title: "Area and Volume of Solids", mastery: 41, due: 2 },
    ]),
    mkChapter(10, "Exponents and Powers", [
      { title: "Powers with Negative Exponents", mastery: 67, due: 8 },
    ]),
    mkChapter(11, "Direct and Inverse Proportions", [
      { title: "Direct Proportion", mastery: 62, due: 5 },
      { title: "Inverse Proportion", mastery: 53, due: null },
    ]),
    mkChapter(12, "Factorisation", [
      { title: "Factorisation and Division of Algebraic Expressions", mastery: 46, due: null },
    ]),
    mkChapter(13, "Introduction to Graphs", [
      { title: "Linear Graphs and Applications", mastery: 74, due: 10 },
    ]),
    mkChapter(14, "Playing with Numbers", [
      { title: "Games with Numbers and Divisibility Tests", mastery: 68, due: 7 },
    ]),
  ]
);

/* ==================================================================
   SCIENCE
   ================================================================== */
export const SCIENCE_9 = mkSubject(
  "science-9",
  "Science",
  "SCI",
  "green",
  [
    mkChapter(1, "Matter in Our Surroundings", [
      { title: "Physical Nature of Matter", mastery: 73, due: 8 },
      { title: "Characteristics of Particles of Matter", mastery: 67, due: null },
      { title: "Evaporation", mastery: 60, due: null },
    ]),
    mkChapter(2, "Is Matter Around Us Pure", [
      { title: "Pure Substances and Mixtures", mastery: 64, due: 6 },
      { title: "Separating the Components of a Mixture", mastery: 56, due: null },
      { title: "Physical and Chemical Changes", mastery: 58, due: null },
    ]),
    mkChapter(3, "Atoms and Molecules", [
      { title: "Laws of Chemical Combination", mastery: 45, due: 1 },
      { title: "What is a Molecule", mastery: 48, due: null },
      { title: "Writing Chemical Formulae", mastery: 40, due: null },
      { title: "Molecular Mass and Mole Concept", mastery: 37, due: 3 },
    ]),
    mkChapter(4, "Structure of the Atom", [
      { title: "Charged Particles in Matter", mastery: 62, due: 5 },
      { title: "How Are Electrons Distributed", mastery: 54, due: null },
      { title: "Atomic Number and Mass Number", mastery: 51, due: null },
    ]),
    mkChapter(5, "The Fundamental Unit of Life", [
      { title: "What Are the Differences Between a Living Cell and a Brick", mastery: 70, due: 7 },
      { title: "Cell Organelles", mastery: 59, due: null },
    ]),
    mkChapter(6, "Tissues", [
      { title: "Are Plants and Animals Made of Same Types of Tissues", mastery: 66, due: 6 },
      { title: "Animal Tissues", mastery: 55, due: null },
    ]),
    mkChapter(7, "Motion", [
      { title: "Describing Motion", mastery: 63, due: 5 },
      { title: "Measuring the Rate of Motion", mastery: 57, due: null },
      { title: "Graphical Representation of Motion", mastery: 46, due: 2 },
      { title: "Equations of Motion by Graphical Method", mastery: 41, due: null },
    ]),
    mkChapter(8, "Force and Laws of Motion", [
      { title: "Balanced and Unbalanced Forces", mastery: 68, due: 6 },
      { title: "First Law of Motion", mastery: 61, due: null },
      { title: "Inertia and Mass", mastery: 55, due: null },
      { title: "Second and Third Laws of Motion", mastery: 44, due: 3 },
      { title: "Conservation of Momentum", mastery: 40, due: null },
    ]),
    mkChapter(9, "Gravitation", [
      { title: "Thrust and Pressure", mastery: 52, due: 1 },
      { title: "Free Fall and Acceleration Due to Gravity", mastery: 47, due: null },
      { title: "Mass and Weight", mastery: 63, due: 5 },
    ]),
    mkChapter(10, "Work and Energy", [
      { title: "Work", mastery: 58, due: 3 },
      { title: "Energy and Its Forms", mastery: 53, due: null },
      { title: "Kinetic and Potential Energy", mastery: 45, due: null },
      { title: "Law of Conservation of Energy", mastery: 42, due: 2 },
    ]),
    mkChapter(11, "Sound", [
      { title: "Production and Propagation of Sound", mastery: 66, due: 7 },
      { title: "Reflection of Sound", mastery: 59, due: null },
    ]),
    mkChapter(12, "Improvement in Food Resources", [
      { title: "Crop Variety Improvement and Production Management", mastery: 71, due: 9 },
    ]),
  ]
);

export const SCIENCE_8 = mkSubject(
  "science-8",
  "Science",
  "SCI",
  "green",
  [
    mkChapter(1, "Crop Production and Management", [
      { title: "Agricultural Practices", mastery: 74, due: 8 },
      { title: "Irrigation and Crop Protection", mastery: 66, due: null },
    ]),
    mkChapter(2, "Microorganisms: Friend and Foe", [
      { title: "Microorganisms", mastery: 69, due: 7 },
      { title: "Harmful Microorganisms and Food Preservation", mastery: 61, due: null },
    ]),
    mkChapter(3, "Synthetic Fibres and Plastics", [
      { title: "Types of Synthetic Fibres", mastery: 72, due: 9 },
      { title: "Plastics and the Environment", mastery: 68, due: null },
    ]),
    mkChapter(4, "Metals and Non-Metals", [
      { title: "Physical and Chemical Properties of Metals", mastery: 63, due: 4 },
      { title: "Chemical Properties of Metals and Non-Metals", mastery: 54, due: null },
    ]),
    mkChapter(5, "Coal and Petroleum", [
      { title: "Coal, Petroleum and Natural Gas", mastery: 76, due: 10 },
    ]),
    mkChapter(6, "Combustion and Flame", [
      { title: "What is Combustion", mastery: 67, due: 6 },
      { title: "Flame and Its Zones", mastery: 58, due: null },
      { title: "Harmful Effects of Burning Fuel", mastery: 64, due: null },
    ]),
    mkChapter(7, "Conservation of Plants and Animals", [
      { title: "Deforestation and Its Consequences", mastery: 71, due: 7 },
      { title: "Biosphere Reserves", mastery: 62, due: null },
    ]),
    mkChapter(8, "Cell — Structure and Functions", [
      { title: "Discovery of Cell and Cell Theory", mastery: 68, due: 6 },
      { title: "Organelles in a Cell", mastery: 56, due: 1 },
      { title: "Difference Between Animal and Plant Cells", mastery: 59, due: null },
    ]),
    mkChapter(9, "Reproduction in Animals", [
      { title: "Modes of Reproduction", mastery: 64, due: 5 },
      { title: "Fertilisation and Development", mastery: 55, due: null },
    ]),
    mkChapter(10, "Reaching the Age of Adolescence", [
      { title: "Changes at Puberty", mastery: 70, due: 7 },
      { title: "Reproductive Health", mastery: 63, due: null },
    ]),
    mkChapter(11, "Force and Pressure", [
      { title: "Force — A Push or a Pull", mastery: 66, due: 5 },
      { title: "Contact and Non-contact Forces", mastery: 57, due: null },
      { title: "Pressure Exerted by Liquids and Gases", mastery: 52, due: 2 },
    ]),
    mkChapter(12, "Friction", [
      { title: "Friction — A Necessary Evil", mastery: 69, due: 6 },
      { title: "Increasing and Reducing Friction", mastery: 62, due: null },
    ]),
    mkChapter(13, "Sound", [
      { title: "Sound is Produced by a Vibrating Body", mastery: 73, due: 8 },
      { title: "Properties of Sound", mastery: 61, due: null },
    ]),
    mkChapter(14, "Chemical Effects of Electric Current", [
      { title: "Conduction of Electricity Through Liquids", mastery: 65, due: 4 },
      { title: "Chemical Effects of Electric Current", mastery: 58, due: null },
    ]),
    mkChapter(15, "Some Natural Phenomena", [
      { title: "Lightning and Earthquakes", mastery: 71, due: 7 },
    ]),
    mkChapter(16, "Light", [
      { title: "What Makes Things Visible", mastery: 68, due: 6 },
      { title: "Laws of Reflection", mastery: 60, due: null },
      { title: "Multiple Images and the Human Eye", mastery: 54, due: 1 },
    ]),
    mkChapter(17, "Stars and the Solar System", [
      { title: "The Moon and the Stars", mastery: 75, due: 9 },
      { title: "The Solar System", mastery: 72, due: null },
    ]),
    mkChapter(18, "Pollution of Air and Water", [
      { title: "Air Pollution", mastery: 74, due: 8 },
      { title: "Case of the Ganga", mastery: 66, due: null },
    ]),
  ]
);

/* ==================================================================
   SOCIAL SCIENCE
   ================================================================== */
export const SOCIAL_9 = mkSubject(
  "social-9",
  "Social Science",
  "SST",
  "amber",
  [
    mkChapter(1, "The French Revolution", [
      { title: "French Society During the Late Eighteenth Century", mastery: 66, due: 5 },
      { title: "The Revolution and France", mastery: 55, due: 1 },
      { title: "A Revolution That Changed the World", mastery: 50, due: null },
    ]),
    mkChapter(2, "Socialism in Europe and the Russian Revolution", [
      { title: "The Age of Social Change", mastery: 61, due: 4 },
      { title: "The Russian Revolution", mastery: 52, due: null },
      { title: "The Making of a Socialist Society", mastery: 47, due: 2 },
    ]),
    mkChapter(3, "Nazism and the Rise of Hitler", [
      { title: "The Birth of the Weimar Republic", mastery: 58, due: 3 },
      { title: "Hitler's Rise to Power", mastery: 53, due: null },
      { title: "The Nazi Worldview", mastery: 46, due: null },
    ]),
    mkChapter(4, "Forest Society and Colonialism", [
      { title: "The Forest and Its People", mastery: 64, due: 6 },
      { title: "How Forest Rules Affected Cultivators", mastery: 56, due: null },
    ]),
    mkChapter(5, "Pastoralists in the Modern World", [
      { title: "Pastoral Communities", mastery: 67, due: 7 },
      { title: "Colonialism and Pastoral Life", mastery: 59, due: null },
    ]),
    mkChapter(6, "Peasants and Farmers", [
      { title: "The Growth of Farming", mastery: 70, due: 8 },
      { title: "The Modern Farmer", mastery: 63, due: null },
    ]),
    mkChapter(7, "What is Democracy? Why Democracy?", [
      { title: "What is Democracy", mastery: 75, due: 9 },
      { title: "What are the Alternatives", mastery: 68, due: null },
    ]),
    mkChapter(8, "Constitutional Design", [
      { title: "Making of the Indian Constitution", mastery: 71, due: 8 },
      { title: "Guiding Values of the Indian Constitution", mastery: 64, due: null },
    ]),
    mkChapter(9, "Electoral Politics", [
      { title: "Why Elections?", mastery: 73, due: 9 },
      { title: "What Makes Elections Democratic in India", mastery: 66, due: null },
    ]),
    mkChapter(10, "Working of Institutions", [
      { title: "Parliament", mastery: 62, due: 4 },
      { title: "Prime Minister and the Council of Ministers", mastery: 57, due: null },
      { title: "Judiciary", mastery: 54, due: 2 },
    ]),
    mkChapter(11, "Democratic Rights", [
      { title: "Rights in a Democracy", mastery: 70, due: 7 },
      { title: "Rights in the Indian Constitution", mastery: 63, due: null },
    ]),
    mkChapter(12, "The Story of Village Palampur", [
      { title: "Organisation of Production in Farming", mastery: 72, due: 8 },
      { title: "Farming in Palampur", mastery: 65, due: null },
      { title: "Non-Farm Activities in Palampur", mastery: 60, due: null },
    ]),
    mkChapter(13, "People as Resource", [
      { title: "Human Resource", mastery: 69, due: 6 },
      { title: "Quality of Population", mastery: 61, due: null },
    ]),
    mkChapter(14, "Poverty as a Challenge", [
      { title: "Poverty: An Overview", mastery: 66, due: 5 },
      { title: "Anti-Poverty Measures", mastery: 58, due: null },
    ]),
    mkChapter(15, "Food Security in India", [
      { title: "Food Security: What, Why and for Whom", mastery: 68, due: 6 },
      { title: "Food Security in India Today", mastery: 61, due: null },
    ]),
  ]
);

export const SOCIAL_8 = mkSubject(
  "social-8",
  "Social Science",
  "SST",
  "amber",
  [
    mkChapter(1, "How, When and Where", [
      { title: "How Important are Dates", mastery: 77, due: 10 },
      { title: "What is History", mastery: 71, due: null },
    ]),
    mkChapter(2, "From Trade to Territory", [
      { title: "Company Rule Expands", mastery: 64, due: 4 },
      { title: "Establishing Eastern India", mastery: 58, due: null },
    ]),
    mkChapter(3, "Ruling the Countryside", [
      { title: "The Company Becomes the Diwan", mastery: 61, due: 3 },
      { title: "The Blue Rebellion and After", mastery: 54, due: null },
    ]),
    mkChapter(4, "Tribals, Dikus and the Vision of a Golden Age", [
      { title: "Tribal Societies", mastery: 67, due: 6 },
      { title: "Colonial Rule and the Tribals", mastery: 57, due: null },
      { title: "Revolts in the Forests", mastery: 52, due: 1 },
    ]),
    mkChapter(5, "When People Rebel — 1857 and After", [
      { title: "The Policies and the People", mastery: 63, due: 4 },
      { title: "The Fire Spreads", mastery: 58, due: null },
      { title: "The Company Fights Back", mastery: 53, due: null },
    ]),
    mkChapter(6, "Colonialism and the City", [
      { title: "Town Making", mastery: 66, due: 5 },
      { title: "Bombay: The City of Dreams", mastery: 59, due: null },
    ]),
    mkChapter(7, "Weavers, Iron Smelters and Factory Owners", [
      { title: "The Last Cotton Mills", mastery: 68, due: 7 },
      { title: "India's Iron Industry", mastery: 60, due: null },
    ]),
    mkChapter(8, "Civilising the Native, Educating the Nation", [
      { title: "Orientalists and Utilitarians", mastery: 64, due: 5 },
      { title: "The Girls Come to School", mastery: 59, due: null },
      { title: "Education for the People", mastery: 55, due: 2 },
    ]),
    mkChapter(9, "The Making of the National Movement — 1870s to 1947", [
      { title: "Towards Nationalism", mastery: 70, due: 8 },
      { title: "The Non-Cooperation Movement and Khilafat", mastery: 62, due: null },
      { title: "Civil Disobedience and Quit India", mastery: 56, due: 1 },
    ]),
    mkChapter(10, "India After Independence", [
      { title: "A New Nation", mastery: 73, due: 9 },
      { title: "Partition and Its Aftermath", mastery: 64, due: null },
    ]),
    mkChapter(11, "The Indian Constitution", [
      { title: "The Making of the Constitution", mastery: 71, due: 8 },
      { title: "Institution of Government", mastery: 63, due: null },
    ]),
    mkChapter(12, "Parliament and the Making of Laws", [
      { title: "Parliament of India", mastery: 69, due: 7 },
      { title: "How Are Laws Made", mastery: 61, due: null },
    ]),
    mkChapter(13, "Public Facilities and the Environment", [
      { title: "Public Facilities", mastery: 67, due: 6 },
      { title: "Environment", mastery: 62, due: null },
    ]),
    mkChapter(14, "Law and Social Justice", [
      { title: "A Living Document", mastery: 68, due: 7 },
      { title: "Social Justice and the Marginalised", mastery: 60, due: null },
    ]),
    mkChapter(15, "Resources and Development", [
      { title: "Resources", mastery: 72, due: 8 },
      { title: "Sustainable Development", mastery: 64, due: null },
    ]),
    mkChapter(16, "Land, Soil, Water, Natural Vegetation and Wildlife Resources", [
      { title: "Land Resources", mastery: 69, due: 7 },
      { title: "Soil and Water", mastery: 61, due: null },
      { title: "Natural Vegetation and Wildlife", mastery: 58, due: 2 },
    ]),
    mkChapter(17, "Mineral and Power Resources", [
      { title: "Types of Minerals", mastery: 66, due: 5 },
      { title: "Conservation of Minerals and Power Resources", mastery: 59, due: null },
    ]),
    mkChapter(18, "Agriculture, Industries and Human Resources", [
      { title: "Types of Farming", mastery: 70, due: 7 },
      { title: "Manufacturing Industries", mastery: 62, due: null },
      { title: "Human Resources", mastery: 67, due: 6 },
    ]),
    mkChapter(19, "Our Resources", [
      { title: "Economic Activities and Resources", mastery: 71, due: 8 },
      { title: "Human Resources and Environment", mastery: 64, due: null },
    ]),
  ]
);

/* ==================================================================
   ENGLISH
   ================================================================== */
export const ENGLISH_9 = mkSubject(
  "english-9",
  "English",
  "ENG",
  "ink",
  [
    mkChapter(1, "Beehive — Literature", [
      { title: "The Fun They Had", mastery: 72, due: 8 },
      { title: "The Sound of Music", mastery: 68, due: 7 },
      { title: "The Little Girl", mastery: 64, due: 5 },
      { title: "A Truly Beautiful Mind", mastery: 60, due: 3 },
      { title: "The Snake and the Mirror", mastery: 66, due: 6 },
      { title: "My Childhood", mastery: 58, due: null },
      { title: "Reach for the Top", mastery: 63, due: 4 },
      { title: "If I Were You", mastery: 55, due: 1 },
      { title: "The Lake Isle of Innisfree", mastery: 69, due: 7 },
      { title: "A Legend of the Northland", mastery: 74, due: 9 },
    ]),
    mkChapter(2, "Moments — Supplementary", [
      { title: "The Lost Child", mastery: 70, due: 8 },
      { title: "Iswaran the Storyteller", mastery: 65, due: 5 },
      { title: "The Happy Prince", mastery: 62, due: 3 },
      { title: "The Hack Driver", mastery: 58, due: null },
      { title: "The Young Munshi of Kashmir", mastery: 67, due: 6 },
      { title: "A House is Not a Home", mastery: 54, due: 2 },
      { title: "The Lake Isle of Innisfree (Poem)", mastery: 71, due: 8 },
    ]),
  ]
);

export const ENGLISH_8 = mkSubject(
  "english-8",
  "English",
  "ENG",
  "ink",
  [
    mkChapter(1, "Honeydew — Literature", [
      { title: "The Best Christmas Present in the World", mastery: 73, due: 8 },
      { title: "The Tsunami", mastery: 67, due: 6 },
      { title: "Glimpses of the Past", mastery: 62, due: 4 },
      { title: "Bepin Choudhury's Lapse of Memory", mastery: 58, due: 2 },
      { title: "The Summit Within", mastery: 64, due: 5 },
      { title: "This is Jody's Fawn", mastery: 69, due: 7 },
      { title: "A Visit to Cambridge", mastery: 61, due: 3 },
      { title: "A Short Monsoon Diary", mastery: 70, due: 7 },
      { title: "The Great Stone Face — One", mastery: 65, due: 5 },
      { title: "The Great Stone Face — Two", mastery: 63, due: 4 },
    ]),
    mkChapter(2, "Honeydew — Poetry", [
      { title: "The Ant and the Cricket", mastery: 72, due: 8 },
      { title: "Geography Lesson", mastery: 68, due: 7 },
      { title: "Macavity: The Mystery Cat", mastery: 74, due: 9 },
      { title: "The Last Bargain", mastery: 66, due: 6 },
      { title: "The School Boy", mastery: 69, due: 7 },
      { title: "When I Set Out for Lyon in France", mastery: 71, due: 8 },
      { title: "Dust of Snow / Fire and Ice", mastery: 75, due: 9 },
      { title: "A House, A Home", mastery: 70, due: 8 },
      { title: "The Quarrel", mastery: 67, due: 6 },
      { title: "On the Grasshopper and Cricket", mastery: 72, due: 8 },
      { title: "The Blind Boy", mastery: 64, due: 5 },
      { title: "The Daffodils", mastery: 73, due: 9 },
      { title: "A Slumber Did My Spirit Seal", mastery: 69, due: 7 },
    ]),
    mkChapter(3, "It So Happened — Supplementary", [
      { title: "How the Camel Got His Hump", mastery: 68, due: 7 },
      { title: "Children at Work", mastery: 63, due: 4 },
      { title: "The Selfish Giant", mastery: 66, due: 5 },
      { title: "The Treasure Within", mastery: 61, due: 3 },
      { title: "Princess September", mastery: 67, due: 6 },
      { title: "The Fight", mastery: 64, due: 4 },
      { title: "Jalebis", mastery: 70, due: 8 },
      { title: "The Open Window", mastery: 65, due: 5 },
      { title: "A Baker from Goa", mastery: 71, due: 8 },
      { title: "The Duck and the Kangaroo", mastery: 73, due: 9 },
      { title: "The Little Girl", mastery: 62, due: 4 },
      { title: "The Butterfly", mastery: 72, due: 8 },
    ]),
  ]
);

/* ==================================================================
   HINDI
   ================================================================== */
export const HINDI_9 = mkSubject(
  "hindi-9",
  "Hindi — Course A",
  "HIN",
  "teal",
  [
    mkChapter(1, "क्षितिज (गद्य)", [
      { title: "इस जल प्रलय में", mastery: 66, due: 5 },
      { title: "रोबिनसेन क्रूसो", mastery: 60, due: 2 },
      { title: "सांझ की बेला", mastery: 55, due: null },
      { title: "सुख का अतीत", mastery: 51, due: 3 },
      { title: "गिल्लू", mastery: 63, due: 4 },
      { title: "स्मृति के टुकड़े", mastery: 58, due: null },
      { title: "एक कहानी यह भी", mastery: 54, due: 1 },
      { title: "अतित में भविष्य का बीज — वास्को डिगामा का भारत", mastery: 49, due: null },
    ]),
    mkChapter(2, "क्षितिज (पद्य)", [
      { title: "दो बातें", mastery: 68, due: 6 },
      { title: "राख के घरोंदे", mastery: 62, due: 4 },
      { title: "पुनर्प्रसूता", mastery: 57, due: null },
      { title: "माँ ने कहा था", mastery: 65, due: 5 },
      { title: "नींद में टिमटिमाते सितारे", mastery: 60, due: 3 },
      { title: "आदी कवि में पुनर्विहंग वादी", mastery: 53, due: 1 },
      { title: "यमराज की दिषा में", mastery: 58, due: 2 },
      { title: "वह सुबह कभी तो आएगी", mastery: 64, due: 5 },
      { title: "पहाड़ों पर अन्धेरा है", mastery: 69, due: 7 },
    ]),
    mkChapter(3, "कृतिका (संपूर्ण)", [
      { title: "इस्तीफ़ा", mastery: 61, due: 3 },
      { title: "ल्हासा की ओर", mastery: 56, due: null },
      { title: "स्वामी विवेकानन्द", mastery: 64, due: 5 },
      { title: "विज्ञान की भूमिका", mastery: 59, due: 2 },
    ]),
  ]
);

export const HINDI_8 = mkSubject(
  "hindi-8",
  "Hindi — Course A",
  "HIN",
  "teal",
  [
    mkChapter(1, "क्षितिज (गद्य)", [
      { title: "ध्वनि", mastery: 70, due: 7 },
      { title: "ल्हासा की ओर", mastery: 63, due: 4 },
      { title: "बस की यात्रा", mastery: 58, due: 2 },
      { title: "दिये जल उठे", mastery: 54, due: 1 },
      { title: "सुख का आधार", mastery: 61, due: 3 },
      { title: "में नान्ही-सी एक लड़की थी", mastery: 66, due: 5 },
      { title: "इतना खराब वक्त?", mastery: 59, due: null },
      { title: "सुल्तान के सपने", mastery: 55, due: 1 },
    ]),
    mkChapter(2, "क्षितिज (पद्य)", [
      { title: "बादल", mastery: 71, due: 8 },
      { title: "मनवी सिखाती हैं वातें ऐसी", mastery: 64, due: 5 },
      { title: "अच्छा ही हुआ", mastery: 59, due: 2 },
      { title: "वह चिट्ठी नहीं", mastery: 56, due: null },
      { title: "राख के पाँच बोझ", mastery: 52, due: 3 },
      { title: "रहिमन, पानी राखिये", mastery: 67, due: 6 },
      { title: "कबी", mastery: 62, due: 4 },
      { title: "स्वराज", mastery: 58, due: 2 },
      { title: "आओ मिलकर गाएँ", mastery: 69, due: 7 },
    ]),
    mkChapter(3, "वसन्त (संपूर्ण)", [
      { title: "आशा का सेवन", mastery: 65, due: 5 },
      { title: "जीवन-विज्ञान की ओर", mastery: 60, due: 3 },
      { title: "मोदा के हुल्ले", mastery: 56, due: 1 },
      { title: "स्वस्थ हैं हम मित्र जानकी माता", mastery: 63, due: 4 },
      { title: "चौबीस पन्नों का हिन्दी प्रेमपत्र", mastery: 58, due: 2 },
      { title: "हम चुनाव किऊँ करते हैं", mastery: 67, due: 6 },
      { title: "बेबाक का परिचय", mastery: 61, due: 3 },
      { title: "शर्मा जी का रूपांतरण", mastery: 57, due: 1 },
      { title: "राष्ट्रीय चेतना का उदय", mastery: 64, due: 5 },
    ]),
  ]
);

/* ==================================================================
   SANSKRIT — keeps the existing one-class demo set
   ================================================================== */
export { }
