import { ValidatorFn } from '@angular/forms';

/**
 * Function type for getting the validators for a specific control or group of controls.
 * @param T Type of the value that the validators are for.
 */
type GetValidatorsFn<T> = (
  value: T
) => { [key in keyof T]: ValidatorFn | ValidatorFn[] };

/**
 * Function type for performing custom validation for the form.
 * @param T Type of the value that the validators are for.
 */
type CustomValidatorsFn<T> = (value: T) => void;

/**
 * Represents a validation configuration for a specific group of controls.
 */
export interface ValidationSet<T> {
  /** Names of the controls that trigger validating*/
  triggeredControls: (keyof T)[];
  /** Function to retrieve the validators or perform custom validation */
  validate: GetValidatorsFn<T> | CustomValidatorsFn<T>;
}
