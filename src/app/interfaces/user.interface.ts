export interface City {
    name: string;
    code: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    dob: Date;
    gender: string;
    addressLine1: string;
    addressLine2: string;
    city: City;
}

export type CreateUser = Omit<User, 'id'>;