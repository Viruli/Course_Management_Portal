/* EduPath Mobile — Student surface */

const STUDENT_TABS = [
  { id: 'home',     label: 'Home',     ico: 'home' },
  { id: 'browse',   label: 'Browse',   ico: 'compass' },
  { id: 'mine',     label: 'My Learning', ico: 'graduation-cap' },
  { id: 'profile',  label: 'Profile',  ico: 'user' },
];

/* Greeting block in home screen */
function StudentHomeHero({ user, onContinue }) {
  const inProgress = COURSES.find(c => c.id === 'math');
  return (
    <div style={{
      background: 'var(--color-primary)',
      color: '#fff',
      padding: '12px 16px 28px',
      borderRadius: '0 0 24px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: -40, right: -60, width: 220, height: 220,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(188,233,85,0.12) 0%, transparent 60%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={38} name={user.name} variant="lime" />
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Hello 👋</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600 }}>{user.name.split(' ')[0]}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn icon="search" dark />
          <IconBtn icon="bell" dark dot />
        </div>
      </div>

      <h1 style={{
        margin: '4px 0 8px',
        fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700,
        letterSpacing: '-0.02em', lineHeight: 1.15, color: '#fff', textWrap: 'balance'
      }}>
        Ready to <span style={{ color: 'var(--color-accent)' }}>keep going?</span>
      </h1>
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
        You've completed <b style={{ color: '#fff' }}>3 lessons</b> this week.
      </p>

      {/* Resume card */}
      <div style={{
        marginTop: 18,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 18,
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer'
      }} onClick={onContinue}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'rgba(188,233,85,0.14)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-accent)', flexShrink: 0
        }}>
          <Icon name="play" size={22} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Continue learning</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{LESSON.title}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{LESSON.number}</div>
          <div style={{ marginTop: 8 }}>
            <Progress pct={inProgress.progress} onDark showLabel={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentHome({ user, onNav, onContinue, onCourse }) {
  const inProgress = COURSES.filter(c => c.progress > 0);
  const recommended = COURSES.filter(c => c.progress === 0).slice(0, 3);

  return (
    <Phone>
      <StudentHomeHero user={user} onContinue={onContinue} />

      <PageBody padding={16} gap={20} style={{ paddingBottom: 24 }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Stat ico="book-open" label="Enrolled" value={user.enrolled} />
          <Stat ico="clock" label="Hours" value={user.hours} />
          <Stat ico="flame" label="Day streak" value={user.streak} delta="+1" />
        </div>

        {/* In progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-h">
            <h3>In progress</h3>
            <a className="link" onClick={() => onNav('mine')}>View all <Icon name="arrow-right" size={12} /></a>
          </div>

          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -16px', padding: '4px 16px 8px', scrollbarWidth: 'none' }}>
            {inProgress.map(c => (
              <div key={c.id} style={{ flexShrink: 0, width: 220 }}>
                <CourseCard course={c} onClick={() => onCourse(c)} compact />
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-h">
            <h3>Browse by category</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { ico: 'calculator', label: 'Math' },
              { ico: 'flask-conical', label: 'Science' },
              { ico: 'book-open', label: 'Lang Arts' },
              { ico: 'landmark', label: 'Social' },
              { ico: 'languages', label: 'Languages' },
              { ico: 'terminal', label: 'Computing' },
              { ico: 'briefcase', label: 'Business' },
              { ico: 'palette', label: 'Creative' },
            ].map(cat => (
              <button key={cat.label} onClick={() => onNav('browse')} style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-stroke)', borderRadius: 14,
                padding: '12px 4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: 'pointer', color: 'var(--color-primary)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500
              }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-light-gray)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Icon name={cat.ico} size={16} />
                </span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-h">
            <h3>Recommended for you</h3>
            <a className="link" onClick={() => onNav('browse')}>View all <Icon name="arrow-right" size={12} /></a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recommended.slice(0, 2).map(c => (
              <RecCard key={c.id} course={c} onClick={() => onCourse(c)} />
            ))}
          </div>
        </div>
      </PageBody>

      <BottomNav items={STUDENT_TABS} active="home" onChange={onNav} />
    </Phone>
  );
}

/* horizontal recommendation card */
function RecCard({ course, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', gap: 12, padding: 10, background: 'var(--color-surface)',
      border: '1px solid var(--color-stroke)', borderRadius: 16, cursor: 'pointer',
      textAlign: 'left', alignItems: 'stretch'
    }}>
      <div style={{ width: 90, flexShrink: 0 }}>
        <CourseCover kind={course.kind} emblem={course.emblem} height={90} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2px 0' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-body-green)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{course.tag}</div>
          <h4 style={{ margin: '4px 0 4px', fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>{course.title}</h4>
          <div className="h-meta">
            <Icon name="layers" size={11} />
            <span>{course.lessons} lessons</span>
            <span className="dot-sep"></span>
            <Icon name="star" size={11} />
            <span>{course.rating}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--color-body-green)', fontWeight: 500 }}>{course.students.toLocaleString()} students</span>
          <span style={{ width: 26, height: 26, borderRadius: 9999, background: 'var(--color-accent)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrow-right" size={14} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* Browse / Catalog */
function StudentBrowse({ onNav, onCourse }) {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'math', label: 'Math' },
    { id: 'sci', label: 'Science' },
    { id: 'lit', label: 'Lang Arts' },
    { id: 'soc', label: 'Social' },
    { id: 'cs', label: 'Computing' },
  ];
  const list = COURSES.filter(c => filter === 'all' || c.kind === filter)
                      .filter(c => !q || c.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <Phone>
      <AppBar title="Browse Courses" trailing={<IconBtn icon="sliders-horizontal" />} />
      <div style={{ padding: '12px 16px 4px', display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--color-surface)' }}>
        <SearchField value={q} onChange={setQ} placeholder="Search by topic, instructor, course…" />
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 6px', scrollbarWidth: 'none' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '6px 14px', height: 32, borderRadius: 9999,
              border: '1px solid ' + (filter === f.id ? 'var(--color-primary)' : 'var(--color-stroke)'),
              background: filter === f.id ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f.id ? '#fff' : 'var(--color-primary)',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
              cursor: 'pointer', flexShrink: 0
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      <PageBody padding={16} gap={14} style={{ paddingTop: 14, paddingBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--color-body-green)', fontWeight: 500 }}>{list.length} courses</span>
          <span style={{ fontSize: 12, color: 'var(--color-body-green)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <Icon name="arrow-down-up" size={12} /> Most popular
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {list.map(c => (
            <CourseCard key={c.id} course={c} onClick={() => onCourse(c)} compact />
          ))}
        </div>
      </PageBody>

      <BottomNav items={STUDENT_TABS} active="browse" onChange={onNav} />
    </Phone>
  );
}

/* Course detail */
function StudentCourseDetail({ course, onBack, onPlay, onEnrol }) {
  const enrolled = course.progress != null && course.progress >= 0 && course.progress > 0;
  const [tab, setTab] = useState('overview');
  return (
    <Phone>
      <AppBar
        leading={<IconBtn icon="arrow-left" onClick={onBack} />}
        title=""
        transparent
        trailing={
          <Fragment>
            <IconBtn icon="bookmark" />
            <IconBtn icon="share-2" />
          </Fragment>
        } />

      <PageBody padding={0} gap={0} style={{ paddingBottom: 100 }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ position: 'relative' }}>
            <CourseCover kind={course.kind} emblem={course.emblem} tag={course.tag} height={180} />
          </div>
          <h1 style={{
            margin: '16px 0 8px',
            fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700,
            letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--color-primary)'
          }}>{course.title}</h1>

          <div className="h-meta" style={{ gap: 8 }}>
            <Icon name="star" size={12} style={{ color: '#D97706' }} /> <b style={{ color: 'var(--color-primary)' }}>{course.rating}</b>
            <span className="dot-sep"></span>
            <span>{course.students.toLocaleString()} students</span>
            <span className="dot-sep"></span>
            <span>{course.lessons} lessons</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: 12, background: 'var(--color-light-gray)', borderRadius: 12 }}>
            <Avatar size={40} name={course.instructor} variant="dark" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--color-body-green)', fontWeight: 500 }}>Instructor</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{course.instructor}</div>
            </div>
            <Icon name="message-circle" size={18} style={{ color: 'var(--color-body-green)' }} />
          </div>
        </div>

        <div style={{ padding: '20px 16px 0' }}>
          <Tabs items={[
            { id: 'overview', label: 'Overview' },
            { id: 'curriculum', label: 'Curriculum', count: LESSON.curriculum.length },
            { id: 'reviews', label: 'Reviews' },
          ]} active={tab} onChange={setTab} />
        </div>

        <PageBody padding={16} gap={16}>
          {tab === 'overview' && (
            <Fragment>
              <p style={{ margin: 0, color: 'var(--color-body-green)', fontSize: 14, lineHeight: 1.55 }}>
                A practical, paced introduction to {course.tag.toLowerCase()}. {LESSON.desc}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { ico: 'video', label: 'Video lessons', val: course.lessons },
                  { ico: 'clock', label: 'Total time', val: course.time },
                  { ico: 'file-text', label: 'Worksheets', val: 8 },
                  { ico: 'award', label: 'Certificate', val: 'On completion' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 10, background: 'var(--color-surface)', border: '1px solid var(--color-stroke)', borderRadius: 12 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--color-light-gray)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                      <Icon name={f.ico} size={14} />
                    </span>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-body-green)' }}>{f.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{f.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600 }}>What you'll learn</h4>
                {[
                  'Solve linear equations confidently',
                  'Graph slope-intercept and standard form',
                  'Apply ratios and proportions to real problems',
                  'Read and interpret data sets',
                ].map(line => (
                  <div key={line} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--color-body-green)' }}>
                    <Icon name="check" size={14} style={{ color: 'var(--color-success)', marginTop: 3, flexShrink: 0 }} />
                    {line}
                  </div>
                ))}
              </div>
            </Fragment>
          )}

          {tab === 'curriculum' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LESSON.curriculum.map((s, i) => {
                const ico = s.status === 'done' ? 'check-circle' :
                            s.status === 'active' ? 'play-circle' :
                            s.status === 'locked' ? 'lock' : 'circle';
                const color = s.status === 'done' ? 'var(--color-success)' :
                              s.status === 'active' ? 'var(--color-accent)' :
                              s.status === 'locked' ? 'var(--color-muted)' : 'var(--color-body-green)';
                return (
                  <button key={s.id} onClick={s.status === 'active' ? onPlay : null}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                            background: s.status === 'active' ? 'rgba(188,233,85,0.10)' : 'var(--color-surface)',
                            border: '1px solid ' + (s.status === 'active' ? 'rgba(188,233,85,0.40)' : 'var(--color-stroke)'),
                            borderRadius: 12, textAlign: 'left', cursor: s.status === 'active' ? 'pointer' : 'default',
                            opacity: s.status === 'locked' ? 0.6 : 1
                          }}>
                    <span style={{ width: 28, height: 28, borderRadius: 9999, background: 'var(--color-light-gray)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                      <Icon name={ico} size={14} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--color-body-green)', fontWeight: 500 }}>Lesson {i + 1}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{s.title}</div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 500 }}>{s.time}</span>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-stroke)', borderRadius: 14 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 700, lineHeight: 1, color: 'var(--color-primary)' }}>{course.rating}</div>
                  <div style={{ marginTop: 4, color: '#D97706', letterSpacing: 2, fontSize: 12 }}>★★★★★</div>
                  <div style={{ fontSize: 11, color: 'var(--color-body-green)', marginTop: 2 }}>{Math.round(course.students * 0.42)} reviews</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[5, 4, 3, 2, 1].map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-body-green)' }}>
                      <span style={{ width: 8 }}>{s}</span>
                      <span style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--color-stroke)' }}>
                        <span style={{ display: 'block', height: '100%', width: [82, 14, 3, 0.6, 0.4][5 - s] + '%', background: 'var(--color-accent)', borderRadius: 4 }}></span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {[
                { name: 'Imal de Silva', when: '3 d ago', stars: 5, text: 'Lessons are short, focused, and easy to follow. The worksheets really cement the concepts.' },
                { name: 'Tharushi J.', when: '1 w ago', stars: 5, text: 'Best math content I\'ve found online. Re-watched the slope-intercept lesson three times.' },
              ].map(r => (
                <div key={r.name} style={{ padding: 14, background: 'var(--color-surface)', border: '1px solid var(--color-stroke)', borderRadius: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar size={32} name={r.name} variant="dark" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{r.when} · <span style={{ color: '#D97706', letterSpacing: 1 }}>{'★'.repeat(r.stars)}</span></div>
                    </div>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--color-body-green)', lineHeight: 1.5 }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </PageBody>
      </PageBody>

      {/* Sticky enrol bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 24,
        padding: '12px 16px', background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-stroke)',
        display: 'flex', alignItems: 'center', gap: 10, zIndex: 5
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--color-body-green)', fontWeight: 500 }}>Course access</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>{enrolled ? 'Enrolled · ' + course.progress + '%' : 'Free with approval'}</div>
        </div>
        {enrolled
          ? <Button size="lg" icon="play" onClick={onPlay}>Resume</Button>
          : <Button size="lg" icon="plus" onClick={onEnrol}>Request enrol</Button>}
      </div>
    </Phone>
  );
}

/* Lesson player */
function StudentLessonPlayer({ onBack, onComplete }) {
  const [tab, setTab] = useState('about');
  const [playing, setPlaying] = useState(true);
  return (
    <Phone>
      <div style={{
        position: 'relative',
        height: 230,
        background: 'linear-gradient(180deg, #0E1A16 0%, #1F3626 100%)',
        flexShrink: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 8, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px',
          zIndex: 4
        }}>
          <IconBtn icon="chevron-down" onClick={onBack} dark />
          <div style={{ display: 'flex', gap: 4 }}>
            <IconBtn icon="cast" dark />
            <IconBtn icon="more-vertical" dark />
          </div>
        </div>

        {/* fake video frame */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(188,233,85,0.10) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
          opacity: 0.4
        }}></div>
        <div style={{
          position: 'absolute', top: '50%', left: 24, right: 24, transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontFamily: 'var(--font-heading)'
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>y = mx + b</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Slope-intercept form</div>
        </div>

        {/* play */}
        <button onClick={() => setPlaying(!playing)} style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 60, height: 60, borderRadius: 9999,
          background: 'rgba(188,233,85,0.92)',
          border: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-primary)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
        }}>
          <Icon name={playing ? 'pause' : 'play'} size={26} strokeWidth={2} />
        </button>

        {/* progress */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
            <span>9:24</span>
            <span>{LESSON.duration}</span>
          </div>
          <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 4 }}>
            <span style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '64%', background: 'var(--color-accent)', borderRadius: 4 }}></span>
            <span style={{ position: 'absolute', left: '64%', top: '50%', transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: 9999, background: 'var(--color-accent)', boxShadow: '0 0 0 4px rgba(188,233,85,0.20)' }}></span>
          </div>
        </div>
      </div>

      <PageBody padding={16} gap={14} style={{ paddingBottom: 110 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-body-green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{LESSON.number}</div>
          <h1 style={{ margin: '4px 0 6px', fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-primary)' }}>{LESSON.title}</h1>
          <div className="h-meta">
            <Icon name="book-open" size={11} /> {LESSON.course}
            <span className="dot-sep"></span>
            <Icon name="clock" size={11} /> {LESSON.duration}
          </div>
        </div>

        <Tabs items={[
          { id: 'about', label: 'About' },
          { id: 'materials', label: 'Materials', count: LESSON.materials.length },
          { id: 'notes', label: 'Notes' },
        ]} active={tab} onChange={setTab} />

        {tab === 'about' && (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-body-green)', lineHeight: 1.55 }}>
            {LESSON.desc}
          </p>
        )}
        {tab === 'materials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LESSON.materials.map(m => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--color-surface)', border: '1px solid var(--color-stroke)', borderRadius: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--color-light-gray)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <Icon name={m.ico} size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-body-green)' }}>{m.size}</div>
                </div>
                <IconBtn icon="download" />
              </div>
            ))}
          </div>
        )}
        {tab === 'notes' && (
          <Fragment>
            <textarea defaultValue={"• Slope = rise / run\n• y-intercept is where the line crosses the y-axis\n• Practice example 3 again before quiz."} style={{
              width: '100%', minHeight: 140, padding: 12, borderRadius: 12,
              border: '1px solid var(--color-stroke)', background: 'var(--color-surface)',
              fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-primary)',
              resize: 'none', outline: 'none', lineHeight: 1.5
            }} />
            <Button variant="secondary" icon="save" full>Save notes</Button>
          </Fragment>
        )}
      </PageBody>

      {/* sticky bottom action */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 24,
        padding: '12px 16px', background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-stroke)',
        display: 'flex', alignItems: 'center', gap: 8, zIndex: 5
      }}>
        <Button variant="secondary" size="lg" icon="chevron-left" />
        <Button size="lg" icon="check" full onClick={onComplete}>Mark complete</Button>
        <Button variant="secondary" size="lg" iconAfter="chevron-right" />
      </div>
    </Phone>
  );
}

/* My Learning */
function StudentMine({ onNav, onCourse }) {
  const [tab, setTab] = useState('progress');
  const inProgress = COURSES.filter(c => c.progress > 0);
  const enrolled = COURSES.filter(c => c.progress === 0).slice(0, 2);
  return (
    <Phone>
      <AppBar title="My Learning" trailing={<IconBtn icon="search" />} />
      <PageBody padding={16} gap={14} style={{ paddingBottom: 100 }}>
        {/* Stats */}
        <div className="card card--dark" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(188,233,85,0.08)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>This week</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginTop: 4, color: '#fff', letterSpacing: '-0.02em' }}>3 lessons · 2h 14m</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>1 lesson ahead of last week.</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(188,233,85,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
              <Icon name="flame" size={22} />
            </div>
          </div>
          {/* week dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 14, position: 'relative' }}>
            {['M','T','W','T','F','S','S'].map((d, i) => {
              const done = i < 3;
              const active = i === 3;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: done ? 'var(--color-accent)' : active ? 'rgba(188,233,85,0.20)' : 'rgba(255,255,255,0.06)',
                    border: active ? '1.5px solid var(--color-accent)' : 'none',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: done ? 'var(--color-primary)' : 'rgba(255,255,255,0.65)',
                  }}>
                    {done ? <Icon name="check" size={14} /> : null}
                  </span>
                  <span style={{ fontSize: 10, color: done || active ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{d}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Tabs items={[
          { id: 'progress', label: 'In progress', count: inProgress.length },
          { id: 'enrolled', label: 'Enrolled' },
          { id: 'completed', label: 'Done' },
        ]} active={tab} onChange={setTab} />

        {tab === 'progress' && inProgress.map(c => (
          <RecCard key={c.id} course={c} onClick={() => onCourse(c)} />
        ))}
        {tab === 'enrolled' && enrolled.map(c => (
          <RecCard key={c.id} course={c} onClick={() => onCourse(c)} />
        ))}
        {tab === 'completed' && (
          <EmptyState ico="trophy" title="No completions yet" body="Complete a course and you'll see your certificate here." />
        )}
      </PageBody>
      <BottomNav items={STUDENT_TABS} active="mine" onChange={onNav} />
    </Phone>
  );
}

/* Notifications */
function ScreenNotifications({ items, onBack, onMarkAll }) {
  return (
    <Phone>
      <AppBar
        leading={<IconBtn icon="arrow-left" onClick={onBack} />}
        title="Notifications"
        trailing={<button onClick={onMarkAll} style={{ background: 'transparent', border: 0, color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Mark all read</button>} />
      <PageBody padding={0} gap={0} style={{ paddingBottom: 24 }}>
        {items.map((n, i) => {
          const tone = n.tone === 'success' ? 'var(--color-success)' :
                       n.tone === 'warning' ? 'var(--color-warning)' :
                       n.tone === 'info' ? 'var(--color-info)' : 'var(--color-primary)';
          return (
            <div key={n.id} style={{
              display: 'flex', gap: 12, padding: '14px 16px',
              background: n.read ? 'var(--color-surface)' : 'rgba(188,233,85,0.06)',
              borderBottom: '1px solid var(--color-stroke-2)',
              borderLeft: n.read ? 'none' : '3px solid var(--color-accent)',
              paddingLeft: n.read ? 16 : 13,
              cursor: 'pointer'
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: 9999, flexShrink: 0,
                background: 'var(--color-light-gray)', color: tone,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name={n.ico} size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{n.title}</div>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)', flexShrink: 0 }}>{n.when}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-body-green)', marginTop: 2, lineHeight: 1.45 }}>{n.body}</div>
              </div>
            </div>
          );
        })}
      </PageBody>
    </Phone>
  );
}

/* Profile */
function StudentProfile({ user, onNav, onSignOut }) {
  return (
    <Phone>
      <AppBar title="Profile" trailing={<IconBtn icon="settings" />} />
      <PageBody padding={16} gap={16} style={{ paddingBottom: 100 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '8px 0 4px' }}>
          <Avatar size={84} name={user.name} variant="lime" />
          <div style={{ marginTop: 6, fontFamily: 'var(--font-heading)', fontSize: 19, fontWeight: 700, color: 'var(--color-primary)' }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--color-body-green)' }}>{user.email}</div>
          <Eyebrow lime icon="graduation-cap">Student · {user.joined}</Eyebrow>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Stat ico="book-open" label="Enrolled" value={user.enrolled} />
          <Stat ico="clock" label="Hours" value={user.hours + 'h'} />
          <Stat ico="flame" label="Streak" value={user.streak + 'd'} />
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { ico: 'graduation-cap', label: 'My Learning', sub: '4 courses · 23h watched', go: () => onNav('mine') },
            { ico: 'award', label: 'Certificates', sub: 'View completion certificates' },
            { ico: 'bell', label: 'Notifications', sub: '3 unread', go: () => onNav('notifications') },
            { ico: 'credit-card', label: 'Billing', sub: 'Receipts and invoices' },
            { ico: 'shield', label: 'Privacy & security', sub: 'Password, sessions, data' },
            { ico: 'life-buoy', label: 'Help & support' },
          ].map((it, i, arr) => (
            <div key={it.label} onClick={it.go}
                 style={{
                   display: 'flex', alignItems: 'center', gap: 12,
                   padding: '14px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--color-stroke-2)' : 0,
                   cursor: 'pointer'
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
      <BottomNav items={STUDENT_TABS} active="profile" onChange={onNav} />
    </Phone>
  );
}

Object.assign(window, {
  STUDENT_TABS, StudentHome, StudentBrowse, StudentCourseDetail,
  StudentLessonPlayer, StudentMine, ScreenNotifications, StudentProfile,
});
