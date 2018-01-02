Parcel Data Service
-------------------

This is a gRPC service that returns basic parcel information from county GIS
shapefiles.

Each county has their own schema for parcel information, so adapters must be
written for each and put in the `adapters` dir.

The shapefiles themselves will be read from disk in the dir path specified by the
envvar `SHAPEFILE_BASE`.  That dir should have a folder structure of
`<state>/counties/<county name>/<shapefile name>.*` where `<state>` is the upper-case two
letter state abbreviation, `<county name>` is the title cased county name, and
`<shapefile name>` is the basename all of the relevant shapefile files (e.g.
`.shp`, `.dbf`, `.prj`, `.shx`).  The path to the parcel `.shp` file is defined in the
adapter class's `parcel_shapefile` attribute.

This can also be executed directly (not through gRPC) in scripts as well.
