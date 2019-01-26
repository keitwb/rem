load("util.js");

var fileMetadata = [
  {
    filename: "doc1.pdf",
    metadata: {
      description: "2016 Tax Bill",
      tags: ['taxes', 'bills'],
    },
  },
  {
    filename: "farm.jpg",
    metadata: {
      description: "Pic of farm",
      tags: ['overview'],
    },
  },
];

// The file content itself is loaded by the mongofiles utility in the main fixture script.  That
// script handles putting the content in the GridFS schema.
fileMetadata.forEach(function(o) {
  var fileDoc = fileByFileName(o.filename);
  Object.assign(fileDoc, o);

  print("Updating file metadata to " + JSON.stringify(fileDoc) + " for " + o.filename);
  if (rem.media.files.updateOne({ _id: fileDoc._id }, {$set: fileDoc}).modifiedCount != 1) {
    throw 'File not found: ' + o.filename;
  }
});
