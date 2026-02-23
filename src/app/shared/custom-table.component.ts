import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-wrapper">
      <table class="table" *ngIf="data && data.length > 0">
        <thead>
          <tr>
            <th *ngFor="let col of columns">{{ col.header }}</th>
            <th *ngIf="tableType">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data">
            <td *ngFor="let col of columns">{{ row[col.field] }}</td>
            <td *ngIf="tableType">
              <button class="btn-edit">Edit</button>
              <button class="btn-delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!data || data.length === 0" class="no-data">
        No data available
      </div>
    </div>
  `,
  styles: [`
    .table-wrapper {
      width: 100%;
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }

    .table th,
    .table td {
      border: 1px solid var(--border-color);
      padding: 12px;
      text-align: left;
    }

    .table th {
      background: var(--secondary-color);
      color: white;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
    }

    .table tbody tr:hover {
      background: var(--link-hover-bg);
    }

    .table td {
      color: var(--text-color);
      font-size: 14px;
    }

    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: var(--label-color);
      opacity: 0.6;
      font-size: 14px;
    }

    .btn-edit {
      background-color: var(--success-color);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-right: 8px;
    }

    .btn-edit:hover {
      opacity: 0.8;
    }

    .btn-delete {
      background-color: var(--danger-color);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .btn-delete:hover {
      opacity: 0.8;
    }
  `]
})
export class CustomTableComponent {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() tableType: string = '';
}
