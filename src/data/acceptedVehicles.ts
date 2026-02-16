export interface VehicleModel {
  name: string;
  year: number;
  tiers: string[];
}

export interface VehicleMake {
  make: string;
  models: VehicleModel[];
}

export const TIERS = ["Standard", "Extra Comfort", "Black", "XL"] as const;
export type Tier = (typeof TIERS)[number];

export const acceptedVehicles: VehicleMake[] = [
  {
    make: "Acura",
    models: [
      { name: "ILX", year: 2015, tiers: ["Standard"] },
      { name: "TLX", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "RLX", year: 2015, tiers: ["Extra Comfort"] },
      { name: "MDX", year: 2015, tiers: ["Standard", "Extra Comfort", "XL"] },
      { name: "RDX", year: 2015, tiers: ["Standard"] },
    ],
  },
  {
    make: "Audi",
    models: [
      { name: "A4", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "A6", year: 2015, tiers: ["Extra Comfort", "Black"] },
      { name: "A8", year: 2015, tiers: ["Black"] },
      { name: "Q5", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "Q7", year: 2015, tiers: ["Extra Comfort", "XL"] },
      { name: "Q8", year: 2019, tiers: ["Extra Comfort", "Black"] },
      { name: "e-tron", year: 2019, tiers: ["Extra Comfort"] },
    ],
  },
  {
    make: "Bentley",
    models: [
      { name: "Flying Spur", year: 2015, tiers: ["Black"] },
      { name: "Bentayga", year: 2017, tiers: ["Black", "XL"] },
      { name: "Continental GT", year: 2015, tiers: ["Black"] },
    ],
  },
  {
    make: "BMW",
    models: [
      { name: "3 Series", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "5 Series", year: 2015, tiers: ["Extra Comfort", "Black"] },
      { name: "7 Series", year: 2015, tiers: ["Black"] },
      { name: "X3", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "X5", year: 2015, tiers: ["Extra Comfort", "XL"] },
      { name: "X7", year: 2019, tiers: ["Black", "XL"] },
      { name: "iX", year: 2022, tiers: ["Extra Comfort"] },
      { name: "i4", year: 2022, tiers: ["Extra Comfort"] },
    ],
  },
  {
    make: "Cadillac",
    models: [
      { name: "CT4", year: 2020, tiers: ["Standard"] },
      { name: "CT5", year: 2020, tiers: ["Standard", "Extra Comfort"] },
      { name: "CT6", year: 2016, tiers: ["Extra Comfort", "Black"] },
      { name: "Escalade", year: 2015, tiers: ["Black", "XL"] },
      { name: "XT5", year: 2017, tiers: ["Standard", "Extra Comfort"] },
      { name: "XT6", year: 2020, tiers: ["Extra Comfort", "XL"] },
      { name: "Lyriq", year: 2023, tiers: ["Extra Comfort"] },
    ],
  },
  {
    make: "Chevrolet",
    models: [
      { name: "Malibu", year: 2015, tiers: ["Standard"] },
      { name: "Impala", year: 2015, tiers: ["Standard"] },
      { name: "Equinox", year: 2015, tiers: ["Standard"] },
      { name: "Traverse", year: 2015, tiers: ["Standard", "XL"] },
      { name: "Suburban", year: 2015, tiers: ["XL"] },
      { name: "Tahoe", year: 2015, tiers: ["XL"] },
      { name: "Bolt EV", year: 2017, tiers: ["Standard"] },
    ],
  },
  {
    make: "Dodge",
    models: [
      { name: "Charger", year: 2015, tiers: ["Standard"] },
      { name: "Durango", year: 2015, tiers: ["Standard", "XL"] },
    ],
  },
  {
    make: "Ford",
    models: [
      { name: "Fusion", year: 2015, tiers: ["Standard"] },
      { name: "Taurus", year: 2015, tiers: ["Standard"] },
      { name: "Escape", year: 2015, tiers: ["Standard"] },
      { name: "Edge", year: 2015, tiers: ["Standard"] },
      { name: "Explorer", year: 2015, tiers: ["Standard", "XL"] },
      { name: "Expedition", year: 2015, tiers: ["XL"] },
      { name: "Mustang Mach-E", year: 2021, tiers: ["Standard", "Extra Comfort"] },
    ],
  },
  {
    make: "Genesis",
    models: [
      { name: "G70", year: 2019, tiers: ["Extra Comfort"] },
      { name: "G80", year: 2017, tiers: ["Extra Comfort", "Black"] },
      { name: "G90", year: 2017, tiers: ["Black"] },
      { name: "GV70", year: 2022, tiers: ["Extra Comfort"] },
      { name: "GV80", year: 2021, tiers: ["Extra Comfort", "XL"] },
    ],
  },
  {
    make: "GMC",
    models: [
      { name: "Terrain", year: 2015, tiers: ["Standard"] },
      { name: "Acadia", year: 2015, tiers: ["Standard", "XL"] },
      { name: "Yukon", year: 2015, tiers: ["XL"] },
      { name: "Yukon XL", year: 2015, tiers: ["XL"] },
    ],
  },
  {
    make: "Honda",
    models: [
      { name: "Civic", year: 2016, tiers: ["Standard"] },
      { name: "Accord", year: 2015, tiers: ["Standard"] },
      { name: "CR-V", year: 2015, tiers: ["Standard"] },
      { name: "Pilot", year: 2015, tiers: ["Standard", "XL"] },
      { name: "Odyssey", year: 2015, tiers: ["XL"] },
    ],
  },
  {
    make: "Hyundai",
    models: [
      { name: "Elantra", year: 2017, tiers: ["Standard"] },
      { name: "Sonata", year: 2015, tiers: ["Standard"] },
      { name: "Tucson", year: 2016, tiers: ["Standard"] },
      { name: "Santa Fe", year: 2015, tiers: ["Standard", "XL"] },
      { name: "Palisade", year: 2020, tiers: ["Extra Comfort", "XL"] },
      { name: "Ioniq 5", year: 2022, tiers: ["Standard", "Extra Comfort"] },
      { name: "Ioniq 6", year: 2023, tiers: ["Extra Comfort"] },
    ],
  },
  {
    make: "Infiniti",
    models: [
      { name: "Q50", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "Q60", year: 2017, tiers: ["Extra Comfort"] },
      { name: "QX50", year: 2019, tiers: ["Extra Comfort"] },
      { name: "QX60", year: 2015, tiers: ["Extra Comfort", "XL"] },
      { name: "QX80", year: 2015, tiers: ["Black", "XL"] },
    ],
  },
  {
    make: "Jaguar",
    models: [
      { name: "XE", year: 2017, tiers: ["Extra Comfort"] },
      { name: "XF", year: 2016, tiers: ["Extra Comfort", "Black"] },
      { name: "F-PACE", year: 2017, tiers: ["Extra Comfort"] },
      { name: "I-PACE", year: 2019, tiers: ["Extra Comfort"] },
    ],
  },
  {
    make: "Jeep",
    models: [
      { name: "Cherokee", year: 2015, tiers: ["Standard"] },
      { name: "Grand Cherokee", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "Grand Cherokee L", year: 2021, tiers: ["Extra Comfort", "XL"] },
      { name: "Wagoneer", year: 2022, tiers: ["Extra Comfort", "XL"] },
      { name: "Grand Wagoneer", year: 2022, tiers: ["Black", "XL"] },
    ],
  },
  {
    make: "Kia",
    models: [
      { name: "Forte", year: 2017, tiers: ["Standard"] },
      { name: "K5", year: 2021, tiers: ["Standard"] },
      { name: "Sportage", year: 2017, tiers: ["Standard"] },
      { name: "Sorento", year: 2016, tiers: ["Standard", "XL"] },
      { name: "Telluride", year: 2020, tiers: ["Extra Comfort", "XL"] },
      { name: "EV6", year: 2022, tiers: ["Standard", "Extra Comfort"] },
      { name: "EV9", year: 2024, tiers: ["Extra Comfort", "XL"] },
    ],
  },
  {
    make: "Land Rover",
    models: [
      { name: "Range Rover Evoque", year: 2016, tiers: ["Extra Comfort"] },
      { name: "Range Rover Velar", year: 2018, tiers: ["Extra Comfort"] },
      { name: "Range Rover Sport", year: 2015, tiers: ["Extra Comfort", "Black"] },
      { name: "Range Rover", year: 2015, tiers: ["Black", "XL"] },
      { name: "Discovery", year: 2017, tiers: ["Extra Comfort", "XL"] },
    ],
  },
  {
    make: "Lexus",
    models: [
      { name: "IS", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "ES", year: 2015, tiers: ["Extra Comfort"] },
      { name: "GS", year: 2015, tiers: ["Extra Comfort", "Black"] },
      { name: "LS", year: 2015, tiers: ["Black"] },
      { name: "NX", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "RX", year: 2015, tiers: ["Extra Comfort", "XL"] },
      { name: "GX", year: 2015, tiers: ["Extra Comfort", "XL"] },
      { name: "LX", year: 2015, tiers: ["Black", "XL"] },
    ],
  },
  {
    make: "Lincoln",
    models: [
      { name: "MKZ", year: 2015, tiers: ["Extra Comfort"] },
      { name: "Continental", year: 2017, tiers: ["Extra Comfort", "Black"] },
      { name: "Corsair", year: 2020, tiers: ["Extra Comfort"] },
      { name: "Aviator", year: 2020, tiers: ["Extra Comfort", "XL"] },
      { name: "Navigator", year: 2015, tiers: ["Black", "XL"] },
    ],
  },
  {
    make: "Lucid",
    models: [
      { name: "Air Pure", year: 2022, tiers: ["Extra Comfort"] },
      { name: "Air Touring", year: 2022, tiers: ["Extra Comfort", "Black"] },
      { name: "Air Grand Touring", year: 2022, tiers: ["Black"] },
    ],
  },
  {
    make: "Maserati",
    models: [
      { name: "Ghibli", year: 2015, tiers: ["Black"] },
      { name: "Quattroporte", year: 2015, tiers: ["Black"] },
      { name: "Levante", year: 2017, tiers: ["Black", "XL"] },
    ],
  },
  {
    make: "Mazda",
    models: [
      { name: "Mazda3", year: 2016, tiers: ["Standard"] },
      { name: "Mazda6", year: 2015, tiers: ["Standard"] },
      { name: "CX-5", year: 2017, tiers: ["Standard"] },
      { name: "CX-9", year: 2016, tiers: ["Standard", "XL"] },
      { name: "CX-50", year: 2023, tiers: ["Standard"] },
      { name: "CX-90", year: 2024, tiers: ["Extra Comfort", "XL"] },
    ],
  },
  {
    make: "Mercedes-Benz",
    models: [
      { name: "C-Class", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "E-Class", year: 2015, tiers: ["Extra Comfort", "Black"] },
      { name: "S-Class", year: 2015, tiers: ["Black"] },
      { name: "GLC", year: 2016, tiers: ["Extra Comfort"] },
      { name: "GLE", year: 2015, tiers: ["Extra Comfort", "XL"] },
      { name: "GLS", year: 2017, tiers: ["Black", "XL"] },
      { name: "EQS", year: 2022, tiers: ["Black"] },
      { name: "EQE", year: 2023, tiers: ["Extra Comfort"] },
    ],
  },
  {
    make: "Mitsubishi",
    models: [
      { name: "Outlander", year: 2016, tiers: ["Standard"] },
      { name: "Eclipse Cross", year: 2018, tiers: ["Standard"] },
    ],
  },
  {
    make: "Porsche",
    models: [
      { name: "Panamera", year: 2015, tiers: ["Black"] },
      { name: "Cayenne", year: 2015, tiers: ["Black", "XL"] },
      { name: "Macan", year: 2015, tiers: ["Extra Comfort"] },
      { name: "Taycan", year: 2020, tiers: ["Extra Comfort", "Black"] },
    ],
  },
  {
    make: "Rivian",
    models: [
      { name: "R1S", year: 2022, tiers: ["Extra Comfort", "XL"] },
      { name: "R1T", year: 2022, tiers: ["Extra Comfort"] },
    ],
  },
  {
    make: "Rolls-Royce",
    models: [
      { name: "Ghost", year: 2015, tiers: ["Black"] },
      { name: "Phantom", year: 2015, tiers: ["Black"] },
      { name: "Cullinan", year: 2019, tiers: ["Black", "XL"] },
    ],
  },
  {
    make: "Tesla",
    models: [
      { name: "Model 3", year: 2017, tiers: ["Standard", "Extra Comfort"] },
      { name: "Model Y", year: 2020, tiers: ["Standard", "Extra Comfort"] },
      { name: "Model S", year: 2016, tiers: ["Extra Comfort", "Black"] },
      { name: "Model X", year: 2016, tiers: ["Extra Comfort", "Black", "XL"] },
    ],
  },
  {
    make: "Toyota",
    models: [
      { name: "Corolla", year: 2016, tiers: ["Standard"] },
      { name: "Camry", year: 2015, tiers: ["Standard"] },
      { name: "Avalon", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "RAV4", year: 2015, tiers: ["Standard"] },
      { name: "Highlander", year: 2015, tiers: ["Standard", "XL"] },
      { name: "Sequoia", year: 2015, tiers: ["XL"] },
      { name: "Sienna", year: 2015, tiers: ["XL"] },
      { name: "bZ4X", year: 2023, tiers: ["Standard"] },
    ],
  },
  {
    make: "Volkswagen",
    models: [
      { name: "Jetta", year: 2016, tiers: ["Standard"] },
      { name: "Passat", year: 2015, tiers: ["Standard"] },
      { name: "Tiguan", year: 2018, tiers: ["Standard"] },
      { name: "Atlas", year: 2018, tiers: ["Standard", "XL"] },
      { name: "ID.4", year: 2021, tiers: ["Standard", "Extra Comfort"] },
    ],
  },
  {
    make: "Volvo",
    models: [
      { name: "S60", year: 2015, tiers: ["Standard", "Extra Comfort"] },
      { name: "S90", year: 2017, tiers: ["Extra Comfort", "Black"] },
      { name: "XC40", year: 2019, tiers: ["Standard"] },
      { name: "XC60", year: 2018, tiers: ["Extra Comfort"] },
      { name: "XC90", year: 2016, tiers: ["Extra Comfort", "Black", "XL"] },
    ],
  },
];

export const totalModelCount = acceptedVehicles.reduce(
  (sum, make) => sum + make.models.length,
  0,
);
