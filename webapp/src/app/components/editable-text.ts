import { Component, ElementRef, Input, Output, EventEmitter, ViewChild } from '@angular/core';

@Component({
  selector: 'rem-editable-text',
  template: `
    <div (mouseenter)="showEditButton=true" (mouseleave)="showEditButton=false">
      <div *ngIf="editing" [delayClickOutsideInit]="true" (clickOutside)="toggleEditing()">
        <input type="text" value="{{obj[property]}}" #textinput />
        <button type="button" class="btn btn-link btn-sm px-0 mx-0" (click)="save(textinput.value)">Save</button>
      </div>
      <div class="d-flex" *ngIf="!editing">
        <div #content [class.border]="showEditButton" style="padding-right: 30px;" *ngIf="!editing">
          <h3 *ngIf="elm=='h3'">{{obj[property]}}</h3>
          <span *ngIf="elm=='span' || !elm">{{obj[property]}}</span>
        </div>
        <button class="btn btn-link btn-sm px-0 my-0" (click)="toggleEditing()" style="margin-left: -30px;" *ngIf="showEditButton">Edit</button>
      </div>
    </div>
  `,
})
export class EditableTextComponent<T> {
  @Input() obj: T;
  @Input() property: string;
  @Input() elm: string;
  @Output() edit = new EventEmitter<[string, any]>();

  @ViewChild("content") textNode: ElementRef;
  editing: boolean;
  showEditButton: boolean;

  save(text: string) {
    this.edit.emit([this.property, text]);
    this.toggleEditing();
  }

  toggleEditing() {
    this.editing = !this.editing;
  }
}
