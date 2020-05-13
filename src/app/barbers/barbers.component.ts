import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from "moment";
import 'moment/locale/sl';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { slLocale } from 'ngx-bootstrap/locale';
defineLocale('sl', slLocale);

import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BarbersService } from '../core/barbers.service';
import { Appointment, Barber, Service, WorkHours } from "../core/models";

@Component({
  selector: 'app-barbers',
  templateUrl: './barbers.component.html',
  styleUrls: ['./barbers.component.scss'],
  providers: []
})
export class BarbersComponent implements OnInit {

  barbers: Barber[];
  services: Service[];
  locale: string = 'sl';
  selectedBarber: Barber = null;
  selectedService: Service = null;
  selectedDate: moment.Moment = null;
  selectedStartDateTimeUnix: number = null;
  selectedEndDateTimeUnix: number = null;
  selectedTime: moment.MomentFormatSpecification = null;
  fetchedBarberWorkingHoursForSelectedDay: WorkHours = null;
  confirmedAppointment: boolean = false;
  barbersForm: FormGroup;

  get firstName() { return this.barbersForm.get('firstName'); }
  get lastName() { return this.barbersForm.get('lastName'); }
  get email() { return this.barbersForm.get('email'); }
  get contactNumber() { return this.barbersForm.get('contactNumber'); }
  get selectBarber() { return this.barbersForm.get('selectBarber'); }
  get selectService() { return this.barbersForm.get('selectService'); }
  get selectDate() { return this.barbersForm.get('selectDate'); }
  get selectHour() { return this.barbersForm.get('selectHour'); }
  get price() { return this.barbersForm.get('price'); }

  constructor(
    private barbersService: BarbersService, 
    private localeService: BsLocaleService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.localeService.use(this.locale);
    moment.locale(this.locale);

    this.barbersForm = new FormGroup({
      'firstName': new FormControl(null, Validators.required),
      'lastName': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'contactNumber': new FormControl(null, [Validators.required, Validators.pattern(new RegExp("^(([0-9]{3})[ \-\/]?([0-9]{3})[ \-\/]?([0-9]{3}))|([0-9]{9})|([\+]?([0-9]{3})[ \-\/]?([0-9]{2})[ \-\/]?([0-9]{3})[ \-\/]?([0-9]{3}))$"))]),
      'selectBarber': new FormControl(null, Validators.required),
      'selectService': new FormControl(null, Validators.required),
      'selectDate': new FormControl(null, Validators.required),
      'selectHour': new FormControl(null, Validators.required),
      'price': new FormControl(null)
    });

    this.barbersService.getBarbers().subscribe((response: Barber[]) => {
      this.barbers = response;
    });

    this.barbersService.getServices().subscribe((response: Service[]) => {
      this.services = response;
    });
  }

  onSelectBarber(): void {
    this.selectedBarber = this.selectBarber.value
  }

  onSelectService(): void {
    this.selectedService = this.selectService.value
  }

  onSelectDate(date): void {
    if(!date) {
      return;
    } else {
      // Barber has to be selected first
      if (!this.selectedBarber){
        return alert ("Please select Barber and Service first");
      }

      const selectedWeekday = moment(date).weekday();
      
      this.barbersService.getBarbers().subscribe((fetchedBarbers: Barber[]) => {
        // if barber not found
        if (!fetchedBarbers[this.selectedBarber.id-1]['workHours'][selectedWeekday]) {
          return; 
        }

        // if barbers working hours not found
        if (!fetchedBarbers[this.selectedBarber.id-1]['workHours']) {
          return; 
        }

        // if barbers working hours for selected weekday not found
        if (!fetchedBarbers[this.selectedBarber.id-1]['workHours'][selectedWeekday]) {
          return; 
        }
        
        this.fetchedBarberWorkingHoursForSelectedDay = fetchedBarbers[this.selectedBarber.id-1]['workHours'][selectedWeekday];
      });
      this.selectedDate = moment(date);
    }
  } 

  onSelectTime(time): void {
    // date has to be selected first
    if (!this.fetchedBarberWorkingHoursForSelectedDay) {
      return alert("Please select Date first");
    } else {

      const desiredTime = moment(time).format("HH:mm");
      const selectedHour = parseInt(desiredTime.split(':')[0]);

      const startHour = this.fetchedBarberWorkingHoursForSelectedDay.startHour
      const endHour = parseInt(this.fetchedBarberWorkingHoursForSelectedDay.endHour);

      const startLunchHour = this.fetchedBarberWorkingHoursForSelectedDay.lunchTime.startHour
      const endLunchHour = this.fetchedBarberWorkingHoursForSelectedDay.lunchTime.startHour 
      + this.fetchedBarberWorkingHoursForSelectedDay.lunchTime.durationMinutes / 60;

      // check if selected time is in working hours and not in lunch break
      if ((selectedHour >= startHour && selectedHour <= endHour) 
        && (selectedHour < startLunchHour || selectedHour > endLunchHour)) {
          
          const selectedTime = moment(time);
          
          this.selectedStartDateTimeUnix = moment(this.selectedDate)
            .add(selectedTime.hour(), "hours")
            .add(selectedTime.minute(), "minutes")
            .unix()
          
          this.selectedEndDateTimeUnix = moment.unix(this.selectedStartDateTimeUnix).add(this.selectedService.durationMinutes, "minutes").unix();
          this.selectedTime = moment(time).format("HH:mm");
          this.barbersForm.patchValue({'selectHour': this.selectedTime}); 
      } 
    }
  }

  onSubmit(): void {
    // startDateTime has to be confirmed first
    if (!this.selectedStartDateTimeUnix && !this.selectedEndDateTimeUnix) {
      
      return alert("Please select another time");
    } else {
      
      this.barbersService.getAppointments().subscribe((fetchedAppointments: Appointment[]) => {
        fetchedAppointments.forEach((appointment: Appointment) => {
          
          const fetchedAppointmentsStartTimeUnix = appointment.startDate
          const fetchedAppointmentsDurationMinutes = this.selectedService.durationMinutes;
          const fetchedAppointmentsEndTimeUnix = moment.unix(fetchedAppointmentsStartTimeUnix).add(fetchedAppointmentsDurationMinutes, "minutes").unix();

          // check if selectedDateTime is not between other appointments
          if ((this.selectedStartDateTimeUnix > fetchedAppointmentsStartTimeUnix || this.selectedStartDateTimeUnix < fetchedAppointmentsStartTimeUnix) 
            && (this.selectedEndDateTimeUnix > fetchedAppointmentsEndTimeUnix || this.selectedEndDateTimeUnix < fetchedAppointmentsEndTimeUnix)) {
             this.confirmedAppointment = true;
          } else {
            this.confirmedAppointment = false;

            return alert("Appointment already taken");
          }
        });
        if (this.confirmedAppointment) {
          
          const body = {
            startDate: this.selectedStartDateTimeUnix,
            barberId: this.selectedBarber?.id,
            serviceId: this.selectedService?.id
          }

          this.barbersService.saveAppointment(body).subscribe((response) => {
            console.log(response);
            if(response) {
              this.router.navigate(["/success"]);
            } else {

              return alert("Something went wrong");
            }
          });
        } else {

          return alert("Please pick another time");
        }
      });
    }
  }

}
