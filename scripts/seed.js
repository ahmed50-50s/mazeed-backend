// Inserts sample centers and the landing-page content for local development.
// Usage: npm run seed            (adds sample centers; fills landing content only where it is empty)
//        npm run seed -- --fresh (deletes ALL centers and landing content first; analytics are never touched)
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Center from '../src/models/Center.js';
import Service from '../src/models/Service.js';
import PricingPlan from '../src/models/PricingPlan.js';
import ShowcaseItem from '../src/models/ShowcaseItem.js';
import Testimonial from '../src/models/Testimonial.js';
import SiteSettings from '../src/models/SiteSettings.js';
import * as landing from './seed-data/landing.js';

const samples = [
  {
    name: 'دار الإخلاص لتحفيظ القرآن',
    address: 'شارع التحرير، بجوار مسجد النور',
    region: 'القاهرة',
    whatsappNumber: '+20 100 123 4567',
    details: 'حلقات للأطفال والكبار، تجويد وتحفيظ بالسند المتصل.',
  },
  {
    name: 'دار الفرقان',
    address: 'شارع الجمهورية، عمارة 12',
    region: 'الإسكندرية',
    whatsappNumber: '201112223334',
    details: 'حلقات مسائية للنساء يومي السبت والثلاثاء.',
  },
  {
    name: 'مدرسة النور القرآنية',
    address: 'حي الجامعة، خلف مكتبة المدينة',
    region: 'المنصورة',
    whatsappNumber: '00201223334445',
    details: 'تحفيظ للأطفال من سن 5 سنوات.',
  },
];

// Ordered collections: array position becomes `order`
const collections = [
  [Service, landing.services],
  [PricingPlan, landing.plans],
  [ShowcaseItem, landing.showcaseItems],
  [Testimonial, landing.testimonials],
];

async function seedContent(fresh) {
  for (const [Model, items] of collections) {
    if (fresh) await Model.deleteMany({});
    if (await Model.exists({})) {
      console.log(`${Model.modelName}: already has data, skipped`);
      continue;
    }
    const created = await Model.insertMany(items.map((item, order) => ({ ...item, order })));
    console.log(`${Model.modelName}: inserted ${created.length}`);
  }

  if (fresh) await SiteSettings.deleteMany({});
  if (await SiteSettings.exists({ key: 'main' })) {
    console.log('SiteSettings: already exists, skipped');
  } else {
    await SiteSettings.create({ key: 'main', ...landing.settings });
    console.log('SiteSettings: created');
  }
}

async function seed() {
  await connectDB();
  const fresh = process.argv.includes('--fresh');
  if (fresh) {
    const { deletedCount } = await Center.deleteMany({});
    console.log(`Deleted ${deletedCount} existing centers`);
  }
  const created = await Center.insertMany(samples);
  console.log(`Inserted ${created.length} centers`);

  await seedContent(fresh);
  await mongoose.connection.close();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
