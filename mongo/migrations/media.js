load("common.js");

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
rem.media.files.dropIndex("checksum-and-length");
rem.media.files.createIndex({ md5: 1, length: 1 }, {name: "checksum-and-length"});
setRelations("media.files", [
  {
    rel: "properties",
    type: "MANY_TO_MANY",
    role: "OWNING",
    "target-coll": "media",
    "ref-field": "$.properties[*]",
  },
  {
    rel: "leases",
    type: "MANY_TO_MANY",
    role: "OWNING",
    "target-coll": "media",
    "ref-field": "$.leases.[*]"
  }
]);
