import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { UserService, User } from './user.service';  // <-- You'll create a user.service
// If you have a role-check in the frontend, you can also import AuthService, etc.

@Component({
  selector: 'app-user-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatSnackBarModule],
  templateUrl: './user-maintenance.component.html',
  styleUrls: ['./user-maintenance.component.scss']
})
export class UserMaintenanceComponent implements OnInit {

  // 1) Columns for our drag-and-drop grid
  columns = [
    { header: 'Name', field: 'UserName' },
    { header: 'Email', field: 'UserEmail' },
    { header: 'Role', field: 'UserRole' },
  ];

  // 2) The array of users from the backend
  users: User[] = [];

  // 3) Track if the user has tried to create/update (for inline errors)
  hasSubmitted = false;

  // 4) The user record being edited
  selectedUser: Partial<User> = {
    UserID: undefined,
    UserName: '',
    UserEmail: '',
    UserRole: 'STANDARD',
    UserPassword: ''  // Only required when creating a new user
  };

  // Provide some user roles for the dropdown
  userRoles = ['ADMIN', 'SUPERVISOR', 'STANDARD'];

  // For dynamic columns in the grid
  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllUsers();
  }

  // -------------- DRAG & DROP --------------
  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  onDragEntered(event: any) {
    event.container.element.nativeElement.classList.add('cdk-drag-over');
  }
  onDragExited(event: any) {
    event.container.element.nativeElement.classList.remove('cdk-drag-over');
  }

  // -------------- LOAD --------------
  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        // response is the entire JSON { success, status, message, data: [...] }
        this.users = response.data; // pick out the actual array
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });    
  }  

  // -------------- SELECT --------------
  selectUser(u: User): void {
    // Copy so that table is not updated immediately
    this.selectedUser = { ...u };
  }

  // -------------- CREATE --------------
  addUser(): void {
    this.hasSubmitted = true;

    // If required fields missing => warn, skip
    if (!this.isValidForCreate()) {
      this.showWarning('User Name, Email, Role, and Password are required for new user!');
      return;
    }

    this.userService.createUser(this.selectedUser).subscribe({
      next: (created) => {
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

    // If required fields missing => warn, skip
    if (!this.isValidForUpdate()) {
      this.showWarning('User Name, Email, and Role are required to update!');
      return;
    }

    const id = this.selectedUser.UserID;
    this.userService.updateUser(id, this.selectedUser).subscribe({
      next: () => {
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

  // -------------- UTILITY --------------
  // Return the correct cell value for each row/column
  getCellValue(row: User, column: { header: string; field: string }): any {
    return (row as any)[column.field] || '';
  }

  trackByUserID(index: number, item: User) {
    return item.UserID;
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

  // Validate required fields for CREATE
  private isValidForCreate(): boolean {
    // Must have name, email, role, password
    if (!this.selectedUser.UserName?.trim()) return false;
    if (!this.selectedUser.UserEmail?.trim()) return false;
    if (!this.selectedUser.UserRole?.trim()) return false;
    if (!this.selectedUser.UserPassword?.trim()) return false;
    return true;
  }

  // Validate required fields for UPDATE
  private isValidForUpdate(): boolean {
    // Must have name, email, role
    if (!this.selectedUser.UserName?.trim()) return false;
    if (!this.selectedUser.UserEmail?.trim()) return false;
    if (!this.selectedUser.UserRole?.trim()) return false;
    // Password is optional for update => skip check
    return true;
  }

  trackByColumn(index: number, column: { header: string; field: string }): string {
    // Use the field name as a unique ID
    return column.field;
  }

  // -------------- SNACK BAR HELPERS --------------
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
