import * as React from "react";
import { Link } from "react-router-dom";

import { modelFromSearchHit, SearchClient } from "@/backend/search";
import { Property } from "@/model/models.gen";
import { withErr } from "@/util/errors";

import SearchContext from "./context/SearchContext";

interface Props {
  tag: string;
  properties?: Property[];
}

export const TagDetail: React.SFC<Props> = ({ tag, properties }) => {
  return (
    <React.Fragment>
      <TagLabel tag={tag} />
      <div>
        {properties && properties.length > 0 ? (
          properties.map(prop => (
            <div key={prop._id.toString()}>
              <Link to={`/property/${prop._id.toString()}`}>{prop.name}</Link>
            </div>
          ))
        ) : (
          <div>No items linked to tag</div>
        )}
      </div>
    </React.Fragment>
  );
};

interface State {
  properties?: Property[];
  err: Error;
  loading: boolean;
}

export default class TagDetailWithSearch extends React.Component<Props, State> {
  public static contextType = SearchContext;
  public context: SearchClient;

  public readonly state: State = {
    err: null,
    loading: true,
    properties: null,
  };

  public async componentDidMount() {
    this.setState({ loading: true });
    const [results, err] = await withErr(
      this.context.query<Property>({
        query: { term: { "tags.keyword": this.props.tag } },
      })
    );
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

  public render() {
    return <TagDetail tag={this.props.tag} properties={this.state.properties} />;
  }
}

export const TagLabel = ({ tag }: { tag: string }) => (
  <span className="badge badge-primary" key={tag}>
    {tag}
  </span>
);
