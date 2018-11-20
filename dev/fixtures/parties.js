load("util.js");

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
  }
]);

