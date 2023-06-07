import 'zone.js/dist/zone';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormValidator, ValidationSet } from './form.validator';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [FormValidator],
  template: `
  <form [formGroup]="myForm">
  <label>
    Email:
    <input type="email" formControlName="email" />
  </label>
  <label>
    Confirm Email:
    <input type="email" formControlName="confirmEmail" />
  </label>
  <div  style="color:red;" *ngIf="myForm?.get('confirmEmail')?.invalid && myForm?.get('confirmEmail')?.dirty">
    Confirm Email is required and must match the Email field.
  </div>
</form>
  `,
})
export class App {
  myForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private formValidator: FormValidator
  ) {}

  ngOnInit(): void {
    this.myForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', Validators.required],
    });

    const validationSets: ValidationSet<any>[] = [
      {
        triggeredControls: ['email', 'confirmEmail'],
        validate: () => {
          return [
            ['confirmEmail', [Validators.required, this.matchEmailValidator]],
          ];
        },
      },
    ];

    const formValidationContext = this.formValidator.createContext(this.myForm);
    formValidationContext.validate(200, ...validationSets);
  }

  matchEmailValidator = (control: AbstractControl) => {
    const email = this.myForm.get('email')?.value;
    const confirmEmail = control.value;
    return email === confirmEmail ? null : { emailMismatch: true };
  };
}

bootstrapApplication(App);
