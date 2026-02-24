import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';

import { UserService } from './user.service';
import { User } from './user.model';
import { LoaderService } from '../shared/loader.service';
import { LoaderComponent } from '../shared/loader.component';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule, // ✅ ngIf, ngFor, ngClass
    ReactiveFormsModule, // ✅ formGroup
    FormsModule, // ✅ ngModel
    LoaderComponent, // ✅ <app-loader>
    ConfirmModalComponent, // ✅ <app-confirm-modal>
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  userForm!: FormGroup;
  users: User[] = [];
  pagedUsers: User[] = [];
  filteredUsers: User[] = [];

  editMode = false;
  selectedId?: number;
  submitted = false;

  activeSearchColumn: string | null = null;
  columnSearchValues: { [key: string]: string } = {};

  public Math = Math;
  userToDelete?: User;

  // pagination
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 20];

  // modal
  showConfirmModal = false;
  confirmMode: 'delete' | 'save' = 'save';
  modalTitle = '';
  modalMessage = '';
  confirmText = '';

  // toast
  toastVisible = false;
  toastMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
    }
  }

  initForm() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: [
        '',
        [Validators.required, Validators.minLength(6), noWhitespaceValidator],
      ],
      role: ['STUDENT'],
      status: ['ACTIVE'],
    });
  }

  private sortUsersByCreated(users: User[]): User[] {
    const dateKeys = [
      'created_at',
      'createdAt',
      'createdDate',
      'created_on',
      'created',
    ];

    const getTime = (u: any): number => {
      for (const k of dateKeys) {
        if (u && u[k]) {
          const t = Date.parse(u[k]);
          if (!isNaN(t)) return t;
        }
      }

      // fallback → newer ID first
      if (u && (u.id || u.id === 0)) {
        return Number(u.id) || 0;
      }

      return 0;
    };

    // newest first
    return users.slice().sort((a, b) => getTime(b) - getTime(a));
  }

  loadUsers(): void {
    this.userService.getUsersByType('ALL').subscribe((res) => {

      // 🔥 sort newest users first
      const sorted = this.sortUsersByCreated(res);

      this.users = sorted;
      this.filteredUsers = [...sorted];

      this.totalItems = sorted.length;
      this.currentPage = 1;
      this.calculatePages();
    });
  }


  /* =========================
   COLUMN SEARCH (USER)
========================= */
  activateColumnSearch(column: string): void {
    this.activeSearchColumn = column;
  }

  onColumnSearch(column: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.columnSearchValues[column] = value;
    this.applyColumnFilters();
  }

  applyColumnFilters(): void {
    this.filteredUsers = this.users.filter((user) =>
      Object.keys(this.columnSearchValues).every((key) => {
        const searchValue = this.columnSearchValues[key];
        return (
          !searchValue ||
          String((user as any)[key] ?? '')
            .toLowerCase()
            .includes(searchValue)
        );
      })
    );

    this.currentPage = 1;
    this.totalItems = this.filteredUsers.length;
    this.calculatePages();
  }

  clearColumnSearch(column: string): void {
    delete this.columnSearchValues[column];
    this.activeSearchColumn = null;
    this.filteredUsers = [...this.users];
    this.totalItems = this.filteredUsers.length;
    this.calculatePages();
  }

  filter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredUsers = this.users.filter((user) =>
      Object.values(user).join(' ').toLowerCase().includes(value)
    );

    this.currentPage = 1;
    this.totalItems = this.filteredUsers.length;
    this.calculatePages();
  }

  submit(): void {
    this.submitted = true;
    this.userForm.markAllAsTouched();

    if (this.editMode) {
      // password not required in edit
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }

    if (this.userForm.invalid) return;

    this.confirmSave();
  }

  confirmSave(): void {
    const raw = this.userForm.getRawValue();

    console.log('Raw form values:', raw);
    // ===== TRIM STRINGS =====
    const name = (raw.name ?? '').toString().trim();
    const email = (raw.email ?? '').toString().trim();
    const password = (raw.password ?? '').toString();

    // ===== NAME VALIDATION =====
    if (!name) {
      this.userForm.get('name')?.setErrors({ whitespace: true });
      return;
    }

    // ===== EMAIL VALIDATION =====
    if (!email) {
      this.userForm.get('email')?.setErrors({ required: true });
      return;
    }

    // ===== PHONE VALIDATION =====
    if (!/^[6-9]\d{9}$/.test(raw.phone)) {
      this.userForm.get('phone')?.setErrors({ invalidPhone: true });
      return;
    }

    // ===== PASSWORD VALIDATION (ONLY ON CREATE) =====
    if (!this.editMode) {
      if (!password) {
        this.userForm.get('password')?.setErrors({ required: true });
        return;
      }

      if (password.length < 6) {
        this.userForm.get('password')?.setErrors({
          minlength: { requiredLength: 6, actualLength: password.length },
        });
        return;
      }

      if (/\s/.test(password)) {
        this.userForm.get('password')?.setErrors({ whitespace: true });
        return;
      }
    }

    // ===== PAYLOAD =====
    const payload: User = {
      id: this.editMode ? this.selectedId : undefined,
      name,
      email,
      phone: raw.phone,
      password: raw.password,
      role: raw.role,
      status: raw.status
    };

    // ===== SAVE =====
    this.userService.save(payload).subscribe({
      next: () => {
        const wasEdit = this.editMode;
        this.resetForm();
        this.loadUsers();
        this.toast(
          wasEdit ? 'User updated successfully' : 'User created successfully'
        );
      },
      error: (err) => {
        console.error('Error saving user', err);
      },
    });
  }

  edit(u: User) {
    console.log('Editing user:', u);
    this.editMode = true;
    this.selectedId = u.id;

    this.userForm.patchValue({
      name: u.name,
      email: u.email,
      password: u.password,
      phone: u.phone,
      role: (u.role || '').toString().toUpperCase(),
      status: (u.status || '').toString().toUpperCase()
    });

    this.userForm.get('role')?.setValue((u.role || '').toString().toUpperCase());
    this.userForm.get('status')?.setValue((u.status || '').toString().toUpperCase());
  }

  deleteUser(u: User): void {
    this.userToDelete = u;

    this.confirmMode = 'delete';
    this.modalTitle = 'Delete User';
    this.modalMessage = 'Are you sure you want to delete this user?';
    this.confirmText = 'Delete';
    this.showConfirmModal = true;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    const payload: User = {
      ...this.userToDelete,
      status: 'DELETED',
    };

    this.userService.save(payload).subscribe({
      next: () => {
        this.loadUsers();
        this.toast('User deleted successfully');
        this.showConfirmModal = false;
        this.userToDelete = undefined;
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.showConfirmModal = false;
      },
    });
    this.resetForm();
  }

  resetForm(): void {
    this.userForm.reset({
      role: 'STUDENT',
      status: 'ACTIVE',
    });

    this.userForm.get('password')?.enable();
    this.userForm
      .get('password')
      ?.setValidators([
        Validators.required,
        Validators.minLength(6),
        noWhitespaceValidator,
      ]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.editMode = false;
    this.submitted = false;
    this.selectedId = undefined;
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    // Allow digits only and max 10 characters
    input.value = input.value.replace(/\D/g, '').slice(0, 10);

    this.userForm.get('phone')?.setValue(input.value, { emitEvent: false });
  }

  calculatePages() {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    this.pagedUsers = this.filteredUsers.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.calculatePages();
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.calculatePages();
  }

  toast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 2500);
  }

  cancelModal() {
    this.showConfirmModal = false;
  }
}

export function noWhitespaceValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value || '';
  return value.includes(' ') ? { whitespace: true } : null;
}
