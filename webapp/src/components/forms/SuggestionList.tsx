import * as React from "react";

import classNames from "classnames";

import { addDocEvent, UnregisterEventFunc } from "@/util/events";

interface Props {
  suggestions: string[];
  onSelect: (s: string) => void;
  onEnterPressed?: () => void;
  onEscapePressed?: () => void;
}

interface State {
  highlightedIndex: number;
}

/**
 * This is a "controlled component" that provides a text input that shows suggestions as the user is
 * typing.
 */
export default class SuggestionList extends React.Component<Props, State> {
  public readonly state: State = {
    highlightedIndex: -1,
  };

  private unregisterKeydown: UnregisterEventFunc;

  public componentDidMount() {
    this.unregisterKeydown = addDocEvent("keydown", e => this.processKey(e.key));
  }

  public componentWillUnmount() {
    this.unregisterKeydown();
  }

  public render() {
    return (
      <div className="position-absolute shadow-sm">
        {this.props.suggestions.map((s, i) => (
          <div
            key={s}
            className={classNames("px-1", {
              "bg-primary-light": i === this.state.highlightedIndex,
            })}
            onMouseEnter={() => this.setState({ highlightedIndex: i })}
            onClick={() => this.props.onSelect(s)}
          >
            {s}
          </div>
        ))}
      </div>
    );
  }

  private processKey(k: string) {
    if (k === "ArrowDown") {
      this.setState({
        highlightedIndex: Math.min(this.props.suggestions.length - 1, this.state.highlightedIndex + 1),
      });
    } else if (k === "ArrowUp") {
      this.setState({
        highlightedIndex: Math.max(-1, this.state.highlightedIndex - 1),
      });
    } else if (k === "Escape") {
      this.setState({
        highlightedIndex: -1,
      });
      if (this.props.onEscapePressed) {
        this.props.onEscapePressed();
      }
    } else if (k === "Enter") {
      if (this.state.highlightedIndex >= 0) {
        this.props.onSelect(this.props.suggestions[this.state.highlightedIndex]);
        this.setState({
          highlightedIndex: -1,
        });
      } else if (this.props.onEnterPressed) {
        this.props.onEnterPressed();
      }
    }
  }
}
