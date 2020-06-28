import { ObjectID } from "bson";
import React, { useMemo, useRef, useState } from "react";

import MediaUploadClient from "@/backend/media";
import * as Config from "@/config/config";

const MediaCreate: React.SFC<{ propertyId: string }> = ({ propertyId }) => {
  const conf = Config.fromLocalStorage();
  const fileRef = useRef<HTMLInputElement>();
  const uploadURL = `${conf.dataStreamURL.replace(/^ws/, "http")}`;
  const [uploads, setUploads] = useState<Map<string, number>>(new Map());

  const mediaClient = useMemo(() => new MediaUploadClient(uploadURL), [uploadURL]);

  const onFileSelected = (files: FileList) => {
    // tslint:disable:prefer-for-of
    for (let i = 0; i < files.length; i++) {
      const newID = new ObjectID();
      mediaClient.uploadFile(newID, files.item(i), { tags: ["a"] }, (pe: ProgressEvent) => {
        setUploads({ ...uploads, [name]: pe.loaded / pe.total });
      });
      console.log(newID);
    }
    console.log(files);
    console.log(uploadURL);
    console.log(propertyId);
  };

  return (
    <>
      <input
        type="file"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={e => onFileSelected(e.target.files)}
        multiple
      />
      <button onClick={() => fileRef.current.click()}>Add Media</button>
      {[...uploads.entries()].map(([name, percent]) => (
        <div>
          Uploading {name}: {percent}%
        </div>
      ))}
    </>
  );
};

export default MediaCreate;
