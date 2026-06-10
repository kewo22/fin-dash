import { Component, ChangeDetectionStrategy, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { User, City, Gender, EditUser } from '../../interfaces';
import { GenerToValuePipe } from '../../pipes/gener-to-value-pipe';
import { UserService } from '../../services/user.service';
import { UK_CITIES } from '../../constants/uk-cities';

@Component({
  selector: 'app-user-table',
  imports: [
    CommonModule, FormsModule, GenerToValuePipe,
    TableModule, SkeletonModule, TagModule, ButtonModule,
    DialogModule, InputTextModule, DatePickerModule, RadioButtonModule, SelectModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './user-table.html',
  styleUrl: './user-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTable {
  private userService = inject(UserService);
  private confirmationService = inject(ConfirmationService);

  users = input.required<User[] | undefined>();
  isLoading = input.required<boolean>();
  error = input.required<Error | undefined>();

  readonly skeletonRows = Array.from({ length: 5 });
  readonly cities = UK_CITIES;

  editingUserId = signal<string | null>(null);
  editDraft = signal<EditUser | null>(null);
  isSaving = signal(false);

  openEdit(user: User): void {
    this.editingUserId.set(user.id);
    this.editDraft.set({
      username: user.username,
      email: user.email,
      gender: user.gender,
      city: user.city,
      dob: new Date(user.dob),
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
    });
  }

  closeEdit(): void {
    this.editingUserId.set(null);
    this.editDraft.set(null);
  }

  patchDraft(patch: Partial<EditUser>): void {
    this.editDraft.update(d => d ? { ...d, ...patch } : null);
  }

  async saveEdit(): Promise<void> {
    const id = this.editingUserId();
    const draft = this.editDraft();
    if (!id || !draft) return;

    this.isSaving.set(true);
    const { dob, ...rest } = draft;
    await this.userService.updateUser(id, { ...rest, dob: dob.toISOString() });
    this.isSaving.set(false);
    this.closeEdit();
  }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `Delete user <strong>${user.username}</strong>? This cannot be undone.`,
      header: 'Delete User',
      icon: 'pi pi-trash',
      acceptButtonProps: { label: 'Delete', severity: 'danger', size: 'small' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true, size: 'small' },
      accept: () => this.userService.deleteUser(user.id),
    });
  }
}
