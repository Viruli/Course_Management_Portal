// Mock data — mirrors src/CMP/src/data.jsx (typed for TS)

import type {
  Course, StudentInfo, AdminInfo, Registration, Enrolment, Admin,
  AuditEntry, Notification, Lesson, BuilderCourse, AppUser,
} from './types';

export const COURSES: Course[] = [
  { id: 'math', kind: 'math', emblem: 'Calculator',     tag: 'Mathematics',     title: 'Mathematics Foundations',    short: 'Algebra · Geometry · Stats',         lessons: 12, time: '4h 20m', progress: 65, instructor: 'Dr. Anjali Silva',      students: 482, rating: 4.8 },
  { id: 'sci',  kind: 'sci',  emblem: 'FlaskConical',   tag: 'Science',         title: 'Science Essentials',         short: 'Bio · Chem · Physics',               lessons: 15, time: '5h 10m', progress: 28, instructor: 'Prof. Ravi Tennakoon',  students: 318, rating: 4.7 },
  { id: 'lit',  kind: 'lit',  emblem: 'BookOpen',       tag: 'Language Arts',   title: 'Reading & Writing Intensive', short: 'Comprehension & composition',       lessons: 10, time: '3h 50m', progress: 0,  instructor: 'Saman Perera',          students: 264, rating: 4.6 },
  { id: 'soc',  kind: 'soc',  emblem: 'Landmark',       tag: 'Social Studies',  title: 'Social Studies Survey',      short: 'History · Civics · Economics',       lessons: 11, time: '4h 00m', progress: 0,  instructor: 'Nadeesha Fernando',     students: 189, rating: 4.5 },
  { id: 'lang', kind: 'lang', emblem: 'Languages',      tag: 'Languages',       title: 'Business English',           short: 'Workplace communication',            lessons: 14, time: '6h 15m', progress: 0,  instructor: 'Tharushi Jayawardena',  students: 412, rating: 4.9 },
  { id: 'cs',   kind: 'cs',   emblem: 'Terminal',       tag: 'Computing',       title: 'Intro to Programming',       short: 'Python fundamentals',                lessons: 16, time: '7h 40m', progress: 0,  instructor: 'Sahan Wijeratne',       students: 521, rating: 4.8 },
];

export const STUDENT: StudentInfo = {
  name: 'Anjali Silva',
  email: 'anjali.silva@edupath.lk',
  initials: 'AS',
  joined: 'Joined March 2026',
  enrolled: 4,
  hours: 23,
  streak: 7,
};

export const ADMIN_USER: AdminInfo = {
  name: 'Sahan Wijeratne',
  email: 'sahan.w@edupath.lk',
  role: 'Admin',
};

export const SUPER: AdminInfo = {
  name: 'Dilani Rajapakse',
  email: 'dilani.r@edupath.lk',
  role: 'Super Admin',
};

export const REGISTRATIONS: Registration[] = [
  { id: 'r1', name: 'Anjali Silva',      email: 'anjali.silva@edupath.lk',  when: '2 min ago',  status: 'pending' },
  { id: 'r2', name: 'Ravi Tennakoon',    email: 'r.tennakoon@edupath.lk',   when: '12 min ago', status: 'pending' },
  { id: 'r3', name: 'Saman Perera',      email: 'saman.p@edupath.lk',       when: '1 h ago',    status: 'pending' },
  { id: 'r4', name: 'Nadeesha Fernando', email: 'nadeesha.f@edupath.lk',    when: '2 h ago',    status: 'pending' },
  { id: 'r5', name: 'Tharushi Jay.',     email: 'tharushi@edupath.lk',      when: 'Yesterday',  status: 'pending' },
  { id: 'r6', name: 'Kasun Bandara',     email: 'kasun.b@edupath.lk',       when: 'Yesterday',  status: 'pending' },
  { id: 'r7', name: 'Imal de Silva',     email: 'imal.d@edupath.lk',        when: '2 days ago', status: 'approved' },
  { id: 'r8', name: 'Praveen Madhushan', email: 'praveen.m@edupath.lk',     when: '3 days ago', status: 'rejected' },
];

export const ENROLMENTS: Enrolment[] = [
  { id: 'e1', name: 'Ravi Tennakoon', course: 'Mathematics Foundations', when: '8 min ago',  status: 'pending' },
  { id: 'e2', name: 'Anjali Silva',   course: 'Science Essentials',      when: '15 min ago', status: 'pending' },
  { id: 'e3', name: 'Saman Perera',   course: 'Reading & Writing',       when: '40 min ago', status: 'pending' },
  { id: 'e4', name: 'Nadeesha F.',    course: 'Social Studies Survey',   when: '2 h ago',    status: 'pending' },
  { id: 'e5', name: 'Imal de Silva',  course: 'Business English',        when: 'Yesterday',  status: 'approved' },
];

export const ADMINS: Admin[] = [
  { id: 'a1', name: 'Sahan Wijeratne',   email: 'sahan.w@edupath.lk',   joined: 'Jan 2026', courses: 8, status: 'active' },
  { id: 'a2', name: 'Tharushi Jay.',     email: 'tharushi@edupath.lk',  joined: 'Feb 2026', courses: 5, status: 'active' },
  { id: 'a3', name: 'Kasun Bandara',     email: 'kasun.b@edupath.lk',   joined: 'Mar 2026', courses: 3, status: 'active' },
  { id: 'a4', name: 'Praveen Madhushan', email: 'praveen.m@edupath.lk', joined: 'Apr 2026', courses: 0, status: 'pending' },
  { id: 'a5', name: 'Imal de Silva',     email: 'imal.d@edupath.lk',    joined: 'Apr 2026', courses: 0, status: 'pending' },
];

export const AUDIT: AuditEntry[] = [
  { id: 'l1', who: 'Sahan Wijeratne',  what: 'Approved enrolment',       target: 'Anjali Silva → Mathematics Foundations', when: '2 min ago',  ico: 'CheckCircle', tone: 'success' },
  { id: 'l2', who: 'Sahan Wijeratne',  what: 'Approved registration',    target: 'Ravi Tennakoon',                          when: '12 min ago', ico: 'UserCheck',   tone: 'success' },
  { id: 'l3', who: 'Tharushi Jay.',    what: 'Published course',         target: 'Business English · v2',                   when: '1 h ago',    ico: 'BookOpen',    tone: 'info' },
  { id: 'l4', who: 'Dilani Rajapakse', what: 'Invited admin',            target: 'praveen.m@edupath.lk',                    when: '3 h ago',    ico: 'ShieldPlus',  tone: 'info' },
  { id: 'l5', who: 'Sahan Wijeratne',  what: 'Rejected enrolment',       target: 'Praveen M. → Science Essentials',         when: 'Yesterday',  ico: 'XCircle',     tone: 'warning' },
  { id: 'l6', who: 'System',           what: 'Failed sign-in × 12',      target: 'IP 203.94.180.21',                        when: 'Yesterday',  ico: 'AlertTriangle', tone: 'warning' },
  { id: 'l7', who: 'Dilani Rajapakse', what: 'Updated platform settings',target: 'Email templates',                         when: '2 days ago', ico: 'Settings',    tone: 'info' },
];

export const NOTIFS_STUDENT: Notification[] = [
  { id: 'n1', ico: 'CheckCircle', tone: 'success', title: 'Enrolment approved',  body: 'Mathematics Foundations · Lesson 1 is ready.',   when: '12 min ago', read: false },
  { id: 'n2', ico: 'CheckCircle', tone: 'success', title: 'Enrolment approved',  body: 'Science Essentials · You can start anytime.',    when: 'Yesterday',  read: false },
  { id: 'n3', ico: 'Clock',       tone: 'warning', title: 'Enrolment pending',   body: 'Reading & Writing Intensive · Awaiting approval.', when: '2 days ago', read: true },
  { id: 'n4', ico: 'Flame',       tone: 'success', title: '7-day streak!',        body: "You've studied 7 days in a row. Keep it up.",    when: '3 days ago', read: true },
  { id: 'n5', ico: 'Megaphone',   tone: 'info',    title: 'New course added',    body: 'Business English is now in the catalog.',         when: '5 days ago', read: true },
];

export const NOTIFS_ADMIN: Notification[] = [
  { id: 'na1', ico: 'UserPlus',      tone: 'info', title: 'New registration',  body: 'Anjali Silva is awaiting sign-up approval.',  when: '2 min ago', read: false },
  { id: 'na2', ico: 'ClipboardList', tone: 'info', title: 'Enrolment request', body: 'Ravi T. → Mathematics Foundations.',          when: '8 min ago', read: false },
  { id: 'na3', ico: 'UserPlus',      tone: 'info', title: 'New registration',  body: 'Saman Perera is awaiting sign-up approval.',  when: '1 h ago',   read: false },
];

export const SAMPLE_USERS: AppUser[] = [
  // Super admin
  { uid: 'u-1', name: 'Dilani Rajapakse', email: 'dilani.r@edupath.lk',  role: 'super',   status: 'active',    joined: 'Jan 2026', managesCourses: 0, lastActive: '5 min ago' },

  // Active admins
  { uid: 'u-2', name: 'Sahan Wijeratne',   email: 'sahan.w@edupath.lk',   role: 'admin',   status: 'active',    joined: 'Jan 2026', managesCourses: 8, lastActive: '2 min ago' },
  { uid: 'u-3', name: 'Tharushi Jayawardena', email: 'tharushi@edupath.lk', role: 'admin', status: 'active',    joined: 'Feb 2026', managesCourses: 5, lastActive: '1 h ago' },
  { uid: 'u-4', name: 'Kasun Bandara',     email: 'kasun.b@edupath.lk',   role: 'admin',   status: 'active',    joined: 'Mar 2026', managesCourses: 3, lastActive: 'Yesterday' },

  // Pending admin invites
  { uid: 'u-5', name: 'Praveen Madhushan', email: 'praveen.m@edupath.lk', role: 'admin',   status: 'pending',   joined: 'Apr 2026', managesCourses: 0, lastActive: 'Never' },
  { uid: 'u-6', name: 'Imal de Silva',     email: 'imal.d@edupath.lk',    role: 'admin',   status: 'pending',   joined: 'Apr 2026', managesCourses: 0, lastActive: 'Never' },

  // Active students
  { uid: 'u-7', name: 'Anjali Silva',      email: 'anjali.silva@edupath.lk', role: 'student', status: 'active', joined: 'Mar 2026', enrolled: 4, lastActive: '12 min ago' },
  { uid: 'u-8', name: 'Ravi Tennakoon',    email: 'r.tennakoon@edupath.lk',  role: 'student', status: 'active', joined: 'Feb 2026', enrolled: 3, lastActive: '38 min ago' },
  { uid: 'u-9', name: 'Saman Perera',      email: 'saman.p@edupath.lk',      role: 'student', status: 'active', joined: 'Mar 2026', enrolled: 2, lastActive: '2 h ago' },
  { uid: 'u-10', name: 'Nadeesha Fernando',email: 'nadeesha.f@edupath.lk',   role: 'student', status: 'active', joined: 'Apr 2026', enrolled: 1, lastActive: 'Yesterday' },
  { uid: 'u-11', name: 'Kavindi Liyanage', email: 'kavindi.l@edupath.lk',    role: 'student', status: 'active', joined: 'Apr 2026', enrolled: 5, lastActive: '3 h ago' },
  { uid: 'u-12', name: 'Dinesh Pathirana', email: 'dinesh.p@edupath.lk',     role: 'student', status: 'active', joined: 'Mar 2026', enrolled: 2, lastActive: 'Yesterday' },

  // Pending sign-ups
  { uid: 'u-13', name: 'Hashini Wickramaratne', email: 'hashini.w@edupath.lk', role: 'student', status: 'pending', joined: '2 min ago',  enrolled: 0, lastActive: 'Just now' },
  { uid: 'u-14', name: 'Yasith Senanayake',     email: 'yasith.s@edupath.lk',  role: 'student', status: 'pending', joined: '12 min ago', enrolled: 0, lastActive: 'Just now' },

  // Suspended account
  { uid: 'u-15', name: 'Banu Karunaratne', email: 'banu.k@edupath.lk',    role: 'student', status: 'suspended', joined: 'Jan 2026', enrolled: 0, lastActive: '12 days ago' },
];

// Sample fully-structured course used by student curriculum view + as
// a starting template when editing an existing course.
export const SAMPLE_BUILDER_COURSE: BuilderCourse = {
  id: 'math',
  title: 'Mathematics Foundations',
  coverImageUrl: '',
  type: 'Mathematics',
  description:
    'A practical, paced introduction to algebra, geometry and statistics. ' +
    "You'll cover slope-intercept form, solving for x, and graphing — " +
    'with worked examples drawn from past practice papers.',
  semesters: [
    {
      id: 'sem-1',
      name: 'Semester 1',
      subjects: [
        {
          id: 'sub-1-1',
          title: 'Number Sense & Operations',
          lessons: [
            { id: 'l-1-1-1', title: 'Place value and integers',     description: 'Understanding number positions and operations on integers.', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', attachments: [
              { id: 'at-1', name: 'Place value worksheet', kind: 'pdf', size: '312 KB' },
            ] },
            { id: 'l-1-1-2', title: 'Order of operations',           description: 'BODMAS / PEMDAS and how to evaluate complex expressions.', url: '', attachments: [] },
            { id: 'l-1-1-3', title: 'Negative numbers in real life', description: 'Temperature, debt, and elevation examples.', url: '', attachments: [] },
          ],
        },
        {
          id: 'sub-1-2',
          title: 'Fractions, Decimals & Percents',
          lessons: [
            { id: 'l-1-2-1', title: 'Converting between forms',  description: 'Move between fractions, decimals and percentages confidently.', url: '', attachments: [] },
            { id: 'l-1-2-2', title: 'Operations with fractions', description: 'Add, subtract, multiply and divide fractions.',                   url: '', attachments: [] },
          ],
        },
      ],
    },
    {
      id: 'sem-2',
      name: 'Semester 2',
      subjects: [
        {
          id: 'sub-2-1',
          title: 'Algebra: Linear Equations',
          lessons: [
            { id: 'l-2-1-1', title: 'Slope-intercept form',     description: 'y = mx + b and how to graph any line.',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', attachments: [
              { id: 'at-2', name: 'Lesson 8 · Practice quiz', kind: 'pdf', size: '10 questions' },
            ] },
            { id: 'l-2-1-2', title: 'Solving for x',            description: 'Isolate variables using inverse operations.',     url: '', attachments: [] },
            { id: 'l-2-1-3', title: 'Word problems → equations', description: 'Translate everyday situations into linear equations.', url: '', attachments: [] },
          ],
        },
        {
          id: 'sub-2-2',
          title: 'Geometry Foundations',
          lessons: [
            { id: 'l-2-2-1', title: 'Points, lines and angles', description: 'The building blocks of geometric reasoning.', url: '', attachments: [] },
            { id: 'l-2-2-2', title: 'Triangle properties',      description: 'Sum of angles, types of triangles, congruence.', url: '', attachments: [] },
          ],
        },
      ],
    },
  ],
};

export const LESSON: Lesson = {
  course: 'Mathematics Foundations',
  title: 'Algebra: Linear Equations',
  number: 'Lesson 8 of 12',
  duration: '14:32',
  progress: 65,
  desc: "Linear equations are the backbone of algebra. In this lesson you'll cover slope-intercept form, solving for x, and graphing — with worked examples drawn from past practice papers.",
  curriculum: [
    { id: 's1', title: 'Number Sense & Operations',     status: 'done',   time: '12:08' },
    { id: 's2', title: 'Fractions, Decimals, Percents', status: 'done',   time: '15:21' },
    { id: 's3', title: 'Algebra: Linear Equations',     status: 'active', time: '14:32' },
    { id: 's4', title: 'Algebra: Inequalities',         status: 'todo',   time: '11:50' },
    { id: 's5', title: 'Geometry Foundations',          status: 'todo',   time: '13:15' },
    { id: 's6', title: 'Measurement',                   status: 'locked', time: '9:42' },
    { id: 's7', title: 'Data & Statistics',             status: 'locked', time: '12:55' },
  ],
  materials: [
    { ico: 'FileText', name: 'Linear Equations · Worksheet', size: 'PDF · 312 KB' },
    { ico: 'FilePen',  name: 'Lesson 8 · Practice quiz',     size: '10 questions' },
    { ico: 'Video',    name: 'Worked example · Slope form',  size: 'MP4 · 4 min' },
  ],
};
