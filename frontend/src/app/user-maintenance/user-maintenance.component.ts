import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { UserService, User } from './user.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-user-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatSnackBarModule,
    MatDialogModule    
  ],
  templateUrl: './user-maintenance.component.html',
  styleUrls: ['./user-maintenance.component.scss']
})
export class UserMaintenanceComponent implements OnInit {
  // Columns for our grid
  columns = [
    { header: 'Name', field: 'UserName' },
    { header: 'Email', field: 'UserEmail' },
    { header: 'Role', field: 'UserRole' },
  ];

  // The array of users from the backend
  users: User[] = [];

  // Track whether the user has tried to create/update (for inline validation)
  hasSubmitted = false;

  // The currently selected (or new) user
  selectedUser: Partial<User> = {
    UserID: undefined,
    UserName: '',
    UserEmail: '',
    UserRole: 'STANDARD',
    UserPassword: ''
  };

  // Possible user roles for the dropdown
  userRoles = ['ADMIN', 'SUPERVISOR', 'STANDARD'];

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadAllUsers();
  }

  // -------------- DRAG & DROP --------------
  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  onDragEntered(event: any): void {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }

  onDragExited(event: any): void {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  // -------------- LOAD --------------
  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.data;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  // -------------- SELECT --------------
  selectUser(u: User): void {
    // Copy the selected user and clear password
    this.selectedUser = { ...u, UserPassword: '' };
  }

  // -------------- CREATE --------------
  addUser(): void {
    this.hasSubmitted = true;
    if (!this.isValidForCreate()) {
      this.showWarning('User Name, Email, Role, and Password are required to create a new user.');
      return;
    }
    this.userService.createUser(this.selectedUser).subscribe({
      next: () => {
        this.showInfo(this.selectedUser.UserName + ' has been added');
        this.loadAllUsers();
        this.resetForm();
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to create user:', err);
          this.showError('Fatal error creating user! Please contact support.');
        }
      }
    });
  }

  // -------------- UPDATE --------------
  modifyUser(): void {
    if (!this.selectedUser.UserID) {
      this.showWarning('No user selected to update!');
      return;
    }
    this.hasSubmitted = true;
    if (!this.isValidForUpdate()) {
      this.showWarning('User Name, Email, and Role are required to update!');
      return;
    }
    const id = this.selectedUser.UserID;
    this.userService.updateUser(id, this.selectedUser).subscribe({
      next: () => {
        this.showInfo(this.selectedUser.UserName + ' modified');
        this.loadAllUsers();
        this.resetForm();
      },
      error: (err) => {
        if (err.status !== 403) {
          console.error('Failed to update user:', err);
          this.showError('Fatal error updating user! Please contact support.');
        }
      }
    });
  }

  // -------------- DELETE --------------
  deleteUser(): void {
    if (!this.selectedUser.UserID) {
      this.showWarning('No user selected to delete!');
      return;
    }

    // Open the confirmation dialog with panelClass for scoping
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: `Are you sure you wish to delete user "${this.selectedUser.UserName}"?`
      },
      panelClass: 'orange-dialog' // <--- Here is the custom class
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const id = this.selectedUser.UserID!;
        this.userService.deleteUser(id).subscribe({
          next: () => {
            this.loadAllUsers();
            this.resetForm();
          },
          error: (err) => {
            if (err.status !== 403) {
              console.error('Failed to delete user:', err);
              this.showError('Fatal error deleting user! Please contact support.');
            }
          }
        });
      }
    });
  }

  // -------------- CANCEL --------------
  cancel(): void {
    this.resetForm();
  }

  // -------------- UTILITIES --------------
  getCellValue(row: User, column: { header: string; field: string }): any {
    return (row as any)[column.field] || '';
  }

  trackByUserID(index: number, item: User): number {
    return item.UserID;
  }

  trackByColumn(index: number, column: { header: string; field: string }): string {
    return column.field;
  }

  private resetForm(): void {
    this.selectedUser = {
      UserID: undefined,
      UserName: '',
      UserEmail: '',
      UserRole: 'STANDARD',
      UserPassword: ''
    };
    this.hasSubmitted = false;
  }

  private isValidForCreate(): boolean {
    if (!this.selectedUser.UserName?.trim()) { return false; }
    if (!this.selectedUser.UserEmail?.trim()) { return false; }
    if (!this.selectedUser.UserRole?.trim()) { return false; }
    if (!this.selectedUser.UserPassword?.trim()) { return false; }
    return true;
  }

  private isValidForUpdate(): boolean {
    if (!this.selectedUser.UserName?.trim()) { return false; }
    if (!this.selectedUser.UserEmail?.trim()) { return false; }
    if (!this.selectedUser.UserRole?.trim()) { return false; }
    return true;
  }

  // -------------- SNACK BAR HELPERS --------------
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
