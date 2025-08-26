import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UserService } from './user.service';
import { UserDto } from '@app/shared/models';
import { DataTableComponent } from '../data-table/data-table.component';
import { UserMaintenanceEditDialogComponent } from '../user-maintenance-edit-dialog/user-maintenance-edit-dialog.component';

@Component({
  selector: 'app-user-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatDialogModule, DataTableComponent],
  templateUrl: './user-maintenance.component.html',
  styleUrls: ['./user-maintenance.component.scss']
})
export class UserMaintenanceComponent implements OnInit {
  columns = [
    { header: 'Full Name', field: 'userFullName' },
    { header: 'Email', field: 'userEmail' },
    { header: 'Roles', field: 'roles' }
  ];

  users: UserDto[] = [];

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  private getData<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    return Array.isArray(res.data) ? res.data : [];
  }

  isArray(prop: any): boolean {
    return Array.isArray(prop);
  }

  ngOnInit(): void {
    this.loadAllUsers();
  }

  private mapUserData(users: UserDto[]): any[] {
    if (!Array.isArray(users)) {
      return [];
    }
    return users.map(user => ({
      ...user,
      roles: user.roles?.join(', ') || ''
    }));
  }

  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = this.mapUserData(this.getData<UserDto>(users));
      },
      error: () => {
        this.showError('Failed to load users. Please try again.');
        this.users = [];
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserMaintenanceEditDialogComponent, {
      data: {},
      panelClass: 'orange-dialog'
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadAllUsers();
      }
    });
  }

  openEditDialog(user: UserDto): void {
    const dialogRef = this.dialog.open(UserMaintenanceEditDialogComponent, {
      data: user,
      panelClass: 'orange-dialog'
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadAllUsers();
      }
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