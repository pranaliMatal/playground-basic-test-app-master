import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  loadTime;

  constructor(
    private httpClient: HttpClient
  ) { }

  getPatients() {
    let startTime = new Date().getTime();
    return this.httpClient.get(environment.queryURI + '/Patient',
      { headers: this.getHeaders() }).pipe(
        map(data => {
          this.loadTime = new Date().getTime() - startTime;
          return this.getPatientsData(data);
        })
      );
  }

  getPatientsWithinDOBRange(from, to) {
    let startTime = new Date().getTime();
    return this.httpClient.get(environment.queryURI + `/Patient/?birthdate=ge${from}&birthdate=le${to}`,
      { headers: this.getHeaders() }).pipe(
        map(data => {
          this.loadTime = new Date().getTime() - startTime;
          return this.getPatientsData(data);
        })
      );
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/fhir+json'
    });
    return headers;
  }

  searchPatients(name, dob) {
    let startTime = new Date().getTime();
    return this.httpClient.get(environment.queryURI + `/Patient?birthdate=${dob}&name=${name}`,
      { headers: this.getHeaders() }).pipe(
        map(data => {
          this.loadTime = new Date().getTime() - startTime;
          return this.getPatientsData(data);
        })
      );
  }

  getPatientsData(data) {
    let patientsList = [];
    let resources = data['entry'] || [];

    resources.forEach((res, index) => {
      let resource = res.resource || {};
      if (resource.name && resource.name.length) {
        patientsList[index] = resource;
      }
    });

    return patientsList;
  }

  getPatientFullName(patNameArray) {
    let fullName = '';
    let officialNameObj = patNameArray && patNameArray.length ? patNameArray[0] : null;

    if (officialNameObj) {
      if (officialNameObj.text) {
        fullName = officialNameObj.text;
      }
      else {
        let givenName = officialNameObj.given && officialNameObj.given.length ? officialNameObj.given.join(' ') + ' ' : '';
        let prefix = officialNameObj.prefix && officialNameObj.prefix.length ? officialNameObj.prefix.join(' ') + ' ' : '';

        fullName = prefix + givenName + officialNameObj.family;
      }
    }

    return fullName;
  }

}