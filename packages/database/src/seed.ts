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
];

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.costTemplate.deleteMany();

  // Seed cost templates
  for (const template of costTemplates) {
    await prisma.costTemplate.create({ data: template });
  }

  console.log(`Seeded ${costTemplates.length} cost templates across 2 trades.`);

  // Verify
  const roofingCount = await prisma.costTemplate.count({ where: { trade: 'Roofing' } });
  const flooringCount = await prisma.costTemplate.count({ where: { trade: 'Flooring' } });
  console.log(`  - Roofing: ${roofingCount} templates`);
  console.log(`  - Flooring: ${flooringCount} templates`);
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
