/* EduPath Mobile — Admin & Super Admin surfaces */

const ADMIN_TABS = [
  { id: 'dashboard',    label: 'Home',     ico: 'layout-dashboard' },
  { id: 'registrations',label: 'Sign-ups', ico: 'user-plus', badge: 6 },
  { id: 'enrolments',   label: 'Enrols',   ico: 'clipboard-list', badge: 4 },
  { id: 'courses',      label: 'Courses',  ico: 'book-open' },
  { id: 'more',         label: 'More',     ico: 'menu' },
];

const SUPER_TABS = [
  { id: 'dashboard',    label: 'Home',     ico: 'layout-dashboard' },
  { id: 'admins',       label: 'Admins',   ico: 'shield-check', badge: 2 },
  { id: 'queue',        label: 'Approvals',ico: 'clipboard-list', badge: 10 },
  { id: 'audit',        label: 'Audit',    ico: 'history' },
  { id: 'more',         label: 'More',     ico: 'menu' },
];

/* ─── Admin Dashboard ─────────────────────────────────────────── */
function AdminDashboard({ user, onNav, onOpen }) {
  return (
    <Phone>
      <div style={{
        background: 'var(--color-primary)', color: '#fff',
        padding: '12px 16px 22px',
        borderRadius: '0 0 24px 24px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(188,233,85,0.10) 0%, transparent 60%)' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar size={36} name={user.name} variant="lime" />
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Signed in as</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600 }}>{user.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Eyebrow dark icon="shield">{user.role}</Eyebrow>
            <IconBtn icon="bell" dark dot />
          </div>
        </div>

        <h1 style={{ margin: '4px 0 6px', fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
          14 items <span style={{ color: 'var(--color-accent)' }}>need you</span>
        </h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Approvals are waiting. Older queue items are highlighted.</p>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={() => onNav('registrations')} style={{
            flex: 1, padding: 12, borderRadius: 14,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
            color: '#fff', textAlign: 'left', cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(188,233,85,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                <Icon name="user-plus" size={14} />
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>+2 today</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginTop: 8, letterSpacing: '-0.02em' }}>6</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Sign-ups pending</div>
          </button>
          <button onClick={() => onNav('enrolments')} style={{
            flex: 1, padding: 12, borderRadius: 14,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
            color: '#fff', textAlign: 'left', cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(188,233,85,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                <Icon name="clipboard-list" size={14} />
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>+1 today</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginTop: 8, letterSpacing: '-0.02em' }}>4</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Enrolment requests</div>
          </button>
        </div>
      </div>

      <PageBody padding={16} gap={16} style={{ paddingBottom: 100 }}>
        {/* Platform stats */}
        <div className="section-h"><h3>Platform</h3><span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Last 7 days</span></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Stat ico="users" label="Active students" value="1,284" delta="+8%" />
          <Stat ico="book-open" label="Live courses" value="18" />
          <Stat ico="check-circle" label="Lessons done" value="3,402" delta="+12%" />
        </div>

        {/* Recent queue */}
        <div className="section-h">
          <h3>Recent queue</h3>
          <a className="link" onClick={() => onNav('registrations')}>View all <Icon name="arrow-right" size={12} /></a>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {REGISTRATIONS.filter(r => r.status === 'pending').slice(0, 4).map((r, i, arr) => (
            <div key={r.id} onClick={() => onOpen('reg', r)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--color-stroke-2)' : 0, cursor: 'pointer'
            }}>
              <Avatar size={36} name={r.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-body-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email} · {r.when}</div>
              </div>
              <Badge tone="warning" icon="clock">Pending</Badge>
            </div>
          ))}
        </div>

        <div className="section-h"><h3>Latest activity</h3></div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {AUDIT.slice(0, 3).map((l, i, arr) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--color-stroke-2)' : 0 }}>
              <span style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: 'var(--color-light-gray)',
                color: l.tone === 'success' ? 'var(--color-success-deep)' :
                       l.tone === 'warning' ? 'var(--color-warning)' : 'var(--color-info)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name={l.ico} size={14} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>
                  <b>{l.who}</b> · <span style={{ color: 'var(--color-body-green)' }}>{l.what.toLowerCase()}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-body-green)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.target}</div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--color-muted)', flexShrink: 0, fontWeight: 500 }}>{l.when}</span>
            </div>
          ))}
        </div>
      </PageBody>

      <BottomNav items={ADMIN_TABS} active="dashboard" onChange={onNav} />
    </Phone>
  );
}

/* ─── Registrations queue ─────────────────────────────────────── */
function AdminRegistrations({ onNav, onOpen }) {
  const [filter, setFilter] = useState('pending');
  const counts = {
    pending: REGISTRATIONS.filter(r => r.status === 'pending').length,
    approved: REGISTRATIONS.filter(r => r.status === 'approved').length,
    rejected: REGISTRATIONS.filter(r => r.status === 'rejected').length,
  };
  const list = REGISTRATIONS.filter(r => r.status === filter);
  return (
    <Phone>
      <AppBar title="Registrations" subtitle={counts.pending + ' pending'} trailing={<IconBtn icon="search" />} />
      <PageBody padding={16} gap={14} style={{ paddingBottom: 100 }}>
        <Tabs items={[
          { id: 'pending', label: 'Pending', count: counts.pending },
          { id: 'approved', label: 'Approved', count: counts.approved },
          { id: 'rejected', label: 'Rejected', count: counts.rejected },
        ]} active={filter} onChange={setFilter} />

        {list.length === 0 ? (
          <EmptyState icon="check-check" title="All caught up!" body="No pending registrations right now." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map(r => (
              <div key={r.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar size={42} name={r.name} variant="dark" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-body-green)' }}>{r.email}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>Submitted {r.when}</div>
                  </div>
                  {r.status === 'pending' && <Badge tone="warning">Pending</Badge>}
                  {r.status === 'approved' && <Badge tone="success">Approved</Badge>}
                  {r.status === 'rejected' && <Badge tone="error">Rejected</Badge>}
                </div>
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Button variant="secondary" size="sm" full icon="x" onClick={() => onOpen('reject', r)}>Reject</Button>
                    <Button size="sm" full icon="check" onClick={() => onOpen('approve', r)}>Approve</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PageBody>
      <BottomNav items={ADMIN_TABS} active="registrations" onChange={onNav} />
    </Phone>
  );
}

/* ─── Enrolments queue ────────────────────────────────────────── */
function AdminEnrolments({ onNav, onOpen }) {
  const pending = ENROLMENTS.filter(e => e.status === 'pending');
  return (
    <Phone>
      <AppBar title="Enrolment requests" subtitle={pending.length + ' awaiting approval'} trailing={<IconBtn icon="filter" />} />
      <PageBody padding={16} gap={12} style={{ paddingBottom: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Eyebrow icon="clipboard-list">Course access</Eyebrow>
          <button style={{ background: 'transparent', border: 0, fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <Icon name="check-check" size={14} /> Approve all
          </button>
        </div>

        {pending.map(e => (
          <div key={e.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar size={40} name={e.name} variant="dark" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{e.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{e.when}</div>
              </div>
              <Badge tone="warning">Pending</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: 10, background: 'var(--color-light-gray)', borderRadius: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--color-primary)', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="book-open" size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--color-body-green)', fontWeight: 500 }}>Wants access to</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.course}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Button variant="secondary" size="sm" icon="message-square">Note</Button>
              <Button variant="secondary" size="sm" full icon="x" onClick={() => onOpen('reject', e)}>Reject</Button>
              <Button size="sm" full icon="check" onClick={() => onOpen('approve', e)}>Approve</Button>
            </div>
          </div>
        ))}
      </PageBody>
      <BottomNav items={ADMIN_TABS} active="enrolments" onChange={onNav} />
    </Phone>
  );
}

/* ─── Course management ────────────────────────────────────────── */
function AdminCourses({ onNav, onCourse }) {
  const [tab, setTab] = useState('published');
  return (
    <Phone>
      <AppBar title="Courses" trailing={<IconBtn icon="search" />} />
      <PageBody padding={16} gap={14} style={{ paddingBottom: 100 }}>
        <Tabs items={[
          { id: 'published', label: 'Published', count: 18 },
          { id: 'drafts', label: 'Drafts', count: 3 },
          { id: 'archive', label: 'Archive' },
        ]} active={tab} onChange={setTab} />

        {tab === 'published' && (
          <Fragment>
            {COURSES.slice(0, 4).map(c => (
              <div key={c.id} className="card" style={{ padding: 12, display: 'flex', gap: 12, cursor: 'pointer' }} onClick={() => onCourse(c)}>
                <div style={{ width: 80, flexShrink: 0 }}>
                  <CourseCover kind={c.kind} emblem={c.emblem} height={80} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Badge tone="success" icon="check-circle">Published</Badge>
                  </div>
                  <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{c.title}</h4>
                  <div className="h-meta" style={{ marginTop: 4 }}>
                    <Icon name="users" size={11} /> {c.students}
                    <span className="dot-sep"></span>
                    <Icon name="layers" size={11} /> {c.lessons}
                    <span className="dot-sep"></span>
                    <Icon name="star" size={11} /> {c.rating}
                  </div>
                </div>
                <IconBtn icon="more-vertical" />
              </div>
            ))}
          </Fragment>
        )}
        {tab === 'drafts' && (
          <Fragment>
            {[
              { title: 'Project Management Basics', tag: 'Business', updated: 'Edited 2h ago', complete: 60 },
              { title: 'Spoken English', tag: 'Languages', updated: 'Edited yesterday', complete: 30 },
              { title: 'Data Visualisation', tag: 'Computing', updated: 'Edited 3 days ago', complete: 80 },
            ].map((d, i) => (
              <div key={i} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <Badge tone="warning" icon="pencil">Draft</Badge>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{d.updated}</span>
                </div>
                <h4 style={{ margin: '8px 0 4px', fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: 'var(--color-primary)' }}>{d.title}</h4>
                <div className="h-meta" style={{ marginBottom: 10 }}><Icon name="tag" size={11} /> {d.tag}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Progress pct={d.complete} showLabel={false} />
                  <span style={{ fontSize: 11, color: 'var(--color-body-green)', fontWeight: 600 }}>{d.complete}% complete</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="secondary" size="sm" full icon="pencil">Continue</Button>
                  <Button size="sm" full icon="upload">Publish</Button>
                </div>
              </div>
            ))}
          </Fragment>
        )}
        {tab === 'archive' && (
          <EmptyState icon="archive" title="No archived courses" body="Archive a course to hide it from learners while keeping its data." />
        )}
      </PageBody>

      {/* FAB */}
      <button style={{
        position: 'absolute', right: 16, bottom: 110,
        width: 56, height: 56, borderRadius: 9999,
        background: 'var(--color-accent)', border: 0, cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(21,42,36,0.25)',
        color: 'var(--color-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 6
      }}>
        <Icon name="plus" size={26} strokeWidth={2.5} />
      </button>

      <BottomNav items={ADMIN_TABS} active="courses" onChange={onNav} />
    </Phone>
  );
}

/* ─── Course editor (draft) ───────────────────────────────────── */
function AdminCourseEditor({ course, onBack, onPublish }) {
  return (
    <Phone>
      <AppBar
        leading={<IconBtn icon="arrow-left" onClick={onBack} />}
        title="Edit course"
        trailing={
          <Fragment>
            <IconBtn icon="eye" />
            <button onClick={onPublish} className="btn btn--primary btn--sm" style={{ marginLeft: 4 }}>
              <Icon name="upload" size={13} /> Publish
            </button>
          </Fragment>
        } />
      <PageBody padding={16} gap={14} style={{ paddingBottom: 100 }}>
        <div style={{ position: 'relative' }}>
          <CourseCover kind={course.kind} emblem={course.emblem} tag={course.tag} height={140} />
          <button style={{
            position: 'absolute', bottom: 10, right: 10, height: 32, padding: '0 12px',
            borderRadius: 9999, background: 'rgba(255,255,255,0.92)', border: 0,
            fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6
          }}>
            <Icon name="image" size={13} /> Replace cover
          </button>
        </div>

        <div className="field">
          <label className="field__label">Course title</label>
          <input className="input" defaultValue={course.title} />
        </div>
        <div className="field">
          <label className="field__label">Subject area</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Mathematics', 'Science', 'Lang Arts', 'Social', 'Computing'].map(t => (
              <span key={t} style={{
                padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                background: t === course.tag ? 'var(--color-primary)' : 'var(--color-light-gray)',
                color: t === course.tag ? '#fff' : 'var(--color-primary)',
              }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field__label">Short description</label>
          <textarea className="input" style={{ height: 80, padding: 12, resize: 'none' }} defaultValue={LESSON.desc} />
        </div>

        <div className="section-h"><h3>Curriculum</h3><a className="link"><Icon name="plus" size={12} /> Add lesson</a></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LESSON.curriculum.slice(0, 4).map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--color-surface)', border: '1px solid var(--color-stroke)', borderRadius: 12 }}>
              <span style={{ color: 'var(--color-muted)' }}><Icon name="grip-vertical" size={16} /></span>
              <span style={{ width: 22, height: 22, borderRadius: 9999, background: 'var(--color-light-gray)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{s.title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-body-green)' }}>Video · {s.time}</div>
              </div>
              <IconBtn icon="more-vertical" />
            </div>
          ))}
        </div>
      </PageBody>
    </Phone>
  );
}

/* ─── Approval bottom sheet (admin) ───────────────────────────── */
function ApprovalSheet({ kind, item, onClose, onConfirm }) {
  const isApprove = kind === 'approve';
  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet__panel" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle"></div>
        <div style={{ padding: '4px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 44, height: 44, borderRadius: 12,
              background: isApprove ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
              color: isApprove ? 'var(--color-success-deep)' : 'var(--color-error-deep)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon name={isApprove ? 'check-circle' : 'x-circle'} size={22} />
            </span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: 'var(--color-primary)' }}>
                {isApprove ? 'Approve' : 'Reject'} {item.course ? 'enrolment' : 'registration'}?
              </h3>
              <div style={{ fontSize: 12, color: 'var(--color-body-green)', marginTop: 2 }}>{item.name}{item.course ? ' → ' + item.course : ''}</div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: 12, background: 'var(--color-light-gray)', borderRadius: 12, fontSize: 12, color: 'var(--color-body-green)', lineHeight: 1.5 }}>
            {isApprove
              ? "We'll email this person and unlock access immediately. This action is logged in the audit trail."
              : "We'll notify this person and they can re-apply. You can leave a short reason."}
          </div>

          {!isApprove && (
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field__label">Reason (optional)</label>
              <textarea className="input" style={{ height: 70, padding: 12, resize: 'none' }} placeholder="Add a short reason…"></textarea>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" full size="lg" onClick={onClose}>Cancel</Button>
            <Button full size="lg" icon={isApprove ? 'check' : 'x'} onClick={() => onConfirm(item)}>
              {isApprove ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── More menu screen (admin) ───────────────────────────────── */
function AdminMore({ user, onNav, onSignOut, role = 'Admin' }) {
  const adminItems = [
    { ico: 'book-open', label: 'Courses', sub: '18 published · 3 drafts', go: () => onNav('courses') },
    { ico: 'history',   label: 'Audit log', sub: 'Recent platform activity', go: () => onNav('audit') },
    { ico: 'users',     label: 'Students', sub: '1,284 active' },
    { ico: 'megaphone', label: 'Announcements', sub: 'Send platform updates' },
    { ico: 'settings',  label: 'Settings', sub: 'Account, security, prefs' },
    { ico: 'life-buoy', label: 'Help & support' },
  ];
  const superItems = [
    { ico: 'shield-check', label: 'Administrators', sub: '5 admins · 2 pending', go: () => onNav('admins') },
    ...adminItems
  ];
  const items = role === 'Super Admin' ? superItems : adminItems;
  const tabs = role === 'Super Admin' ? SUPER_TABS : ADMIN_TABS;
  return (
    <Phone>
      <AppBar title="More" />
      <PageBody padding={16} gap={14} style={{ paddingBottom: 100 }}>
        <div className="card card--dark" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={48} name={user.name} variant="lime" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: '#fff' }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{user.email}</div>
            <div style={{ marginTop: 6 }}><Eyebrow lime icon="shield">{role}</Eyebrow></div>
          </div>
          <Icon name="chevron-right" size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {items.map((it, i, arr) => (
            <div key={it.label} onClick={it.go}
                 style={{
                   display: 'flex', alignItems: 'center', gap: 12,
                   padding: '14px 14px',
                   borderBottom: i < arr.length - 1 ? '1px solid var(--color-stroke-2)' : 0, cursor: 'pointer'
                 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-light-gray)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <Icon name={it.ico} size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{it.label}</div>
                {it.sub && <div style={{ fontSize: 11, color: 'var(--color-body-green)', marginTop: 1 }}>{it.sub}</div>}
              </div>
              <Icon name="chevron-right" size={18} style={{ color: 'var(--color-muted)' }} />
            </div>
          ))}
        </div>

        <Button variant="secondary" full size="lg" icon="log-out" onClick={onSignOut}>Sign out</Button>
      </PageBody>
      <BottomNav items={tabs} active="more" onChange={onNav} />
    </Phone>
  );
}

/* ─── Audit log ─────────────────────────────────────────────── */
function AdminAudit({ onNav, role = 'Super Admin' }) {
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? AUDIT : AUDIT.filter(a => a.tone === filter);
  const tabs = role === 'Super Admin' ? SUPER_TABS : ADMIN_TABS;
  return (
    <Phone>
      <AppBar title="Audit log" trailing={<IconBtn icon="download" />} />
      <PageBody padding={16} gap={14} style={{ paddingBottom: 100 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 4px', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: 'All', count: AUDIT.length },
            { id: 'success', label: 'Approvals', count: AUDIT.filter(a => a.tone === 'success').length },
            { id: 'info', label: 'Changes', count: AUDIT.filter(a => a.tone === 'info').length },
            { id: 'warning', label: 'Warnings', count: AUDIT.filter(a => a.tone === 'warning').length },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '6px 14px', height: 32, borderRadius: 9999,
              border: '1px solid ' + (filter === f.id ? 'var(--color-primary)' : 'var(--color-stroke)'),
              background: filter === f.id ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f.id ? '#fff' : 'var(--color-primary)',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
              cursor: 'pointer', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              {f.label}
              <span style={{ fontFamily: 'var(--font-mono)', padding: '0px 6px', borderRadius: 9999, background: filter === f.id ? 'rgba(255,255,255,0.16)' : 'var(--color-light-gray)', fontSize: 10 }}>{f.count}</span>
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {list.map((l, i, arr) => (
            <div key={l.id} style={{
              display: 'flex', gap: 12, padding: '14px 14px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--color-stroke-2)' : 0
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: 9999, flexShrink: 0,
                background: l.tone === 'success' ? 'var(--color-success-bg)' :
                            l.tone === 'warning' ? 'var(--color-warning-bg)' : 'var(--color-info-bg)',
                color:      l.tone === 'success' ? 'var(--color-success-deep)' :
                            l.tone === 'warning' ? 'var(--color-warning)' : 'var(--color-info)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name={l.ico} size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{l.what}</div>
                <div style={{ fontSize: 12, color: 'var(--color-body-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.target}</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>{l.who} · {l.when}</div>
              </div>
            </div>
          ))}
        </div>
      </PageBody>
      <BottomNav items={tabs} active="audit" onChange={onNav} />
    </Phone>
  );
}

/* ─── Super Admin Dashboard ───────────────────────────────────── */
function SuperDashboard({ user, onNav, onOpen }) {
  return (
    <Phone>
      <div style={{
        background: 'var(--color-primary)', color: '#fff',
        padding: '12px 16px 22px',
        borderRadius: '0 0 24px 24px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(188,233,85,0.10) 0%, transparent 60%)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar size={36} name={user.name} variant="lime" />
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Signed in as</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600 }}>{user.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Eyebrow dark icon="shield-check">{user.role}</Eyebrow>
            <IconBtn icon="bell" dark />
          </div>
        </div>

        <h1 style={{ margin: '4px 0 6px', fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
          Platform <span style={{ color: 'var(--color-accent)' }}>health</span>
        </h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>2 admin invites are pending acceptance.</p>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {[
            { ico: 'shield-check', val: '5', label: 'Admins active', go: () => onNav('admins') },
            { ico: 'clipboard-list', val: '10', label: 'Approvals queued', go: () => onNav('queue') },
            { ico: 'history', val: '47', label: 'Events today', go: () => onNav('audit') },
          ].map(s => (
            <button key={s.label} onClick={s.go} style={{
              flex: 1, padding: 12, borderRadius: 14, textAlign: 'left',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
              color: '#fff', cursor: 'pointer'
            }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(188,233,85,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                <Icon name={s.ico} size={14} />
              </span>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginTop: 8, letterSpacing: '-0.02em' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      <PageBody padding={16} gap={16} style={{ paddingBottom: 100 }}>
        <div className="section-h"><h3>Admins</h3><a className="link" onClick={() => onNav('admins')}>Manage <Icon name="arrow-right" size={12} /></a></div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {ADMINS.slice(0, 3).map((a, i, arr) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--color-stroke-2)' : 0 }}>
              <Avatar size={36} name={a.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{a.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-body-green)' }}>{a.courses} courses · joined {a.joined}</div>
              </div>
              {a.status === 'active' ? <Badge tone="success" icon="check">Active</Badge> : <Badge tone="warning" icon="clock">Pending</Badge>}
            </div>
          ))}
        </div>

        <div className="section-h"><h3>System events</h3><a className="link" onClick={() => onNav('audit')}>Open log <Icon name="arrow-right" size={12} /></a></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { ico: 'shield-plus', tone: 'info', title: 'Admin invite accepted', body: 'Sahan Wijeratne is now active.', when: '20 min ago' },
            { ico: 'alert-triangle', tone: 'warning', title: '12 failed sign-ins', body: 'Single IP (Colombo). Auto-rate-limited.', when: '1 h ago' },
            { ico: 'rocket', tone: 'info', title: 'Course published', body: 'Business English · v2 by Tharushi.', when: '2 h ago' },
          ].map((e, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12 }}>
              <span style={{
                width: 38, height: 38, borderRadius: 9999, flexShrink: 0,
                background: e.tone === 'warning' ? 'var(--color-warning-bg)' : 'var(--color-info-bg)',
                color: e.tone === 'warning' ? 'var(--color-warning)' : 'var(--color-info)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name={e.ico} size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{e.title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-body-green)', marginTop: 1 }}>{e.body}</div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--color-muted)', flexShrink: 0, fontWeight: 500 }}>{e.when}</span>
            </div>
          ))}
        </div>
      </PageBody>

      <BottomNav items={SUPER_TABS} active="dashboard" onChange={onNav} />
    </Phone>
  );
}

/* ─── Admins management ──────────────────────────────────────── */
function SuperAdmins({ onNav, onInvite }) {
  return (
    <Phone>
      <AppBar title="Administrators" subtitle={ADMINS.filter(a => a.status === 'pending').length + ' invites pending'} trailing={<IconBtn icon="search" />} />
      <PageBody padding={16} gap={12} style={{ paddingBottom: 100 }}>
        <button onClick={onInvite} style={{
          background: 'var(--color-light-gray)', border: '1px dashed var(--color-stroke)',
          borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', textAlign: 'left'
        }}>
          <span style={{ width: 40, height: 40, borderRadius: 9999, background: 'var(--color-primary)', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>Invite an admin</div>
            <div style={{ fontSize: 12, color: 'var(--color-body-green)' }}>Send a sign-up link by email.</div>
          </div>
          <Icon name="arrow-right" size={16} style={{ color: 'var(--color-muted)' }} />
        </button>

        {ADMINS.map(a => (
          <div key={a.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={42} name={a.name} variant="dark" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{a.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-body-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>{a.status === 'active' ? `${a.courses} courses · joined ${a.joined}` : `Invited ${a.joined}`}</div>
            </div>
            {a.status === 'active' ? <Badge tone="success" icon="check">Active</Badge> : <Badge tone="warning" icon="clock">Pending</Badge>}
            <IconBtn icon="more-vertical" />
          </div>
        ))}
      </PageBody>
      <BottomNav items={SUPER_TABS} active="admins" onChange={onNav} />
    </Phone>
  );
}

/* ─── Invite admin sheet ─────────────────────────────────────── */
function InviteAdminSheet({ onClose, onConfirm }) {
  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet__panel" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle"></div>
        <div style={{ padding: '4px 20px 20px' }}>
          <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>Invite an admin</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-body-green)' }}>They'll get an email with a sign-up link.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            <div className="field">
              <label className="field__label">Full name</label>
              <input className="input" placeholder="e.g. Imal de Silva" />
            </div>
            <div className="field">
              <label className="field__label">Email</label>
              <input className="input" placeholder="name@edupath.lk" />
            </div>
            <div className="field">
              <label className="field__label">Role</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn--primary btn--full">Admin</button>
                <button className="btn btn--secondary btn--full">Super Admin</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Button variant="secondary" full size="lg" onClick={onClose}>Cancel</Button>
            <Button full size="lg" icon="send" onClick={onConfirm}>Send invite</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Combined queue (super admin) ───────────────────────────── */
function SuperQueue({ onNav, onOpen }) {
  const [tab, setTab] = useState('reg');
  return (
    <Phone>
      <AppBar title="Approvals queue" trailing={<IconBtn icon="filter" />} />
      <PageBody padding={16} gap={14} style={{ paddingBottom: 100 }}>
        <Tabs items={[
          { id: 'reg', label: 'Sign-ups', count: REGISTRATIONS.filter(r => r.status === 'pending').length },
          { id: 'enr', label: 'Enrolments', count: ENROLMENTS.filter(e => e.status === 'pending').length },
        ]} active={tab} onChange={setTab} />

        {tab === 'reg' && REGISTRATIONS.filter(r => r.status === 'pending').map(r => (
          <div key={r.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar size={40} name={r.name} variant="dark" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-body-green)' }}>{r.email}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{r.when}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Button variant="secondary" size="sm" full icon="x" onClick={() => onOpen('reject', r)}>Reject</Button>
              <Button size="sm" full icon="check" onClick={() => onOpen('approve', r)}>Approve</Button>
            </div>
          </div>
        ))}

        {tab === 'enr' && ENROLMENTS.filter(e => e.status === 'pending').map(e => (
          <div key={e.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar size={36} name={e.name} variant="dark" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{e.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-body-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>→ {e.course}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{e.when}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Button variant="secondary" size="sm" full icon="x" onClick={() => onOpen('reject', e)}>Reject</Button>
              <Button size="sm" full icon="check" onClick={() => onOpen('approve', e)}>Approve</Button>
            </div>
          </div>
        ))}
      </PageBody>
      <BottomNav items={SUPER_TABS} active="queue" onChange={onNav} />
    </Phone>
  );
}

Object.assign(window, {
  ADMIN_TABS, SUPER_TABS,
  AdminDashboard, AdminRegistrations, AdminEnrolments, AdminCourses, AdminCourseEditor,
  ApprovalSheet, AdminMore, AdminAudit,
  SuperDashboard, SuperAdmins, InviteAdminSheet, SuperQueue,
});
