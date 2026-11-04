export const DEFAULT_VEHICLE_ID = 'sports_car';
export const VEHICLES = [
  {
    id: 'sports_car',
    name: 'Sports Car',
    tagline: 'Agile & Balanced',
    price: 0,
    stats: {
      speed: 7,
      acceleration: 7,
      stability: 7,
    },
    handling: {
      driveAccel: 885,
      maxVx: 515,
      airDriveAccel: 165,
      gravity: 620,
      pitchResponsiveness: 26,
    },
    description:
      'Sleek and nimble classic sports car. Perfectly balanced for any ramp.',
  },
  {
    id: 'monster_truck',
    name: 'Monster Truck',
    tagline: 'High Torque & Grip',
    price: 150,
    stats: {
      speed: 6,
      acceleration: 8,
      stability: 9,
    },
    handling: {
      driveAccel: 980,
      maxVx: 480,
      airDriveAccel: 140,
      gravity: 660,
      pitchResponsiveness: 22,
    },
    description:
      'Giant heavy wheels and immense climbing torque to power over steep slopes.',
  },
  {
    id: 'police_car',
    name: 'Police Car',
    tagline: 'High-Speed Pursuit',
    price: 300,
    stats: {
      speed: 8,
      acceleration: 8,
      stability: 7,
    },
    handling: {
      driveAccel: 930,
      maxVx: 540,
      airDriveAccel: 175,
      gravity: 620,
      pitchResponsiveness: 28,
    },
    description:
      'Equipped with flashing emergency sirens and fast pursuit acceleration.',
  },
  {
    id: 'racing_car',
    name: 'Racing Car',
    tagline: 'Blistering Velocity',
    price: 450,
    stats: {
      speed: 10,
      acceleration: 9,
      stability: 6,
    },
    handling: {
      driveAccel: 960,
      maxVx: 570,
      airDriveAccel: 190,
      gravity: 630,
      pitchResponsiveness: 30,
    },
    description:
      'Ultra aerodynamic track racer engineered for blistering top speeds.',
  },
  {
    id: 'school_bus',
    name: 'School Bus',
    tagline: 'Heavy & Ultra Stable',
    price: 600,
    stats: {
      speed: 6,
      acceleration: 6,
      stability: 10,
    },
    handling: {
      driveAccel: 840,
      maxVx: 495,
      airDriveAccel: 130,
      gravity: 650,
      pitchResponsiveness: 20,
    },
    description:
      'Iconic yellow school bus. Heavy, sturdy, and exceptionally stable.',
  },
];
export function getVehicleById(id) {
  const found = VEHICLES.find((v) => v.id === id);
  return found || VEHICLES[0];
}
