import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

import { CourseService } from './course.service';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { Course } from './course.model';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';
import { LoaderService } from '../shared/loader.service';
import { LoaderComponent } from '../shared/loader.component';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ConfirmModalComponent, LoaderComponent],
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss'],
})
export class CourseComponent implements OnInit {
  courseForm!: FormGroup;
  submitted = false;

   instructors: User[] = [];
  courses: Course[] = [];
  filteredCourses: Course[] = [];

  // Pagination
  pageSizeOptions = [5, 10, 15, 25, 50];
  pageSize = 15;
  currentPage = 1;

  editMode = false;
  selectedId!: number;

  public Math = Math;

  /* =========================
     CONFIRM MODAL STATE
  ========================= */
  showConfirmModal = false;
  confirmMode: 'save' | 'delete' = 'save';

  modalTitle = '';
  modalMessage = '';
  confirmText = '';

  courseToDelete!: Course;

  // Toast notification
  toastMessage = '';
  toastVisible = false;
  toastTimeout: any;

  /** 🔍 Column search state */
  activeSearchColumn: string | null = null;
  columnSearchValues: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private userService: UserService,
    private loader: LoaderService
  ) {}

  /* =========================
     INIT
  ========================= */
  ngOnInit(): void {
    this.initForm();
    this.loadCourses();
    this.loadInstructors();
  }

  /* =========================
     FORM INIT
  ========================= */
  initForm(): void {
    this.courseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10), this.wordLimitValidator(50)]],
      studentLimit: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      instructorId: ['', Validators.required],
      type: ['MANDATORY', Validators.required],
      status: ['ACTIVE', Validators.required],
    });
  }

  /** Validator factory to enforce a maximum number of words in a control's value. */
  private wordLimitValidator(maxWords: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const v = control.value;
      if (v == null || v === '') return null;
      const words = String(v).trim().split(/\s+/).filter(Boolean);
      return words.length > maxWords ? { maxWords: { requiredWords: maxWords, actualWords: words.length } } : null;
    };
  }

  /* =========================
     LOAD COURSES
  ========================= */
  loadCourses(): void {
    this.loader.show();
    this.courseService.getAll().subscribe({
      next: (res) => {
        // sort courses so most recently created appear first
        this.courses = this.sortCoursesByCreated(res);
        this.filteredCourses = [...this.courses];
        this.currentPage = 1;
        this.loader.hide();
      },
      error: (err) => {
        console.error('Error loading courses', err);
        this.loader.hide();
      },
    });
  }

  /**
   * Sort courses by a created timestamp if available (descending).
   * Supports common field names like created_at, createdAt, createdDate, created.
   * Falls back to `id` descending when no date field is present.
   */
  private sortCoursesByCreated(courses: Course[]): Course[] {
    const dateKeys = ['created_at', 'createdAt', 'createdDate', 'created_on', 'created'];

    const getTime = (c: any): number => {
      for (const k of dateKeys) {
        if (c && c[k]) {
          const t = Date.parse(c[k]);
          if (!isNaN(t)) return t;
        }
      }
      // fallback to numeric id (newer ids assumed larger)
      if (c && (c.id || c.id === 0)) return Number(c.id) || 0;
      return 0;
    };

    return courses.slice().sort((a, b) => getTime(b as any) - getTime(a as any));
  }

  loadInstructors(): void {
    this.loader.show();
    this.userService.getUsersByType('INSTRUCTOR').subscribe({
      next: (data) => {
        this.instructors = data;
        this.loader.hide();
      },
      error: (err) => {
        console.error('Error loading instructors', err);
        this.loader.hide();
      },
    });
  }

  /* =========================
     CREATE / UPDATE (WITH CONFIRM)
  ========================= */
  submit(): void {
    this.submitted = true;
    this.courseForm.markAllAsTouched();

    if (this.courseForm.invalid) return;

    // Directly save on submit for create/update (no confirmation modal)
    this.confirmSave();
  }

  confirmSave(): void {
    const raw = this.courseForm.getRawValue();

    // Trim string fields to avoid saving leading/trailing whitespace
    const name = (raw.name ?? '').toString().trim();
    const description = (raw.description ?? '').toString().trim();

    // If name becomes empty after trim, mark as error and abort save
    if (!name) {
      this.courseForm.get('name')?.setErrors({ whitespace: true });
      return;
    }

    // Validate description after trimming: prevent whitespace-only and enforce minlength
    if (!description) {
      this.courseForm.get('description')?.setErrors({ whitespace: true });
      return;
    }

    if (description.length < 10) {
      this.courseForm.get('description')?.setErrors({ minlength: { requiredLength: 10, actualLength: description.length } });
      return;
    }

    // Enforce word limit (50 words)
    const descWords = description.split(/\s+/).filter(Boolean);
    if (descWords.length > 50) {
      this.courseForm.get('description')?.setErrors({ maxWords: { requiredWords: 50, actualWords: descWords.length } });
      return;
    }

    const payload = {
      ...raw,
      name,
      description,
      studentLimit: Number(raw.studentLimit),
      instructorId: Number(raw.instructorId),
      id: this.editMode ? this.selectedId : null,
    };

    this.loader.show();
    this.courseService.save(payload).subscribe({
      next: (res) => {
        if (res.success) {
          const wasEdit = this.editMode;
          this.resetForm();
          this.loadCourses();
          this.showConfirmModal = false;
          // show toast depending on whether we were editing
          this.showToast(wasEdit ? 'Course updated successfully' : 'Course created successfully');
        }
        this.loader.hide();
      },
      error: (err) => {
        console.error('Error saving course', err);
        this.loader.hide();
      },
    });
  }

  showToast(message: string, duration = 3000): void {
    this.toastMessage = message;
    this.toastVisible = true;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toastVisible = false;
    }, duration);
  }

  /* =========================
     EDIT
  ========================= */
  edit(course: Course): void {
    this.editMode = true;
    this.selectedId = course.id!;

    this.courseForm.patchValue({
      name: course.name,
      description: course.description,
      studentLimit: course.student_limit,
      instructorId: course.instructor_id,
      type: course.type,
      status: course.status,
    });

    this.courseForm.get('name')?.disable();
    // this.courseForm.get('description')?.disable();
  }

  /* =========================
     DELETE (WITH CONFIRM)
  ========================= */
  deleteCourse(course: Course): void {
    this.courseToDelete = course;

    this.confirmMode = 'delete';
    this.modalTitle = 'Delete Course';
    this.modalMessage = 'Are you sure you want to delete this course?';
    this.confirmText = 'Delete';

    this.showConfirmModal = true;
  }

  confirmDelete(): void {
    const course = this.courseToDelete;

    const payload: Course = {
      id: course.id,
      name: course.name,
      description: course.description,
      student_limit: course.student_limit,
      instructor_id: course.instructor_id,
      type: course.type,
      status: 'DELETED',
    };

    this.loader.show();
    this.courseService.save(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadCourses();
          this.showConfirmModal = false;
        }
        this.loader.hide();
      },
      error: (err) => {
        console.error('Error deleting course', err);
        this.loader.hide();
      },
    });
  }

  cancelModal(): void {
    this.showConfirmModal = false;
  }

  /* =========================
     GLOBAL SEARCH
  ========================= */
  filter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCourses = this.courses.filter((course) =>
      Object.values(course).join(' ').toLowerCase().includes(value)
    );
    this.currentPage = 1;
  }

  /* =========================
     COLUMN SEARCH
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
    this.filteredCourses = this.courses.filter((course) =>
      Object.keys(this.columnSearchValues).every((key) => {
        const searchValue = this.columnSearchValues[key];
        return (
          !searchValue ||
          String((course as any)[key])
            .toLowerCase()
            .includes(searchValue)
        );
      })
    );
    this.currentPage = 1;
  }

  clearColumnSearch(column: string): void {
    delete this.columnSearchValues[column];
    this.activeSearchColumn = null;
    this.filteredCourses = [...this.courses];
    this.currentPage = 1;
  }

  // Pagination helpers
  get totalItems(): number {
    return this.filteredCourses.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pagedCourses(): Course[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCourses.slice(start, start + this.pageSize);
  }

  changePage(page: string | number): void {
    let p = Number(page);
    if (isNaN(p) || p < 1) p = 1;
    if (p > this.totalPages) p = this.totalPages;
    this.currentPage = p;
  }

  changePageSize(size: string | number): void {
    this.pageSize = Number(size);
    this.currentPage = 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  /* =========================
     RESET FORM
  ========================= */
  resetForm(): void {
    this.editMode = false;
    this.selectedId = undefined as any;
    this.submitted = false;

    this.courseForm.enable();
    this.courseForm.reset({
      type: 'MANDATORY',
      status: 'ACTIVE',
    });
  }
}
