import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {MongoClient} from 'mongodb';
if(!process.env.MONGODB_URI||!process.env.MONGODB_DB)throw new Error('Configure MONGODB_URI and MONGODB_DB explicitly.');
// 001 is preserved byte-for-byte for provenance and old checksum verification.
// Its empty nested `required` arrays are rejected by MongoDB 7; fresh databases
// therefore bootstrap directly from the corrected immutable 002 snapshot.
const bytes=await readFile(new URL('./002.schema.json',import.meta.url));
const code=await readFile(new URL(import.meta.url));
const checksum=createHash('sha256').update(bytes).update(code).digest('hex');
const {collections}=JSON.parse(bytes),client=new MongoClient(process.env.MONGODB_URI);
await client.connect();const db=client.db(process.env.MONGODB_DB);let locked=false;
try{
 const existing=new Set((await db.listCollections({}, {nameOnly:true}).toArray()).map(x=>x.name));
 const legacy=await db.collection('_schema_migrations').findOne({_id:'001_initial_schema'});
 const prior=await db.collection('_schema_migrations').findOne({_id:'002_application'});
 if(existing.size&&!legacy&&!prior&&[...existing].some(n=>!['_schema_migrations','_schema_migration_locks'].includes(n)))throw new Error('Database is not empty and has no recognized migration history. Use a new dedicated database.');
 if(legacy){const oldSchema=await readFile(new URL('../schema.json',import.meta.url));const oldCode=await readFile(new URL('./001_initial_schema.mjs',import.meta.url));if(legacy.checksum!==createHash('sha256').update(oldSchema).update(oldCode).digest('hex'))throw new Error('Legacy 001 checksum mismatch. Restore original files; do not rewrite migration history.');}
 try{await db.collection('_schema_migration_locks').insertOne({_id:'portfolio_schema',startedAt:new Date()});locked=true;}catch(e){if(e.code===11000)throw new Error('Another migration holds portfolio_schema lock. See README for recovery.');throw e;}
 if(prior){if(prior.checksum!==checksum)throw new Error('Migration 002 checksum mismatch. Restore immutable migration files and add a new migration.');console.log('Migration 002 already applied; no content changed.');}
 else{
  for(const[name,spec]of Object.entries(collections))if(existing.has(name)&&await db.collection(name).countDocuments({$nor:[spec.validator]},{limit:1}))throw new Error(`Existing ${name} data is incompatible; back up and migrate explicitly.`);
  for(const[name,spec]of Object.entries(collections)){
   const options={validator:spec.validator,validationLevel:'strict',validationAction:'error'};
   if(existing.has(name))await db.command({collMod:name,...options});else await db.createCollection(name,options);
   if(spec.indexes.length)await db.collection(name).createIndexes(spec.indexes);
  }
  const now=new Date();const seed=(collection,query,document)=>db.collection(collection).updateOne(query,{$setOnInsert:{...document,createdAt:now,updatedAt:now}},{upsert:true});
  await seed('portfolio_settings',{key:'main'},{key:'main',name:'Abdul Samad',roles:['Full-Stack Developer','WordPress Developer','Web Designer','Entrepreneur'],heroMediaType:'photo',location:'Karachi, Pakistan',socialLinks:[],stats:[],floatingControls:{enabled:false,platforms:[],comingSoonEnabled:false,comingSoonLabel:'Coming Soon 👀',animationEnabled:true},splash:{enabled:true,wordmark:'ABDUL SAMAD.',subtitle:'DEVELOPER & ENTREPRENEUR',durationMs:1200,oncePerSession:true,animationEnabled:true},mobileNavigation:[{label:'Home',url:'/',visible:true},{label:'Projects',url:'/projects',visible:true},{label:'Ventures',url:'/ventures',visible:true},{label:'Blog',url:'/blog',visible:true},{label:'More',url:'#more',visible:true}]});
  for(const[displayOrder,key]of ['hero','ventures','about','services','skills','process','projects','beyond-code','articles','contact'].entries())await seed('home_sections',{key},{key,heading:key,visible:true,displayOrder});
  for(const[displayOrder,[name,slug]]of [['Bibros Solutions','bibros-solutions'],['DUSSU Store','dussu-store'],['Bol Hi','bol-hi']].entries())await seed('ventures',{slug},{name,slug,role:'Founder',publicationStatus:'draft',progressStatus:name==='Bol Hi'?'coming_soon':'in_development',displayOrder,featured:false});
  for(const[displayOrder,[title,slug,summary]]of [['WordPress Development','wordpress-development','Flexible business websites, Elementor customization and WooCommerce stores.'],['MERN Stack Development','mern-stack-development','Custom web applications built with React, Node.js, Express and MongoDB.'],['Web Design','web-design','Clear, responsive website experiences built around your audience.']].entries())await seed('services',{slug},{title,slug,summary,publicationStatus:'published',publishedAt:now,displayOrder,visible:true,capabilities:[],deliverables:[],faqs:[],content:[]});
  for(const[key,title]of [['home','Abdul Samad — Developer & Entrepreneur'],['about','About Abdul Samad'],['services','Development & Design Services'],['projects','Selected Work'],['ventures','Ventures & Companies'],['blog','Blog & Articles'],['coming-soon','Coming Soon'],['contact','Let’s build something meaningful.'],['privacy','Privacy Policy']])await seed('pages',{key},{key,slug:key,title,publicationStatus:key==='privacy'?'draft':'published',...(key!=='privacy'?{publishedAt:now}:{}),content:[]});
  for(const[displayOrder,title]of ['Understand','Design','Build','Refine'].entries())await seed('skill_items',{group:'process',title},{group:'process',title,description:['We discuss your idea, audience and goals.','We shape a clear, responsive experience.','We turn the design into a working product.','We test the details and prepare the handoff.'][displayOrder],displayOrder,visible:true});
  await db.collection('_schema_migrations').insertOne({_id:'002_application',checksum,appliedAt:new Date()});console.log('Migration 002 applied. No admin or fake published projects created.');
 }
}finally{try{if(locked)await db.collection('_schema_migration_locks').deleteOne({_id:'portfolio_schema'});}finally{await client.close();}}
