/**
 * COGNIFY — Mock Service Data
 * Implements the shapes from lib/types.ts. This data stands in for the
 * NestJS backend until the API layer is connected. Do not invent new
 * backend functionality — every field here maps to an existing capability
 * (mastery, weak-topic detection, Learning DNA, spaced retention, etc.).
 */
import type {
  ActivityItem,
  Board,
  CreditsBalance,
  Goal,
  LearningDNA,
  StudentProfile,
  Subject,
  TodayPathItem,
  Topic,
  TopicState,
} from "./types";

/* ---------- Curriculum ---------- */

type TopicInput = {
  title: string;
  objectives: string[];
  mastery: number;
  lastStudied: string | null;
  revisionDueInDays: number | null;
  action: TodayPathItem["action"] | null;
  reason: string | null;
  minutes: number;
  resources: { type: "lesson" | "practice" | "video" | "revision"; label: string; durationMinutes: number }[];
  /** Optional stable id override — used for non-Latin topic titles that the
   *  auto-slugger would otherwise reduce to empty strings */
  topicId?: string;
};

const mkChapter = (
  index: number,
  title: string,
  topics: TopicInput[]
) => ({
  id: `ch-${title.toLowerCase().replace(/\s+/g, "-")}`,
  index,
  title,
  topics: topics.map((t, i) => mkTopic(t, i, (t as { topicId?: string }).topicId ?? (t as { topicId?: string }).topicId)),
});

function mkTopic(

  base: {
    title: string;
    objectives: string[];
    mastery: number;
    lastStudied: string | null;
    revisionDueInDays: number | null;
    action: TodayPathItem["action"] | null;
    reason: string | null;
    minutes: number;
    resources: { type: "lesson" | "practice" | "video" | "revision"; label: string; durationMinutes: number }[];
  },
  index: number,
  overrideId?: string
) {
  let state: TopicState = "new";
  if (base.mastery >= 90) state = "mastered";
  else if (base.mastery >= 70) state = "proficient";
  else if (base.mastery >= 45) state = "developing";
  else if (base.mastery > 0) state = "weak";

  let revisionStatus: Topic["revisionStatus"] = "not-started";
  if (base.revisionDueInDays === null) revisionStatus = "not-started";
  else if (base.revisionDueInDays <= 0) revisionStatus = "overdue";
  else if (base.revisionDueInDays <= 3) revisionStatus = "due";
  else revisionStatus = "on-track";

  return {
    id: overrideId ?? `t-${index}-${base.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 28)}`,
    title: base.title,
    objectives: base.objectives.map((text, i) => ({ id: `lo-${i}`, text })),
    mastery: base.mastery,
    state,
    lastStudied: base.lastStudied,
    revisionDueInDays: base.revisionDueInDays,
    revisionStatus,
    recommendedAction: base.action,
    actionReason: base.reason,
    resources: base.resources.map((r, i) => ({ id: `res-${i}`, ...r })),
    estimatedMinutes: base.minutes,
  };
}

const freshTopic = (
  title: string,
  objectives: string[],
  lessonLabel: string,
  practiceLabel: string,
  minutes = 25,
): TopicInput => ({
  title,
  objectives,
  mastery: 0,
  lastStudied: null,
  revisionDueInDays: null,
  action: "learn",
  reason: "Start with the core idea, then practise it in context.",
  minutes,
  resources: [
    { type: "lesson", label: lessonLabel, durationMinutes: Math.max(12, minutes - 8) },
    { type: "practice", label: practiceLabel, durationMinutes: 15 },
  ],
});

const MATH = {
  id: "math",
  name: "Mathematics",
  code: "MATH",
  color: "teal" as const,
  chapters: [
    mkChapter(1, "Real Numbers", [
      {
        title: "Euclid's Division Lemma & HCF",
        objectives: [
          "Apply Euclid's division algorithm to find HCF of two integers",
          "Distinguish between lemmas, theorems and algorithms",
        ],
        mastery: 84,
        lastStudied: "2026-08-17",
        revisionDueInDays: 6,
        action: "practice",
        reason:
          "A short drill will lock this in.",
        minutes: 20,
        resources: [
          { type: "practice", label: "HCF algorithm drill", durationMinutes: 15 },
          { type: "lesson", label: "Worked example set", durationMinutes: 10 },
        ],
      },
      {
        title: "Irrational Numbers & Proofs",
        objectives: [
          "Prove √2 and √3 are irrational using contradiction",
          "Identify rational vs irrational expressions",
        ],
        mastery: 38,
        lastStudied: "2026-08-14",
        revisionDueInDays: -2,
        action: "revise",
        reason:
          "Revision is a little overdue — one quick walkthrough covers it.",
        minutes: 25,
        resources: [
          { type: "revision", label: "Contradiction proof walkthrough", durationMinutes: 20 },
          { type: "video", label: "Why √2 cannot be a fraction", durationMinutes: 8 },
        ],
      },
      {
        title: "Fundamental Theorem of Arithmetic",
        objectives: [
          "Express composite numbers as prime factor products",
          "Use prime factorisation for HCF and LCM",
        ],
        mastery: 61,
        lastStudied: "2026-08-16",
        revisionDueInDays: 4,
        action: null,
        reason: null,
        minutes: 20,
        resources: [
          { type: "lesson", label: "Prime factorisation notes", durationMinutes: 12 },
          { type: "practice", label: "HCF/LCM problem set", durationMinutes: 15 },
        ],
      },
    ]),
    mkChapter(2, "Polynomials", [
      {
        title: "Zeros of a Polynomial",
        objectives: [
          "Relate zeros to the graph of a polynomial",
          "Count zeros from geometric representation",
        ],
        mastery: 92,
        lastStudied: "2026-08-10",
        revisionDueInDays: 12,
        action: null,
        reason: null,
        minutes: 15,
        resources: [
          { type: "revision", label: "Spaced review: zeros", durationMinutes: 10 },
          { type: "practice", label: "Graph interpretation set", durationMinutes: 12 },
        ],
      },
      {
        title: "Relationship between Zeros & Coefficients",
        objectives: [
          "Apply sum-and-product formulas for quadratic zeros",
          "Form a quadratic from given zeros",
        ],
        mastery: 27,
        lastStudied: "2026-08-15",
        revisionDueInDays: 1,
        action: "revise",
        reason:
          "This one still needs work — worth revisiting this week.",
        minutes: 30,
        resources: [
          { type: "revision", label: "Zero-coefficient relationship revision", durationMinutes: 20 },
          { type: "practice", label: "Mixed problem set", durationMinutes: 15 },
        ],
      },
      {
        title: "Division Algorithm for Polynomials",
        objectives: [
          "Divide polynomials and verify dividend = divisor × quotient + remainder",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: "learn",
        reason:
          "The natural next topic after Zeros of a Polynomial.",
        minutes: 35,
        resources: [
          { type: "lesson", label: "Polynomial long division", durationMinutes: 25 },
          { type: "video", label: "Visual division walkthrough", durationMinutes: 10 },
        ],
      },
    ]),
    mkChapter(3, "Pair of Linear Equations", [
      {
        title: "Graphical Method",
        objectives: [
          "Represent equations graphically and find intersection points",
          "Classify consistent, inconsistent and dependent pairs",
        ],
        mastery: 73,
        lastStudied: "2026-08-13",
        revisionDueInDays: 8,
        action: null,
        reason: null,
        minutes: 20,
        resources: [
          { type: "lesson", label: "Graphical solutions notes", durationMinutes: 12 },
          { type: "practice", label: "Plotting exercise", durationMinutes: 15 },
        ],
      },
      {
        title: "Substitution & Elimination Methods",
        objectives: [
          "Solve pairs using substitution",
          "Solve pairs using elimination",
        ],
        mastery: 55,
        lastStudied: "2026-08-16",
        revisionDueInDays: 5,
        action: "practice",
        reason:
          "A few sign slips showed up last time — timed practice fixes that.",
        minutes: 20,
        resources: [
          { type: "practice", label: "Timed elimination drill", durationMinutes: 15 },
          { type: "lesson", label: "Sign-error checklist", durationMinutes: 8 },
        ],
      },
      {
        title: "Cross-Multiplication & Word Problems",
        objectives: [
          "Apply cross-multiplication method",
          "Convert real-world situations into linear equations",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: null,
        reason: null,
        minutes: 30,
        resources: [
          { type: "lesson", label: "Cross-multiplication theory", durationMinutes: 20 },
          { type: "practice", label: "Word problem set", durationMinutes: 20 },
        ],
      },
    ]),
    mkChapter(4, "Quadratic Equations", [
      {
        title: "Standard Form & Factorisation",
        objectives: [
          "Identify quadratic equations in standard form",
          "Solve by factorisation",
        ],
        mastery: 66,
        lastStudied: "2026-08-12",
        revisionDueInDays: 9,
        action: null,
        reason: null,
        minutes: 20,
        resources: [
          { type: "lesson", label: "Factorisation methods", durationMinutes: 15 },
          { type: "practice", label: "Splitting the middle term", durationMinutes: 15 },
        ],
      },
      {
        title: "Completing the Square",
        objectives: ["Convert ax² + bx + c into completed-square form", "Solve using the method"],
        mastery: 19,
        lastStudied: "2026-08-15",
        revisionDueInDays: 3,
        action: "revise",
        reason:
          "This one stalled last time — a guided re-attempt will carry it.",
        minutes: 30,
        resources: [
          { type: "revision", label: "Guided completing-the-square", durationMinutes: 25 },
          { type: "video", label: "Geometric intuition", durationMinutes: 9 },
        ],
      },
      {
        title: "Nature of Roots & Discriminant",
        objectives: [
          "Use the discriminant to predict root nature",
          "Relate discriminant sign to graph intersections",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: null,
        reason: null,
        minutes: 25,
        resources: [
          { type: "lesson", label: "Discriminant notes", durationMinutes: 18 },
          { type: "practice", label: "Root nature exercises", durationMinutes: 15 },
        ],
      },
    ]),
    mkChapter(5, "Arithmetic Progressions", [
      freshTopic("General Term of an AP", ["Identify the first term and common difference", "Find the nth term using a_n = a + (n − 1)d"], "AP term walkthrough", "Nth-term practice"),
      freshTopic("Sum of an AP", ["Use the formula for the sum of the first n terms", "Solve arithmetic-progression word problems"], "AP sum lesson", "Sum-of-AP problem set"),
    ]),
    mkChapter(6, "Triangles", [
      freshTopic("Similarity of Triangles", ["Apply the criteria for similarity", "Use proportional corresponding sides"], "Similarity theorem notes", "Triangle similarity drill"),
      freshTopic("Pythagoras and Similarity", ["Use the Pythagoras theorem in right triangles", "Connect similarity to side-length relationships"], "Pythagoras worked examples", "Right-triangle practice"),
    ]),
    mkChapter(7, "Coordinate Geometry", [
      freshTopic("Distance Formula", ["Find the distance between two points on a plane", "Apply the formula to geometric problems"], "Distance formula lesson", "Coordinate distance drill"),
      freshTopic("Section Formula and Area", ["Divide a line segment in a given ratio", "Find the area of a triangle from coordinates"], "Section formula walkthrough", "Coordinate area problems"),
    ]),
    mkChapter(8, "Introduction to Trigonometry", [
      freshTopic("Trigonometric Ratios", ["Define sine, cosine and tangent in a right triangle", "Choose the correct ratio for a given angle"], "Trigonometric ratios lesson", "Ratio identification practice"),
      freshTopic("Values of Standard Angles", ["Recall ratios for 0°, 30°, 45°, 60° and 90°", "Use standard-angle values in calculations"], "Standard angles reference", "Standard-angle practice"),
    ]),
    mkChapter(9, "Some Applications of Trigonometry", [
      freshTopic("Heights and Distances", ["Draw a diagram for an angle-of-elevation problem", "Use trigonometric ratios to find an unknown height or distance"], "Heights and distances lesson", "Application word problems"),
    ]),
    mkChapter(10, "Circles", [
      freshTopic("Tangent to a Circle", ["Use the theorem that a tangent is perpendicular to the radius", "Identify tangent properties from a diagram"], "Circle tangent theorems", "Tangent problem set"),
      freshTopic("Number of Tangents", ["Determine the number of tangents from a point", "Relate the point's position to possible tangents"], "Tangents from a point", "Circle geometry drill"),
    ]),
    mkChapter(11, "Areas Related to Circles", [
      freshTopic("Area of a Sector", ["Calculate the area of a sector", "Use central angle and radius in a sector problem"], "Sector area walkthrough", "Sector and segment practice"),
      freshTopic("Length of an Arc", ["Calculate arc length from radius and angle", "Solve mixed perimeter questions involving circles"], "Arc length lesson", "Arc-length problem set"),
    ]),
    mkChapter(12, "Surface Areas and Volumes", [
      freshTopic("Surface Area of Solids", ["Select the correct surface-area formula", "Solve combined-solid surface-area problems"], "Surface area formula guide", "Surface-area practice"),
      freshTopic("Volume of Combined Solids", ["Find volume of cylinders, cones and spheres", "Break a composite solid into familiar parts"], "Volumes of solids lesson", "Volume word problems"),
    ]),
    mkChapter(13, "Statistics", [
      freshTopic("Mean of Grouped Data", ["Calculate mean using the direct or assumed-mean method", "Interpret a grouped frequency table"], "Grouped-data mean lesson", "Mean calculation practice"),
      freshTopic("Median and Mode", ["Find median and mode from grouped data", "Use cumulative frequency to locate the median class"], "Median and mode walkthrough", "Statistics mixed set"),
    ]),
    mkChapter(14, "Probability", [
      freshTopic("Classical Probability", ["Define probability as favourable outcomes over total outcomes", "Calculate probabilities for equally likely events"], "Probability fundamentals", "Probability drill"),
      freshTopic("Complementary Events", ["Use P(not E) = 1 − P(E)", "Solve simple complementary-event problems"], "Complementary probability notes", "Probability word problems"),
    ]),
  ],
} satisfies Subject;

const SCIENCE = {
  id: "science",
  name: "Science",
  code: "SCI",
  color: "green" as const,
  chapters: [
    mkChapter(1, "Chemistry · Chemical Reactions and Equations", [
      {
        title: "Writing & Balancing Equations",
        objectives: [
          "Write skeletal and balanced chemical equations",
          "Apply the law of conservation of mass",
        ],
        mastery: 88,
        lastStudied: "2026-08-16",
        revisionDueInDays: 10,
        action: null,
        reason: null,
        minutes: 15,
        resources: [
          { type: "revision", label: "Balancing rapid review", durationMinutes: 10 },
          { type: "practice", label: "Equation balancing set", durationMinutes: 12 },
        ],
      },
      {
        title: "Types of Reactions",
        objectives: [
          "Classify combination, decomposition, displacement and double displacement reactions",
          "Identify exothermic and endothermic processes",
        ],
        mastery: 41,
        lastStudied: "2026-08-14",
        revisionDueInDays: 2,
        action: "practice",
        reason: "A quick classification drill closes this gap.",
        minutes: 20,
        resources: [
          { type: "practice", label: "Reaction classification drill", durationMinutes: 15 },
          { type: "lesson", label: "Comparison table notes", durationMinutes: 10 },
        ],
      },
      {
        title: "Oxidation, Reduction & Corrosion",
        objectives: [
          "Define oxidation and reduction in terms of oxygen/hydrogen transfer",
          "Explain rancidity and corrosion with examples",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: "learn",
        reason: "The natural next topic in your sequence.",
        minutes: 30,
        resources: [
          { type: "lesson", label: "Redox fundamentals", durationMinutes: 20 },
          { type: "video", label: "Corrosion in the real world", durationMinutes: 8 },
        ],
      },
    ]),
    mkChapter(2, "Chemistry · Acids, Bases and Salts", [
      {
        title: "Properties of Acids & Bases",
        objectives: [
          "Describe acid/base behaviour with indicators",
          "Explain reactions with metals, carbonates and oxides",
        ],
        mastery: 76,
        lastStudied: "2026-08-15",
        revisionDueInDays: 7,
        action: null,
        reason: null,
        minutes: 15,
        resources: [
          { type: "lesson", label: "Indicator chart notes", durationMinutes: 10 },
          { type: "practice", label: "Reaction prediction set", durationMinutes: 12 },
        ],
      },
      {
        title: "pH Scale & Strength",
        objectives: [
          "Interpret pH values and relate them to H⁺ concentration",
          "Distinguish strong and weak acids/bases",
        ],
        mastery: 52,
        lastStudied: "2026-08-13",
        revisionDueInDays: 4,
        action: "practice",
        reason: "Steady progress — one practice set keeps it moving.",
        minutes: 20,
        resources: [
          { type: "practice", label: "pH calculation set", durationMinutes: 15 },
          { type: "lesson", label: "Logarithm refresher", durationMinutes: 8 },
        ],
      },
    ]),
    mkChapter(3, "Chemistry · Metals and Non-metals", [
      freshTopic("Properties of Metals", ["Relate physical properties to metallic character", "Explain reactions of metals with oxygen, water and acids"], "Metals fundamentals", "Metal-properties practice"),
      freshTopic("Reactivity Series", ["Arrange metals by reactivity", "Predict displacement reactions using the reactivity series"], "Reactivity-series lesson", "Metal-reaction questions"),
    ]),
    mkChapter(4, "Chemistry · Carbon and Its Compounds", [
      freshTopic("Covalent Bonding in Carbon", ["Explain why carbon forms covalent compounds", "Represent simple carbon compounds"], "Carbon bonding lesson", "Covalent-compound practice"),
      freshTopic("Functional Groups and Reactions", ["Identify common functional groups", "Describe combustion, oxidation and addition reactions"], "Carbon compounds walkthrough", "Organic-reaction questions"),
    ]),
    mkChapter(5, "Chemistry · Periodic Classification of Elements", [
      freshTopic("Modern Periodic Table", ["Explain the basis of the modern periodic table", "Relate electronic configuration to position"], "Periodic table lesson", "Element-position practice"),
      freshTopic("Trends in the Periodic Table", ["Describe trends in valency and atomic size", "Relate periodic trends to chemical properties"], "Periodic trends notes", "Periodic-classification questions"),
    ]),
    mkChapter(6, "Biology · Life Processes", [
      {
        title: "Nutrition in Plants",
        objectives: [
          "Explain photosynthesis with its equation and conditions",
          "Describe the opening and closing of stomata",
        ],
        mastery: 95,
        lastStudied: "2026-08-09",
        revisionDueInDays: 14,
        action: null,
        reason: null,
        minutes: 10,
        resources: [
          { type: "revision", label: "Spaced review: photosynthesis", durationMinutes: 10 },
        ],
      },
      {
        title: "Nutrition in Humans",
        objectives: [
          "Trace the pathway of food through the alimentary canal",
          "Explain the role of enzymes at each stage",
        ],
        mastery: 33,
        lastStudied: "2026-08-15",
        revisionDueInDays: 1,
        action: "revise",
        reason: "Due for revision — a diagram-based walkthrough fits well.",
        minutes: 25,
        resources: [
          { type: "revision", label: "Alimentary canal diagram revision", durationMinutes: 20 },
          { type: "video", label: "Digestion animation", durationMinutes: 7 },
        ],
      },
      {
        title: "Transportation & Excretion",
        objectives: [
          "Describe double circulation in humans",
          "Explain excretion in plants and humans",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: null,
        reason: null,
        minutes: 30,
        resources: [
          { type: "lesson", label: "Circulation notes", durationMinutes: 20 },
          { type: "video", label: "Heart walkthrough", durationMinutes: 10 },
        ],
      },
    ]),
    mkChapter(7, "Biology · Control and Coordination", [
      freshTopic("Nervous System", ["Describe coordination through the nervous system", "Relate reflex actions to stimulus and response"], "Nervous-system lesson", "Coordination practice"),
      freshTopic("Plant Hormones and Movements", ["Explain the role of plant hormones", "Distinguish tropic movements in plants"], "Plant coordination notes", "Plant-response questions"),
    ]),
    mkChapter(8, "Biology · How Do Organisms Reproduce?", [
      freshTopic("Asexual Reproduction", ["Describe common methods of asexual reproduction", "Compare fission, budding and vegetative propagation"], "Asexual reproduction lesson", "Reproduction comparison set"),
      freshTopic("Sexual Reproduction in Plants", ["Describe the parts of a flower", "Trace pollination and fertilisation"], "Plant reproduction walkthrough", "Flower reproduction practice"),
    ]),
    mkChapter(9, "Biology · Heredity", [
      freshTopic("Mendel's Experiments", ["Explain dominant and recessive traits", "Use simple inheritance crosses"], "Mendelian heredity lesson", "Trait inheritance practice"),
      freshTopic("Evolution and Variation", ["Explain how variation supports natural selection", "Distinguish inherited and acquired traits"], "Variation and evolution notes", "Heredity reasoning set"),
    ]),
    mkChapter(10, "Biology · Our Environment", [
      freshTopic("Food Chains and Trophic Levels", ["Construct a food chain", "Explain energy transfer between trophic levels"], "Food-chain diagram lesson", "Ecosystem practice"),
      freshTopic("Biodegradable and Non-biodegradable Waste", ["Classify common waste materials", "Explain effects of waste accumulation"], "Waste-management notes", "Environment application set"),
    ]),
    mkChapter(11, "Biology · Sustainable Management of Natural Resources", [
      freshTopic("Forest and Wildlife Conservation", ["Explain the need for sustainable resource use", "Compare conservation approaches"], "Conservation lesson", "Sustainability case questions"),
    ]),
    mkChapter(12, "Physics · Light – Reflection and Refraction", [
      freshTopic("Reflection by Spherical Mirrors", ["Use mirror ray diagrams", "Relate focal length, radius and image formation"], "Spherical mirrors lesson", "Mirror ray-diagram practice"),
      freshTopic("Refraction Through Lenses", ["Trace rays through convex and concave lenses", "Use the lens formula for image formation"], "Lenses walkthrough", "Lens formula practice"),
    ]),
    mkChapter(13, "Physics · Human Eye and the Colourful World", [
      freshTopic("Defects of Vision", ["Explain myopia and hypermetropia", "Identify the correcting lens for each defect"], "Human-eye lesson", "Vision-defect practice"),
      freshTopic("Dispersion of Light", ["Explain dispersion through a prism", "Describe atmospheric effects such as scattering"], "Colourful-world notes", "Light-scattering questions"),
    ]),
    mkChapter(14, "Physics · Electricity", [
      freshTopic("Electric Current and Potential Difference", ["Relate current, charge and time", "Use the definition of potential difference"], "Electricity fundamentals", "Current and voltage drill"),
      freshTopic("Ohm's Law and Resistance", ["Apply Ohm's law", "Calculate resistance in simple circuits"], "Ohm's law walkthrough", "Circuit calculation practice"),
      freshTopic("Series and Parallel Circuits", ["Compare series and parallel combinations", "Calculate equivalent resistance"], "Circuit combinations lesson", "Resistance network problems"),
    ]),
    mkChapter(15, "Physics · Magnetic Effects of Electric Current", [
      freshTopic("Magnetic Field of a Current", ["Draw field lines around a current-carrying conductor", "Use the right-hand thumb rule"], "Magnetic-field lesson", "Field-line practice"),
      freshTopic("Electromagnetic Induction", ["Explain electromagnetic induction", "Describe the working idea of a generator"], "Induction and generators", "Magnetism application set"),
    ]),
    mkChapter(16, "Physics · Sources of Energy", [
      freshTopic("Renewable and Non-renewable Sources", ["Compare renewable and non-renewable energy sources", "Evaluate an energy source using practical criteria"], "Energy sources lesson", "Energy comparison practice"),
      freshTopic("Environmental Impact of Energy", ["Explain pollution from conventional sources", "Suggest cleaner energy choices"], "Energy and environment notes", "Source-evaluation questions"),
    ]),
  ],
} satisfies Subject;

const SOCIAL = {
  id: "social",
  name: "Social Science",
  code: "SST",
  color: "amber" as const,
  chapters: [
    mkChapter(1, "History · The Rise of Nationalism in Europe", [
      {
        title: "The French Revolution & the Idea of the Nation",
        objectives: [
          "Analyse the role of the French Revolution in fostering nationalism",
          "Explain the impact of Napoleon's Civil Code of 1804",
        ],
        mastery: 70,
        lastStudied: "2026-08-16",
        revisionDueInDays: 9,
        action: null,
        reason: null,
        minutes: 20,
        resources: [
          { type: "lesson", label: "Timeline notes", durationMinutes: 15 },
          { type: "practice", label: "Source analysis set", durationMinutes: 15 },
        ],
      },
      {
        title: "Making of Nationalism in Italy & Germany",
        objectives: [
          "Compare unification processes in Italy and Germany",
          "Evaluate the role of key figures: Cavour, Garibaldi, Bismarck",
        ],
        mastery: 22,
        lastStudied: "2026-08-14",
        revisionDueInDays: -1,
        action: "revise",
        reason: "Revision is a little overdue; one pass refreshes it.",
        minutes: 30,
        resources: [
          { type: "revision", label: "Comparison-table revision", durationMinutes: 25 },
          { type: "lesson", label: "Key figures summary", durationMinutes: 10 },
        ],
      },
      {
        title: "Nationalism & Imperialism",
        objectives: [
          "Explain how the Balkans became a flashpoint",
          "Link imperialism to the outbreak of the First World War",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: null,
        reason: null,
        minutes: 25,
        resources: [
          { type: "lesson", label: "Balkans notes", durationMinutes: 18 },
          { type: "video", label: "Map walkthrough: Europe 1914", durationMinutes: 9 },
        ],
      },
    ]),
    mkChapter(2, "History · Nationalism in India", [
      {
        title: "The First World War & Non-Cooperation",
        objectives: [
          "Assess the impact of the war on India's economy and society",
          "Explain the Khilafat and Non-Cooperation movements",
        ],
        mastery: 58,
        lastStudied: "2026-08-15",
        revisionDueInDays: 6,
        action: "practice",
        reason: "Short-answer practice sharpens this exam skill.",
        minutes: 20,
        resources: [
          { type: "practice", label: "Long-answer writing set", durationMinutes: 20 },
        ],
      },
      {
        title: "Civil Disobedience & Sense of Collective Belonging",
        objectives: [
          "Describe the Salt March and its significance",
          "Explain how folklore, flags and icons created collective identity",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: "learn",
        reason: "Next topic in sequence — ready when the backlog clears.",
        minutes: 30,
        resources: [
          { type: "lesson", label: "Salt March notes", durationMinutes: 22 },
          { type: "video", label: "Dandi March documentary excerpt", durationMinutes: 12 },
        ],
      },
    ]),
    mkChapter(3, "History · The Making of a Global World", [
      freshTopic("Pre-modern Trade and Cultural Exchange", ["Describe early trade links across regions", "Explain how ideas, foods and diseases travelled"], "Global-world history lesson", "Trade-network practice"),
      freshTopic("The Nineteenth-Century Global Economy", ["Explain migration, trade and technology links", "Connect global change to colonial rule"], "Nineteenth-century overview", "Globalisation source questions"),
    ]),
    mkChapter(4, "History · The Age of Industrialisation", [
      freshTopic("Industrialisation and the Factory", ["Describe the growth of factories in Britain", "Explain changes in production and labour"], "Industrialisation lesson", "Factory-system practice"),
      freshTopic("Industrialisation in India", ["Trace the growth of Indian industries", "Explain the role of hand labour and markets"], "Indian industry notes", "Industrialisation questions"),
    ]),
    mkChapter(5, "History · Print Culture and the Modern World", [
      freshTopic("Print and Social Change", ["Explain how print spread ideas", "Relate print culture to debate and reform"], "Print-culture lesson", "Print and society practice"),
      freshTopic("Print, Dissent and Censorship", ["Describe print's role in political debate", "Explain why authorities attempted censorship"], "Print and dissent notes", "Source-based history set"),
    ]),
    mkChapter(6, "Political Science · Power Sharing", [
      freshTopic("Forms of Power Sharing", ["Identify different forms of power sharing", "Explain why power sharing is desirable"], "Power-sharing lesson", "Power-sharing case study"),
    ]),
    mkChapter(7, "Political Science · Federalism", [
      freshTopic("Features of Federalism", ["Identify the key features of a federal system", "Distinguish federal and unitary arrangements"], "Federalism fundamentals", "Federalism practice"),
      freshTopic("Federalism in India", ["Explain the language-policy and centre-state examples", "Describe how Indian federalism has strengthened"], "Indian federalism notes", "Federalism case questions"),
    ]),
    mkChapter(8, "Political Science · Gender, Religion and Caste", [
      freshTopic("Gender and Political Representation", ["Explain how gender division shapes public life", "Evaluate representation in politics"], "Gender and politics lesson", "Representation practice"),
      freshTopic("Religion, Caste and Politics", ["Distinguish communalism from religious diversity", "Explain how caste can influence politics"], "Religion and caste notes", "Civics reasoning set"),
    ]),
    mkChapter(9, "Political Science · Political Parties", [
      freshTopic("Functions of Political Parties", ["Describe the major functions of political parties", "Explain why parties are necessary in democracy"], "Political-parties lesson", "Party functions practice"),
      freshTopic("Challenges to Political Parties", ["Identify common challenges faced by parties", "Suggest reforms to strengthen parties"], "Party reform notes", "Political-parties questions"),
    ]),
    mkChapter(10, "Political Science · Outcomes of Democracy", [
      freshTopic("Accountable and Responsive Government", ["Explain how democracy produces accountable government", "Evaluate responsiveness to citizens"], "Democratic outcomes lesson", "Outcome-evaluation practice"),
      freshTopic("Democracy and Social Diversity", ["Assess democracy's record on equality and dignity", "Use examples to evaluate democratic outcomes"], "Democracy outcomes notes", "Civics case-study set"),
    ]),
    mkChapter(11, "Geography · Resources and Development", [
      freshTopic("Resource Planning", ["Classify resources by origin and ownership", "Explain the need for resource planning"], "Resource-planning lesson", "Resource classification practice"),
      freshTopic("Land Resources and Soil", ["Explain land-use patterns", "Identify major soil types and their features"], "Soils and land notes", "Soil-map questions"),
    ]),
    mkChapter(12, "Geography · Forest and Wildlife Resources", [
      freshTopic("Biodiversity and Conservation", ["Explain the importance of biodiversity", "Compare conservation strategies"], "Biodiversity lesson", "Conservation practice"),
      freshTopic("Community and Conservation", ["Describe community-based conservation", "Evaluate how local people protect resources"], "Community conservation notes", "Case-study questions"),
    ]),
    mkChapter(13, "Geography · Water Resources", [
      freshTopic("Multipurpose River Projects", ["Describe the uses of multipurpose projects", "Evaluate their benefits and concerns"], "River-projects lesson", "Water-resource practice"),
      freshTopic("Rainwater Harvesting", ["Explain the need for water conservation", "Describe rainwater harvesting methods"], "Rainwater harvesting notes", "Water-management questions"),
    ]),
    mkChapter(14, "Geography · Agriculture", [
      freshTopic("Types of Farming", ["Distinguish primitive subsistence, intensive and commercial farming", "Relate farming type to physical conditions"], "Agriculture fundamentals", "Farming-type practice"),
      freshTopic("Major Crops and Cropping Patterns", ["Locate major crops and their growing conditions", "Explain seasonal cropping patterns"], "Major crops lesson", "Agriculture map questions"),
    ]),
    mkChapter(15, "Geography · Minerals and Energy Resources", [
      freshTopic("Mineral Resources", ["Classify metallic and non-metallic minerals", "Explain how minerals are distributed and used"], "Mineral-resources lesson", "Mineral-map practice"),
      freshTopic("Conventional and Non-conventional Energy", ["Compare major energy sources", "Evaluate the need for conservation"], "Energy resources notes", "Energy-resource questions"),
    ]),
    mkChapter(16, "Geography · Manufacturing Industries", [
      freshTopic("Industrial Location", ["Explain factors affecting industrial location", "Relate raw materials, labour and markets to location"], "Manufacturing lesson", "Industrial-location practice"),
      freshTopic("Industrial Pollution and Control", ["Identify types of industrial pollution", "Suggest measures to reduce pollution"], "Industry and environment notes", "Manufacturing case questions"),
    ]),
    mkChapter(17, "Geography · Lifelines of National Economy", [
      freshTopic("Transport and Communication", ["Compare major transport networks", "Explain the role of communication in the economy"], "Transport and communication lesson", "Lifelines practice"),
      freshTopic("International Trade and Tourism", ["Explain the importance of trade", "Assess tourism as an economic activity"], "Trade and tourism notes", "Geography application set"),
    ]),
  ],
} satisfies Subject;

const ENGLISH = {
  id: "english",
  name: "English",
  code: "ENG",
  color: "ink" as const,
  chapters: [
    mkChapter(1, "First Flight — Prose", [
      {
        title: "A Letter to God",
        objectives: [
          "Analyse Lencho's faith and the story's irony",
          "Interpret the writer's message about human goodness",
        ],
        mastery: 81,
        lastStudied: "2026-08-12",
        revisionDueInDays: 11,
        action: null,
        reason: null,
        minutes: 15,
        resources: [
          { type: "revision", label: "Comprehension rapid review", durationMinutes: 12 },
        ],
      },
      {
        title: "Nelson Mandela: Long Walk to Freedom",
        objectives: [
          "Summarise Mandela's views on freedom and courage",
          "Explain the meaning of 'twin obligations'",
        ],
        mastery: 44,
        lastStudied: "2026-08-15",
        revisionDueInDays: 2,
        action: "practice",
        reason: "Comprehension is strong; answer-structure practice adds the marks.",
        minutes: 20,
        resources: [
          { type: "practice", label: "Answer-structure drills", durationMinutes: 15 },
          { type: "lesson", label: "PEEL paragraph model", durationMinutes: 10 },
        ],
      },
      {
        title: "Two Stories about Flying",
        objectives: [
          "Contrast the themes of the two stories",
          "Analyse the symbolism of flight",
        ],
        mastery: 0,
        lastStudied: null,
        revisionDueInDays: null,
        action: null,
        reason: null,
        minutes: 25,
        resources: [
          { type: "lesson", label: "Story comparison notes", durationMinutes: 20 },
        ],
      },
    ]),
  ],
} satisfies Subject;

const HINDI = {
  id: "hindi",
  name: "Hindi — Course A",
  code: "HIN",
  color: "teal" as const,
  chapters: [
    mkChapter(1, "गद्य (Gadya)", [
      {
        topicId: "t-0-maa-ki-chitthi",
        title: "माँ की चिट्ठी",
        objectives: [
          "कहानी के मुख्य विषय की व्याख्या करना",
          "पात्रों के चरित्र का विश्लेषण करना",
        ],
        mastery: 74,
        lastStudied: "2026-08-13",
        revisionDueInDays: 8,
        action: null,
        reason: null,
        minutes: 15,
        resources: [
          { type: "revision", label: "प्रश्नोत्तर अभ्यास", durationMinutes: 12 },
        ],
      },
      {
        topicId: "t-1-lhasa-ki-or",
        title: "ल्हासा की ओर",
        objectives: ["यात्रा वर्णन की विशेषताओं को समझना"],
        mastery: 30,
        lastStudied: "2026-08-14",
        revisionDueInDays: 3,
        action: "revise",
        reason: "Revision is due for this chapter.",
        minutes: 20,
        resources: [
          { type: "revision", label: "सारांश पुनरावलोकन", durationMinutes: 18 },
        ],
      },
    ]),
  ],
} satisfies Subject;

const SANSKRIT = {
  id: "sanskrit",
  name: "Sanskrit",
  code: "SKT",
  color: "green" as const,
  chapters: [
    mkChapter(1, "गद्यखण्डः", [
      {
        topicId: "t-0-achha-vakt-mein-bhale-kaam",
        title: "अच्छा वक्त में भले काम",
        objectives: ["कथावस्तु का वर्णन करना"],
        mastery: 60,
        lastStudied: "2026-08-11",
        revisionDueInDays: 7,
        action: null,
        reason: null,
        minutes: 15,
        resources: [{ type: "revision", label: "शब्दार्थ पुनरावलोकन", durationMinutes: 12 }],
      },
    ]),
  ],
} satisfies Subject;

export const boards: Board[] = [
  {
    id: "cbse",
    name: "CBSE",
    classes: [
      {
        id: "cbse-10",
        name: "Class 10",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI, SANSKRIT],
      },
      {
        id: "cbse-9",
        name: "Class 9",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI],
      },
      {
        id: "cbse-8",
        name: "Class 8",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI],
      },
    ],
  },
  {
    id: "icse",
    name: "ICSE",
    classes: [
      {
        id: "icse-10",
        name: "Class 10",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI],
      },
      {
        id: "icse-9",
        name: "Class 9",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI],
      },
    ],
  },
  {
    id: "up-board",
    name: "UP Board",
    classes: [
      {
        id: "up-10",
        name: "Class 10",
        subjects: [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI],
      },
    ],
  },
];

/* ---------- Derived curriculum helpers ---------- */

export function findSubject(boardId: string, classId: string, subjectId: string) {
  const board = boards.find((b) => b.id === boardId);
  const cls = board?.classes.find((c) => c.id === classId);
  return cls?.subjects.find((s) => s.id === subjectId) ?? null;
}

export function allTopics(subject: Subject) {
  return subject.chapters.flatMap((ch) =>
    ch.topics.map((t) => ({ chapter: ch, topic: t }))
  );
}

/* ---------- Learning DNA ---------- */

export const learningDNA: LearningDNA = {
  profileStrength: 72,
  peakFocusHour: "18:00–20:00",
  avgSessionMinutes: 34,
  mistakeProfile: {
    conceptual: 46,
    careless: 31,
    procedural: 23,
  },
  topFormat: "visual-diagram",
  formatExperimentResults: [
    { format: "visual-diagram", success: 83 },
    { format: "worked-example", success: 74 },
    { format: "analogy", success: 68 },
    { format: "step-by-step", success: 61 },
    { format: "verbal-explanation", success: 52 },
  ],
  insights: [
    {
      id: "i1",
      dimension: "Teaching format",
      finding: "You retain 31% more from diagram-based lessons than verbal ones",
      confidence: 88,
      implication:
        "COGNIFY has begun favouring visual-diagram resources in your recommendations.",
    },
    {
      id: "i2",
      dimension: "Mistake classification",
      finding: "46% of your errors are conceptual, concentrated in proofs and algebra",
      confidence: 81,
      implication:
        "Weak-topic detection flags 'Relationship between Zeros & Coefficients' for revision.",
    },
    {
      id: "i3",
      dimension: "Confidence calibration",
      finding: "You overestimate mastery on weak topics by ~35 percentage points",
      confidence: 76,
      implication:
        "Recommendations for those topics now require an evidence check before marking complete.",
    },
    {
      id: "i4",
      dimension: "Attention",
      finding: "Focus dips after ~22 minutes on text-heavy material",
      confidence: 69,
      implication:
        "Sessions are being chunked into 20-minute blocks with active breaks.",
    },
  ],
};

/* ---------- Goals ---------- */

export const goals: Goal[] = [
  {
    id: "g1",
    title: "Raise Mathematics chapter 2 to 70% mastery",
    progress: 48,
    dueDate: "2026-09-05",
  },
  {
    id: "g2",
    title: "Complete all overdue revisions this week",
    progress: 60,
    dueDate: "2026-08-23",
  },
  {
    id: "g3",
    title: "14-day learning streak",
    progress: 64,
    dueDate: "2026-08-28",
  },
];

/* ---------- Activity ---------- */

export const recentActivity: ActivityItem[] = [
  { id: "a1", type: "practice", topic: "Substitution & Elimination", subject: "MATH", when: "2h ago", result: "+4% mastery" },
  { id: "a2", type: "revision", topic: "Types of Reactions", subject: "SCI", when: "5h ago", result: "+6% mastery" },
  { id: "a3", type: "learn", topic: "French Revolution & the Nation", subject: "SST", when: "Yesterday", result: "First exposure" },
  { id: "a4", type: "test", topic: "Weekly revision test", subject: "MATH", when: "Yesterday", result: "71% (+9 pts)" },
  { id: "a5", type: "learn", topic: "Nutrition in Humans", subject: "SCI", when: "2 days ago", result: "22 min session" },
  { id: "a6", type: "practice", topic: "pH Scale & Strength", subject: "SCI", when: "2 days ago", result: "+5% mastery" },
];

/* ---------- Today's Learning Path ---------- */

export const todaysPath: TodayPathItem[] = [
  {
    topicId: "t-2-relationship-between-zeros-coefficients",
    topicTitle: "Relationship between Zeros & Coefficients",
    subject: "MATH",
    action: "revise",
    minutes: 30,
    reason: "Your weakest tracked topic — worth the thirty minutes today.",
    urgency: "high",
  },
  {
    topicId: "t-1-substitution-elimination-methods",
    topicTitle: "Substitution & Elimination Methods",
    subject: "MATH",
    action: "practice",
    minutes: 20,
    reason: "A few sign slips showed up last time — timed practice fixes that.",
    urgency: "normal",
  },
  {
    topicId: "t-0-nutrition-in-humans",
    topicTitle: "Nutrition in Humans",
    subject: "SCI",
    action: "revise",
    minutes: 25,
    reason: "Spaced revision is due — best done today.",
    urgency: "normal",
  },
];

/* ---------- Profile & credits ---------- */

export const studentProfile: StudentProfile = {
  id: "s-001",
  name: "Aarav Mehta",
  board: "CBSE",
  className: "Class 10",
  subjectIds: ["math", "science", "social", "english", "hindi"],
  learningGoal:
    "Master the Class 10 syllabus with depth — build genuine understanding, not exam-night recall.",
  weeklyTargetMinutes: 420,
  streakDays: 9,
  createdAt: "2026-07-14",
};

export const creditsBalance: CreditsBalance = {
  balance: 142,
  earnedThisWeek: 86,
  spentThisWeek: 30,
};

/* ---------- Weak topics / revision due (for the dashboard rail) ---------- */

export function weakTopics() {
  const weak: { subject: Subject; chapterTitle: string; topic: NonNullable<ReturnType<typeof allTopics>[number]>["topic"] }[] = [];
  for (const subject of [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI]) {
    for (const ch of subject.chapters) {
      for (const t of ch.topics) {
        if (t.state === "weak" || t.state === "developing") {
          weak.push({ subject, chapterTitle: ch.title, topic: t });
        }
      }
    }
  }
  return weak.sort((a, b) => a.topic.mastery - b.topic.mastery);
}

export function revisionDue() {
  const due: { subject: Subject; chapterTitle: string; topic: NonNullable<ReturnType<typeof allTopics>[number]>["topic"] }[] = [];
  for (const subject of [MATH, SCIENCE, SOCIAL, ENGLISH, HINDI]) {
    for (const ch of subject.chapters) {
      for (const t of ch.topics) {
        if (t.revisionStatus === "due" || t.revisionStatus === "overdue") {
          due.push({ subject, chapterTitle: ch.title, topic: t });
        }
      }
    }
  }
  return due.sort((a, b) => (a.topic.revisionDueInDays ?? 99) - (b.topic.revisionDueInDays ?? 99));
}

/* ---------- Per-class curriculum variants ----------
 *  Class 8 and 9 teach genuinely different content from Class 10
 *  (e.g. Class 9 Maths "Number Systems", Class 8 Science "Light",
 *  Class 9 Social "The Story of Village Palampur"). This module holds
 *  those variants; the resolver below swaps them in by class id. */
import {
  ENGLISH_8,
  ENGLISH_9,
  HINDI_8,
  HINDI_9,
  MATH_8,
  MATH_9,
  SCIENCE_8,
  SCIENCE_9,
  SOCIAL_8,
  SOCIAL_9,
} from "./mockDataClasses";

/** Map class id → subject id → variant Subject. Class 10 keeps the
 *  canonical MATH / SCIENCE / SOCIAL / ENGLISH / HINDI objects above. */
const CLASS_VARIANTS: Record<string, Record<string, Subject>> = {
  "cbse-9": {
    math: MATH_9,
    science: SCIENCE_9,
    social: SOCIAL_9,
    english: ENGLISH_9,
    hindi: HINDI_9,
  },
  "cbse-8": {
    math: MATH_8,
    science: SCIENCE_8,
    social: SOCIAL_8,
    english: ENGLISH_8,
    hindi: HINDI_8,
  },
  // ICSE and UP Board reuse the CBSE variants as close-proximity mocks.
  "icse-9": {
    math: MATH_9,
    science: SCIENCE_9,
    social: SOCIAL_9,
    english: ENGLISH_9,
    hindi: HINDI_9,
  },
  "icse-8": {
    math: MATH_8,
    science: SCIENCE_8,
    social: SOCIAL_8,
    english: ENGLISH_8,
    hindi: HINDI_8,
  },
};

/** Resolve the subject for a class, using the class-appropriate variant
 *  when one exists (Class 8/9) and the canonical Class-10 subject
 *  otherwise. This is the single entry point the UI should use for
 *  per-student curriculum lookups. */
export function findSubjectForClass(
  boardId: string,
  classId: string,
  subjectId: string
): Subject | null {
  const base = findSubject(boardId, classId, subjectId);
  if (!base) return null;
  return CLASS_VARIANTS[classId]?.[subjectId] ?? base;
}
