import { Component, OnInit } from '@angular/core';
import { BarbersService } from '../core/barbers.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from "moment";
import 'moment/locale/sl';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { slLocale } from 'ngx-bootstrap/locale';
defineLocale('sl', slLocale);
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

import { Appointment, Barber } from "../core/models";

@Component({
  selector: 'app-barbers',
  templateUrl: './barbers.component.html',
  styleUrls: ['./barbers.component.scss'],
  providers: []
})
export class BarbersComponent implements OnInit {

  appointments: [];
  barbers: [];
  services: [];
  workHours: [];
  locale = 'sl';
  selectedBarber = null;
  selectedService = null;
  selectedDate = null;
  selectedDateUnix = null;
  selectedStartDateTimeUnix = null;
  selectedEndDateTimeUnix = null;
  selectedTime = null;
  selectedWeekNumber = null;
  fetchedBarberWorkingHoursForSelectedDay = null;
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

  constructor(private barbersService: BarbersService, private localeService: BsLocaleService) { }

  ngOnInit(): void {
    this.localeService.use(this.locale);
    moment.locale("sl");

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

    this.barbersService.getAppointments().subscribe((response: []) => {
      this.appointments = response;
    });

    this.barbersService.getBarbers().subscribe((response: []) => {
      this.barbers = response;
    });

    this.barbersService.getServices().subscribe((response: []) => {
      this.services = response;
    });

    this.barbersService.getWorkHours().subscribe((response: []) => {
      this.workHours = response;
    });
  }

  onSelectService() {
    this.selectedService = this.selectService.value
  }

  onSelectBarber() {
    this.selectedBarber = this.selectBarber.value
  }

  onSelectDate(date) {
    if(!date) {
      return;
    } else {
      // Barber have to be selected first
      if (!this.selectedBarber){
        return alert ("Please select Barber and Service first");
      }

      let selectedWeekday = moment(date).weekday();
      this.barbersService.getBarbers().subscribe((fetchedBarbers: Barber) => {
        if (!fetchedBarbers[this.selectedBarber.id-1]['workHours'][selectedWeekday]) {
          return; // if barber not found
        }

        if (!fetchedBarbers[this.selectedBarber.id-1]['workHours']) {
          return; // if barber working hours not found
        }

        if (!fetchedBarbers[this.selectedBarber.id-1]['workHours'][selectedWeekday]) {
          return; // if barber working hours for selected weekday not found
        }
        this.fetchedBarberWorkingHoursForSelectedDay = fetchedBarbers[this.selectedBarber.id-1]['workHours'][selectedWeekday];
      });
      this.selectedDate = moment(date);
      this.selectedDateUnix = moment(date).unix();
    }
  } 

  onSelectTime(time) {
    if (!this.fetchedBarberWorkingHoursForSelectedDay) {
      return alert("Please select Date first");
    }
    
    this.selectedTime = moment(time).format("HH:mm");
    this.barbersForm.patchValue({'selectHour': this.selectedTime});
    
    // do it with unix
    const desiredTime = moment(time).format("HH:mm");
    const selectedHour = parseInt(desiredTime.split(':')[0]);

    const startHour = this.fetchedBarberWorkingHoursForSelectedDay.startHour
    const endHour = parseInt(this.fetchedBarberWorkingHoursForSelectedDay.endHour);

    const startLunchHour = this.fetchedBarberWorkingHoursForSelectedDay.lunchTime.startHour
    const endLunchHour = this.fetchedBarberWorkingHoursForSelectedDay.lunchTime.startHour 
    + this.fetchedBarberWorkingHoursForSelectedDay.lunchTime.durationMinutes / 60;

    // and check if selected TIME in working hours and not in lunch break
    if ((selectedHour >= startHour && selectedHour <= endHour) 
    && (selectedHour < startLunchHour || selectedHour > endLunchHour)) {
      const selectedTime = moment(time);
      this.selectedStartDateTimeUnix = moment(this.selectedDate)
        .add(selectedTime.hour(), "hours")
        .add(selectedTime.minute(), "minutes")
        .unix()
      this.selectedEndDateTimeUnix = moment.unix(this.selectedStartDateTimeUnix).add(this.selectedService.durationMinutes, "minutes").unix();
      
      console.log(moment.unix(this.selectedStartDateTimeUnix).format("DD.MM.YYYY HH:mm"), moment.unix(this.selectedEndDateTimeUnix).format("DD.MM.YYYY HH:mm"));
    
    }
  }

  onSubmit() {
    if (!this.selectedStartDateTimeUnix && !this.selectedEndDateTimeUnix) {
      return alert("Please select a time");
    } else {
      this.barbersService.getAppointments().subscribe((fetchedAppointments: Appointment[]) => {
        fetchedAppointments.forEach((appointment: Appointment) => {
          
          const fetchedAppointmentsStartTimeUnix = appointment.startDate
          const fetchedAppointmentsDurationMinutes = this.selectedService.durationMinutes;
          const fetchedAppointmentsEndTimeUnix = moment.unix(fetchedAppointmentsStartTimeUnix).add(fetchedAppointmentsDurationMinutes, "minutes").unix();

          if (false) {
            return alert("Appointment already taken");
          } else {
            const body = {
              startDate: this.selectedDateUnix,
              barberId: this.selectedBarber?.id,
              serviceId: this.selectedService?.id
            }
            this.barbersService.saveAppointment(body);
          }
        });
      });
    }
  }

}