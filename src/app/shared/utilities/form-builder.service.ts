import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Injectable } from '@angular/core';

/**
 * Form Building Utilities
 * Provides factory methods for creating common form patterns
 */

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  constructor(private fb: FormBuilder) {}

  /**
   * Create a search form (common pattern)
   * Usage: const form = this.formBuilder.createSearchForm();
   */
  createSearchForm(): FormGroup {
    return this.fb.group({
      searchText: [''],
    });
  }

  /**
   * Create a filter form with multiple fields
   * Usage: const form = this.formBuilder.createFilterForm({
   *   city: '',
   *   state: '',
   *   status: 'active',
   * });
   */
  createFilterForm(fields: Record<string, any>): FormGroup {
    const group: Record<string, any> = {};
    Object.keys(fields).forEach((key) => {
      group[key] = [fields[key] || ''];
    });
    return this.fb.group(group);
  }

  /**
   * Create a nested form group (like shipping/install/sap)
   * Usage: const form = this.formBuilder.createNestedForm({
   *   shipping: { address: '', city: '', state: '' },
   *   install: { address: '', city: '' },
   * });
   */
  createNestedForm(groupDefinitions: Record<string, Record<string, any>>): FormGroup {
    const groups: Record<string, FormGroup> = {};
    Object.keys(groupDefinitions).forEach((groupName) => {
      const fields: Record<string, any> = {};
      Object.keys(groupDefinitions[groupName]).forEach((fieldName) => {
        fields[fieldName] = [groupDefinitions[groupName][fieldName] || ''];
      });
      groups[groupName] = this.fb.group(fields);
    });
    return this.fb.group(groups);
  }

  /**
   * Create a project form
   * Usage: const form = this.formBuilder.createProjectForm(project);
   */
  createProjectForm(projectData?: any): FormGroup {
    return this.fb.group({
      projectNum: [{ value: projectData?.projectNum || '', disabled: true }],
      customer: [projectData?.customer || '', Validators.required],
      workOrder: [projectData?.workOrder || ''],
      appendix: [projectData?.appendix || ''],
      addr1: [projectData?.addr1 || ''],
      addr2: [projectData?.addr2 || ''],
      city: [projectData?.city || ''],
      stateOrProv: [projectData?.stateOrProv || ''],
      zip: [projectData?.zip || ''],
      country: [projectData?.country || ''],
      dateOfIssue: [projectData?.dateOfIssue || ''],
      earthquakeZone: [projectData?.earthquakeZone || 'low'],
      rise: [projectData?.rise || ''],
      floorHeight: [projectData?.floorHeight || '', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      projectGroup: [projectData?.projectGroup || 'Facilities'],
      completed: [projectData?.completed || false],
    });
  }

  /**
   * Create a work item form
   */
  createWorkItemForm(itemData?: any): FormGroup {
    return this.fb.group({
      workItemNum: [{ value: itemData?.workItemNum || '', disabled: true }],
      description: [itemData?.description || '', Validators.required],
      quantity: [itemData?.quantity || 1, [Validators.required, Validators.min(1)]],
      unit: [itemData?.unit || '', Validators.required],
      status: [itemData?.status || 'pending'],
      notes: [itemData?.notes || ''],
    });
  }

  /**
   * Create a contact form
   */
  createContactForm(contactData?: any): FormGroup {
    return this.fb.group({
      name: [contactData?.name || '', Validators.required],
      email: [contactData?.email || '', [Validators.required, Validators.email]],
      phone: [contactData?.phone || '', [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
      title: [contactData?.title || ''],
      company: [contactData?.company || ''],
    });
  }

  /**
   * Create an address form
   */
  createAddressForm(addressData?: any): FormGroup {
    return this.fb.group({
      addr1: [addressData?.addr1 || '', Validators.required],
      addr2: [addressData?.addr2 || ''],
      city: [addressData?.city || '', Validators.required],
      stateOrProv: [addressData?.stateOrProv || '', Validators.required],
      zip: [addressData?.zip || '', Validators.required],
      country: [addressData?.country || 'USA'],
    });
  }

  /**
   * Enable/disable form group recursively
   */
  setFormGroupDisabled(formGroup: FormGroup, disabled: boolean): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.setFormGroupDisabled(control, disabled);
      } else {
        if (disabled) {
          control?.disable({ emitEvent: false });
        } else {
          control?.enable({ emitEvent: false });
        }
      }
    });
  }

  /**
   * Reset form group to initial state
   */
  resetFormGroup(formGroup: FormGroup, initialValue?: any): void {
    if (initialValue) {
      formGroup.reset(initialValue, { emitEvent: false });
    } else {
      formGroup.reset({}, { emitEvent: false });
    }
  }

  /**
   * Get form errors as readable object
   * Usage: const errors = this.formBuilder.getFormErrors(form);
   */
  getFormErrors(form: FormGroup | AbstractControl): Record<string, any> {
    const errors: Record<string, any> = {};

    Object.keys(form.controls || {}).forEach((key) => {
      const control = form.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
      if (control instanceof FormGroup) {
        const groupErrors = this.getFormErrors(control);
        if (Object.keys(groupErrors).length > 0) {
          errors[key] = groupErrors;
        }
      }
    });

    return errors;
  }

  /**
   * Get first error message for a form control
   */
  getFirstErrorMessage(control: AbstractControl | null): string {
    if (!control || !control.errors) {
      return '';
    }

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['email']) return 'Invalid email format';
    if (errors['pattern']) return 'Invalid format';

    return 'Invalid input';
  }
}
