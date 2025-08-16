import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

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
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './user-maintenance.component.html',
  styleUrls: ['./user-maintenance.component.scss']
})
export class UserMaintenanceComponent implements OnInit {
  columns: { header: string; field: string }[] = [
    { header: 'Full Name', field: 'userFullName' },
    { header: 'Email', field: 'userEmail' },
    { header: 'Roles', field: 'roles' }
  ];

  users: UserDto[] = [];
  hasSubmitted: boolean = false;
  selectedUser: Partial<UserDto> & { password?: string } = {
    userFullName: '',
    userEmail: '',
    roles: [],
    password: ''
  };
  
  selectedRoles: Map<string, boolean> = new Map<string, boolean>();
  allRoles: string[] = ['ADMIN', 'SUPERVISOR', 'STANDARD'];
  uiMode: 'view' | 'editing' = 'view';

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

  onDrop(event: CdkDragDrop<{ header: string; field: string }[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  onDragEntered(event: CdkDragEnter): void {
    const element = event.container.element.nativeElement;
    element.classList.add('cdk-drag-over');
  }

  onDragExited(event: CdkDragExit): void {
    const element = event.container.element.nativeElement;
    element.classList.remove('cdk-drag-over');
  }

  get gridTemplateColumns(): string {
    return this.columns.map(() => 'auto').join(' ');
  }

  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: UserDto[]) => {
        this.users = users;
      },
      error: (err: any) => {
        console.error('Failed to load users:', err);
        this.showError('Failed to load users. Please try again.');
      }
    });
  }

  selectUser(user: UserDto): void {
    this.selectedUser = { ...user, password: '' };
    this.updateSelectedRoles(user.roles || []);
    this.hasSubmitted = false;
    this.uiMode = 'editing';
  }

  addUser(): void {
    this.hasSubmitted = true;
    const payload = this.preparePayload();
    if (!this.isValidForCreate(payload)) {
      this.showWarning('Full Name, Email, Roles, and Password are required.');
      return;
    }

    this.userService.createUser(payload).subscribe({
      next: (user: UserDto) => {
        this.showInfo(`${payload.userFullName} has been added`);
        this.loadAllUsers();
        this.resetFormAndMode();
      },
      error: (err: any) => this.handleError(err, 'creating')
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
      next: (user: UserDto) => {
        this.showInfo(`${payload.userFullName} modified`);
        this.loadAllUsers();
        this.resetFormAndMode();
      },
      error: (err: any) => this.handleError(err, 'updating')
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
            this.loadAllUsers();
            this.resetFormAndMode();
          },
          error: (err: any) => this.handleError(err, 'deleting')
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
      userFullName: this.selectedUser.userFullName || '',
      userEmail: this.selectedUser.userEmail || '',
      roles
    };

    if (this.selectedUser.password) {
      payload.password = this.selectedUser.password;
    }
    return payload;
  }

  private resetForm(): void {
    this.selectedUser = {
      userFullName: '',
      userEmail: '',
      roles: [],
      password: ''
    };
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

  getCellValue(row: UserDto, column: { field: string }): string {
    const value = (row as any)[column.field];
    return Array.isArray(value) ? value.join(', ') : (value || '');
  }

  trackByUserID(_index: number, item: UserDto): number {
    return item.id;
  }

  trackByColumn(_index: number, column: { field: string }): string {
    return column.field;
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

  private handleError(err: any, action: string): void {
    console.error(`Failed to ${action} user:`, err);
    this.showError(`Fatal error ${action} user! Please contact support.`);
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showWarning(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 7000 });
  }
}