import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class BarbersService {

  constructor(private http: HttpClient) { }

  getAppointments() {
    return this.http.get(environment.ROUTES.APPOINTMENTS_ROUTE);
  }

  getBarbers() {
    return this.http.get(environment.ROUTES.BARBERS_ROUTE);
  }
  
  getServices() {
    return this.http.get(environment.ROUTES.SERVICES_ROUTE);
  }

  getWorkHours() {
    return this.http.get(environment.ROUTES.WORK_HOURS_ROUTE);
  }

}
