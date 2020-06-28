import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { modelFromSearchHit, SearchClient } from "@/backend/search";
import { CollectionName, Property } from "@/model/models.gen";
import { withErr } from "@/util/errors";

import SearchContext from "./context/SearchContext";
import FilterBar, { Filters } from "./filters/FilterBar";
import Map from "./map/Map";
import { PropertyRowById } from "./PropertyRow";

export const PropertyOverview: React.SFC<{}> = () => {
  const searchClient = useContext(SearchContext);
  const [error, setError] = useState();
  const [filters, setFilters] = useState([]);
  const [, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>();
  useEffect(() => {
    doQuery([], searchClient)
      .then(([props, err]) => {
        setError(err);
        setProperties(props);
      })
      .catch(err => {
        setError(err);
      });
  }, []);

  async function updateFilter(newFilters: Filters) {
    setIsLoading(true);
    setError(null);
    setFilters(filters);

    const [props, err] = await doQuery(newFilters, searchClient);

    setIsLoading(false);
    setProperties(props);
    setError(err);
  }

  return (
    <div>
      <Map properties={properties} />
      <div className="row justify-content-between">
        <div className="col">
          <FilterBar filters={filters} suggestor={s => suggestFilter(s, searchClient)} onUpdate={updateFilter} />
        </div>
        <div className="col">
          <Link to="/property/new">Create</Link>
        </div>
      </div>
      {error ? (
        <div>Error loading property list: {error.toString()}</div>
      ) : !properties ? (
        <div>Loading...</div>
      ) : properties.length === 0 ? (
        <div>No properties</div>
      ) : (
        properties.map(p => <PropertyRowById key={p._id.toString()} id={p._id} />)
      )}
    </div>
  );
};
export default PropertyOverview;

async function doQuery(filters: Filters, searchClient: SearchClient): Promise<[Property[], Error]> {
  // Get rid of blank filters
  const realFilters = filters.filter(f => !!f[0]);

  let query: object;
  if (realFilters.length > 0) {
    query = {
      match: realFilters.reduce((obj, f) => {
        obj[f[0]] = f[1];
        return obj;
      }, {}),
    };
  } else {
    query = { match_all: {} };
  }

  const sort = ["county", "state", "name.keyword"];

  const [results, err] = await withErr(searchClient.query<Property>({ query, sort }, CollectionName.Properties));
  if (err) {
    return [null, err];
  }
  return [results.hits.hits.map(h => modelFromSearchHit(h)), err];
}

async function suggestFilter(s: string, searchClient: SearchClient): Promise<string[]> {
  return (await searchClient.getFields(CollectionName.Properties)).fields.filter(f =>
    f.toLowerCase().startsWith(s.toLowerCase())
  );
}
