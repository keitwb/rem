import { ObjectID } from "bson";
import React, { useContext } from "react";
import { useHistory } from "react-router-dom";

import DataClientContext from "@/components/context/DataClientContext";
import EditableText from "@/components/forms/EditableText";
import { CollectionName, InsurancePolicy, Owner, Party, Property } from "@/model/models.gen";
import { ModelUpdate, pull, push, set } from "@/model/updates";
import { ensureArray } from "@/util/arrays";

import useModel from "./hooks/useModel";
import useModelList from "./hooks/useModelList";
import MediaListByIds from "./MediaList";
import { NoteListByIds } from "./NoteList";
import TagEditor from "./TagEditor";
import TagList from "./TagList";
import TaxInfo from "./TaxInfo";

import styles from "./PropertyDetail.css";

interface Props {
  property: Property;
  onUpdate: (updates: ModelUpdate<Property> | Array<ModelUpdate<Property>>) => void;
}

const PropertyDetail: React.SFC<Props> = ({ property, onUpdate }) => {
  const history = useHistory();

  return property ? (
    <div className={styles.container}>
      <EditableText
        className={styles.propName}
        value={property.name}
        onUpdate={val => onUpdate(set<Property>("name", val))}
      >
        <div>{property.name}</div>
      </EditableText>
      <div className={styles.location}>
        <EditableText value={property.county} onUpdate={val => onUpdate(set<Property>("county", val))}>
          <div>{property.county} County,&nbsp;</div>
        </EditableText>
        <EditableText value={property.state} onUpdate={val => onUpdate(set<Property>("state", val))}>
          <div>{property.state}</div>
        </EditableText>
      </div>
      <div>
        <button onClick={() => onUpdate(set<Property>("parcelDataRefreshRequested", true))}>Refresh GIS Info</button>
      </div>
      <OwnerInfo owners={property.owners} />
      <InsuranceInfo policyIds={property.insurancePolicyIds} />
      <div>
        Notes:
        <NoteListByIds ids={property.noteIds} />
      </div>
      <div>
        <div>Media:</div>
        <button onClick={() => history.push(`/property/${property._id.toString()}/add-media`)}>Add Media</button>
        <MediaListByIds ids={property.mediaIds} />
      </div>
      <div>
        <div>Tags:</div>
        <TagList onRemove={removedTag => onUpdate(pull<Property>("tags", removedTag))} tags={property.tags} />
        <TagEditor onAdd={newTag => onUpdate(push<Property>("tags", newTag))} />
      </div>
      <div>
        <div>Tax Info:</div>
        <TaxInfo property={property} onRefreshRequested={() => onUpdate(set<Property>("taxRefreshRequested", true))} />
      </div>
    </div>
  ) : (
    <div>Not loaded yet</div>
  );
};

export default PropertyDetail;

export const PropertyDetailById: React.SFC<{ id: ObjectID }> = ({ id }) => {
  const property = useModel(CollectionName.Properties, id);
  const dataClient = useContext(DataClientContext);
  return (
    <PropertyDetail
      property={property}
      onUpdate={updates => {
        dataClient.update(CollectionName.Properties, id, ensureArray(updates));
      }}
    />
  );
};

function OwnerInfo({ owners }: { owners: Owner[] }) {
  if (!owners || !owners.length) {
    return <div>No ownership information</div>;
  }
  const ownerParties = useModelList<Party>(CollectionName.Parties, owners.map(o => o.id));
  const totalPortion = owners.reduce((acc, o) => acc + (o.portion || 0), 0.0);

  return (
    <>
      <div>Owners:</div>
      {ownerParties.map((party, i) => (
        <div key={i}>
          <div>Name: {party.name}</div>
          <div>Portion: {((owners[i].portion / totalPortion) * 100).toFixed(2)}%</div>
        </div>
      ))}
    </>
  );
}

function InsuranceInfo({ policyIds }: { policyIds: ObjectID[] }) {
  const policies = useModelList<InsurancePolicy>(CollectionName.InsurancePolicies, policyIds);

  return policies && policies.length > 0 ? (
    <>
      {policies.map(policy => (
        <div key={policy._id.toHexString()}>Policy: {policy.toString()}</div>
      ))}
    </>
  ) : (
    <div>No insurance policies</div>
  );
}
