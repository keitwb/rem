import * as React from "react";

import { modelFromSearchHit, SearchClient } from "@/backend/search";
import { CollectionName, Property } from "@/model/models.gen";
import { withErr } from "@/util/errors";

import SearchContext from "./context/SearchContext";
import FilterBar, { Filters } from "./filters/FilterBar";
import { Suggestor } from "./forms/SuggestedInput";
import PropertyRow from "./PropertyRow";

interface Props {
  properties: Property[];
  filters: Filters;
  filterSuggestor: Suggestor;
  onFilterChange: (filters: Filters) => void;
  error: Error;
}

export const PropertyOverview: React.SFC<Props> = ({ properties, filters, filterSuggestor, onFilterChange, error }) => (
  <div className="w-100">
    <div>
      <FilterBar filters={filters} suggestor={filterSuggestor} onUpdate={onFilterChange} />
    </div>
    {error ? (
      <div>Error loading property list: {error.toString()}</div>
    ) : !properties ? (
      <div>Loading...</div>
    ) : properties.length === 0 ? (
      <div>No properties</div>
    ) : (
      properties.map(p => <PropertyRow key={p._id.toString()} id={p._id.toString()} />)
    )}
  </div>
);

interface SearchProps {
  tag: string;
  properties?: Property[];
}

interface State {
  properties?: Property[];
  err: Error;
  loading: boolean;
  filters: Filters;
}

export default class PropertyOverviewWithSearch extends React.Component<SearchProps, State> {
  public static contextType = SearchContext;
  public context: SearchClient;

  public readonly state: State = {
    err: null,
    filters: [],
    loading: true,
    properties: null,
  };

  public async componentDidMount() {
    this.doQuery([]);
  }

  public render() {
    return (
      <PropertyOverview
        filters={this.state.filters}
        onFilterChange={filters => this.doQuery(filters)}
        filterSuggestor={s => this.suggestFilter(s)}
        error={this.state.err}
        properties={this.state.properties}
      />
    );
  }

  private async doQuery(filters: Filters) {
    this.setState({
      filters,
      loading: true,
    });

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

    const sort = ["county.keyword", "state.keyword", "name.keyword"];

    const [results, err] = await withErr(this.context.query<Property>({ query, sort }, CollectionName.Properties));
    this.setState({ loading: false });
    if (err) {
      this.setState({
        err,
      });
      return;
    }
    this.setState({
      properties: results.hits.hits.map(h => modelFromSearchHit(h)),
    });
  }

  private async suggestFilter(s: string): Promise<string[]> {
    return (await this.context.getFields(CollectionName.Properties)).fields.filter(f =>
      f.toLowerCase().startsWith(s.toLowerCase())
    );
  }
}
