// Mock domain types — mirrors the prototype's data.jsx shape, no API contract.

export type CourseKind = 'math' | 'sci' | 'lit' | 'soc' | 'lang' | 'cs';

export interface Course {
  id: string;
  kind: CourseKind;
  emblem: string;
  tag: string;
  title: string;
  short: string;
  lessons: number;
  time: string;
  progress: number;
  instructor: string;
  students: number;
  rating: number;
}

export interface StudentInfo {
  name: string;
  email: string;
  initials: string;
  joined: string;
  enrolled: number;
  hours: number;
  streak: number;
}

export interface AdminInfo {
  name: string;
  email: string;
  role: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'active';

export interface Registration {
  id: string;
  name: string;
  email: string;
  when: string;
  status: ApprovalStatus;
}

export interface Enrolment {
  id: string;
  name: string;
  course: string;
  when: string;
  status: ApprovalStatus;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  joined: string;
  courses: number;
  status: ApprovalStatus;
}

export type AuditTone = 'success' | 'info' | 'warning';

export interface AuditEntry {
  id: string;
  who: string;
  what: string;
  target: string;
  when: string;
  ico: string;
  tone: AuditTone;
}

export type NotifTone = 'success' | 'warning' | 'info';

export interface Notification {
  id: string;
  ico: string;
  tone: NotifTone;
  title: string;
  body: string;
  when: string;
  read: boolean;
}

export type LessonStatus = 'done' | 'active' | 'todo' | 'locked';

export interface LessonItem {
  id: string;
  title: string;
  status: LessonStatus;
  time: string;
}

export interface LessonMaterial {
  ico: string;
  name: string;
  size: string;
}

export interface Lesson {
  course: string;
  title: string;
  number: string;
  duration: string;
  progress: number;
  desc: string;
  curriculum: LessonItem[];
  materials: LessonMaterial[];
}

export type Role = 'public' | 'student' | 'admin' | 'super';

// ─── User management (Super Admin only) ──────────────────────────────────

export type AppRole = 'student' | 'admin' | 'super';
export type AccountStatus = 'pending' | 'active' | 'suspended';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: AppRole;
  status: AccountStatus;
  joined: string;        // human-readable join date
  enrolled?: number;     // for students
  managesCourses?: number; // for admins
  lastActive: string;    // "2 min ago", etc.
}

// ─── Nested course hierarchy (admin authoring + student curriculum) ─────

export type CourseType =
  | 'Engineering' | 'Science' | 'Mathematics' | 'Language Arts'
  | 'Social Studies' | 'Computing' | 'Business' | 'Creative';

export interface BuilderAttachment {
  id: string;
  name: string;
  kind: 'pdf' | 'doc' | 'video' | 'image' | 'other';
  size: string;
}

export interface BuilderLesson {
  id: string;
  title: string;
  description: string;
  url: string;           // any video URL (YouTube, Vimeo, etc.) — was youtubeUrl
  attachments: BuilderAttachment[];
}

export interface BuilderSubject {
  id: string;
  title: string;
  lessons: BuilderLesson[];
}

export interface BuilderSemester {
  id: string;
  name: string;
  subjects: BuilderSubject[];
}

export interface BuilderCourse {
  id: string;
  title: string;
  type: CourseType;
  description: string;
  semesters: BuilderSemester[];
}
