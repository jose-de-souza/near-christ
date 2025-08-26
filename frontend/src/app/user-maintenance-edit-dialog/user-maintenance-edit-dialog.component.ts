import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../user-maintenance/user.service';
import { UserDto, UserUpsertDto } from '@app/shared/models';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-user-maintenance-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatSnackBarModule, MatCheckboxModule],
  templateUrl: './user-maintenance-edit-dialog.component.html',
  styleUrls: ['./user-maintenance-edit-dialog.component.scss']
})
export class UserMaintenanceEditDialogComponent {
  hasSubmitted = false;
  uiMode: 'view' | 'editing' = 'view';
  allRoles: string[] = ['ADMIN', 'SUPERVISOR', 'STANDARD'];
  selectedRoles: Map<string, boolean> = new Map<string, boolean>();
  selectedUser: Partial<UserDto> & { password?: string } = {
    userFullName: '',
    userEmail: '',
    roles: [],
    password: ''
  };

  constructor(
    public dialogRef: MatDialogRef<UserMaintenanceEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<UserDto>,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    if (data.id) {
      this.selectedUser = { ...data, password: '' };
      this.uiMode = 'editing';
      this.updateSelectedRoles(data.roles || []);
    } else {
      this.uiMode = 'view';
      this.updateSelectedRoles(['STANDARD']);
    }
  }

  get selectedRolesCount(): number {
    return Array.from(this.selectedRoles.values()).filter(isSelected => isSelected).length;
  }

  addUser(): void {
    this.hasSubmitted = true;
    const payload = this.preparePayload();
    if (!this.isValidForCreate(payload)) {
      this.showWarning('Full Name, Email, Roles, and Password are required.');
      return;
    }
    this.userService.createUser(payload).subscribe({
      next: () => {
        this.showInfo(`${payload.userFullName} has been added`);
        this.dialogRef.close(true);
      },
      error: () => this.showError('Error creating user. Please contact support.')
    });
  }

  modifyUser(): void {
    if (!this.selectedUser.id) {
      this.showWarning('No user selected for modification.');
      return;
    }
    this.hasSubmitted = true;
    const payload = this.preparePayload();
    if (!this.isValidForUpdate(payload)) {
      this.showWarning('Full Name, Email, and Roles are required.');
      return;
    }
    this.userService.updateUser(this.selectedUser.id, payload).subscribe({
      next: () => {
        this.showInfo(`${payload.userFullName} modified`);
        this.dialogRef.close(true);
      },
      error: () => this.showError('Error updating user. Please contact support.')
    });
  }

  deleteUser(): void {
    if (!this.selectedUser.id || !this.selectedUser.userFullName) {
      this.showWarning('No user selected for deletion.');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you wish to delete user "${this.selectedUser.userFullName}"?` },
      panelClass: 'orange-dialog'
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.userService.deleteUser(this.selectedUser.id!).subscribe({
          next: () => {
            this.showInfo('User deleted');
            this.dialogRef.close(true);
          },
          error: () => this.showError('Error deleting user. Please contact support.')
        });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private preparePayload(): UserUpsertDto {
    const roles = Array.from(this.selectedRoles.entries())
      .filter(([_, isSelected]) => isSelected)
      .map(([roleName]) => roleName);
    const payload: UserUpsertDto = {
      userFullName: this.selectedUser.userFullName || '',
      userEmail: this.selectedUser.userEmail || '',
      roles
    };
    if (this.selectedUser.password) {
      payload.password = this.selectedUser.password;
    }
    return payload;
  }

  private updateSelectedRoles(roles: string[]): void {
    this.selectedRoles.clear();
    this.allRoles.forEach(role => {
      this.selectedRoles.set(role, roles.includes(role));
    });
  }

  private isValidForCreate(payload: UserUpsertDto): boolean {
    return !!(
      payload.userFullName?.trim() &&
      payload.userEmail?.trim() &&
      payload.roles.length > 0 &&
      payload.password?.trim()
    );
  }

  private isValidForUpdate(payload: UserUpsertDto): boolean {
    return !!(
      payload.userFullName?.trim() &&
      payload.userEmail?.trim() &&
      payload.roles.length > 0
    );
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-info']
    });
  }

  private showWarning(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-warning']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 7000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}