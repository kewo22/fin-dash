import { Injectable } from '@angular/core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    ScanCommand,
    DeleteCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DynamodbService {
    private client: DynamoDBDocumentClient;
    private tableName = environment.aws.tableName;

    constructor() {
        const dynamo = new DynamoDBClient({
            region: environment.aws.region,
            credentials: {
                accessKeyId: environment.aws.accessKeyIdDyDb,
                secretAccessKey: environment.aws.secretAccessKeyDyDb,
            },
        });
        this.client = DynamoDBDocumentClient.from(dynamo);
    }

    // Get all items
    async getAll<T>(): Promise<T[]> {
        const result = await this.client.send(
            new ScanCommand({ TableName: this.tableName })
        );
        return (result.Items ?? []) as T[];
    }

    // Get single item by id
    async getById<T>(id: string): Promise<T | null> {
        const result = await this.client.send(
            new GetCommand({ TableName: this.tableName, Key: { id } })
        );
        return (result.Item as T) ?? null;
    }

    // Create item
    async create<T extends Record<string, any>>(item: T): Promise<T> {
        const newItem = { id: uuidv4(), ...item };
        await this.client.send(
            new PutCommand({ TableName: this.tableName, Item: newItem })
        );
        return newItem as T;
    }

    // Update item
    async update(id: string, fields: Record<string, any>): Promise<void> {
        const keys = Object.keys(fields);
        const expression = 'SET ' + keys.map(k => `#${k} = :${k}`).join(', ');
        const names = keys.reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {});
        const values = keys.reduce((acc, k) => ({ ...acc, [`:${k}`]: fields[k] }), {});

        await this.client.send(
            new UpdateCommand({
                TableName: this.tableName,
                Key: { id },
                UpdateExpression: expression,
                ExpressionAttributeNames: names,
                ExpressionAttributeValues: values,
            })
        );
    }

    // Delete item
    async delete(id: string): Promise<void> {
        await this.client.send(
            new DeleteCommand({ TableName: this.tableName, Key: { id } })
        );
    }
}