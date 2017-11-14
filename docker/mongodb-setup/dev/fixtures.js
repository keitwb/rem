rem = connect('mongodb:27017/rem');

function upsert(collName, docs) {
  var coll = rem.getCollection(collName);

  print("Loading " + collName);
  docs.forEach(function(d) {
    coll.updateOne({ _id: d._id }, { $set: d }, { upsert: true });
    coll.updateOne({ _id: d._id }, { $set: {"_etag": new ObjectId() }});
  });
}

var ids = {};
function ID(id) {
  if (!ids[id]) {
    ids[id] = new ObjectId();
  }

  return ids[id];
}

upsert("properties", [
  {
    _id: ID(1),
    createdDate: new Date("2017-02-01"),
    createdBy:    ID(1),
    name:         "Swamp Tract",
    description:  "Tract in the swamp land behind the old highway",
    acreage:      120.5,
    county:       "Pender",
    state:        "NC",
    propType:     "land",
    owners:       [{id: ID(1), portion: 50}, {id: ID(2), portion: 50}],
    pinNumbers:   ["123-45-678"],
    notes:        [ID(1), ID(2)],
    leases:       [ID(1), ID(2)],
    contacts:     [ID(1)],
    _updates: [
      {
        type: "push",
        fieldName: "notes",
        value: 2,
        userId: ID(1),
        timestamp: new Date("2017-05-01"),
      },
    ]
  },
  {
    _id: ID(2),
    createdDate:  new Date("2017-01-01"),
    createdBy:    ID(2),
    name:         "Robeson Office Building",
    description:  "Old office building on Main St.",
    acreage:      0.5,
    county:       "Cumberland",
    state:        "NC",
    propType:     "commercial",
    pinNumbers:   ["123-45-678"],
    leases:       [ID(3)],
    _updates: [
      {
        type: "set",
        fieldName: "acreage",
        value: 0.5,
        userId: ID(1),
        timestamp: new Date("2017-06-01"),
      },
    ]
  },
]);

upsert("leases", [
  {
    _id: ID(1),
    createdDate:  new Date("2016-02-01"),
    createdBy:    ID(1),
    description:  "First lease",
    startDate:    new Date("2016-01-01"),
    termLength:   12,
    termUnit:     "months",
    rate:         100,
    lessees:      [ID(1)],
    media:        [ID(1)],
    notes:        [],
    createdBy:   "1",
    _updates: [],
  },
  {
    _id: ID(2),
    createdDate: new Date("2017-01-01"),
    createdBy:   ID(1),
    description: "Second lease",
    startDate:   new Date("2017-01-01"),
    termLength:  3,
    termUnit:    "years",
    rate:        100,
    _updates: [ ],
  }
]);

upsert("notes", [
  {
    _id: ID(1),
    createdDate: new Date("2017-03-01"),
    createdBy:   ID(1),
    note:        "Needs work -- lawn needs mowing.",
    _updates: [
      {
        type: "set",
        fieldName: "note",
        value: "Needs work.",
        userId: ID(2),
        timestamp: new Date("2017-03-01"),
      },
    ]
  },
  {
    _id: ID(2),
    createdDate: new Date("2017-04-01"),
    createdBy:   ID(1),
    note:        "Work Completed.",
    _updates: []
  }
]);

upsert("parties", [
  {
    _id: ID(1),
    createdDate: new Date("2017-01-01"),
    createdBy:   ID(1),
    name:        "Billy Bob",
    type:        "person",
    phone:       "555-555-5555",
    address:     "123 Main St.",
    city:        "Springfield",
    state:       "MI",
    zipcode:     "12345",
    _updates: [ ]
  },
  {
    _id: ID(2),
    createdDate: new Date("2017-01-01"),
    createdBy:   ID(1),
    name:        "Modern Real Estate",
    type:        "company",
    phone:       "777-777-7777",
    subParties:  [ID(1)],
    address:     "123 Land St.",
    city:        "Springfield",
    state:       "MI",
    zipcode:     "12345",
    _updates: [ ]
  }
]);

// Users
upsert("user", [
  {
    _id: ID(1),
    createdDate: new Date("2016-02-01"),
    createdBy:   null,
    username:    "john",
    email:       "john@example.com",
    firstName:   "John",
    lastName:    "Smith",
    _updates: [ ]
  },
  {
    _id: ID(2),
    createdDate: new Date("2016-02-05"),
    username:    "bill",
    email:       "bill@example.com",
    firstName:   "Bill",
    lastName:    "Johnson",
    _updates: [ ]
  }
]);

var fileMetadata = [
  { filename: "doc1.pdf", meta: { description: "2016 Tax Bill" } }
];

fileMetadata.forEach(function(o) {
  var fileDoc = rem.media.files.findOne({filename: o.filename});
  fileDoc.metadata = Object.assign({}, fileDoc.metadata, o.metadata);

  print("Updating file metadata for " + o.filename);
  if (rem.media.files.updateOne({ _id: fileDoc._id }, {$set: fileDoc}).modifiedCount != 1) {
    throw 'File not found: ' + o.filename;
  }
});
