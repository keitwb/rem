import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.css']
})
export class PropertyComponent implements OnInit {
  editing: boolean = false;
  propForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.createForm();
    this.editing = false;
  }

  createForm() {
    this.propForm = this.fb.group({
        name: '',
    });

  }

  ngOnInit() {
  }

  onSubmit() {
      // Save property to server
      // Go to view of the property
  }

}

