import * as React from "react";

import { Suggestor } from "@/components/forms/SuggestedInput";
import EditableFilterItem from "./EditableFilterItem";

export type Filters = Array<[string, string]>;

interface Props {
  onUpdate: (filters: Filters) => void;
  filters: Filters;
  suggestor: Suggestor;
}

interface State {
  editingIndex: number;
}

export default class FilterBar extends React.Component<Props, State> {
  public readonly state: State = {
    editingIndex: null,
  };

  public render() {
    return (
      <div>
        {this.props.filters.map(([k, v], i) => (
          <EditableFilterItem
            suggestor={this.props.suggestor}
            onClick={() => this.setState({ editingIndex: i })}
            onChange={(newK, newV) => this.updateFilter(i, newK, newV)}
            onDelete={() => this.updateFilter(i, null, null)}
            isEditing={this.state.editingIndex === i}
            placeholder="Add filter"
            key={`${k}:${v}`}
            name={k}
            val={v}
          />
        ))}
        <div>
          <div onClick={() => this.addNewFilter()} className="btn btn-outline-primary btn-sm">
            Add Filter
          </div>
        </div>
      </div>
    );
  }

  private updateFilter(i: number, key: string, val: string) {
    let newFilters: Array<[string, string]>;
    if (!key && !val) {
      newFilters = [...this.props.filters.slice(0, i), ...this.props.filters.slice(i + 1)];
    } else {
      newFilters = [...this.props.filters.slice(0, i), [key, val], ...this.props.filters.slice(i + 1)];
    }

    this.props.onUpdate(newFilters);

    this.setState({
      editingIndex: null,
    });
  }

  private addNewFilter() {
    const newFilter: [string, string] = ["", null];

    this.props.onUpdate([...this.props.filters, newFilter]);
    this.setState({
      editingIndex: this.props.filters.length,
    });
  }
}
