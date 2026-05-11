/* EduPath Mobile — top-level prototype App.
   A self-contained role flow you can drop into any artboard. */

const { useState: useState_, useEffect: useEffect_, Fragment: Fragment_ } = React;

/* Re-uses NOTIFS_STUDENT from data.jsx */
function makeNotifs() { return NOTIFS_STUDENT.map(n => ({ ...n })); }

/* The big App. role = public | student | admin | super | mixed */
function RoleApp({ role = 'mixed', startScreen, embed }) {
  const [screen, setScreen] = React.useState(() => {
    if (startScreen) return startScreen;
    if (role === 'public')  return 'splash';
    if (role === 'student') return 'studentHome';
    if (role === 'admin')   return 'adminDash';
    if (role === 'super')   return 'superDash';
    return 'splash';
  });
  const [course, setCourse] = React.useState(COURSES[0]);
  const [notifs, setNotifs] = React.useState(makeNotifs);
  const [sheet, setSheet] = React.useState(null); /* {kind, item} */
  const [toast, setToast] = React.useState(null);

  /* role-aware tab nav */
  const studentNav = (id) => {
    const map = { home: 'studentHome', browse: 'studentBrowse', mine: 'studentMine', profile: 'studentProfile', notifications: 'notifications' };
    setScreen(map[id] || 'studentHome');
  };
  const adminNav = (id) => {
    const map = { dashboard: 'adminDash', registrations: 'adminRegs', enrolments: 'adminEnrols', courses: 'adminCourses', more: 'adminMore', audit: 'adminAudit' };
    setScreen(map[id] || 'adminDash');
  };
  const superNav = (id) => {
    const map = { dashboard: 'superDash', admins: 'superAdmins', queue: 'superQueue', audit: 'adminAudit', more: 'superMore' };
    setScreen(map[id] || 'superDash');
  };

  const flash = (msg) => {
    setToast(msg);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setToast(null), 2200);
  };

  const goCourse = (c) => { setCourse(c); setScreen('courseDetail'); };

  const screens = {
    /* — Public — */
    splash:        <ScreenSplash onContinue={() => setScreen('onboarding')} />,
    onboarding:    <ScreenOnboarding onDone={() => setScreen('signin')} />,
    signin:        <ScreenSignIn onBack={() => setScreen('onboarding')} onSubmit={() => setScreen('studentHome')} onSwitch={() => setScreen('signup')} />,
    signup:        <ScreenSignUp onBack={() => setScreen('signin')} onSubmit={() => setScreen('pending')} onSwitch={() => setScreen('signin')} />,
    pending:       <ScreenPending onSignOut={() => setScreen('signin')} />,

    /* — Student — */
    studentHome:    <StudentHome user={STUDENT} onNav={studentNav} onContinue={() => setScreen('lesson')} onCourse={goCourse} />,
    studentBrowse:  <StudentBrowse onNav={studentNav} onCourse={goCourse} />,
    studentMine:    <StudentMine onNav={studentNav} onCourse={goCourse} />,
    studentProfile: <StudentProfile user={STUDENT} onNav={studentNav} onSignOut={() => setScreen('signin')} />,
    courseDetail:   <StudentCourseDetail course={course} onBack={() => setScreen('studentBrowse')} onPlay={() => setScreen('lesson')} onEnrol={() => { flash('Enrolment requested'); setScreen('studentMine'); }} />,
    lesson:         <StudentLessonPlayer onBack={() => setScreen('courseDetail')} onComplete={() => { flash('Lesson marked complete'); setScreen('studentMine'); }} />,
    notifications:  <ScreenNotifications items={notifs} onBack={() => setScreen('studentHome')} onMarkAll={() => { setNotifs(notifs.map(n => ({ ...n, read: true }))); flash('Notifications cleared'); }} />,

    /* — Admin — */
    adminDash:     <AdminDashboard user={ADMIN_USER} onNav={adminNav} onOpen={(kind, item) => setSheet({ kind, item })} />,
    adminRegs:     <AdminRegistrations onNav={adminNav} onOpen={(kind, item) => setSheet({ kind, item })} />,
    adminEnrols:   <AdminEnrolments onNav={adminNav} onOpen={(kind, item) => setSheet({ kind, item })} />,
    adminCourses:  <AdminCourses onNav={adminNav} onCourse={(c) => { setCourse(c); setScreen('adminCourseEdit'); }} />,
    adminCourseEdit: <AdminCourseEditor course={course} onBack={() => setScreen('adminCourses')} onPublish={() => { flash('Course published'); setScreen('adminCourses'); }} />,
    adminMore:     <AdminMore user={ADMIN_USER} onNav={adminNav} onSignOut={() => setScreen('signin')} role="Admin" />,
    adminAudit:    <AdminAudit onNav={role === 'super' ? superNav : adminNav} role={role === 'super' ? 'Super Admin' : 'Admin'} />,

    /* — Super Admin — */
    superDash:     <SuperDashboard user={SUPER} onNav={superNav} onOpen={(kind, item) => setSheet({ kind, item })} />,
    superAdmins:   <SuperAdmins onNav={superNav} onInvite={() => setSheet({ kind: 'invite' })} />,
    superQueue:    <SuperQueue onNav={superNav} onOpen={(kind, item) => setSheet({ kind, item })} />,
    superMore:     <AdminMore user={SUPER} onNav={superNav} onSignOut={() => setScreen('signin')} role="Super Admin" />,
  };

  return (
    <div className="role-app" data-role={role}>
      <div className="phone-wrap">
        {screens[screen] || screens.splash}

        {/* Sheets / overlays */}
        {sheet && sheet.kind !== 'invite' && (
          <ApprovalSheet
            kind={sheet.kind}
            item={sheet.item}
            onClose={() => setSheet(null)}
            onConfirm={(item) => { setSheet(null); flash(sheet.kind === 'approve' ? 'Approved · ' + (item.name || 'item') : 'Rejected'); }} />
        )}
        {sheet && sheet.kind === 'invite' && (
          <InviteAdminSheet onClose={() => setSheet(null)} onConfirm={() => { setSheet(null); flash('Invite sent'); }} />
        )}
        {toast && (
          <div className="toast">
            <Icon name="check-circle" size={16} />
            {toast}
          </div>
        )}
      </div>

      {/* in-screen quick screen picker — only when embed is true */}
      {embed && (
        <div className="screen-picker">
          {/* small title */}
          <div className="screen-picker__label">{role === 'public' ? 'Public visitor' : role === 'student' ? 'Student' : role === 'admin' ? 'Admin' : 'Super Admin'} flow</div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { RoleApp });
