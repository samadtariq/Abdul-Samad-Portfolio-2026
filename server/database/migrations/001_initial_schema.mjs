import { readFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const schemaBytes = await readFile(new URL('../schema.json', import.meta.url));
const { collections } = JSON.parse(schemaBytes);
const command = process.argv[2] ?? 'plan';
if (!['plan', 'up'].includes(command)) throw new Error('Use plan or up. No destructive down migration is supplied.');
if (command === 'plan') {
  console.log('Migration 001: create/validate collections and indexes; insert missing defaults only.');
  for (const [name, spec] of Object.entries(collections)) console.log(`${name}: ${spec.indexes.length} indexes`);
} else {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) throw new Error('Set MONGODB_URI and MONGODB_DB explicitly.');
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(process.env.MONGODB_URI);
  const id = '001_initial_schema';
  const checksum = createHash('sha256').update(schemaBytes).update(await readFile(fileURLToPath(import.meta.url))).digest('hex');
  const owner = randomUUID();
  let acquired = false;
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const ledger = db.collection('_schema_migrations');
    const locks = db.collection('_schema_migration_locks');
    try { await locks.insertOne({ _id: 'portfolio_schema', owner, startedAt: new Date() }); acquired = true; }
    catch (error) { if (error.code === 11000) throw new Error('Another migration holds portfolio_schema lock. See README for interrupted-run recovery.'); throw error; }
    const previous = await ledger.findOne({ _id: id });
    if (previous) {
      if (previous.checksum !== checksum) throw new Error('Applied migration checksum changed. Restore original files and add a new numbered migration.');
      console.log('Migration 001 already applied; no changes.');
    } else {
      const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map(x => x.name));
      // Reject incompatible existing documents before changing application collections.
      for (const [name, spec] of Object.entries(collections)) {
        if (existing.has(name)) {
          const invalid = await db.collection(name).countDocuments({ $nor: [spec.validator] }, { limit: 1 });
          if (invalid) throw new Error(`Existing ${name} documents do not match schema. Back up and migrate their fields explicitly first.`);
        }
      }
      for (const [name, spec] of Object.entries(collections)) {
        const options = { validator: spec.validator, validationLevel: 'strict', validationAction: 'error' };
        if (existing.has(name)) await db.command({ collMod: name, ...options });
        else await db.createCollection(name, options);
        if (spec.indexes.length) await db.collection(name).createIndexes(spec.indexes);
        console.log(`Ready: ${name}`);
      }
      const now = new Date();
      const insertMissing = (name, query, values) => db.collection(name).updateOne(query, { $setOnInsert: { ...values, createdAt: now, updatedAt: now } }, { upsert: true });
      await insertMissing('portfolio_settings', { key: 'main' }, {
        key: 'main', name: 'Abdul Samad', roles: ['Full-Stack Developer', 'WordPress Developer', 'Web Designer', 'Entrepreneur'],
        heroMediaType: 'photo', location: 'Karachi, Pakistan', socialLinks: [], stats: [],
        floatingControls: { enabled: false, platforms: [], comingSoonEnabled: false, comingSoonLabel: 'Coming Soon 👀', animationEnabled: true },
        splash: { enabled: true, wordmark: 'ABDUL SAMAD.', subtitle: 'DEVELOPER & ENTREPRENEUR', durationMs: 1200, oncePerSession: true, animationEnabled: true },
        mobileNavigation: [
          { label: 'Home', url: '/', visible: true }, { label: 'Projects', url: '/projects', visible: true },
          { label: 'Ventures', url: '/ventures', visible: true }, { label: 'Blog', url: '/blog', visible: true },
          { label: 'More', url: '#more', visible: true }
        ]
      });
      for (const [displayOrder, key] of ['hero','ventures','about','services','skills','process','projects','beyond-code','articles','contact'].entries()) {
        await insertMissing('home_sections', { key }, { key, heading: key, visible: true, displayOrder });
      }
      for (const [displayOrder, [name, slug]] of [['Bibros Solutions','bibros-solutions'],['DUSSU Store','dussu-store'],['Bol Hi','bol-hi']].entries()) {
        const values = { name, slug, role: 'Founder', publicationStatus: 'draft', displayOrder, featured: false };
        // Unknown business launch states are not asserted; admin must review before publishing.
        values.progressStatus = name === 'Bol Hi' ? 'coming_soon' : 'in_development';
        await insertMissing('ventures', { slug }, values);
      }
      await ledger.insertOne({ _id: id, checksum, appliedAt: new Date() });
      console.log('Migration 001 complete. No admin account or fake published content was created.');
    }
  } finally {
    try {
      if (acquired) await client.db(process.env.MONGODB_DB).collection('_schema_migration_locks').deleteOne({ _id: 'portfolio_schema', owner });
    } finally { await client.close(); }
  }
}
