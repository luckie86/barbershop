// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  IMAGE: "https://i.imgur.com/rFNRx0N.jpg",
  ROUTES: {
    BARBERS_ROUTE: "http://localhost:3000/barbers",
    APPOINTMENTS_ROUTE: "http://localhost:3000/appointments",
    WORK_HOURS_ROUTE: "http://localhost:3000/workHours",
    SERVICES_ROUTE: "http://localhost:3000/services"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
