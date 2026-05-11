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
  youtubeUrl: '',
  attachments: [],
});

interface State {
  course: BuilderCourse;
  isEditing: boolean;

  // Whole-course actions
  initNew: () => void;
  load: (course: BuilderCourse) => void;
  reset: () => void;

  // Course-level
  setTitle: (title: string) => void;
  setType: (type: CourseType) => void;
  setDescription: (description: string) => void;

  // Semester
  addSemester: () => string;
  renameSemester: (semesterId: string, name: string) => void;
  removeSemester: (semesterId: string) => void;

  // Subject
  addSubject: (semesterId: string) => string;
  renameSubject: (semesterId: string, subjectId: string, title: string) => void;
  removeSubject: (semesterId: string, subjectId: string) => void;

  // Lesson
  addLesson: (semesterId: string, subjectId: string) => string;
  removeLesson: (semesterId: string, subjectId: string, lessonId: string) => void;
  updateLesson: (
    semesterId: string,
    subjectId: string,
    lessonId: string,
    patch: Partial<Omit<BuilderLesson, 'id' | 'attachments'>>,
  ) => void;
  getLesson: (semesterId: string, subjectId: string, lessonId: string) => BuilderLesson | null;

  // Attachments
  addAttachment: (semesterId: string, subjectId: string, lessonId: string) => void;
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

  initNew: () => set({ course: emptyCourse(), isEditing: false }),
  load: (course) => set({ course, isEditing: true }),
  reset: () => set({ course: emptyCourse(), isEditing: false }),

  setTitle:       (title)       => set((s) => ({ course: { ...s.course, title } })),
  setType:        (type)        => set((s) => ({ course: { ...s.course, type } })),
  setDescription: (description) => set((s) => ({ course: { ...s.course, description } })),

  addSemester: () => {
    const sem = emptySemester(get().course.semesters.length + 1);
    set((s) => ({ course: { ...s.course, semesters: [...s.course.semesters, sem] } }));
    return sem.id;
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

  addSubject: (semesterId) => {
    const sub = emptySubject();
    set((s) => ({
      course: {
        ...s.course,
        semesters: s.course.semesters.map((sem) =>
          sem.id === semesterId ? { ...sem, subjects: [...sem.subjects, sub] } : sem,
        ),
      },
    }));
    return sub.id;
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

  addLesson: (semesterId, subjectId) => {
    const lesson = emptyLesson();
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

  addAttachment: (semesterId, subjectId, lessonId) => {
    const sample = fakeAttachmentNames[Math.floor(Math.random() * fakeAttachmentNames.length)];
    const attachment: BuilderAttachment = {
      id: uid('att'),
      name: sample.name,
      kind: sample.kind,
      size: sample.size,
    };
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
