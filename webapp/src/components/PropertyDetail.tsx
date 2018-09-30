import * as React from "react";

import EditableText from "@/components/forms/EditableText";
import { Property } from "@/model/models";
import { ModelUpdate, set } from "@/model/updates";

import MediaList from "./MediaList";

interface Props {
  instance: Property;
  onUpdate: (updates: ModelUpdate<Property> | Array<ModelUpdate<Property>>) => void;
}

const PropertyDetail: React.SFC<Props> = ({ instance, onUpdate }) =>
  instance ? (
    <div className="container">
      <EditableText value={instance.name} onUpdate={val => onUpdate(set<Property>("name", val))}>
        <h2>{instance.name}</h2>
      </EditableText>
      <div>
        County:
        <EditableText value={instance.county} onUpdate={val => onUpdate(set<Property>("county", val))}>
          <div>{instance.county}</div>
        </EditableText>
      </div>
      <div>Media:</div>
      <MediaList mediaIds={instance.media} />
    </div>
  ) : (
    <div>Not loaded yet</div>
  );

export default PropertyDetail;
