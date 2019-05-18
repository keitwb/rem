// Media (docs, images, etc.)
db.createCollection("media.files");

db.runCommand({
   collMod:"media.files",
   validator:{},
   validationLevel:"strict"
});

db.media.files.dropIndex("name-date");
db.media.files.createIndex({ filename: 1, uploadDate: 1 }, {name: "name-date"});
db.media.files.dropIndex("checksum-and-length");
db.media.files.createIndex({ md5: 1, length: 1 }, {name: "checksum-and-length"});
