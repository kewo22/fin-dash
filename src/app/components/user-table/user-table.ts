import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { User } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { GenerToValuePipe } from '../../pipes/gener-to-value-pipe';

@Component({
  selector: 'app-user-table',
  imports: [CommonModule, GenerToValuePipe, TableModule, SkeletonModule, TagModule],
  templateUrl: './user-table.html',
  styleUrl: './user-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTable {
  users = input.required<User[] | undefined>();
  isLoading = input.required<boolean>();
  error = input.required<Error | undefined>();

  readonly skeletonRows = Array.from({ length: 5 });
}
