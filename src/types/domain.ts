export interface TimelineItem {
  time: string;
  title: string;
}

export interface EventInfo {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  location: string;
  /** ISO 8601 instants. */
  startsAt: string;
  endsAt: string;
  minContribution: number;
  registrationOpen: boolean;
  votingOpen: boolean;
  musicOpen: boolean;
  memoriesOpen: boolean;
  timeline: TimelineItem[];
}

/** Returned only after the student's signed session is verified. */
export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  registrationCode: string;
}
