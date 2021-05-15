import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../app/services/api-service.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import Utils from './utils/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'fhir-app-test';
  headers = ['name', 'DOB', 'gender'];
  dataSource: MatTableDataSource<[]>;
  searchForm: FormGroup;

  private _search: Subject<any>;

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private _dateTime: DatePipe
  ) {
    this._search = new Subject();
    this.dataSource = new MatTableDataSource<[]>();

  }

  ngOnInit() {

    this.searchForm = this.createForm();
    const searchClickdeDebounced = this._search.pipe(debounceTime(500));
    searchClickdeDebounced.subscribe(() => {
      this.searchPatient();
    });

    let fromDate = 1960, toDate = 1965;
    this.apiService.getPatientsWithinDOBRange(fromDate, toDate).subscribe(
      data => {
        this.dataSource.data = data;
      }
    )

  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  sortData(sort: MatSort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'date': return Utils.compare(a['birthDate'], b['birthDate'], isAsc);
        default: return 0;
      }
    });
  }

  getName(patNameArray) {
    return this.apiService.getPatientFullName(patNameArray);
  }

  searchPatient() {
    let name = this.patientName.value;
    let formattedDOB = this._dateTime.transform(this.patientDOB.value, 'yyyy-MM-dd');
    this.apiService.searchPatients(name, formattedDOB).subscribe(
      data => {
        this.dataSource.data = data;
      },
      error => {
        this.dataSource.data = [];
      }
    )
  }

  search() {
    this._search.next();
  }

  createForm(): FormGroup {
    let namePattern = "^[a-zA-Z\.'-]*$";
    let datePattern = '^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$';
    return this.formBuilder.group({
      patientName: ['', [Validators.required, Validators.pattern(namePattern)]],
      patientDOB: ['', [Validators.required]]
    });

  }

  get patientName() {
    return this.searchForm.get('patientName');
  }

  get patientDOB() {
    return this.searchForm.get('patientDOB');
  }

  get loadTime() {
    return this.apiService.loadTime;
  }

  ngOnDestroy() {
    this._search.unsubscribe();
  }

}