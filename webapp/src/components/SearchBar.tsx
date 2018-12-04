import * as debounce from "debounce";
import * as React from "react";
import OutsideClickHandler from "react-outside-click-handler";

import { SearchClient, SearchResults } from "@/backend/search";
import { withErr } from "@/util/errors";
import { addDocEvent, UnregisterEventFunc } from "@/util/events";

import SearchResultList from "./SearchResultList";

interface Props {
  searchClient: SearchClient;
}

interface State {
  results: SearchResults<any>;
  err: Error;
  searching: boolean;
  showResults: boolean;
}

export default class SearchBar extends React.Component<Props, State> {
  public readonly state: State = {
    err: null,
    results: null,
    searching: false,
    showResults: true,
  };

  private unregisterKeydown: UnregisterEventFunc;

  public componentDidMount() {
    this.unregisterKeydown = addDocEvent("keydown", e => this.processKey(e.key));
  }

  public componentWillUnmount() {
    this.unregisterKeydown();
  }

  public render() {
    const doSearchDebounced = debounce((q: string) => this.doSearch(q), 100);

    return (
      <OutsideClickHandler onOutsideClick={() => this.hideResults()}>
        <div className="w-50 position-relative">
          <form className="w-100">
            <input
              type="text"
              className="w-100 p-2 border border-secondary"
              placeholder="Search"
              onChange={e => doSearchDebounced(e.target.value)}
            />
          </form>
          {this.state.showResults ? (
            <div className="bg-light position-absolute w-100 on-top">
              <div className="shadow-sm">
                {this.state.results ? (
                  <SearchResultList onSelect={() => this.hideResults()} results={this.state.results} />
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </OutsideClickHandler>
    );
  }

  private processKey(k: string) {
    if (k === "Escape") {
      this.setState({
        showResults: false,
      });
    }
  }

  private hideResults() {
    this.setState({
      showResults: false,
    });
  }

  private async doSearch(query: string) {
    this.setState({ searching: true });
    const [results, err] = await withErr(this.props.searchClient.queryByString(query));
    this.setState({ searching: false, showResults: true });
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
