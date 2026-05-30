import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Employee } from '../../models/dashboard.models';

@Component({
  selector: 'app-top-employees',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-employees.component.html'
})
export class TopEmployeesComponent {
  employees = input.required<Employee[]>();
}
