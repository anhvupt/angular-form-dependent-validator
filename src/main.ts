import 'zone.js/dist/zone';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { createValidationContext } from './form-validator/form-validator';
import { requireIf } from './form-validator/util';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
  <form [formGroup]="form">
  <label>
    Email:
    <input type="email" formControlName="email" />
  </label>
  <label>
    Should validate
    <input type="checkbox" formControlName="shouldValidate" />
  </label>
  <br/>
  <small style="color:red;" *ngIf="isErrorShown('email')">
    Email is invalid.
</small>
</form>
  `,
})
export class App {
  form = this.buildForm();

  isErrorShown(name: keyof typeof this.form.controls) {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }

  private buildForm() {
    const form = inject(FormBuilder).group({
      email: [''],
      shouldValidate: [],
    });
    const validation = createValidationContext(form);
    validation.validate({
      triggeredControls: ['email', 'shouldValidate'],
      validate: (value) => ({
        email: [requireIf(() => value.shouldValidate)],
      }),
    });
    return form;
  }
}

bootstrapApplication(App);
