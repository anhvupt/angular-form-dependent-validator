import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { filter } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ValidationSet } from './type';
import { distinctUntilKeysChanged, setValidators } from './util';

export function createValidationContext(form: FormGroup, debounceTime = 200) {
  return new FormValidationContext(form, debounceTime);
}

class FormValidationContext {
  constructor(public form: FormGroup, public debounceTime = 200) {}

  /**
   * Perform form validation based on the provided validation sets.
   * @param validationSets The validation sets specifying the controls to validate and the validation logic.
   */
  validate<T extends typeof this.form.value>(
    ...validationSets: ValidationSet<T>[]
  ) {
    const dictinctOn = validationSets.reduce(
      (acc, v) => [...acc, ...v.triggeredControls],
      [] as (keyof T)[]
    );
    this.form.valueChanges
      .pipe(
        debounceTime(this.debounceTime),
        filter((x) => !!x),
        distinctUntilKeysChanged<T>(...dictinctOn),
        takeUntilDestroyed()
      )
      .subscribe((formValue) => {
        validationSets.forEach((validationSet) => {
          const { triggeredControls } = validationSet;
          const shouldValidate = triggeredControls.some(
            (controlName) => this.form.get(String(controlName))?.dirty
          );

          if (!shouldValidate) return;
          this.validateSingleSet(formValue, validationSet);
        });
      });
  }

  private validateSingleSet<T extends typeof this.form.value>(
    value: T,
    { validate }: ValidationSet<T>
  ) {
    const ctrlValidatorFns = validate(value);

    if (!ctrlValidatorFns) return; // return if the custom validation was called

    for (const [name, validatorFns] of Object.entries(ctrlValidatorFns)) {
      const control = this.form.controls[name];
      if (!control) {
        console.error(`can not find control name: ${String(name)}`);
        return;
      }
      const validatorFnArr = Array.isArray(validatorFns)
        ? validatorFns
        : [validatorFns];

      setValidators([control, validatorFnArr]);
    }
  }
}
