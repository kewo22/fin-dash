export interface City {
    name: string;
    code: string;
}

export type Gender = 'notSpecify' | 'male' | 'female';

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    dob: string;
    gender: Gender;
    addressLine1: string;
    addressLine2: string;
    city: City;
}

export type CreateUser = Omit<User, 'id'>;

/** Form model — dob is a Date object from the datepicker, converted to string on submit. */
export type UserFormModel = Omit<CreateUser, 'dob'> & { dob: Date };