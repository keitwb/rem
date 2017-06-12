if (rs.status()["ok"] == 0) {
  rs.initiate();
}

rem = db.getSiblingDB('rem');
colls = rem.getCollectionNames();

rem.createCollection("properties")

rem.runCommand({
   collMod:"properties",
   validator:{},
   validationLevel:"strict"
})

rem.properties.createIndex({ name: 1 })
