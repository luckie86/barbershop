export interface Appointment {
    id: number;
    startDate: number;
    barberId: number;
    serviceId: number;
}

export interface Barber {
    id: number;
    firstName: string;
    lastName: string;
    workHours: WorkHours[];
}

interface WorkHours {
    id: number;
    day: number;
    startHour: number;
    endHour: string;
    lunchTime: LunchTime;
}

interface LunchTime {
    startHour: number;
    durationMinutes: number;
}