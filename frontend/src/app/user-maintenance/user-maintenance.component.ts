import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { UserService } from './user.service';
import { UserDto, UserUpsertDto } from './user.dto';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-user-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  templateUrl: './user-maintenance.component.html',
  styleUrls: ['./user-maintenance.component.scss']
})
export class UserMaintenanceComponent implements OnInit {
  columns = [
    { header: 'User Name', field: 'userName' },
    { header: 'Email', field: 'userEmail' },
    { header: 'Roles', field: 'roles' },
  ];

  users: UserDto[] = [];
  hasSubmitted = false;
  selectedUser: Partial<UserDto> & { password?: string } = {};
  
  selectedRoles = new Map<string, boolean>();
  allRoles = ['ADMIN', 'SUPERVISOR', 'STANDARD'];
  uiMode: 'view' | 'editing' = 'view';

  // --- ADD THIS GETTER ---
  // This public getter allows the template to safely check the number of selected roles.
  public get selectedRolesCount(): number {
    return Array.from(this.selectedRoles.values()).filter(isSelected => isSelected).length;
  }

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadAllUsers();
    this.resetForm();
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => { this.users = users; },
      error: (err) => { console.error('Failed to load users:', err); }
    });
  }

  selectUser(user: UserDto): void {
    this.selectedUser = { ...user, password: '' };
    this.updateSelectedRoles(user.roles);
    this.hasSubmitted = false;
    this.uiMode = 'editing';
  }

  addUser(): void {
    this.hasSubmitted = true;
    const payload = this.preparePayload();
    if (!this.isValidForCreate(payload)) {
      this.showWarning('User Name, Email, Roles, and Password are required.');
      return;
    }

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.showInfo(`${payload.userName} has been added`);
        this.loadAllUsers();
        this.resetFormAndMode();
      },
      error: (err) => this.handleError(err, 'creating')
    });
  }

  modifyUser(): void {
    if (!this.selectedUser.id) return;
    this.hasSubmitted = true;
    const payload = this.preparePayload();
    if (!this.isValidForUpdate(payload)) {
      this.showWarning('User Name, Email, and Roles are required.');
      return;
    }

    this.userService.updateUser(this.selectedUser.id, payload).subscribe({
      next: () => {
        this.showInfo(`${payload.userName} modified`);
        this.loadAllUsers();
        this.resetFormAndMode();
      },
      error: (err) => this.handleError(err, 'updating')
    });
  }

  deleteUser(): void {
    if (!this.selectedUser.id || !this.selectedUser.userName) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you wish to delete user "${this.selectedUser.userName}"?` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.userService.deleteUser(this.selectedUser.id!).subscribe({
          next: () => {
            this.showInfo('User deleted');
            this.loadAllUsers();
            this.resetFormAndMode();
          },
          error: (err) => this.handleError(err, 'deleting')
        });
      }
    });
  }

  cancel(): void {
    this.resetFormAndMode();
  }

  private preparePayload(): UserUpsertDto {
    const roles = Array.from(this.selectedRoles.entries())
      .filter(([_, isSelected]) => isSelected)
      .map(([roleName, _]) => roleName);

    const payload: UserUpsertDto = {
      userName: this.selectedUser.userName || '',
      userEmail: this.selectedUser.userEmail || '',
      roles: roles
    };

    if (this.selectedUser.password) {
      payload.password = this.selectedUser.password;
    }
    return payload;
  }

  private resetForm(): void {
    this.selectedUser = { userName: '', userEmail: '', password: '' };
    this.updateSelectedRoles(['STANDARD']);
    this.hasSubmitted = false;
  }

  private resetFormAndMode(): void {
    this.resetForm();
    this.uiMode = 'view';
  }
  
  private updateSelectedRoles(roles: string[]): void {
    this.selectedRoles.clear();
    this.allRoles.forEach(role => {
      this.selectedRoles.set(role, roles.includes(role));
    });
  }

  getCellValue(row: UserDto, column: { field: string }): any {
    const value = (row as any)[column.field];
    return Array.isArray(value) ? value.join(', ') : value;
  }
  
  trackByUserID(index: number, item: UserDto): number { return item.id; }
  trackByColumn(index: number, column: { field: string }): string { return column.field; }

  private isValidForCreate(payload: UserUpsertDto): boolean {
    return !!(payload.userName?.trim() && payload.userEmail?.trim() && payload.roles.length > 0 && payload.password?.trim());
  }

  private isValidForUpdate(payload: UserUpsertDto): boolean {
    return !!(payload.userName?.trim() && payload.userEmail?.trim() && payload.roles.length > 0);
  }

  private handleError(err: any, action: string): void {
    console.error(`Failed to ${action} user:`, err);
    this.showError(`Fatal error ${action} user! Please contact support.`);
  }

  private showInfo(message: string): void { this.snackBar.open(message, 'Close', { duration: 3000 }); }
  private showWarning(message: string): void { this.snackBar.open(message, 'Close', { duration: 3000 }); }
  private showError(message: string): void { this.snackBar.open(message, 'Close', { duration: 7000 }); }
}
