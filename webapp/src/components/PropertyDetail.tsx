import * as React from "react";

import EditableText from "@/components/forms/EditableText";
import { CollectionName, Property } from "@/model/models.gen";
import { ModelUpdate, pull, push, set } from "@/model/updates";

import { connectOneModelById } from "./connectModels";
import MediaList from "./MediaList";
import { NoteListConnected } from "./NotesList";
import TagEditor from "./TagEditor";
import TagList from "./TagList";
import TaxInfo from "./TaxInfo";

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
        <NoteListConnected ids={instance.noteIds} />
      </div>
      <div>
        <div>Media:</div>
        <MediaList mediaIds={instance.mediaIds} />
      </div>
      <div>
        <div>Tags:</div>
        <TagList onRemove={removedTag => onUpdate(pull<Property>("tags", removedTag))} tags={instance.tags} />
        <TagEditor onAdd={newTag => onUpdate(push<Property>("tags", newTag))} />
      </div>
      <div>
        <div>Tax Info:</div>
        <TaxInfo property={instance} onRefreshRequested={() => onUpdate(set<Property>("taxRefreshRequested", true))} />
      </div>
    </div>
  ) : (
    <div>Not loaded yet</div>
  );

export default PropertyDetail;

export const PropertyDetailConnected = connectOneModelById(CollectionName.Properties, PropertyDetail);
