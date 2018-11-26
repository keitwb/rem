import * as React from "react";

import { splitLimit } from "@/util/string";

import SuggestedInput, { Suggestor } from "@/components/forms/SuggestedInput";

interface Props {
  name: string;
  val: string;
  onChange: (key: string, val: string) => void;
  suggestor: Suggestor;
}

interface State {
  filterText: string;
}

export function parseFilter(f: string): [string, string] {
  const [key, val] = splitLimit(f, ":", 1).map(s => s.trim());
  return [key, val];
}

// tslint:disable:max-line-length
/**
 * This component uses the state technique described at
 * https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
 */
export default class FilterEditor extends React.Component<Props, State> {
  public readonly state: State = {
    filterText: this.deriveFilterText(),
  };

  public render() {
    return (
      <div>
        <SuggestedInput
          suggestor={this.props.suggestor}
          value={this.state.filterText}
          onEnterPressed={() => this.processText()}
          onEscapePressed={() => this.props.onChange(this.props.name, this.props.val)}
          onChange={val => this.setState({ filterText: val })}
        />
      </div>
    );
  }

  private deriveFilterText() {
    return `${this.props.name}${this.props.val ? ": " + this.props.val : ""}`;
  }

  private processText() {
    const [key, val] = parseFilter(this.state.filterText);
    this.props.onChange(key, val);
  }
}
