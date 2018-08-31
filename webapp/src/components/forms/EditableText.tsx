// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html is very useful
// reading for these form components.

import isFinite from "lodash-es/isFinite";
import isInteger from "lodash-es/isInteger";
import toNumber from "lodash-es/toNumber";
import * as React from "react";

type InputValidator = (value: string) => Error;
type ValueType = "string" | "float" | "integer";

interface Props {
  value: any;
  onUpdate: (value: any) => void;
  renderVal?: (value: any) => React.ReactNode;
  renderInput?: (ref: React.RefObject<HTMLInputElement>, value: any) => React.ReactNode;
  inputWidth?: number;
  placeholder?: string;
  validator?: InputValidator;
  valueType?: ValueType;
}

interface State {
  showEditButton: boolean;
  editing: boolean;
  error: string;
}

export default class EditableText extends React.Component<Props, State> {
  public static defaultProps: Partial<Props> = {
    inputWidth: 300,
    renderInput(ref: React.RefObject<HTMLInputElement>, value: any): React.ReactNode {
      return <input ref={ref} type="text" defaultValue={value} />;
    },
    valueType: "string",
  };

  private inputRef: React.RefObject<HTMLInputElement>;

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
            style={{ zIndex: 9999, width: this.props.inputWidth }}
            onKeyUp={e => {
              if (e.key === "Escape") {
                this.toggleEditing();
              }
              if (e.key === "Enter") {
                this.doSave();
              }
            }}
          >
            {this.props.renderInput(this.inputRef, this.props.value)}
            {this.state.error ? <div className="text-danger bg-light p-1">{this.state.error}</div> : undefined}
            <button type="button" className="btn btn-link btn-sm px-0 mx-0" onClick={() => this.doSave()}>
              Save
            </button>
          </div>
        ) : (
          <div className="d-flex flex-row align-items-center position-relative">
            {this.props.children}
            {this.state.showEditButton && <div className="position-absolute border w-100 h-100" />}
            {(this.state.showEditButton || (!this.props.value && !this.props.placeholder)) && (
              <button
                className="btn btn-link btn-sm px-0 py-0 my-0 position-absolute"
                style={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  right: 0,
                  transform: this.props.value || this.props.placeholder ? "translateX(100%)" : "",
                  zIndex: 9999,
                }}
                onClick={() => this.toggleEditing()}
              >
                Edit
              </button>
            )}
            {!this.props.value &&
              this.props.placeholder && <div className="font-italic text-muted">{this.props.placeholder}</div>}
          </div>
        )}
      </div>
    );
  }

  private toggleEditing() {
    this.setState({
      editing: !this.state.editing,
      error: null,
    });

    if (this.state.editing && this.inputRef.current) {
      this.inputRef.current.value = this.props.value;
      this.inputRef.current.focus();
    }
  }

  private doSave() {
    const newVal = this.inputRef.current.value;

    if (this.props.validator) {
      const error = this.props.validator(newVal);
      if (error) {
        this.setState({
          error: error.toString(),
        });
        return;
      }
    }

    let val: string | number;
    if (!newVal) {
      val = null;
    } else if (this.props.valueType === "float" || this.props.valueType === "integer") {
      const num = toNumber(newVal);
      if (this.props.valueType === "integer" && !isInteger(num)) {
        this.setState({
          error: "Input must be a round number",
        });
        return;
      } else if (this.props.valueType === "float" && !isFinite(num)) {
        this.setState({
          error: "Input must be a number",
        });
        return;
      }
      val = num;
    } else {
      val = newVal;
    }

    this.props.onUpdate(val);
    this.toggleEditing();
  }
}
