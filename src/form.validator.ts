import { Injectable, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormGroup,
  UntypedFormGroup,
  ValidatorFn,
} from '@angular/forms';
import { Subject, Observable, filter } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

/**
 * Function type for getting the validators for a specific control or group of controls.
 */
type GetValidatorsFn<T> = (
  value: T
) =>
  | [keyof T, ValidatorFn[] | ValidatorFn][]
  | [keyof T, ValidatorFn[] | ValidatorFn];

/**
 * Function type for performing custom validation for a specific control or group of controls.
 */
type CustomValidatorsFn<T> = (value: T) => void;

/**
 * Represents a validation configuration for a specific group of controls.
 */
export interface ValidationSet<T> {
  /** Names of the controls that trigger the validation*/
  triggeredControls: (keyof T)[];
  /** Function to retrieve the validators or perform custom validation */
  validate: GetValidatorsFn<T> | CustomValidatorsFn<T>;
}

function distinctUntilKeysChanged<T>(...distinctOn: Array<keyof T>) {
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

function setValidators(
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

@Injectable()
export class FormValidator implements OnDestroy {
  private destroy$ = new Subject<unknown>();

  /**
   * Create a validation context for a specific form.
   * @param form The form to validate.
   * @returns The validation context.
   */
  createContext(form: UntypedFormGroup) {
    return new FormValidationContext(form, this.destroy$);
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}

class FormValidationContext {
  constructor(
    public form: UntypedFormGroup,
    public destroy$: Observable<unknown>
  ) {}

  /**
   * Perform form validation based on the provided validation sets.
   * @param debounce The debounce time for value changes (default: 200ms).
   * @param validationSets The validation sets specifying the controls to validate and the validation logic.
   */
  validate<T extends { [key: string]: any }>(
    debounce = 200,
    ...validationSets: ValidationSet<T>[]
  ) {
    const dictinctOn = validationSets.reduce(
      (acc, v) => [...acc, ...v.triggeredControls],
      [] as (keyof T)[]
    );
    this.form.valueChanges
      .pipe(
        debounceTime(debounce),
        filter((x) => !!x),
        distinctUntilKeysChanged<T>(...dictinctOn),
        takeUntil(this.destroy$)
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

  private validateSingleSet<T extends { [key: string]: any }>(
    value: T,
    { triggeredControls, validate }: ValidationSet<T>
  ) {
    const controls = this.initControlsMap(triggeredControls);
    const ctrlValidatorFns = validate(value);

    if (!ctrlValidatorFns) return; // return if the custom validation was called

    const validateControl = (
      name: keyof T,
      validatorFns: ValidatorFn | ValidatorFn[]
    ) => {
      const control = controls.get(name);
      if (!control) {
        console.error(`can not find control name: ${String(name)}`);
        return;
      }
      const validatorFnArr = Array.isArray(validatorFns)
        ? validatorFns
        : [validatorFns];
      setValidators([control, validatorFnArr]);
    };

    if (this.isMultiControlValidators(ctrlValidatorFns)) {
      ctrlValidatorFns.forEach(([name, validatorFns]) => {
        validateControl(name, validatorFns);
      });
      return;
    }
    const [name, validatorFns] = ctrlValidatorFns;
    validateControl(name, validatorFns);
  }

  private isMultiControlValidators<T extends { [key: string]: any }>(
    ctrlValidatorFns:
      | [keyof T, ValidatorFn | ValidatorFn[]]
      | [keyof T, ValidatorFn | ValidatorFn[]][]
  ): ctrlValidatorFns is [keyof T, ValidatorFn | ValidatorFn[]][] {
    return Array.isArray(ctrlValidatorFns[0]);
  }

  private initControlsMap<T extends { [key: string]: any }>(
    triggeredControls: (keyof T)[]
  ) {
    const controls = new Map<keyof T, AbstractControl>();
    triggeredControls.forEach((name) => {
      const control = this.form.get(String(name)) as AbstractControl;
      if (!control) {
        console.error(`can not find control name: ${String(name)}`);
        return;
      }
      controls.set(String(name), control);
    });
    return controls;
  }
}
