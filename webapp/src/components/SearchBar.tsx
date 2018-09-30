import * as React from "react";
import { Link } from "react-router-dom";

import { SearchClient, SearchHit, SearchResults } from "@/backend/search";

interface Props {
  searchClient: SearchClient;
}

interface State {
  results: SearchResults;
  err: Error;
}

export default class SearchBar extends React.Component<Props, State> {
  public readonly state: State = {
    err: null,
    results: null,
  };

  public render() {
    return (
      <div>
        <form>
          <input type="text" className="form-control" onChange={e => this.doSearch(e.target.value)} />
        </form>
        {this.state.results ? (
          <ul className="list-group">
            {this.state.results.hits.hits.map(r => (
              <li key={r._id}>{this.itemForResult(r)}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  private itemForResult(r: SearchHit) {
    return <Link to={`/property/${r._id}`}>{r._source.name}</Link>;
  }

  private async doSearch(query: string) {
    const [results, err] = await this.props.searchClient.query(query);
    if (err) {
      this.setState({
        err,
      });
    } else {
      this.setState({
        results,
      });
    }
  }
}
