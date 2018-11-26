import * as React from "react";

import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  name: string;
  val: string;
  onClick: () => void;
  onDelete: () => void;
}
const FilterItem: React.SFC<Props> = ({ name, val, onClick, onDelete }) => (
  <div className="badge badge-primary" onClick={onClick}>
    {name}
    {val ? `: ${val}` : null}
    <span onClick={() => onDelete()} className="px-1 visible-on-parent-hover">
      <FontAwesomeIcon icon={faTrashAlt} />
    </span>
  </div>
);

export default FilterItem;
