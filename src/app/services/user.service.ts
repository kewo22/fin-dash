import { Injectable, inject, signal } from '@angular/core';
import { resource } from '@angular/core';
import { DynamodbService } from './dynamodb.service';
import { CreateUser, User } from '../interfaces';


@Injectable({ providedIn: 'root' })
export class UserService {
    private db = inject(DynamodbService);

    public listUsers = resource<User[], unknown>({
        loader: async () => {
            return await this.db.getAll<User>();
        }
    });

    // 5. Mutations: Perform write operation, then update local resource cache or reload
    async createUser(user: CreateUser): Promise<void> {
        const createdUser = await this.db.create(user);

        // Optimistic / Local UI update: Append the new item immediately
        this.listUsers.update(currentUsers =>
            currentUsers ? [...currentUsers, createdUser as User] : [createdUser as User]
        );
    }

}