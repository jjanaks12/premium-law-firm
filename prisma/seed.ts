import { PrismaClient } from './generated/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; // To load DATABASE_URL from .env file

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'System Administrator with full access',
      permissions: {
        "pages:list": true,
        "pages:read": true,
        "roles:list": true,
        "roles:read": true,
        "users:list": true,
        "users:read": true,
        "pages:create": true,
        "pages:delete": true,
        "pages:update": true,
        "roles:create": true,
        "roles:delete": false,
        "roles:update": true,
        "users:create": true,
        "users:delete": true,
        "users:update": true,
        "settings:list": true,
        "settings:read": false,
        "dashboard:list": true,
        "dashboard:read": false,
        "resources:list": true,
        "resources:read": false,
        "settings:update": false,
        "dashboard:update": false,
        "resources:create": false,
        "resources:delete": false,
        "resources:update": false
      },
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'Staff' },
    update: {},
    create: {
      name: 'Staff',
      description: 'Law firm staff member',
      permissions: {},
    },
  });

  console.log('✅ Created/verified roles:', { adminRole, staffRole });

  // Pre-hashed password for 'Admin123!' (using bcrypt cost factor 10)
  const hashedPassword = '$2b$10$8jkh9zFyRSp75OpujctWKOPO7XqwdFjJMZ/Wj6t0cA9G.xOvX7BXS';

  // We set deleted_at to null if it's nullable in the future, 
  // but if it's currently required in the database, we pass a dummy value or handle it.
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@premiumlaw.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@premiumlaw.com',
      first_name: 'System',
      last_name: 'Admin',
      password: hashedPassword,
      role_id: adminRole.id
    },
  });

  console.log('✅ Created/verified admin user:', adminUser);

  // 3. Create Court Levels
  const courtLevels = [
    { name: 'Supreme Court', nepaliName: 'सर्वोच्च अदालत' },
    { name: 'High Court', nepaliName: 'उच्च अदालत' },
    { name: 'District Court', nepaliName: 'जिल्ला अदालत' },
    { name: 'Special Court', nepaliName: 'विशेष अदालत' },
  ];
  for (const level of courtLevels) {
    await prisma.courtLevel.upsert({
      where: { name: level.name },
      update: { nepaliName: level.nepaliName },
      create: level,
    });
  }
  console.log('✅ Created/verified court levels');

  // 4. Create Party Roles
  const partyRoles = [
    { name: 'Plaintiff', nepaliName: 'वादी' },
    { name: 'Defendant', nepaliName: 'प्रतिवादी' },
    { name: 'Petitioner', nepaliName: 'निवेदक' },
    { name: 'Respondent', nepaliName: 'विपक्षी' },
    { name: 'Appellant', nepaliName: 'पुनरावेदक' },
    { name: 'Waris', nepaliName: 'वारेस' },
  ];
  for (const role of partyRoles) {
    await prisma.partyRole.upsert({
      where: { name: role.name },
      update: { nepaliName: role.nepaliName },
      create: role,
    });
  }
  console.log('✅ Created/verified party roles');

  // 5. Create Case Natures
  const caseNatures = [
    { name: 'Civil', nepaliName: 'देवानी' },
    { name: 'Criminal', nepaliName: 'फौजदारी' },
    { name: 'Writ', nepaliName: 'रिट' },
    { name: 'Commercial', nepaliName: 'वाणिज्य' },
  ];
  for (const nature of caseNatures) {
    await prisma.caseNature.upsert({
      where: { name: nature.name },
      update: { nepaliName: nature.nepaliName },
      create: nature,
    });
  }
  console.log('✅ Created/verified case natures');

  // 6. Create public content categories and demonstration posts.
  // These upserts are intentionally idempotent so repeated seeds do not duplicate content.
  const contentTypes = [
    { name: 'Article', slug: 'article', description: 'Long-form legal articles and guidance' },
    { name: 'News', slug: 'news', description: 'Firm and legal-sector news' },
    { name: 'Video Blog', slug: 'video-blog', description: 'Video updates and explainers' },
  ];

  const typeIds: Record<string, string> = {};
  for (const type of contentTypes) {
    const savedType = await prisma.pageType.upsert({
      where: { slug: type.slug },
      update: { ...type, deleted_at: null },
      create: type,
    });
    typeIds[type.slug] = savedType.id;
  }

  const samplePages = [
    {
      slug: 'preparing-for-a-legal-consultation', locale: 'en', type: 'article', image: 0,
      title: 'Preparing for Your First Legal Consultation',
      excerpt: 'A practical checklist to help you organise documents and questions before meeting your lawyer.',
      content: '<h2>Prepare the essentials</h2><p>Collect agreements, letters, receipts, and any previous correspondence related to your matter.</p><h2>Write a clear timeline</h2><p>A short list of important dates helps your lawyer understand the situation quickly and identify the next steps.</p>',
    },
    {
      slug: 'understanding-commercial-contracts', locale: 'en', type: 'article', image: 1,
      title: 'Understanding Commercial Contracts',
      excerpt: 'Key clauses every business should review before signing an agreement.',
      content: '<h2>Read beyond the headline terms</h2><p>Payment, termination, liability, and dispute-resolution clauses often determine how useful an agreement will be when circumstances change.</p>',
    },
    {
      slug: 'firm-expands-dispute-resolution-team', locale: 'en', type: 'news', image: 1,
      title: 'Firm Expands Its Dispute Resolution Team',
      excerpt: 'Premium Law Firm welcomes new experience to its litigation and arbitration practice.',
      content: '<p>Our expanded dispute resolution team will support clients in complex commercial litigation, arbitration, and negotiated settlements.</p>',
    },
    {
      slug: 'legal-awareness-programme-announced', locale: 'en', type: 'news', image: 2,
      title: 'Community Legal Awareness Programme Announced',
      excerpt: 'A new public programme will explain common legal processes in clear, practical language.',
      content: '<p>The programme will cover document preparation, access to legal services, and common questions about court procedures.</p>',
    },
    {
      slug: 'video-what-to-expect-at-a-consultation', locale: 'en', type: 'video-blog', image: 2,
      title: 'Video: What to Expect at a Legal Consultation',
      excerpt: 'A short demonstration video explaining how an initial consultation works.',
      content: '<p>This sample video demonstrates the video-blog layout and playback experience.</p>',
      detail: { videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    },
    {
      slug: 'video-organising-case-documents', locale: 'en', type: 'video-blog', image: 0,
      title: 'Video: Organising Your Case Documents',
      excerpt: 'Simple ways to arrange records before sharing them with your legal team.',
      content: '<p>This sample video demonstrates how video content can be published from the admin panel.</p>',
      detail: { videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    },
    {
      slug: 'kanuni-paramarshko-tayari', locale: 'np', type: 'article', image: 0,
      title: 'कानुनी परामर्शका लागि कसरी तयारी गर्ने',
      excerpt: 'वकिलसँगको पहिलो भेटअघि कागजात र प्रश्नहरू व्यवस्थित गर्ने सरल तरिका।',
      content: '<h2>आवश्यक कागजात तयार गर्नुहोस्</h2><p>सम्झौता, पत्र, रसिद र विषयसँग सम्बन्धित अन्य कागजातहरू एकै ठाउँमा राख्नुहोस्।</p>',
    },
    {
      slug: 'byabasayik-samjhauta-bujhaunuhos', locale: 'np', type: 'article', image: 1,
      title: 'व्यावसायिक सम्झौता बुझ्नुहोस्',
      excerpt: 'सम्झौतामा हस्ताक्षर गर्नुअघि व्यवसायले हेर्नुपर्ने मुख्य सर्तहरू।',
      content: '<p>भुक्तानी, सम्झौता अन्त्य, दायित्व र विवाद समाधानसम्बन्धी सर्तहरू ध्यानपूर्वक पढ्नुहोस्।</p>',
    },
    {
      slug: 'bibad-samadhan-toli-bistar', locale: 'np', type: 'news', image: 1,
      title: 'विवाद समाधान टोली विस्तार',
      excerpt: 'प्रिमियम ल फर्मले मुद्दा तथा मध्यस्थता सेवामा नयाँ अनुभव थपेको छ।',
      content: '<p>विस्तारित टोलीले जटिल व्यावसायिक विवाद, मध्यस्थता र वार्तामार्फत समाधानमा सहयोग गर्नेछ।</p>',
    },
    {
      slug: 'kanuni-jana-chetana-karyakram', locale: 'np', type: 'news', image: 2,
      title: 'कानुनी जनचेतना कार्यक्रम घोषणा',
      excerpt: 'सामान्य कानुनी प्रक्रियालाई सरल भाषामा बुझाउने नयाँ कार्यक्रम।',
      content: '<p>कार्यक्रममा कागजात तयारी, कानुनी सेवामा पहुँच र अदालत प्रक्रियाबारेका सामान्य प्रश्न समेटिनेछन्।</p>',
    },
    {
      slug: 'video-kanuni-paramarshma-ke-hunchha', locale: 'np', type: 'video-blog', image: 2,
      title: 'भिडियो: कानुनी परामर्शमा के हुन्छ?',
      excerpt: 'पहिलो कानुनी परामर्शको प्रक्रिया बुझाउने छोटो नमुना भिडियो।',
      content: '<p>यो नमुना भिडियोले भिडियो ब्लगको लेआउट र प्लेब्याक देखाउँछ।</p>',
      detail: { videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    },
    {
      slug: 'video-mudda-kagajat-byawasthapan', locale: 'np', type: 'video-blog', image: 0,
      title: 'भिडियो: मुद्दाका कागजात व्यवस्थित गर्ने तरिका',
      excerpt: 'कानुनी टोलीलाई दिनुअघि अभिलेखहरू मिलाउने सरल उपाय।',
      content: '<p>यो नमुना सामग्रीले एडमिनबाट भिडियो कसरी प्रकाशित हुन्छ भन्ने देखाउँछ।</p>',
      detail: { videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
    },
  ];

  for (const page of samplePages) {
    const detail = page.detail ?? {};
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        excerpt: page.excerpt,
        content: page.content,
        detail,
        locale: page.locale,
        status: 'published',
        page_type_id: typeIds[page.type],
        thumbnail_id: null,
        deleted_at: null,
      },
      create: {
        slug: page.slug,
        title: page.title,
        excerpt: page.excerpt,
        content: page.content,
        detail,
        locale: page.locale,
        status: 'published',
        page_type_id: typeIds[page.type],
        thumbnail_id: null,
        author_id: adminUser.id,
      },
    });
  }
  console.log('✅ Created/verified sample articles, news, and video blogs');

  console.log('🌱 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
