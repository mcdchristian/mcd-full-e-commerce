require('dotenv').config();

const { Category, Product, User, Cart } = require('../src/models');
const { sequelize } = require('../src/config/db');

// sync({ force: true }) drops every table before recreating it, so running this
// against a production .env destroys the live catalogue, orders and accounts.
const assertSafeToSeed = () => {
  if (process.env.NODE_ENV !== 'production') return;

  if (process.env.ALLOW_DESTRUCTIVE_SEED === 'true') {
    console.warn('NODE_ENV=production and ALLOW_DESTRUCTIVE_SEED=true: dropping all tables.');
    return;
  }

  console.error(
    'Refusing to seed: NODE_ENV=production and this script drops every table.\n' +
    'Set ALLOW_DESTRUCTIVE_SEED=true if you really mean to wipe this database.'
  );
  process.exit(1);
};

const seed = async () => {
  try {
    assertSafeToSeed();

    await sequelize.sync({ force: true });
    console.log('Database cleared and synced');

    const categoryTemplates = [
      { 
        name: 'Électronique', 
        description: 'Le summum de la technologie et de l\'innovation.', 
        imageUrl: 'https://loremflickr.com/800/800/electronics,gadget/all?lock=0',
        keywords: 'electronics,gadget,tech'
      },
      { 
        name: 'Mode', 
        description: 'Exprimez votre personnalité avec style.', 
        imageUrl: 'https://loremflickr.com/800/800/fashion,clothing/all?lock=0',
        keywords: 'fashion,clothing,outfit'
      },
      { 
        name: 'Maison', 
        description: 'L\'élégance et le confort pour votre intérieur.', 
        imageUrl: 'https://loremflickr.com/800/800/interior,furniture/all?lock=0',
        keywords: 'interior,furniture,home'
      },
      { 
        name: 'Beauté', 
        description: 'Révélez votre beauté naturelle.', 
        imageUrl: 'https://loremflickr.com/800/800/beauty,cosmetics/all?lock=0',
        keywords: 'beauty,cosmetics,skincare'
      },
      { 
        name: 'Sports', 
        description: 'La performance au service de votre passion.', 
        imageUrl: 'https://loremflickr.com/800/800/fitness,sports/all?lock=0',
        keywords: 'fitness,sports,equipment'
      }
    ];

    const products = [];
    let lockId = 1;

    for (const cat of categoryTemplates) {
      const createdCategory = await Category.create({
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl
      });

      console.log(`Generating 50 products for ${cat.name}...`);

      for (let i = 0; i < 50; i++) {
        products.push({
          name: `${cat.name} Unique Edition ${i + 1}`,
          description: `Un produit exclusif de notre gamme ${cat.name}. Qualité certifiée et design unique pour une expérience utilisateur inégalée.`,
          price: (Math.random() * 900 + 50).toFixed(2),
          stock: Math.floor(Math.random() * 100) + 1,
          categoryId: createdCategory.id,
          imageUrl: `https://loremflickr.com/800/800/${cat.keywords}/all?lock=${lockId}`
        });
        lockId++;
      }
    }

    await Product.bulkCreate(products);
    console.log(`250 Products seeded successfully with 250 unique images!`);

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    await Cart.create({ userId: admin.id });

    console.log('Massive seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
