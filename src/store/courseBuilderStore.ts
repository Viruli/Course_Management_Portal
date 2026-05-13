import { create } from 'zustand';
import type {
  BuilderCourse, BuilderSemester, BuilderSubject, BuilderLesson,
  BuilderAttachment, CourseType,
} from '../data/types';

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const emptyCourse = (): BuilderCourse => ({
  id: uid('crs'),
  title: '',
  type: 'Engineering',
  description: '',
  coverImageUrl: '',
  semesters: [],
});

const emptySemester = (idx: number): BuilderSemester => ({
  id: uid('sem'),
  name: `Semester ${idx}`,
  subjects: [],
});

const emptySubject = (): BuilderSubject => ({
  id: uid('sub'),
  title: '',
  lessons: [],
});

const emptyLesson = (): BuilderLesson => ({
  id: uid('lsn'),
  title: '',
  description: '',
  url: '',
  attachments: [],
});

interface State {
  course: BuilderCourse;
  isEditing: boolean;

  // Whole-course actions
  courseId: string | null;               // real server-assigned course ID
  initNew: (courseId: string, title?: string, description?: string, coverImageUrl?: string) => void;
  load: (course: BuilderCourse) => void;
  reset: () => void;

  // Course-level
  setTitle: (title: string) => void;
  setType: (type: CourseType) => void;
  setDescription: (description: string) => void;
  setCoverImageUrl: (url: string) => void;

  // Semester
  addSemester: (id: string, name: string) => void;  // id from API response
  renameSemester: (semesterId: string, name: string) => void;
  removeSemester: (semesterId: string) => void;

  // Subject
  addSubject: (semesterId: string, id: string, title: string) => void;  // id from API
  renameSubject: (semesterId: string, subjectId: string, title: string) => void;
  removeSubject: (semesterId: string, subjectId: string) => void;

  // Lesson — id is the real server-assigned lesson ID
  addLesson: (semesterId: string, subjectId: string, id?: string) => string;
  removeLesson: (semesterId: string, subjectId: string, lessonId: string) => void;
  updateLesson: (
    semesterId: string,
    subjectId: string,
    lessonId: string,
    patch: Partial<Omit<BuilderLesson, 'id' | 'attachments'>>,
  ) => void;
  getLesson: (semesterId: string, subjectId: string, lessonId: string) => BuilderLesson | null;

  // Attachments
  addAttachment: (semesterId: string, subjectId: string, lessonId: string, attachment: BuilderAttachment) => void;
  removeAttachment: (semesterId: string, subjectId: string, lessonId: string, attachmentId: string) => void;
}

const fakeAttachmentNames = [
  { name: 'Worksheet.pdf',           kind: 'pdf'   as const, size: '312 KB' },
  { name: 'Slides.pdf',              kind: 'pdf'   as const, size: '1.2 MB' },
  { name: 'Practice quiz.pdf',       kind: 'pdf'   as const, size: '186 KB' },
  { name: 'Reference notes.docx',    kind: 'doc'   as const, size: '94 KB' },
  { name: 'Example walkthrough.mp4', kind: 'video' as const, size: '12 MB' },
  { name: 'Diagram.png',             kind: 'image' as const, size: '420 KB' },
];

export const useCourseBuilderStore = create<State>((set, get) => ({
  course: emptyCourse(),
  isEditing: false,
  courseId: null,

  initNew: (courseId, title, description, coverImageUrl) => set({
    course: {
      ...emptyCourse(),
      ...(title         ? { title }         : {}),
      ...(description   ? { description }   : {}),
      ...(coverImageUrl ? { coverImageUrl } : {}),
    },
    isEditing: false,
    courseId,
  }),
  load: (course) => set({ course, isEditing: true }),
  reset: () => set({ course: emptyCourse(), isEditing: false, courseId: null }),

  setTitle:         (title)         => set((s) => ({ course: { ...s.course, title } })),
  setType:          (type)          => set((s) => ({ course: { ...s.course, type } })),
  setDescription:   (description)   => set((s) => ({ course: { ...s.course, description } })),
  setCoverImageUrl: (coverImageUrl) => set((s) => ({ course: { ...s.course, coverImageUrl } })),

  addSemester: (id, name) => {
    const sem: BuilderSemester = { id, name, subjects: [] };
    set((s) => ({ course: { ...s.course, semesters: [...s.course.semesters, sem] } }));
  },
  renameSemester: (semesterId, name) =>
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.map((sem) =>
          sem.id === semesterId ? { ...sem, name } : sem,
        ),
      },
    })),
  removeSemester: (semesterId) =>
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.filter((sem) => sem.id !== semesterId),
      },
    })),

  addSubject: (semesterId, id, title) => {
    const sub: BuilderSubject = { id, title, lessons: [] };
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.map((sem) =>
          sem.id === semesterId ? { ...sem, subjects: [...sem.subjects, sub] } : sem,
        ),
      },
    }));
  },
  renameSubject: (semesterId, subjectId, title) =>
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.map((sem) =>
          sem.id !== semesterId ? sem : {
            ...sem,
            subjects: sem.subjects.map((sub) =>
              sub.id === subjectId ? { ...sub, title } : sub,
            ),
          },
        ),
      },
    })),
  removeSubject: (semesterId, subjectId) =>
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.map((sem) =>
          sem.id !== semesterId ? sem : {
            ...sem,
            subjects: sem.subjects.filter((sub) => sub.id !== subjectId),
          },
        ),
      },
    })),

  addLesson: (semesterId, subjectId, id) => {
    const lesson = { ...emptyLesson(), ...(id ? { id } : {}) };
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.map((sem) =>
          sem.id !== semesterId ? sem : {
            ...sem,
            subjects: sem.subjects.map((sub) =>
              sub.id !== subjectId ? sub : { ...sub, lessons: [...sub.lessons, lesson] },
            ),
          },
        ),
      },
    }));
    return lesson.id;
  },
  removeLesson: (semesterId, subjectId, lessonId) =>
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.map((sem) =>
          sem.id !== semesterId ? sem : {
            ...sem,
            subjects: sem.subjects.map((sub) =>
              sub.id !== subjectId ? sub : {
                ...sub,
                lessons: sub.lessons.filter((l) => l.id !== lessonId),
              },
            ),
          },
        ),
      },
    })),
  updateLesson: (semesterId, subjectId, lessonId, patch) =>
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.map((sem) =>
          sem.id !== semesterId ? sem : {
            ...sem,
            subjects: sem.subjects.map((sub) =>
              sub.id !== subjectId ? sub : {
                ...sub,
                lessons: sub.lessons.map((l) =>
                  l.id === lessonId ? { ...l, ...patch } : l,
                ),
              },
            ),
          },
        ),
      },
    })),
  getLesson: (semesterId, subjectId, lessonId) => {
    const sem = get().course.semesters.find((x) => x.id === semesterId);
    const sub = sem?.subjects.find((x) => x.id === subjectId);
    return sub?.lessons.find((x) => x.id === lessonId) ?? null;
  },

  addAttachment: (semesterId, subjectId, lessonId, attachment) => {
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.map((sem) =>
          sem.id !== semesterId ? sem : {
            ...sem,
            subjects: sem.subjects.map((sub) =>
              sub.id !== subjectId ? sub : {
                ...sub,
                lessons: sub.lessons.map((l) =>
                  l.id !== lessonId ? l : { ...l, attachments: [...l.attachments, attachment] },
                ),
              },
            ),
          },
        ),
      },
    }));
  },
  removeAttachment: (semesterId, subjectId, lessonId, attachmentId) =>
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.map((sem) =>
          sem.id !== semesterId ? sem : {
            ...sem,
            subjects: sem.subjects.map((sub) =>
              sub.id !== subjectId ? sub : {
                ...sub,
                lessons: sub.lessons.map((l) =>
                  l.id !== lessonId ? l : {
                    ...l,
                    attachments: l.attachments.filter((a) => a.id !== attachmentId),
                  },
                ),
              },
            ),
          },
        ),
      },
    })),
}));
