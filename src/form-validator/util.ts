import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';

export function distinctUntilKeysChanged<T>(...distinctOn: Array<keyof T>) {
  return distinctUntilChanged<T>((x, y) => {
    if (!distinctOn) {
      return JSON.stringify(x) === JSON.stringify(y);
    }
    return distinctOn.reduce(
      (acc: boolean, key: keyof T) => acc && x[key] === y[key],
      true
    );
  });
}

export function setValidators(
  ...controlValidatorPairs: [
    AbstractControl | FormGroup | FormArray,
    ValidatorFn | ValidatorFn[] | null
  ][]
): void {
  controlValidatorPairs.forEach(([control, validators]) => {
    control.setValidators(validators);
    control.updateValueAndValidity();
  });
}

export function requireIf(predicate: () => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    predicate() ? Validators.required(control) : null;
}
