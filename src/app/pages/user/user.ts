import { Component, inject, signal } from '@angular/core';
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

const ukCities: City[] = [
  // England
  { name: "Bath", code: "BATH" },
  { name: "Birmingham", code: "BHX" },
  { name: "Bradford", code: "BRD" },
  { name: "Brighton & Hove", code: "BTN" },
  { name: "Bristol", code: "BRS" },
  { name: "Cambridge", code: "CBG" },
  { name: "Canterbury", code: "CTY" },
  { name: "Carlisle", code: "CAR" },
  { name: "Chelmsford", code: "CHM" },
  { name: "Chester", code: "CHG" },
  { name: "Chichester", code: "CHI" },
  { name: "Colchester", code: "COL" },
  { name: "Coventry", code: "COV" },
  { name: "Derby", code: "DER" },
  { name: "Doncaster", code: "DON" },
  { name: "Durham", code: "DUR" },
  { name: "Ely", code: "ELY" },
  { name: "Exeter", code: "EXE" },
  { name: "Gloucester", code: "GLO" },
  { name: "Hereford", code: "HFD" },
  { name: "Kingston upon Hull", code: "HUL" },
  { name: "Lancaster", code: "LAN" },
  { name: "Leeds", code: "LDS" },
  { name: "Leicester", code: "LEI" },
  { name: "Lichfield", code: "LIC" },
  { name: "Lincoln", code: "LIN" },
  { name: "Liverpool", code: "LPL" },
  { name: "London", code: "LON" },
  { name: "Manchester", code: "MAN" },
  { name: "Milton Keynes", code: "MKY" },
  { name: "Newcastle upon Tyne", code: "NCL" },
  { name: "Norwich", code: "NRW" },
  { name: "Nottingham", code: "NOT" },
  { name: "Oxford", code: "OXF" },
  { name: "Peterborough", code: "PET" },
  { name: "Plymouth", code: "PLY" },
  { name: "Portsmouth", code: "PMR" },
  { name: "Preston", code: "PRN" },
  { name: "Ripon", code: "RIP" },
  { name: "Salford", code: "SLF" },
  { name: "Salisbury", code: "SLS" },
  { name: "Sheffield", code: "SHF" },
  { name: "Southampton", code: "SOU" },
  { name: "Southend-on-Sea", code: "SOS" },
  { name: "St Albans", code: "STA" },
  { name: "Stoke-on-Trent", code: "SOT" },
  { name: "Sunderland", code: "SUN" },
  { name: "Truro", code: "TRU" },
  { name: "Wakefield", code: "WAK" },
  { name: "Wells", code: "WEL" },
  { name: "Westminster", code: "WST" },
  { name: "Winchester", code: "WIN" },
  { name: "Wolverhampton", code: "WLV" },
  { name: "Worcester", code: "WCR" },
  { name: "York", code: "YRK" },

  // Scotland
  { name: "Aberdeen", code: "ABD" },
  { name: "Dundee", code: "DND" },
  { name: "Dunfermline", code: "DFM" },
  { name: "Edinburgh", code: "EDI" },
  { name: "Glasgow", code: "GLA" },
  { name: "Inverness", code: "INV" },
  { name: "Perth", code: "PER" },
  { name: "Stirling", code: "STI" },

  // Wales
  { name: "Bangor", code: "BGR" },
  { name: "Cardiff", code: "CRD" },
  { name: "Newport", code: "NWP" },
  { name: "St Asaph", code: "SAS" },
  { name: "St Davids", code: "SDA" },
  { name: "Swansea", code: "SWA" },
  { name: "Wrexham", code: "WXM" },

  // Northern Ireland
  { name: "Armagh", code: "ARM" },
  { name: "Bangor", code: "BGN" },
  { name: "Belfast", code: "BFS" },
  { name: "Lisburn", code: "LIS" },
  { name: "Londonderry", code: "LDY" },
  { name: "Newry", code: "NRY" }
];

@Component({
  selector: 'app-user',
  imports: [CommonModule, FormField, InputTextModule, ButtonModule, MessageModule, DatePickerModule, RadioButtonModule, SelectModule, UserTable],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  protected userService = inject(UserService);

  public listUsersResource = this.userService.listUsers;

  protected cities = signal<City[]>([
    ...ukCities
  ]);

  protected userModel = signal<UserFormModel>({
    username: '',
    email: '',
    password: '',
    dob: new Date(),
    gender: 'notSpecify',
    addressLine1: '',
    addressLine2: '',
    city: {
      name: '',
      code: ''
    },
  });

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

    // Check if the overall form state is invalid
    if (this.regForm().invalid()) {
      alert('Please correct the validation errors before submitting.');
      return;
    }

    const { dob, ...rest } = this.userModel();
    const payload = { ...rest, dob: dob.toISOString() };
    console.log('Successfully submitted payload:', payload);

    this.userService.createUser(payload);
  }

}
