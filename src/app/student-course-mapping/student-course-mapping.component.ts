import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { StudentCourseService } from './student-course-mapping.service';
import { LoaderService } from '../shared/loader.service';
import { LoaderComponent } from '../shared/loader.component';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';

@Component({
  selector: 'app-student-course-mapping',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoaderComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './student-course-mapping.component.html',
  styleUrls: ['./student-course-mapping.component.scss'],
})
export class StudentCourseMappingComponent implements OnInit, OnDestroy {
  Math = Math;
  mappingForm!: FormGroup;

  // dropdown data
  students: any[] = [];
  courses: any[] = [];
  courseFilterList: any[] = [];
  studentFilterList: any[] = [];

  // selected for multi-select
  selectedStudents: any[] = [];
  selectedCourses: any[] = [];

  // dropdown UI
  studentsDropdownOpen = false;
  coursesDropdownOpen = false;
  studentSearch = '';
  courseSearch = '';
  @ViewChild('studentSearchInput')
  studentSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('courseSearchInput')
  courseSearchInput!: ElementRef<HTMLInputElement>;

  onStudentSearch(value: string): void {
    this.studentSearch = (value || '').toString();
    const q = this.studentSearch?.toLowerCase() || '';
    this.studentFilterList = this.students.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
    );
    console.log('this.studentFilterList: ', this.studentFilterList);
  }

  onCourseSearch(value: string): void {
    this.courseSearch = (value || '').toString();
    const q = this.courseSearch?.toLowerCase() || '';
    this.courseFilterList = this.courses.filter((c) => (c.name || '').toLowerCase().includes(q));
    this.cd.detectChanges();
  }

  // table data
  mappings: any[] = [];
  filteredMappings: any[] = [];
  pagedMappings: any[] = [];

  // ui states
  submitted = false;
  editMode = false;
  selectedId!: number;

  // pagination
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // search
  searchText = '';
  activeSearchColumn: string | null = null;
  columnFilters: any = {};

  // modal
  showConfirmModal = false;
  confirmMode: 'delete' | 'save' = 'delete';
  modalTitle = '';
  modalMessage = '';
  confirmText = '';
  deleteItem: any;

  // toast
  toastVisible = false;
  toastMessage = '';

  constructor(
    private fb: FormBuilder,
    private service: StudentCourseService,
    private loader: LoaderService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (isPlatformBrowser(this.platformId)) {
      this.loadStudents();
      this.loadCourses();
      this.loadMappings();
    }
  }

  /* ================= FORM ================= */

  initForm(): void {
    this.mappingForm = this.fb.group({
      studentIds: [[], Validators.required],
      courseIds: [[], Validators.required],
    });

  }

  submit(): void {
    this.submitted = true;

    // validate that at least one student and one course is selected
    if (!this.selectedStudents.length || !this.selectedCourses.length) {
      return;
    }

    this.modalTitle = this.editMode ? 'Update Mapping' : 'Assign Courses';
    this.modalMessage = this.editMode
      ? 'Are you sure you want to update this mapping?'
      : 'Are you sure you want to assign the selected courses to the selected students?';
    this.confirmText = this.editMode ? 'Update' : 'Assign';
    this.confirmMode = 'save';
    this.showConfirmModal = true;
  }

  confirmSave(): void {
    const payload = {
      studentIds: this.selectedStudents.map((s) => s.id),
      courseIds: this.selectedCourses.map((c) => c.id),
      flag: 'save',
    };

    this.loader.show();

    this.service.save(payload).subscribe({
      next: () =>
        this.success(
          this.editMode
            ? 'Mapping updated successfully'
            : 'Courses assigned successfully'
        ),
      error: (err: any) => {
        console.error('Save error', err);
        this.loader.hide();
      },
    });
  }

  resetForm(): void {
    this.mappingForm.reset({ studentIds: [], courseIds: [] });
    this.selectedStudents = [];
    this.selectedCourses = [];
    this.studentsDropdownOpen = false;
    this.coursesDropdownOpen = false;
    this.submitted = false;
    this.editMode = false;
    this.selectedId = 0;
  }

  edit(item: any): void {
    this.editMode = true;
    this.selectedId = item.id;

    // set selected arrays from this grouped mapping
    const s = this.students.find(
      (st) => String(st.id) === String(item.student_id)
    );
    this.selectedStudents = s ? [s] : [];

    // item may have course_ids (array). map to course objects from loaded courses
    const selectedCourses = (item.course_ids || [])
      .map((cid: any) =>
        this.courses.find((co) => String(co.id) === String(cid))
      )
      .filter(Boolean);
    this.selectedCourses = selectedCourses as any[];

    this.mappingForm.patchValue({
      studentIds: this.selectedStudents.map((s) => s.id),
      courseIds: this.selectedCourses.map((c) => c.id),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ================= DELETE ================= */

  deleteMapping(item: any): void {
    this.deleteItem = item;
    this.confirmMode = 'delete';
    this.modalTitle = 'Remove Courses';
    this.modalMessage =
      'Are you sure you want to remove the selected courses for this student?';
    this.confirmText = 'Delete';
    this.showConfirmModal = true;
  }

  confirmDelete(): void {
    this.loader.show();
    // backend accepts delete via save endpoint with flag 'delete'
    const payload = {
      studentIds: [this.deleteItem.student_id],
      courseIds: this.deleteItem.course_ids || [],
      flag: 'delete',
    };
    this.service.save(payload).subscribe({
      next: () => this.success('Mapping removed successfully'),
      error: (err: any) => {
        console.error('Delete error', err);
        this.loader.hide();
      },
    });
  }

  confirmModalAction(): void {
    if (this.confirmMode === 'save') {
      this.confirmSave();
    } else {
      this.confirmDelete();
    }
  }

  /* ================= MULTI-SELECT HELPERS ================= */

  toggleStudentsDropdown(): void {
    if (this.editMode) return; // disable changing students while editing
    this.studentsDropdownOpen = !this.studentsDropdownOpen;
    if (this.studentsDropdownOpen) {
      this.coursesDropdownOpen = false;
      // clear search so all students are visible when opening
      this.studentSearch = '';

      this.studentFilterList = [...this.students];
      // focus the search input so the list is visible and keyboard can be used
      setTimeout(() => this.studentSearchInput?.nativeElement?.focus(), 0);
    }
  }

  toggleCoursesDropdown(): void {
    this.coursesDropdownOpen = !this.coursesDropdownOpen;
    if (this.coursesDropdownOpen) {
      this.studentsDropdownOpen = false;
      // clear search so all courses are visible when opening
      this.courseSearch = '';

      this.courseFilterList = [...this.courses];

      setTimeout(() => this.courseSearchInput?.nativeElement?.focus(), 0);
    }
  }

  // filteredStudents(): any[] {
  //   const q = this.studentSearch?.toLowerCase() || '';
  //   return this.students.filter(
  //     (s) =>
  //       (s.name || '').toLowerCase().includes(q) ||
  //       (s.email || '').toLowerCase().includes(q)
  //   );
  // }

  // filteredCourses(): any[] {
  //   const q = this.courseSearch?.toLowerCase() || '';
  //   return this.courses.filter((c) => (c.name || '').toLowerCase().includes(q));
  // }

  isStudentSelected(s: any): boolean {
    return this.selectedStudents.some((x) => x.id === s.id);
  }

  isCourseSelected(c: any): boolean {
    return this.selectedCourses.some((x) => x.id === c.id);
  }

  toggleStudentSelection(s: any): void {
    if (this.isStudentSelected(s)) {
      this.selectedStudents = this.selectedStudents.filter(
        (x) => x.id !== s.id
      );
    } else {
      this.selectedStudents = [...this.selectedStudents, s];
    }
    this.mappingForm.patchValue({
      studentIds: this.selectedStudents.map((x) => x.id),
    });
  }

  toggleCourseSelection(c: any): void {
    if (this.isCourseSelected(c)) {
      this.selectedCourses = this.selectedCourses.filter((x) => x.id !== c.id);
    } else {
      this.selectedCourses = [...this.selectedCourses, c];
    }
    this.mappingForm.patchValue({
      courseIds: this.selectedCourses.map((x) => x.id),
    });
  }

  removeSelectedStudent(s: any): void {
    if (this.editMode) return; // do not allow removing student while editing
    this.selectedStudents = this.selectedStudents.filter((x) => x.id !== s.id);
    this.mappingForm.patchValue({
      studentIds: this.selectedStudents.map((x) => x.id),
    });
  }

  removeSelectedCourse(c: any): void {
    this.selectedCourses = this.selectedCourses.filter((x) => x.id !== c.id);
    this.mappingForm.patchValue({
      courseIds: this.selectedCourses.map((x) => x.id),
    });
  }

  cancelModal(): void {
    this.showConfirmModal = false;
  }

  /* ================= LOAD DATA ================= */
  loadStudents(): void {
    this.service.getStudents().subscribe((res: any[]) => {
      this.students = res;
    });
  }

  loadCourses(): void {
    this.service.getCourses().subscribe((res: any[]) => {
      this.courses = res;
    });
  }

  loadMappings(): void {
    this.loader.show();
    this.service.getAll().subscribe((res: any[]) => {
      // backend returns grouped data per student (row.courses is a JSON string)
      const grouped: any[] = [];

      res.forEach((row: any) => {
        let courses: any[] = [];
        try {
          courses =
            typeof row.courses === 'string'
              ? JSON.parse(row.courses)
              : row.courses || [];
        } catch (e) {
          courses = row.courses || [];
        }

        const courseNames = courses.map((c: any) => c.name).filter(Boolean);
        const courseIds = courses.map((c: any) => c.id).filter(Boolean);

        grouped.push({
          id: row.student_id,
          student_id: row.student_id,
          student_name: row.name || row.student_name || '',
          course_names: courseNames.join(', '),
          course_ids: courseIds,
        });
      });

      this.mappings = grouped;
      this.applyFilters();
      this.loader.hide();
    });
  }

  /* ================= SEARCH ================= */

  filter(event: any): void {
    this.searchText = event.target.value.toLowerCase();
    this.applyFilters();
  }

  activateColumnSearch(column: string): void {
    this.activeSearchColumn = column;
  }

  onColumnSearch(column: string, event: any): void {
    this.columnFilters[column] = event.target.value.toLowerCase();
    this.applyFilters();
  }

  clearColumnSearch(column: string): void {
    delete this.columnFilters[column];
    this.activeSearchColumn = null;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredMappings = this.mappings.filter((item) => {
      const globalMatch =
        !this.searchText ||
        Object.values(item).join(' ').toLowerCase().includes(this.searchText);

      const columnMatch = Object.keys(this.columnFilters).every((key) =>
        item[key]?.toString().toLowerCase().includes(this.columnFilters[key])
      );

      return globalMatch && columnMatch;
    });

    this.totalItems = this.filteredMappings.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.changePage(1);
  }

  /* ================= PAGINATION ================= */

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedMappings = this.filteredMappings.slice(start, end);
  }

  changePageSize(size: any): void {
    const val =
      typeof size === 'object' && size?.target
        ? (size.target as HTMLInputElement).value
        : size;
    this.pageSize = +val;
    this.changePage(1);
  }

  ngOnDestroy(): void {
    // no-op for now; included to satisfy OnDestroy contract
  }

  /* ================= UTILS ================= */

  success(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 3000);

    this.showConfirmModal = false;
    this.resetForm();
    this.loadMappings();
    this.loader.hide();
  }
}
