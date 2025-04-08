import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UserService, User } from './user.service';

@Component({
  selector: 'app-user-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule],
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

  // The currently selected (or new) user.
  // Note: When editing an existing user, we clear out the UserPassword field.
  selectedUser: Partial<User> = {
    UserID: undefined,
    UserName: '',
    UserEmail: '',
    UserRole: 'STANDARD',
    UserPassword: '' // This will be cleared when an existing user is selected.
  };

  // Possible user roles for the dropdown
  userRoles = ['ADMIN', 'SUPERVISOR', 'STANDARD'];

  constructor(private userService: UserService, private snackBar: MatSnackBar) { }

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

  // Dynamically build grid CSS columns for each column in `this.columns`
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
    // Create a shallow copy of the selected user and clear the password
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
        this.showInfo(this.selectedUser.UserName + " has been added");
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
        this.showInfo(this.selectedUser.UserName + " modified");
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
    const id = this.selectedUser.UserID;
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

  // -------------- CANCEL --------------
  cancel(): void {
    this.resetForm();
  }

  // -------------- UTILITIES --------------
  // Return the correct cell value for the given user/column
  getCellValue(row: User, column: { header: string; field: string }): any {
    return (row as any)[column.field] || '';
  }

  trackByUserID(index: number, item: User): number {
    return item.UserID;
  }

  trackByColumn(index: number, column: { header: string; field: string }): string {
    return column.field;
  }

  // Reset the form state
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

  // Validate required fields for CREATE
  private isValidForCreate(): boolean {
    if (!this.selectedUser.UserName?.trim()) { return false; }
    if (!this.selectedUser.UserEmail?.trim()) { return false; }
    if (!this.selectedUser.UserRole?.trim()) { return false; }
    if (!this.selectedUser.UserPassword?.trim()) { return false; }
    return true;
  }

  // Validate required fields for UPDATE (password is optional)
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
