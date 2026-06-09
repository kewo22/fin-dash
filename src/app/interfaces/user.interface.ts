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

export type EditUser = Omit<User, 'id' | 'dob' | 'password'> & {
    dob: Date;
};

// export type EditUser = {
//     username: string;
//     email: string;
//     gender: Gender;
//     city: City;
//     dob: Date;
//     addressLine1: string;
//     addressLine2: string;
// };

/** Form model — dob is a Date object from the datepicker, converted to string on submit. */
export type UserFormModel = Omit<CreateUser, 'dob'> & { dob: Date };