import { Injectable, inject, signal, resource } from '@angular/core';
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

    readonly createStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
    readonly createError = signal<string | null>(null);

    async createUser(user: CreateUser): Promise<void> {
        this.createStatus.set('loading');
        this.createError.set(null);
        try {
            const createdUser = await this.db.create(user);
            this.listUsers.update(currentUsers =>
                currentUsers ? [...currentUsers, createdUser as User] : [createdUser as User]
            );
            this.createStatus.set('success');
        } catch (err) {
            this.createError.set(err instanceof Error ? err.message : 'Failed to create user.');
            this.createStatus.set('error');
        }
    }

}
