export interface City {
    name: string;
    code: string;
}

export type Gender = 'notSpecify' | 'male' | 'female';

export interface User {
    id: string;
    username: string;
    email: string;
    passwordEncrypted: string;
    dob: string;
    gender: Gender;
    addressLine1: string;
    addressLine2: string;
    city: City;
}

export type CreateUser = Omit<User, 'id'>;

export type EditUser = Omit<User, 'id' | 'dob' | 'passwordEncrypted'> & {
    dob: Date;
};

/** Form model — plain password collected from the form; encrypted in the service before storage. */
export type UserFormModel = Omit<CreateUser, 'passwordEncrypted' | 'dob'> & {
    password: string;
    dob: Date;
};