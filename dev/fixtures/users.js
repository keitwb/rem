load("util.js");

upsert("users", [
  {
    _id: ID(1),
    createdDate: new Date("2016-02-01"),
    createdBy:   null,
    username:    "john",
    email:       "john@example.com",
    firstName:   "John",
    lastName:    "Smith",
  },
  {
    _id: ID(2),
    createdDate: new Date("2016-02-05"),
    username:    "bill",
    email:       "bill@example.com",
    firstName:   "Bill",
    lastName:    "Johnson",
  }
]);

