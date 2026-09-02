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

// picsum.photos serves a stable image per seed string, so re-running the seed
// keeps the same picture on the same product.
const imageUrl = (seedValue) => `https://picsum.photos/seed/${seedValue}/800/800`;

const seed = async () => {
  try {
    assertSafeToSeed();

    await sequelize.sync({ force: true });
    console.log('Database cleared and synced');

    const categoryTemplates = [
      { 
        name: 'Électronique', 
        description: 'Le summum de la technologie et de l\'innovation.', 
        slug: 'electronique'
      },
      { 
        name: 'Mode', 
        description: 'Exprimez votre personnalité avec style.', 
        slug: 'mode'
      },
      { 
        name: 'Maison', 
        description: 'L\'élégance et le confort pour votre intérieur.', 
        slug: 'maison'
      },
      { 
        name: 'Beauté', 
        description: 'Révélez votre beauté naturelle.', 
        slug: 'beaute'
      },
      { 
        name: 'Sports', 
        description: 'La performance au service de votre passion.', 
        slug: 'sports'
      }
    ];

    const products = [];
    let lockId = 1;

    for (const cat of categoryTemplates) {
      const createdCategory = await Category.create({
        name: cat.name,
        description: cat.description,
        imageUrl: imageUrl(`categorie-${cat.slug}`)
      });

      console.log(`Generating 50 products for ${cat.name}...`);

      for (let i = 0; i < 50; i++) {
        products.push({
          name: `${cat.name} Unique Edition ${i + 1}`,
          description: `Un produit exclusif de notre gamme ${cat.name}. Qualité certifiée et design unique pour une expérience utilisateur inégalée.`,
          price: (Math.random() * 900 + 50).toFixed(2),
          stock: Math.floor(Math.random() * 100) + 1,
          categoryId: createdCategory.id,
          imageUrl: imageUrl(`produit-${lockId}`)
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
