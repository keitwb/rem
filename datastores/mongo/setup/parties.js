// Parties
rem.createCollection("parties");

rem.runCommand({
   collMod:"parties",
   validator:{ $or: [
     { "type": { $in: ["person", "company"] } }
   ]},
   validationLevel:"strict"
});
