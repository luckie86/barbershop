import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BarbersComponent } from "./barbers/barbers.component";
import { SuccessComponent } from './success/success.component';

const routes: Routes = [
  { path: 'barbers', component: BarbersComponent },
  { path: 'success', component: SuccessComponent },
  { path: '**', redirectTo: 'barbers' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
