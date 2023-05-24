import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { EmployeeService } from '../employee.service';
import { Employee } from '../employee';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';


@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})

export class EmployeeComponent implements OnInit {
  dataSaved = false;
  employeeForm: any;
  allEmployees: Observable<Employee[]>;
  dataSource: MatTableDataSource<Employee>;
  selection = new SelectionModel<Employee>(true, []);
  employeeIdUpdate = null;
  massage = null;
  SelectedDate = null;
  isMale = true;
  isFeMale = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  displayedColumns: string[] = ['select', 'nombre', 'apellido', 'fechanacimiento', 'dni', 'Edit', 'Delete'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private formbulider: UntypedFormBuilder, private employeeService: EmployeeService, private _snackBar: MatSnackBar, public dialog: MatDialog) {
    this.employeeService.getAllEmployee().subscribe(data => {     
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngOnInit() {
    this.employeeForm = this.formbulider.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      fechanacimiento: ['', [Validators.required]],
      dni: ['', Validators.compose([Validators.required, Validators.pattern('[0-9]{8}')])]
    });
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = !!this.dataSource && this.dataSource.data.length;
    return numSelected === numRows;
  }

 /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(r => this.selection.select(r));
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row: Employee): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
  
  DeleteData() {
    const numSelected = this.selection.selected;
    if (numSelected.length > 0) {
      if (confirm("Estas seguro de eliminar ")) {
        this.employeeService.deleteData(numSelected).subscribe(result => {
          this.SavedSuccessful(2);
          this.loadAllEmployees();
        })
      }
    } else {
      alert("Selecciona almenos una fila");
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadAllEmployees() {
    this.employeeService.getAllEmployee().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  onFormSubmit() {
    this.dataSaved = false;
    const employee = this.employeeForm.value;
    this.CreateEmployee(employee);
    this.employeeForm.reset();
  }

  loadEmployeeToEdit(employeeId: string) {
    this.employeeService.getEmployeeById(employeeId).subscribe(employee => {
      this.massage = null;
      this.dataSaved = false;
      this.employeeIdUpdate = employee.id;
      this.employeeForm.controls['nombre'].setValue(employee.nombre);
      this.employeeForm.controls['apellido'].setValue(employee.apellido);
      this.employeeForm.controls['fechanacimiento'].setValue(employee.fechanacimiento);
      this.employeeForm.controls['dni'].setValue(employee.dni);
    });

  }
  CreateEmployee(employee: Employee) {
    if (this.employeeIdUpdate == null) {
      this.employeeService.createEmployee(employee).subscribe(
        () => {
          this.dataSaved = true;
          this.SavedSuccessful(1);
          this.loadAllEmployees();
          this.employeeIdUpdate = null;
          this.employeeForm.reset();
        }
      );
    } else {
      employee.id = this.employeeIdUpdate;
      console.log(employee);
      
      this.employeeService.updateEmployee(employee).subscribe(() => {
        this.dataSaved = true;
        this.SavedSuccessful(0);
        this.loadAllEmployees();
        this.employeeIdUpdate = null;
        this.employeeForm.reset();
      });
    }
  }
  deleteEmployee(employeeId: string) {
    if (confirm("Estas seguro de que quieres eliminar ?")) {
      this.employeeService.deleteEmployeeById(employeeId).subscribe(() => {
        this.dataSaved = true;
        this.SavedSuccessful(2);
        this.loadAllEmployees();
        this.employeeIdUpdate = null;
        this.employeeForm.reset();

      });
    }

  }

  resetForm() {
    this.employeeForm.reset();
    this.massage = null;
    this.dataSaved = false;
    this.isMale = true;
    this.isFeMale = false;
    this.loadAllEmployees();
  }

  SavedSuccessful(isUpdate) {
    if (isUpdate == 0) {
      this._snackBar.open('Registro actualizado correctamente!', 'Close', {
        duration: 2000,
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
      });
    } 
    else if (isUpdate == 1) {
      this._snackBar.open('Registro guardado!', 'Close', {
        duration: 2000,
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
      });
    }
    else if (isUpdate == 2) {
      this._snackBar.open('Registro eliminado!', 'Close', {
        duration: 2000,
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
      });
    }
  }
}
