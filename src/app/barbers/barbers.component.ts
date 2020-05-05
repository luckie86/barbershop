import { Component, OnInit } from '@angular/core';
import { BarbersService } from '../core/barbers.service';
import { DatePipe } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-barbers',
  templateUrl: './barbers.component.html',
  styleUrls: ['./barbers.component.scss'],
  providers: [DatePipe]
})
export class BarbersComponent implements OnInit {

  bsInlineValue: Date;
  currentTime;
  appointments: [];
  barbers: [];
  services: [];
  workHours: [];

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

  constructor(private barbersService: BarbersService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.bsInlineValue = null;
    this.currentTime = this.datePipe.transform(new Date(), "HH:mm");

    this.barbersForm = new FormGroup({
      'firstName': new FormControl(null, Validators.required),
      'lastName': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'contactNumber': new FormControl(null, [Validators.required, Validators.pattern(new RegExp("^(([0-9]{3})[ \-\/]?([0-9]{3})[ \-\/]?([0-9]{3}))|([0-9]{9})|([\+]?([0-9]{3})[ \-\/]?([0-9]{2})[ \-\/]?([0-9]{3})[ \-\/]?([0-9]{3}))$"))]),
      'selectBarber': new FormControl(null, Validators.required),
      'selectService': new FormControl(null, Validators.required),
      'selectDate': new FormControl(null, Validators.required),
      'selectHour': new FormControl(null, Validators.required),
      'price': new FormControl(null, Validators.required)
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

  onSubmit(){
    console.log(this.firstName);
  }

}
