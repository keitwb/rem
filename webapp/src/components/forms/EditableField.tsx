// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html is very useful
// reading for these form components.

import * as React from "react";

type InputValidator<T> = (value: T) => Error;

interface Props<T> {
  value: T;
  onUpdate: (value: T) => void;
  renderVal?: (value: T) => React.ReactNode;
  renderInput?: (ref: React.RefObject<HTMLInputElement>, value: T, done: () => void) => React.ReactNode;
  inputWidth?: number;
  placeholder?: string;
  validator?: InputValidator<T>;
}

interface State {
  showEditButton: boolean;
  editing: boolean;
  error: string;
}

export default abstract class EditableField<T> extends React.Component<Props<T>, State> {
  public static defaultProps: Partial<Props<any>> = {
    inputWidth: 300,
    renderInput(ref: React.RefObject<HTMLInputElement>, value: any, done: () => void): React.ReactNode {
      return <input autoFocus ref={ref} type="text" defaultValue={value} onBlur={done} />;
    },
  };

  protected inputRef: React.RefObject<HTMLInputElement>;

  constructor(props: any) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      editing: false,
      error: null,
      showEditButton: false,
    };
  }

  public render() {
    return (
      <div
        className="d-flex d-flex-row position-relative"
        onMouseEnter={() => this.setState({ showEditButton: true })}
        onMouseLeave={() => this.setState({ showEditButton: false })}
      >
        {this.state.editing ? (
          <div
            className={"d-flex flex-row position-absolute" + (this.state.error && " border-danger")}
            style={{ width: this.props.inputWidth }}
            onKeyUp={e => {
              if (e.key === "Escape") {
                this.toggleEditing();
              }
              if (e.key === "Enter") {
                this.doSave();
              }
            }}
          >
            {this.props.renderInput(this.inputRef, this.props.value, () => this.toggleEditing())}
            {this.state.error ? <div className="text-danger bg-light p-1">{this.state.error}</div> : undefined}
            <button type="button" className="btn btn-link btn-sm px-0 mx-0" onClick={() => this.doSave()}>
              Save
            </button>
          </div>
        ) : (
          <div className="d-flex flex-row align-items-center position-relative">
            {this.props.children}
            {this.state.showEditButton && (
              <div className="position-absolute border w-100 h-100" style={{ zIndex: -1 }} />
            )}
            {(this.state.showEditButton || (!this.props.value && !this.props.placeholder)) && (
              <button
                className="btn btn-link btn-sm px-0 py-0 my-0 position-absolute"
                style={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  right: 0,
                  transform: this.props.value || this.props.placeholder ? "translateX(100%)" : "",
                }}
                onClick={() => this.toggleEditing()}
              >
                Edit
              </button>
            )}
            {!this.props.value && this.props.placeholder && (
              <div className="font-italic text-muted">{this.props.placeholder}</div>
            )}
          </div>
        )}
      </div>
    );
  }

  protected validate(newVal: T): boolean {
    if (this.props.validator) {
      const error = this.props.validator(newVal);
      if (error) {
        this.setState({
          error: error.toString(),
        });
        return;
      }
    }
  }

  protected abstract convertValue(newVal: string): T;

  protected doSave(): void {
    const converted = this.convertValue(this.inputRef.current.value);
    this.props.onUpdate(converted);
    this.toggleEditing();
  }

  protected toggleEditing() {
    this.setState({
      editing: !this.state.editing,
      error: null,
    });
  }
}
