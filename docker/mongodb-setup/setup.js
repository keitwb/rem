if (rs.status()["ok"] == 0) {
  rs.initiate();
}

rem = db.getSiblingDB('rem');
colls = rem.getCollectionNames();

rem.createCollection("properties");

rem.runCommand({
   collMod:"properties",
   validator:{},
   validationLevel:"strict"
});

rem.properties.createIndex({ name: "text", description: "text", county: "text", state: "text" });

rem.createCollection("_properties");
rem.getCollection("_properties").insert({"_id": "_properties.properties",
                                         rels: [ rel: "leases", type: "MANY_TO_MANY", "target-coll": "leases"
