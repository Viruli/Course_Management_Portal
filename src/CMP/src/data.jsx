/* Shared sample data for the EduPath mobile app prototype. */

const COURSES = [
  { id: 'math', kind: 'math', emblem: 'calculator', tag: 'Mathematics',
    title: 'Mathematics Foundations', short: 'Algebra · Geometry · Stats',
    lessons: 12, time: '4h 20m', progress: 65, instructor: 'Dr. Anjali Silva',
    students: 482, rating: 4.8 },
  { id: 'sci', kind: 'sci', emblem: 'flask-conical', tag: 'Science',
    title: 'Science Essentials', short: 'Bio · Chem · Physics',
    lessons: 15, time: '5h 10m', progress: 28, instructor: 'Prof. Ravi Tennakoon',
    students: 318, rating: 4.7 },
  { id: 'lit', kind: 'lit', emblem: 'book-open', tag: 'Language Arts',
    title: 'Reading & Writing Intensive', short: 'Comprehension & composition',
    lessons: 10, time: '3h 50m', progress: 0, instructor: 'Saman Perera',
    students: 264, rating: 4.6 },
  { id: 'soc', kind: 'soc', emblem: 'landmark', tag: 'Social Studies',
    title: 'Social Studies Survey', short: 'History · Civics · Economics',
    lessons: 11, time: '4h 00m', progress: 0, instructor: 'Nadeesha Fernando',
    students: 189, rating: 4.5 },
  { id: 'lang', kind: 'lang', emblem: 'languages', tag: 'Languages',
    title: 'Business English', short: 'Workplace communication',
    lessons: 14, time: '6h 15m', progress: 0, instructor: 'Tharushi Jayawardena',
    students: 412, rating: 4.9 },
  { id: 'cs', kind: 'cs', emblem: 'terminal', tag: 'Computing',
    title: 'Intro to Programming', short: 'Python fundamentals',
    lessons: 16, time: '7h 40m', progress: 0, instructor: 'Sahan Wijeratne',
    students: 521, rating: 4.8 },
];

const STUDENT = {
  name: 'Anjali Silva',
  email: 'anjali.silva@edupath.lk',
  initials: 'AS',
  joined: 'Joined March 2026',
  enrolled: 4,
  hours: 23,
  streak: 7,
};

const ADMIN_USER = {
  name: 'Sahan Wijeratne',
  email: 'sahan.w@edupath.lk',
  role: 'Admin',
};

const SUPER = {
  name: 'Dilani Rajapakse',
  email: 'dilani.r@edupath.lk',
  role: 'Super Admin',
};

const REGISTRATIONS = [
  { id: 'r1', name: 'Anjali Silva',     email: 'anjali.silva@edupath.lk',     when: '2 min ago',   status: 'pending' },
  { id: 'r2', name: 'Ravi Tennakoon',   email: 'r.tennakoon@edupath.lk',      when: '12 min ago',  status: 'pending' },
  { id: 'r3', name: 'Saman Perera',     email: 'saman.p@edupath.lk',          when: '1 h ago',     status: 'pending' },
  { id: 'r4', name: 'Nadeesha Fernando',email: 'nadeesha.f@edupath.lk',       when: '2 h ago',     status: 'pending' },
  { id: 'r5', name: 'Tharushi Jay.',    email: 'tharushi@edupath.lk',         when: 'Yesterday',   status: 'pending' },
  { id: 'r6', name: 'Kasun Bandara',    email: 'kasun.b@edupath.lk',          when: 'Yesterday',   status: 'pending' },
  { id: 'r7', name: 'Imal de Silva',    email: 'imal.d@edupath.lk',           when: '2 days ago',  status: 'approved' },
  { id: 'r8', name: 'Praveen Madhushan',email: 'praveen.m@edupath.lk',        when: '3 days ago',  status: 'rejected' },
];

const ENROLMENTS = [
  { id: 'e1', name: 'Ravi Tennakoon',  course: 'Mathematics Foundations',  when: '8 min ago',   status: 'pending' },
  { id: 'e2', name: 'Anjali Silva',    course: 'Science Essentials',       when: '15 min ago',  status: 'pending' },
  { id: 'e3', name: 'Saman Perera',    course: 'Reading & Writing',        when: '40 min ago',  status: 'pending' },
  { id: 'e4', name: 'Nadeesha F.',     course: 'Social Studies Survey',    when: '2 h ago',     status: 'pending' },
  { id: 'e5', name: 'Imal de Silva',   course: 'Business English',         when: 'Yesterday',   status: 'approved' },
];

const ADMINS = [
  { id: 'a1', name: 'Sahan Wijeratne',   email: 'sahan.w@edupath.lk',   joined: 'Jan 2026', courses: 8, status: 'active' },
  { id: 'a2', name: 'Tharushi Jay.',     email: 'tharushi@edupath.lk',  joined: 'Feb 2026', courses: 5, status: 'active' },
  { id: 'a3', name: 'Kasun Bandara',     email: 'kasun.b@edupath.lk',   joined: 'Mar 2026', courses: 3, status: 'active' },
  { id: 'a4', name: 'Praveen Madhushan', email: 'praveen.m@edupath.lk', joined: 'Apr 2026', courses: 0, status: 'pending' },
  { id: 'a5', name: 'Imal de Silva',     email: 'imal.d@edupath.lk',    joined: 'Apr 2026', courses: 0, status: 'pending' },
];

const AUDIT = [
  { id: 'l1', who: 'Sahan Wijeratne', what: 'Approved enrolment',     target: 'Anjali Silva → Mathematics Foundations', when: '2 min ago',  ico: 'check-circle', tone: 'success' },
  { id: 'l2', who: 'Sahan Wijeratne', what: 'Approved registration',  target: 'Ravi Tennakoon',                          when: '12 min ago', ico: 'user-check',   tone: 'success' },
  { id: 'l3', who: 'Tharushi Jay.',   what: 'Published course',       target: 'Business English · v2',                   when: '1 h ago',    ico: 'book-open',    tone: 'info' },
  { id: 'l4', who: 'Dilani Rajapakse',what: 'Invited admin',          target: 'praveen.m@edupath.lk',                    when: '3 h ago',    ico: 'shield-plus',  tone: 'info' },
  { id: 'l5', who: 'Sahan Wijeratne', what: 'Rejected enrolment',     target: 'Praveen M. → Science Essentials',         when: 'Yesterday',  ico: 'x-circle',     tone: 'warning' },
  { id: 'l6', who: 'System',          what: 'Failed sign-in × 12',    target: 'IP 203.94.180.21',                        when: 'Yesterday',  ico: 'alert-triangle', tone: 'warning' },
  { id: 'l7', who: 'Dilani Rajapakse',what: 'Updated platform settings', target: 'Email templates',                      when: '2 days ago', ico: 'settings',     tone: 'info' },
];

const NOTIFS_STUDENT = [
  { id: 'n1', ico: 'check-circle', tone: 'success', title: 'Enrolment approved',
    body: 'Mathematics Foundations · Lesson 1 is ready.', when: '12 min ago', read: false },
  { id: 'n2', ico: 'check-circle', tone: 'success', title: 'Enrolment approved',
    body: 'Science Essentials · You can start anytime.', when: 'Yesterday', read: false },
  { id: 'n3', ico: 'clock', tone: 'warning', title: 'Enrolment pending',
    body: 'Reading & Writing Intensive · Awaiting approval.', when: '2 days ago', read: true },
  { id: 'n4', ico: 'flame', tone: 'success', title: '7-day streak!',
    body: "You've studied 7 days in a row. Keep it up.", when: '3 days ago', read: true },
  { id: 'n5', ico: 'megaphone', tone: 'info', title: 'New course added',
    body: 'Business English is now in the catalog.', when: '5 days ago', read: true },
];

const NOTIFS_ADMIN = [
  { id: 'na1', ico: 'user-plus', tone: 'info', title: 'New registration',
    body: 'Anjali Silva is awaiting sign-up approval.', when: '2 min ago', read: false },
  { id: 'na2', ico: 'clipboard-list', tone: 'info', title: 'Enrolment request',
    body: 'Ravi T. → Mathematics Foundations.', when: '8 min ago', read: false },
  { id: 'na3', ico: 'user-plus', tone: 'info', title: 'New registration',
    body: 'Saman Perera is awaiting sign-up approval.', when: '1 h ago', read: false },
];

const LESSON = {
  course: 'Mathematics Foundations',
  title: 'Algebra: Linear Equations',
  number: 'Lesson 8 of 12',
  duration: '14:32',
  progress: 65,
  desc: "Linear equations are the backbone of algebra. In this lesson you'll cover slope-intercept form, solving for x, and graphing — with worked examples drawn from past practice papers.",
  curriculum: [
    { id: 's1', title: 'Number Sense & Operations',  status: 'done',     time: '12:08' },
    { id: 's2', title: 'Fractions, Decimals, Percents', status: 'done',  time: '15:21' },
    { id: 's3', title: 'Algebra: Linear Equations',   status: 'active',  time: '14:32' },
    { id: 's4', title: 'Algebra: Inequalities',       status: 'todo',    time: '11:50' },
    { id: 's5', title: 'Geometry Foundations',        status: 'todo',    time: '13:15' },
    { id: 's6', title: 'Measurement',                 status: 'locked',  time: '9:42' },
    { id: 's7', title: 'Data & Statistics',           status: 'locked',  time: '12:55' },
  ],
  materials: [
    { ico: 'file-text', name: 'Linear Equations · Worksheet', size: 'PDF · 312 KB' },
    { ico: 'file-pen',  name: 'Lesson 8 · Practice quiz',     size: '10 questions' },
    { ico: 'video',     name: 'Worked example · Slope form',  size: 'MP4 · 4 min' },
  ]
};

Object.assign(window, {
  COURSES, STUDENT, ADMIN_USER, SUPER,
  REGISTRATIONS, ENROLMENTS, ADMINS, AUDIT,
  NOTIFS_STUDENT, NOTIFS_ADMIN, LESSON,
});
