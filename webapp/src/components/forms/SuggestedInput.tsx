import * as React from "react";

import SuggestionList from "./SuggestionList";

export type Suggestor = (input: string) => Promise<string[]>;

interface Props {
  suggestor: Suggestor;
  onEnterPressed: () => void;
  onEscapePressed: () => void;
  onChange: (val: string) => void;
  value: string;
  className?: string;
}

interface State {
  suggestions: string[];
}

/**
 * This is a "controlled component" that provides a text input that shows suggestions as the user is
 * typing.
 */
export default class SuggestedInput extends React.Component<Props, State> {
  public readonly state: State = {
    suggestions: [],
  };

  public render() {
    return (
      <React.Fragment>
        <input
          autoFocus
          className={this.props.className}
          type="text"
          onChange={e => this.processChange(e.target.value)}
          value={this.props.value}
        />
        <SuggestionList
          onEnterPressed={this.props.onEnterPressed}
          onEscapePressed={this.props.onEscapePressed}
          suggestions={this.state.suggestions}
          onSelect={val => this.updateValue(val)}
        />
      </React.Fragment>
    );
  }

  private updateValue(val: string) {
    this.props.onChange(val);
    this.setState({
      suggestions: [],
    });
  }

  private async processChange(val: string) {
    this.props.onChange(val);
    this.setState({
      suggestions: await this.props.suggestor(val),
    });
  }
}
