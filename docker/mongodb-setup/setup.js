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
       { "current.propType": { $in: ["land", "commercial", "residential"] } }
     ]},
     validationLevel:"strict"
  });

  rem.properties.dropIndex("text-search");
  rem.properties.createIndex({
    name: "text",
    description: "text",
    county: "text",
    state: "text",
  }, {
    name: "text-search",
    weights: {
      name: 100,
      description: 50,
      county: 10,
      state: 10,
    }
  });

  setRelations("properties", [
    {
      rel: "leases",
      type: "MANY_TO_MANY",
      role: "OWNING",
      "target-coll": "leases",
      "ref-field": "$.current.leases",
    },
    {
      rel: "contacts",
      type: "MANY_TO_MANY",
      role: "OWNING",
      "target-coll": "contacts",
      "ref-field": "$.current.contacts"
    },
    {
      rel: "notes",
      type: "ONE_TO_MANY",
      role: "OWNING",
      "target-coll": "notes",
      "ref-field": "$.current.notes",
    },
  ]);

  // Leases
  rem.createCollection("leases");

  rem.runCommand({
     collMod:"leases",
     validator:{ $and: [
       {
         $or: [
           { "options.current.leaseType": { $exists: false } },
           { "options.current.leaseType": { $eq: "option" } },
         ]
       }
     ]},
     validationLevel:"strict"
  });

  rem.leases.dropIndex("text-search");
  rem.leases.createIndex({ description: "text" }, {name: "text-search"});
  setRelations("leases", [
    {
      rel: "properties",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "properties",
      "ref-field": "$.current.leases",
    },
    {
      rel: "lessees",
      type: "MANY_TO_MANY",
      role: "OWNING",
      "target-coll": "contacts",
      "ref-field": "$.current.lessees"
    }
  ]);

  // Parties
  rem.createCollection("parties");

  rem.runCommand({
     collMod:"parties",
     validator:{},
     validationLevel:"strict"
  });

  rem.contacts.dropIndex("text-search");
  rem.contacts.createIndex({ name: "text" }, {name: "text-search"});
  setRelations("parties", [
    {
      rel: "properties",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "properties",
      "ref-field": "$.current.contacts",
    },
    {
      rel: "leases",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "leases",
      "ref-field": "$.current.lessees"
    },
    {
      rel: "subParties",
      type: "MANY_TO_ONE",
      role: "OWNING",
      "target-coll": "parties",
      "ref-field": "$.current.subParties",
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
  rem.notes.createIndex({ name: "text", note: "text" }, {name: "text-search"});
  setRelations("notes", [
    //{
      //rel: "properties",
      //type: "MANY_TO_ONE",
      //role: "INVERSE",
      //"target-coll": "properties",
      //"ref-field": "$.current.notes",
    //},
    {
      rel: "leases",
      type: "MANY_TO_ONE",
      role: "INVERSE",
      "target-coll": "leases",
      "ref-field": "$.notes"
    },
    {
      rel: "contacts",
      type: "MANY_TO_ONE",
      role: "INVERSE",
      "target-coll": "contacts",
      "ref-field": "$.notes"
    }
  ]);

  // Media (docs, images, etc.)
  rem.createCollection("media.files");

  rem.runCommand({
     collMod:"media.files",
     validator:{},
     validationLevel:"strict"
  });

  rem.media.files.dropIndex("name-date");
  rem.media.files.createIndex({ filename: 1, uploadDate: 1 }, {name: "name-date"});
  setRelations("media.files", [
    {
      rel: "properties",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "properties",
      "ref-field": "$.media",
    },
    {
      rel: "leases",
      type: "MANY_TO_MANY",
      role: "INVERSE",
      "target-coll": "leases",
      "ref-field": "$.media"
    }
  ]);

}

main();
