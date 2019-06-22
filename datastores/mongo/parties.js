// Parties
db.createCollection("parties");

db.runCommand({
   collMod:"parties",
   validator:{ $or: [
     { "type": { $in: ["person", "company"] } }
   ]},
   validationLevel:"strict"
});
