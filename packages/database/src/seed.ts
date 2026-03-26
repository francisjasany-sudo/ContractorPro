import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const costTemplates = [
  // Roofing - 10 items
  { trade: 'Roofing', name: '3-Tab Asphalt Shingles', unit: 'sq', materialCost: 90, laborRate: 75, defaultWaste: 0.10 },
  { trade: 'Roofing', name: 'Architectural Shingles', unit: 'sq', materialCost: 130, laborRate: 85, defaultWaste: 0.10 },
  { trade: 'Roofing', name: 'Synthetic Underlayment', unit: 'sq', materialCost: 45, laborRate: 20, defaultWaste: 0.05 },
  { trade: 'Roofing', name: 'Ice & Water Shield', unit: 'lf', materialCost: 1.50, laborRate: 0.75, defaultWaste: 0.05 },
  { trade: 'Roofing', name: 'Drip Edge Flashing', unit: 'lf', materialCost: 1.25, laborRate: 1.00, defaultWaste: 0.05 },
  { trade: 'Roofing', name: 'Ridge Cap Shingles', unit: 'lf', materialCost: 2.50, laborRate: 1.50, defaultWaste: 0.05 },
  { trade: 'Roofing', name: 'Roof Vent (Box)', unit: 'ea', materialCost: 35, laborRate: 45, defaultWaste: 0 },
  { trade: 'Roofing', name: 'Ridge Vent', unit: 'lf', materialCost: 4.00, laborRate: 2.50, defaultWaste: 0.05 },
  { trade: 'Roofing', name: 'Pipe Boot Flashing', unit: 'ea', materialCost: 15, laborRate: 25, defaultWaste: 0 },
  { trade: 'Roofing', name: 'Tear-off Existing Roof', unit: 'sq', materialCost: 0, laborRate: 65, defaultWaste: 0 },

  // Flooring - 10 items
  { trade: 'Flooring', name: 'Hardwood Oak (3/4")', unit: 'sqft', materialCost: 6.50, laborRate: 4.00, defaultWaste: 0.10 },
  { trade: 'Flooring', name: 'Laminate Flooring', unit: 'sqft', materialCost: 2.50, laborRate: 2.50, defaultWaste: 0.10 },
  { trade: 'Flooring', name: 'Ceramic Tile (12x12)', unit: 'sqft', materialCost: 3.00, laborRate: 6.00, defaultWaste: 0.10 },
  { trade: 'Flooring', name: 'Luxury Vinyl Plank', unit: 'sqft', materialCost: 3.50, laborRate: 2.00, defaultWaste: 0.08 },
  { trade: 'Flooring', name: 'Carpet (Mid-grade)', unit: 'sqft', materialCost: 3.00, laborRate: 1.50, defaultWaste: 0.05 },
  { trade: 'Flooring', name: 'Underlayment (Foam)', unit: 'sqft', materialCost: 0.50, laborRate: 0.25, defaultWaste: 0.05 },
  { trade: 'Flooring', name: 'Tile Backer Board', unit: 'sqft', materialCost: 1.25, laborRate: 1.50, defaultWaste: 0.05 },
  { trade: 'Flooring', name: 'Baseboard Trim', unit: 'lf', materialCost: 1.75, laborRate: 2.00, defaultWaste: 0.05 },
  { trade: 'Flooring', name: 'Floor Leveling Compound', unit: 'sqft', materialCost: 1.00, laborRate: 1.50, defaultWaste: 0.10 },
  { trade: 'Flooring', name: 'Remove Existing Flooring', unit: 'sqft', materialCost: 0, laborRate: 1.25, defaultWaste: 0 },

  // Painting - 10 items
  { trade: 'Painting', name: 'Interior Paint (Premium)', unit: 'gal', materialCost: 45, laborRate: 35, defaultWaste: 0.10 },
  { trade: 'Painting', name: 'Interior Paint (Standard)', unit: 'gal', materialCost: 30, laborRate: 35, defaultWaste: 0.10 },
  { trade: 'Painting', name: 'Exterior Paint (Premium)', unit: 'gal', materialCost: 55, laborRate: 40, defaultWaste: 0.10 },
  { trade: 'Painting', name: 'Primer', unit: 'gal', materialCost: 25, laborRate: 25, defaultWaste: 0.10 },
  { trade: 'Painting', name: 'Painter\'s Tape', unit: 'roll', materialCost: 6, laborRate: 2, defaultWaste: 0.05 },
  { trade: 'Painting', name: 'Drop Cloth', unit: 'ea', materialCost: 12, laborRate: 3, defaultWaste: 0 },
  { trade: 'Painting', name: 'Caulk (Paintable)', unit: 'tube', materialCost: 5, laborRate: 4, defaultWaste: 0.05 },
  { trade: 'Painting', name: 'Wall Prep & Patching', unit: 'sqft', materialCost: 0.50, laborRate: 1.50, defaultWaste: 0.10 },
  { trade: 'Painting', name: 'Trim/Door Painting', unit: 'ea', materialCost: 8, laborRate: 35, defaultWaste: 0.05 },
  { trade: 'Painting', name: 'Ceiling Paint', unit: 'gal', materialCost: 35, laborRate: 40, defaultWaste: 0.10 },

  // Plumbing - 10 items
  { trade: 'Plumbing', name: 'PEX Pipe (1/2")', unit: 'lf', materialCost: 1.50, laborRate: 4.00, defaultWaste: 0.10 },
  { trade: 'Plumbing', name: 'PEX Pipe (3/4")', unit: 'lf', materialCost: 2.25, laborRate: 4.50, defaultWaste: 0.10 },
  { trade: 'Plumbing', name: 'Copper Pipe (1/2")', unit: 'lf', materialCost: 4.00, laborRate: 8.00, defaultWaste: 0.05 },
  { trade: 'Plumbing', name: 'PVC Drain Pipe (2")', unit: 'lf', materialCost: 2.00, laborRate: 5.00, defaultWaste: 0.05 },
  { trade: 'Plumbing', name: 'Kitchen Faucet (Mid-grade)', unit: 'ea', materialCost: 180, laborRate: 120, defaultWaste: 0 },
  { trade: 'Plumbing', name: 'Bathroom Faucet', unit: 'ea', materialCost: 120, laborRate: 95, defaultWaste: 0 },
  { trade: 'Plumbing', name: 'Toilet (Standard)', unit: 'ea', materialCost: 250, laborRate: 175, defaultWaste: 0 },
  { trade: 'Plumbing', name: 'Water Heater (50 gal)', unit: 'ea', materialCost: 800, laborRate: 450, defaultWaste: 0 },
  { trade: 'Plumbing', name: 'Shut-off Valve', unit: 'ea', materialCost: 15, laborRate: 35, defaultWaste: 0 },
  { trade: 'Plumbing', name: 'Garbage Disposal', unit: 'ea', materialCost: 150, laborRate: 120, defaultWaste: 0 },

  // Electrical - 10 items
  { trade: 'Electrical', name: 'Romex Wire (14/2)', unit: 'lf', materialCost: 0.75, laborRate: 3.50, defaultWaste: 0.10 },
  { trade: 'Electrical', name: 'Romex Wire (12/2)', unit: 'lf', materialCost: 1.00, laborRate: 3.75, defaultWaste: 0.10 },
  { trade: 'Electrical', name: 'Standard Outlet', unit: 'ea', materialCost: 3, laborRate: 45, defaultWaste: 0 },
  { trade: 'Electrical', name: 'GFCI Outlet', unit: 'ea', materialCost: 18, laborRate: 55, defaultWaste: 0 },
  { trade: 'Electrical', name: 'Light Switch (Single)', unit: 'ea', materialCost: 3, laborRate: 40, defaultWaste: 0 },
  { trade: 'Electrical', name: 'Dimmer Switch', unit: 'ea', materialCost: 25, laborRate: 50, defaultWaste: 0 },
  { trade: 'Electrical', name: 'Recessed Light (LED)', unit: 'ea', materialCost: 35, laborRate: 65, defaultWaste: 0 },
  { trade: 'Electrical', name: 'Ceiling Fan Install', unit: 'ea', materialCost: 0, laborRate: 120, defaultWaste: 0 },
  { trade: 'Electrical', name: 'Panel Breaker (20A)', unit: 'ea', materialCost: 12, laborRate: 85, defaultWaste: 0 },
  { trade: 'Electrical', name: 'Smoke Detector (Hardwired)', unit: 'ea', materialCost: 30, laborRate: 55, defaultWaste: 0 },

  // General Remodel - 10 items
  { trade: 'General Remodel', name: 'Demolition (Interior)', unit: 'sqft', materialCost: 0, laborRate: 3.50, defaultWaste: 0 },
  { trade: 'General Remodel', name: 'Drywall (1/2")', unit: 'sqft', materialCost: 0.75, laborRate: 2.50, defaultWaste: 0.10 },
  { trade: 'General Remodel', name: 'Drywall Finishing (Tape & Mud)', unit: 'sqft', materialCost: 0.30, laborRate: 1.75, defaultWaste: 0.05 },
  { trade: 'General Remodel', name: 'Framing (2x4 Wall)', unit: 'lf', materialCost: 3.50, laborRate: 8.00, defaultWaste: 0.10 },
  { trade: 'General Remodel', name: 'Insulation (R-13 Batt)', unit: 'sqft', materialCost: 0.80, laborRate: 0.75, defaultWaste: 0.05 },
  { trade: 'General Remodel', name: 'Crown Molding', unit: 'lf', materialCost: 3.00, laborRate: 5.50, defaultWaste: 0.08 },
  { trade: 'General Remodel', name: 'Door (Interior, Pre-hung)', unit: 'ea', materialCost: 150, laborRate: 120, defaultWaste: 0 },
  { trade: 'General Remodel', name: 'Window (Vinyl, Double-hung)', unit: 'ea', materialCost: 350, laborRate: 200, defaultWaste: 0 },
  { trade: 'General Remodel', name: 'Trim/Casing (Door/Window)', unit: 'lf', materialCost: 2.00, laborRate: 3.50, defaultWaste: 0.08 },
  { trade: 'General Remodel', name: 'Permit & Dumpster', unit: 'ea', materialCost: 500, laborRate: 0, defaultWaste: 0 },
];

async function main() {
  console.log('Seeding database...');

  await prisma.costTemplate.deleteMany();

  await prisma.costTemplate.createMany({ data: costTemplates });

  const trades = ['Roofing', 'Flooring', 'Painting', 'Plumbing', 'Electrical', 'General Remodel'];
  console.log(`Seeded ${costTemplates.length} cost templates across ${trades.length} trades.`);

  for (const trade of trades) {
    const count = await prisma.costTemplate.count({ where: { trade } });
    console.log(`  - ${trade}: ${count} templates`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
