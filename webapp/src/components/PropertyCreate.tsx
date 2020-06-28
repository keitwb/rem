import React, { useContext, useState } from "react";
import useForm from "react-hook-form";
import { useHistory } from "react-router-dom";

import DataClientContext from "@/components/context/DataClientContext";
import SearchContext from "@/components/context/SearchContext";
import { CollectionName, Property } from "@/model/models.gen";
import { ModelUpdate, set } from "@/model/updates";
import { withErr } from "@/util/errors";
import SuggestedInput, { Suggestor } from "./forms/SuggestedInput";

import styles from "./PropertyCreate.css";

interface FormData {
  name: string;
  county: string;
  state: string;
}

const PropertyCreate: React.SFC<{}> = () => {
  const { handleSubmit, register } = useForm<FormData>();
  const dataClient = useContext(DataClientContext);
  const searchClient = useContext(SearchContext);
  const history = useHistory();
  const [error, setError] = useState("");

  const countySuggestor: Suggestor = (input: string) =>
    searchClient.suggest("county", CollectionName.Properties, input);

  const onSubmit = async (data: { [P in keyof Property]?: Property[P] }) => {
    const updates: Array<ModelUpdate<Property>> = Object.keys(data).map(name =>
      set<Property>(name as keyof Property, data[name])
    );
    const [newID, err] = await withErr(dataClient.create(CollectionName.Properties, updates));
    if (err) {
      setError(err.toString());
      return;
    }
    history.push(`/property/${newID.toHexString()}`);
  };

  return (
    <>
      <h1>Create Property</h1>
      <p>
        Enter some basic information about the new property and click "Create". After the property is created you will
        be able to add more details.
      </p>
      <form className={styles.root} onSubmit={handleSubmit(onSubmit)}>
        <label>
          Property Name
          <input type="text" name="name" ref={register} />
        </label>
        <label>
          County
          <SuggestedInput name="county" suggestor={countySuggestor} ref={register} />
        </label>
        <label>
          State
          <select name="state" defaultValue="NC" ref={register}>
            <option value="NC">NC</option>
          </select>
        </label>
        <div>
          <button type="submit">Create</button>
        </div>
        {error ? <div className="std-error">{error}</div> : null}
      </form>
    </>
  );
};

export default PropertyCreate;
