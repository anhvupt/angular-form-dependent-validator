## Form Validation Example

This example demonstrates how to perform form validation in an Angular application using the `FormValidator` service. The `FormValidator` service provides a convenient way to validate form controls based on specific validation sets.

### Prerequisites

- Angular version 10 or higher

### Installation

1. Clone the repository or download the example files.
2. Navigate to the project directory.
3. Install the dependencies by running the following command:

```bash
npm install
```

### Usage

1. In your Angular application, create a new component or use an existing component where you want to implement form validation.
2. Copy the content of the provided `form.validator.ts` file into a new file in your project.
3. Import the necessary modules and services in your component file:

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormValidator, ValidationSet } from './form.validator';
```

4. Add the `FormValidator` service to the `providers` array of your component:

```typescript
@Component({
  selector: 'my-app',
  // ...
  providers: [FormValidator],
  // ...
})
export class AppComponent {
  // ...
}
```

5. Use the `FormBuilder` service to create a `FormGroup` for your form:

```typescript
constructor(
  private formBuilder: FormBuilder,
  private formValidator: FormValidator
) {}

ngOnInit(): void {
  this.myForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    confirmEmail: ['', Validators.required],
  });

  // ...
}
```

6. Define your validation sets using the `ValidationSet` interface:

```typescript
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
```

7. Create a `FormValidationContext` using the `FormValidator` service and pass in the `FormGroup`:

```typescript
const formValidationContext = this.formValidator.createContext(this.myForm);
```

8. Call the `validate` method on the `FormValidationContext` to perform the form validation:

```typescript
formValidationContext.validate(200, ...validationSets);
```

9. Implement your custom validator functions:

```typescript
matchEmailValidator = (control: AbstractControl) => {
  const email = this.myForm.get('email')?.value;
  const confirmEmail = control.value;
  return email === confirmEmail ? null : { emailMismatch: true };
};
```

10. Update your template to bind the form controls and display validation messages:

```html
<form [formGroup]="myForm">
  <label>
    Email:
    <input type="email" formControlName="email" />
  </label>
  <label>
    Confirm Email:
    <input type="email" formControlName="confirmEmail" />
  </label>
  <div *ngIf="myForm?.get('confirmEmail')?.invalid && myForm?.get('confirmEmail')?.dirty">
    Confirm Email is required and must match the Email field.
  </div>
</form>
```

11. Run your Angular application using the following command:

```bash
ng serve
```

12. Open your browser and navigate to `http://localhost:4200` to see the form with validation in action.

That's it! You have now implemented form validation using the `FormValidator` service in your Angular application. Feel free to customize the validation sets and validators based on your specific requirements.
