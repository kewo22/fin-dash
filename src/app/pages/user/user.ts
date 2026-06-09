import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';

import {
  form,
  FormField,
  required,
  email,
  minLength,
  validate
} from '@angular/forms/signals';
import { City, UserFormModel } from '../../interfaces';
import { UserService } from '../../services/user.service';
import { UserTable } from '../../components/user-table/user-table';
import { UK_CITIES } from '../../constants/uk-cities';

@Component({
  selector: 'app-user',
  imports: [CommonModule, FormField, InputTextModule, ButtonModule, MessageModule, DatePickerModule, RadioButtonModule, SelectModule, UserTable],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  protected userService = inject(UserService);

  public listUsersResource = this.userService.userResource;
  protected createStatus = this.userService.createStatus;
  protected createError = this.userService.createError;

  protected cities = signal<City[]>([...UK_CITIES]);

  private readonly defaultModel: UserFormModel = {
    username: '',
    email: '',
    password: '',
    dob: new Date(),
    gender: 'notSpecify',
    addressLine1: '',
    addressLine2: '',
    city: { name: '', code: '' },
  };

  protected userModel = signal<UserFormModel>({ ...this.defaultModel });

  constructor() {
    effect(() => {
      if (this.createStatus() === 'success') {
        this.regForm().reset({ ...this.defaultModel, dob: new Date() });
        this.userService.createStatus.set('idle');
      }
    });
  }

  protected regForm = form(this.userModel, (fields) => {
    // Built-in validation rules
    required(fields.username, { message: 'Username is required.' });

    required(fields.email, { message: 'Email is required.' });
    email(fields.email, { message: 'Please enter a valid email address.' });

    required(fields.password, { message: 'Password is required.' });
    minLength(fields.password, 8, { message: 'Password must be at least 8 characters.' });
    // validate(fields.password, ({ value }) => {
    //   const lowerCaseRegex = /^(?=.*[a-z])$/
    //   if (lowerCaseRegex.test(value())) {
    //     return { kind: 'formatError', message: 'The password must contain at least one lowercase letter.' };
    //   }
    //   return null;
    // });

    // Custom inline validator example
    validate(fields.username, ({ value }) => {
      if (value().toLowerCase() === 'admin') {
        return { kind: 'reserved', message: 'The username "admin" is restricted.' };
      }
      return null;
    });
  });

  protected onSubmit(event: Event) {
    event.preventDefault();
    if (this.regForm().invalid()) {
      return;
    }
    const { dob, ...rest } = this.userModel();
    const payload = { ...rest, dob: dob.toISOString() };
    this.userService.createUser(payload);
  }

}
