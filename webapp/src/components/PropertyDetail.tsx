import * as React from "react";

import EditableText from "@/components/forms/EditableText";
import { CollectionName, Property } from "@/model/models";
import { ModelUpdate, pull, push, set } from "@/model/updates";

import connectModelById from "./connectModelById";
import MediaList from "./MediaList";
import NotesList from "./NotesList";
import TagEditor from "./TagEditor";
import TagList from "./TagList";

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
      <div>
        Notes:
        <NotesList noteIds={instance.notes} />
      </div>
      <div>
        <div>Media:</div>
        <MediaList mediaIds={instance.media} />
      </div>
      <div>
        <div>Tags:</div>
        <TagList onRemove={removedTag => onUpdate(pull<Property>("tags", removedTag))} tags={instance.tags} />
        <TagEditor onAdd={newTag => onUpdate(push<Property>("tags", newTag))} />
      </div>
    </div>
  ) : (
    <div>Not loaded yet</div>
  );

export default PropertyDetail;

export const PropertyDetailConnected = connectModelById(CollectionName.Property, PropertyDetail);
