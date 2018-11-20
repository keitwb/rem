import * as React from "react";

import { SearchClient, SearchResults } from "@/backend/search";
import SearchResultList from "./SearchResultList";

interface Props {
  searchClient: SearchClient;
}

interface State {
  results: SearchResults;
  err: Error;
  searching: boolean;
}

export default class SearchBar extends React.Component<Props, State> {
  public readonly state: State = {
    err: null,
    results: null,
    searching: false,
  };

  public render() {
    return (
      <div className="w-50 position-relative">
        <form className="w-100">
          <input
            type="text"
            className="w-100 p-2 border border-secondary"
            placeholder="Search"
            onChange={e => this.doSearch(e.target.value)}
          />
        </form>
        <div className="bg-light position-absolute w-100">
          <div className="shadow-sm">
            {this.state.results ? <SearchResultList results={this.state.results} /> : null}
          </div>
        </div>
      </div>
    );
  }

  private async doSearch(query: string) {
    this.setState({ searching: true });
    const [results, err] = await this.props.searchClient.query(query);
    this.setState({ searching: false });
    if (err) {
      this.setState({
        err,
      });
      return;
    }
    this.setState({
      results,
    });
  }
}
