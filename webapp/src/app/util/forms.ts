import {FormGroup, FormArray} from '@angular/forms';
import * as _ from 'lodash';


export function markAllControlsTouched(form: FormGroup | FormArray) {
  if (!form.controls) return;
  _.forEach(form.controls, c => {
    c.markAsTouched();
    if (c instanceof FormGroup || c instanceof FormArray) {
      markAllControlsTouched(c);
    }
  });
}
