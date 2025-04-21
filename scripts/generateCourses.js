// Script to generate courses.json file with all indoor and outdoor courses
const fs = require('fs');
const path = require('path');

// Indoor distances (in feet)
const INDOOR_PAR_1_DISTANCES = [2.5, 3, 3.5, 4];
const INDOOR_PAR_2_DISTANCES = [4.5, 5, 5.5, 6, 6.5, 7, 7.5];
const INDOOR_PAR_3_DISTANCE = 10;

// Outdoor distances (in yards)
const OUTDOOR_PAR_2_DISTANCES = [10, 15];
const OUTDOOR_PAR_3_DISTANCES = [20, 25, 30, 35];
const OUTDOOR_PAR_4_DISTANCES = [40];

// Course names
const OUTDOOR_COURSES = [
  "Augusta National",
  "Pebble Beach",
  "TPC Sawgrass",
  "Torrey Pines",
  "Ojai Valley",
  "PGA West",
  "Shadow Creek",
  "Coeur d'Alene",
  "Greywalls",
  "Sand Valley",
];

const INDOOR_COURSES = [
  "Moonlight Basin",
  "Black Desert Stone",
  "Pinehurst No. 2",
  "Pine Valley",
  "Whistling Straits",
  "Bethpage Black",
  "Valhalla",
  "St. Andrews",
  "Erin Hills",
  "Royal Melbourne",
];

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function generateIndoorNineTemplate() {
  return [
    ...Array(2).fill(1), // 2 par 1s
    ...Array(5).fill(2), // 5 par 2s
    ...Array(2).fill(3), // 2 par 3s
  ];
}

function generateOutdoorNineTemplate() {
  return [
    ...Array(2).fill(2), // 2 par 2s
    ...Array(6).fill(3), // 6 par 3s
    ...Array(1).fill(4), // 1 par 4
  ];
}

function getRandomIndoorDistance(par) {
  if (par === 3) return INDOOR_PAR_3_DISTANCE;
  const distances = par === 1 ? INDOOR_PAR_1_DISTANCES : INDOOR_PAR_2_DISTANCES;
  return distances[Math.floor(Math.random() * distances.length)];
}

function getRandomOutdoorDistance(par) {
  let distances;
  if (par === 2) {
    distances = OUTDOOR_PAR_2_DISTANCES;
  } else if (par === 3) {
    distances = OUTDOOR_PAR_3_DISTANCES;
  } else {
    // par 4
    distances = OUTDOOR_PAR_4_DISTANCES;
  }
  return distances[Math.floor(Math.random() * distances.length)];
}

function generateCourse(courseName, holeCount = 18, courseMode = "Indoor") {
  // Generate hole distribution for front nine based on course mode
  const frontNineTemplate =
    courseMode === "Indoor"
      ? generateIndoorNineTemplate()
      : generateOutdoorNineTemplate();

  // For 18 holes we need the back nine, otherwise just use front nine
  const backNineTemplate = holeCount === 18 ? [...frontNineTemplate] : [];

  // Shuffle the nine(s)
  const frontNine = shuffleArray(frontNineTemplate);
  const backNine = holeCount === 18 ? shuffleArray(backNineTemplate) : [];

  // Generate holes with distances based on course mode
  const getDistance =
    courseMode === "Indoor"
      ? getRandomIndoorDistance
      : getRandomOutdoorDistance;

  // Generate holes with distances
  const holes = [...frontNine, ...backNine].map((par, index) => ({
    number: index + 1,
    par: par,
    distance: getDistance(par),
  }));

  // Calculate totals
  const frontNineHoles = holes.slice(0, 9);
  const backNineHoles = holeCount === 18 ? holes.slice(9) : [];

  const frontNinePar = frontNineHoles.reduce((sum, hole) => sum + hole.par, 0);
  const backNinePar =
    backNineHoles.length > 0
      ? backNineHoles.reduce((sum, hole) => sum + hole.par, 0)
      : 0;

  const frontNineDistance = frontNineHoles.reduce(
    (sum, hole) => sum + hole.distance,
    0
  );

  const backNineDistance =
    backNineHoles.length > 0
      ? backNineHoles.reduce((sum, hole) => sum + hole.distance, 0)
      : 0;

  return {
    holes,
    totalPar: frontNinePar + backNinePar,
    totalDistance: frontNineDistance + backNineDistance,
    frontNinePar,
    frontNineDistance,
    backNinePar,
    backNineDistance,
    courseMode: courseMode,
    holeCount: holeCount,
  };
}

function generateAllCourses() {
  console.log("Generating all courses...");
  
  const coursesData = {};
  
  // Generate outdoor courses
  OUTDOOR_COURSES.forEach(courseName => {
    console.log(`Generating outdoor course: ${courseName}`);
    coursesData[courseName] = generateCourse(courseName, 18, "Outdoor");
  });
  
  // Generate indoor courses
  INDOOR_COURSES.forEach(courseName => {
    console.log(`Generating indoor course: ${courseName}`);
    coursesData[courseName] = generateCourse(courseName, 18, "Indoor");
  });
  
  return coursesData;
}

// Run the generation and write to file
const allCourses = generateAllCourses();
const outputPath = path.resolve(__dirname, '../src/utils/courses.json');

fs.writeFileSync(outputPath, JSON.stringify(allCourses, null, 2));

console.log(`✅ Successfully generated courses.json with ${Object.keys(allCourses).length} courses`);
console.log(`File written to: ${outputPath}`); 