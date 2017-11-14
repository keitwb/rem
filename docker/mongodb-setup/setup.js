// All commands are idempotent or guarded so that this script can be run
// multiple times over the same database.

function setRelations(coll, rels) {
  var metaColl = "_properties";
  var propDocId = metaColl + "." + coll;

  // RESTHeart metadata colletion
  rem.createCollection(metaColl);

  // Drop relations
  rem.getCollection(metaColl).updateOne(
    { _id: propDocId },
    { $unset: { rels: "" }});

  // Add back relations
  rem.getCollection(metaColl).updateOne(
    { _id: propDocId },
    { $set: { name: coll },
      $set: { rels: rels }
    },
    { upsert: true });
}

function main() {
  rs.initiate();
  sleep(2500);

  rem = connect('mongodb:27017/rem');

  colls = rem.getCollectionNames();

  // Properties
  rem.createCollection("properties");  // This is idempotent

  rem.runCommand({
     collMod:"properties",
     validator:{ $or: [
       { "propType": { $in: ["land", "commercial", "residential"] } }
     ]},
     validationLevel:"strict"
  });

  rem.properties.dropIndex("text-search");
  rem.properties.createIndex({ "$**": "text" }, {name: "text-search"});

  setRelations("properties", [
    {
      rel: "leases",
      type: "MANY_TO_MANY",
      role: "OWNING",
      "target-coll": "leases",
      "ref-field": "$.leases.[*]",
    },
    {
      rel: "owners",
      type: "MANY_TO_MANY",
      role: "OWNING",
      "target-coll": "parties",
      "ref-field": "$.owners.[*].id",
    },
    {
      rel: "contacts",
      type: "MANY_TO_MANY",
      role: "OWNING",
      "target-coll": "parties",
      "ref-field": "$.contacts.[*]"
    },
    {
      rel: "notes",
      type: "ONE_TO_MANY",
      role: "OWNING",
      "target-coll": "notes",
      "ref-field": "$.notes.[*]",
    },
  ]);

  // Leases
  rem.createCollection("leases");

  rem.runCommand({
     collMod:"leases",
     validator:{ $and: [
       {
         $or: [
           { "options.leaseType": { $exists: false } },
           { "options.leaseType": { $eq: "option" } },
         ]
       }
     ]},
     validationLevel:"strict"
  });

  rem.leases.dropIndex("text-search");
  rem.leases.createIndex({ "$**": "text" }, {name: "text-search"});
  setRelations("leases", [
    {
      rel: "properties",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "properties",
      "ref-field": "$.leases.[*]",
    },
    {
      rel: "lessees",
      type: "MANY_TO_MANY",
      role: "OWNING",
      "target-coll": "parties",
      "ref-field": "$.lessees.[*]"
    }
  ]);

  // Parties
  rem.createCollection("parties");

  rem.runCommand({
     collMod:"parties",
     validator:{ $or: [
       { "type": { $in: ["person", "company"] } }
     ]},
     validationLevel:"strict"
  });

  rem.parties.dropIndex("text-search");
  rem.parties.createIndex({ "$**": "text" }, {name: "text-search"});
  setRelations("parties", [
    {
      rel: "properties-contacts",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "properties",
      "ref-field": "$.contacts.[*]",
    },
    {
      rel: "properties-owned",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "properties",
      "ref-field": "$.owners.[*].id",
    },
    {
      rel: "leases-held",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "leases",
      "ref-field": "$.lessees.[*]"
    },
    {
      rel: "parent-parties",
      type: "MANY_TO_ONE",
      role: "INVERSE",
      "target-coll": "parties",
      "ref-field": "$.subParties.[*]",
    },
  ]);

  // Notes
  rem.createCollection("notes");
  rem.runCommand({
     collMod:"notes",
     validator:{},
     validationLevel:"strict"
  });

  rem.notes.dropIndex("text-search");
  rem.notes.createIndex({ "$**": "text" }, {name: "text-search"});
  setRelations("notes", [
    {
      rel: "properties",
      type: "MANY_TO_ONE",
      role: "INVERSE",
      "target-coll": "properties",
      "ref-field": "$.notes.[*]",
    },
    {
      rel: "leases",
      type: "MANY_TO_ONE",
      role: "INVERSE",
      "target-coll": "leases",
      "ref-field": "$.notes.[*]"
    },
    {
      rel: "parties",
      type: "MANY_TO_ONE",
      role: "INVERSE",
      "target-coll": "parties",
      "ref-field": "$.notes.[*]"
    }
  ]);

  // Media (docs, images, etc.)
  rem.createCollection("media.files");

  rem.runCommand({
     collMod:"media.files",
     validator:{},
     validationLevel:"strict"
  });

  rem.media.files.dropIndex("text-search");
  rem.media.files.createIndex({ "$**": "text" }, {name: "text-search"});
  rem.media.files.dropIndex("name-date");
  rem.media.files.createIndex({ filename: 1, uploadDate: 1 }, {name: "name-date"});
  setRelations("media.files", [
    {
      rel: "properties",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "properties",
      "ref-field": "$.media.[*]",
    },
    {
      rel: "leases",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "leases",
      "ref-field": "$.media.[*]"
    }
  ]);

}

main();
