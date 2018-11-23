import * as React from "react";

interface Props {
  onAdd: (newTag: string) => void;
}

interface State {
  editing: boolean;
}

export default class TagEditor extends React.Component<Props, State> {
  public render() {
    return <div>Add Tag</div>;
  }
}
