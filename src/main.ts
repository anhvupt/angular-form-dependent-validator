import 'zone.js/dist/zone';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
    <input type="checkbox" formControlName="shouldRequire" />
  </label>
  <small style="color:red;" *ngIf="isErrorShown('email')">
    Confirm Email is required.
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
      shouldRequire: [],
    });
    const validation = createValidationContext(form);
    validation.validate({
      triggeredControls: ['email', 'shouldRequire'],
      validate: (value) => ({ email: requireIf(() => value.shouldRequire) }),
    });
    return form;
  }
}

bootstrapApplication(App);
