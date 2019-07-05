package gocommon

// THIS FILE IS GENERATED FROM models/generate.sh
// DO NOT EDIT THIS FILE!

import "time"
import "go.mongodb.org/mongo-driver/bson/primitive"

type Common interface{}

// An insurance policy that applies to one or more properties
type InsurancePolicy struct {
	Error          *string              `bson:"_error,omitempty"` // A placeholder where errors concerning the object can go
	ID             primitive.ObjectID   `bson:"_id"`
	CreatedBy      *primitive.ObjectID  `bson:"createdBy,omitempty"`      // The id of the user that created this object
	CreatedDate    time.Time            `bson:"createdDate,omitempty"`    // The date the object was first created
	LastModifiedBy *primitive.ObjectID  `bson:"lastModifiedBy,omitempty"` // The id of the user that last modified this object
	ModifiedDate   time.Time            `bson:"modifiedDate,omitempty"`   // The date of the last update to the object
	Description    *string              `bson:"description,omitempty"`
	EndDate        time.Time            `bson:"endDate,omitempty"`
	MediaIDS       []primitive.ObjectID `bson:"mediaIds"`
	StartDate      time.Time            `bson:"startDate,omitempty"`
}

// A JSON-encoded BSON ObjectId
//
// The id of the user that created this object
//
// The id of the user that last modified this object
type OID struct {
	OID string `bson:"$oid"`
}

// A lease for one or more properties
type Lease struct {
	Error          *string              `bson:"_error,omitempty"` // A placeholder where errors concerning the object can go
	ID             primitive.ObjectID   `bson:"_id"`
	CreatedBy      *primitive.ObjectID  `bson:"createdBy,omitempty"`      // The id of the user that created this object
	CreatedDate    time.Time            `bson:"createdDate,omitempty"`    // The date the object was first created
	LastModifiedBy *primitive.ObjectID  `bson:"lastModifiedBy,omitempty"` // The id of the user that last modified this object
	ModifiedDate   time.Time            `bson:"modifiedDate,omitempty"`   // The date of the last update to the object
	Description    *string              `bson:"description,omitempty"`
	LeaseType      *LeaseType           `bson:"leaseType,omitempty"`
	Lessees        []primitive.ObjectID `bson:"lessees"`
	Notes          []Note               `bson:"notes"`
	Rate           *float64             `bson:"rate,omitempty"`
	StartDate      time.Time            `bson:"startDate,omitempty"`
	TermLength     *float64             `bson:"termLength,omitempty"`
	TermUnit       *TermUnit            `bson:"termUnit,omitempty"`
}

// A note that gives an update on an item
type Note struct {
	Error          *string              `bson:"_error,omitempty"` // A placeholder where errors concerning the object can go
	ID             primitive.ObjectID   `bson:"_id"`
	CreatedBy      *primitive.ObjectID  `bson:"createdBy,omitempty"`      // The id of the user that created this object
	CreatedDate    time.Time            `bson:"createdDate,omitempty"`    // The date the object was first created
	LastModifiedBy *primitive.ObjectID  `bson:"lastModifiedBy,omitempty"` // The id of the user that last modified this object
	ModifiedDate   time.Time            `bson:"modifiedDate,omitempty"`   // The date of the last update to the object
	Media          []primitive.ObjectID `bson:"media"`
	Note           *string              `bson:"note,omitempty"`
	Title          *string              `bson:"title,omitempty"`
}

// A media file that is associated with a property, lease, note, etc.
type Media struct {
	Error          *string             `bson:"_error,omitempty"` // A placeholder where errors concerning the object can go
	ID             primitive.ObjectID  `bson:"_id"`
	CreatedBy      *primitive.ObjectID `bson:"createdBy,omitempty"`      // The id of the user that created this object
	CreatedDate    time.Time           `bson:"createdDate,omitempty"`    // The date the object was first created
	LastModifiedBy *primitive.ObjectID `bson:"lastModifiedBy,omitempty"` // The id of the user that last modified this object
	ModifiedDate   time.Time           `bson:"modifiedDate,omitempty"`   // The date of the last update to the object
	ChunkSize      *float64            `bson:"chunkSize,omitempty"`
	ContentType    *string             `bson:"contentType,omitempty"`
	Filename       *string             `bson:"filename,omitempty"`
	Length         *float64            `bson:"length,omitempty"`
	Md5            *string             `bson:"md5,omitempty"`
	UploadDate     time.Time           `bson:"uploadDate,omitempty"`
	Metadata       *Metadata           `bson:"metadata,omitempty"`
}

type Metadata struct {
	Description *string  `bson:"description,omitempty"`
	Tags        []string `bson:"tags"`
}

type MongoDoc struct {
	Error          *string             `bson:"_error,omitempty"` // A placeholder where errors concerning the object can go
	ID             primitive.ObjectID  `bson:"_id"`
	CreatedBy      *primitive.ObjectID `bson:"createdBy,omitempty"`      // The id of the user that created this object
	CreatedDate    time.Time           `bson:"createdDate,omitempty"`    // The date the object was first created
	LastModifiedBy *primitive.ObjectID `bson:"lastModifiedBy,omitempty"` // The id of the user that last modified this object
	ModifiedDate   time.Time           `bson:"modifiedDate,omitempty"`   // The date of the last update to the object
}

// Information about a specific parcel
type ParcelInfo struct {
	Acreage       *float64 `bson:"acreage,omitempty"`
	BoundaryWKT   *string  `bson:"boundaryWKT,omitempty"`
	OwnerName     *string  `bson:"ownerName,omitempty"`
	PinNumber     *string  `bson:"pinNumber,omitempty"`
	StreetAddress *string  `bson:"streetAddress,omitempty"`
}

// A person or organization/company that interacts with real estate in some way, e.g. owner,
// lessee, contractors, etc.
type Party struct {
	Error          *string             `bson:"_error,omitempty"` // A placeholder where errors concerning the object can go
	ID             primitive.ObjectID  `bson:"_id"`
	CreatedBy      *primitive.ObjectID `bson:"createdBy,omitempty"`      // The id of the user that created this object
	CreatedDate    time.Time           `bson:"createdDate,omitempty"`    // The date the object was first created
	LastModifiedBy *primitive.ObjectID `bson:"lastModifiedBy,omitempty"` // The id of the user that last modified this object
	ModifiedDate   time.Time           `bson:"modifiedDate,omitempty"`   // The date of the last update to the object
	Address        *string             `bson:"address,omitempty"`
	City           *string             `bson:"city,omitempty"`
	Name           *string             `bson:"name,omitempty"`
	Notes          *Note               `bson:"notes,omitempty"`
	Phone          *string             `bson:"phone,omitempty"`
	State          *string             `bson:"state,omitempty"`
	SubParties     []Party             `bson:"subParties"`
	Type           *Type               `bson:"type,omitempty"`
	Zipcode        *string             `bson:"zipcode,omitempty"`
}

// A set of one or more parcels that constitute a single logic piece of real estate
type Property struct {
	Error                    *string                       `bson:"_error,omitempty"` // A placeholder where errors concerning the object can go
	ID                       primitive.ObjectID            `bson:"_id"`
	CreatedBy                *primitive.ObjectID           `bson:"createdBy,omitempty"`      // The id of the user that created this object
	CreatedDate              time.Time                     `bson:"createdDate,omitempty"`    // The date the object was first created
	LastModifiedBy           *primitive.ObjectID           `bson:"lastModifiedBy,omitempty"` // The id of the user that last modified this object
	ModifiedDate             time.Time                     `bson:"modifiedDate,omitempty"`   // The date of the last update to the object
	Acreage                  *float64                      `bson:"acreage,omitempty"`
	Boundary                 *string                       `bson:"boundary,omitempty"` // WKT of the boundary of the property
	City                     *string                       `bson:"city,omitempty"`
	ContactIDS               []primitive.ObjectID          `bson:"contactIds"`
	County                   *string                       `bson:"county,omitempty"`
	Description              *string                       `bson:"description,omitempty"`
	DesiredRentCents         *int64                        `bson:"desiredRentCents,omitempty"`
	DesiredSalesPriceDollars *int64                        `bson:"desiredSalesPriceDollars,omitempty"`
	GISRefreshRequested      *bool                         `bson:"gisRefreshRequested,omitempty"` // If set to true, the GIS parcel information for this property should be refreshed
	InsurancePolicyIDS       []primitive.ObjectID          `bson:"insurancePolicyIds"`
	LeaseIDS                 []primitive.ObjectID          `bson:"leaseIds"`
	MediaIDS                 []primitive.ObjectID          `bson:"mediaIds"`
	Name                     *string                       `bson:"name,omitempty"`
	NoteIDS                  []primitive.ObjectID          `bson:"noteIds"`
	Owners                   []Owner                       `bson:"owners"`
	PinNumbers               []string                      `bson:"pinNumbers"`
	PropType                 *PropType                     `bson:"propType,omitempty"`
	State                    *string                       `bson:"state,omitempty"`
	Tags                     []string                      `bson:"tags"`
	TaxBills                 map[string]map[string]TaxBill `bson:"taxBills,omitempty"`
	TaxPropInfo              map[string]TaxPropInfo        `bson:"taxPropInfo,omitempty"`
	TaxRefreshRequested      *bool                         `bson:"taxRefreshRequested,omitempty"`
}

type Owner struct {
	ID      *primitive.ObjectID `bson:"id,omitempty"`
	Portion *float64            `bson:"portion,omitempty"`
}

type TaxBill struct {
	BuildingAssessedCents *int64     `bson:"buildingAssessedCents,omitempty"`
	DueDate               time.Time  `bson:"dueDate,omitempty"`
	LandAssessedCents     *int64     `bson:"landAssessedCents,omitempty"`
	LineItems             []LineItem `bson:"lineItems"`
	MiscAssessedCents     *int64     `bson:"miscAssessedCents,omitempty"`
	Payments              []Payment  `bson:"payments"`
	TotalAssessedCents    *int64     `bson:"totalAssessedCents,omitempty"`
}

type LineItem struct {
	AmountCents *int64  `bson:"amountCents,omitempty"`
	Description *string `bson:"description,omitempty"`
}

type Payment struct {
	AmountCents *int64    `bson:"amountCents,omitempty"`
	PaymentDate time.Time `bson:"paymentDate,omitempty"`
}

type TaxPropInfo struct {
	AssessmentDate         time.Time `bson:"assessmentDate,omitempty"`
	BuildingAppraisedCents *int64    `bson:"buildingAppraisedCents,omitempty"`
	LandAppraisedCents     *int64    `bson:"landAppraisedCents,omitempty"`
	LegalDescription       *string   `bson:"legalDescription,omitempty"`
	MiscAppraisedCents     *int64    `bson:"miscAppraisedCents,omitempty"`
	Neighborhood           *string   `bson:"neighborhood,omitempty"`
	OwnerAddress           *string   `bson:"ownerAddress,omitempty"`
	OwnerName              *string   `bson:"ownerName,omitempty"`
	PropertyClass          *string   `bson:"propertyClass,omitempty"`
	SitusAddress           *string   `bson:"situsAddress,omitempty"`
	TaxDistrict            *string   `bson:"taxDistrict,omitempty"`
	TotalAppraisedCents    *int64    `bson:"totalAppraisedCents,omitempty"`
	Zoning                 *string   `bson:"zoning,omitempty"`
}

// A user in the system
type User struct {
	Error          *string             `bson:"_error,omitempty"` // A placeholder where errors concerning the object can go
	ID             primitive.ObjectID  `bson:"_id"`
	CreatedBy      *primitive.ObjectID `bson:"createdBy,omitempty"`      // The id of the user that created this object
	CreatedDate    time.Time           `bson:"createdDate,omitempty"`    // The date the object was first created
	LastModifiedBy *primitive.ObjectID `bson:"lastModifiedBy,omitempty"` // The id of the user that last modified this object
	ModifiedDate   time.Time           `bson:"modifiedDate,omitempty"`   // The date of the last update to the object
	Disabled       bool                `bson:"disabled"`
	Email          *string             `bson:"email,omitempty"`
	FirstName      *string             `bson:"firstName,omitempty"`
	LastName       *string             `bson:"lastName,omitempty"`
	PasswordHashed *string             `bson:"passwordHashed,omitempty"`
	SessionIDs     []string            `bson:"sessionIds"`
	Username       string              `bson:"username"`
}

// A set of Mongo collection names for the various models
type CollectionName string

const (
	InsurancePolicies CollectionName = "insurancePolicies"
	Leases            CollectionName = "leases"
	MediaFiles        CollectionName = "media.files"
	Notes             CollectionName = "notes"
	Parties           CollectionName = "parties"
	Properties        CollectionName = "properties"
	Users             CollectionName = "users"
)

type LeaseType string

const (
	Gross  LeaseType = "gross"
	N      LeaseType = "N"
	Nn     LeaseType = "NN"
	Nnn    LeaseType = "NNN"
	Option LeaseType = "option"
)

type TermUnit string

const (
	Months   TermUnit = "months"
	Quarters TermUnit = "quarters"
	Years    TermUnit = "years"
)

type Type string

const (
	Company Type = "company"
	Person  Type = "person"
)

type PropType string

const (
	Commercial  PropType = "commercial"
	Industrial  PropType = "industrial"
	Land        PropType = "land"
	Residential PropType = "residential"
)
