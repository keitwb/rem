import { Component, Injectable, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { FileService } from 'app/services/files';
import { Media, CollectionName } from 'app/models';

@Component({
  selector: 'rem-media-upload',
  template: `
    <label>
      <button class="btn btn-primary">Choose files...</button>
      <input style="opacity: 0;" type="file" multiple (change)="newFilesSelected($event)" />
    </label>
    <form>
      <ul formArrayName="files">
        <li *ngFor="let f of files">
          {{f.filename}}
        </li>
      </ul>
    </form>
  `,
  styles: [`
  `]
})
@Injectable()
export class MediaUploadComponent {
  @Output() fileAdded = new EventEmitter<[File, object]>();
  form: FormGroup;

  constructor(private fb: FormBuilder) {}

  newFilesSelected(event) {
    this.files = event.target.files;
    this.createForm(this.files);
  }

  createForm(files: File[]) {
    this.form = this.fb.group({
      description: [''],
      tags: [new Set()],
    });
  }

  finalize() {
    this.files.forEach(f => this.fileAdded.emit([f, {}]));
  }
}
