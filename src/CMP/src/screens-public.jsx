/* EduPath Mobile — public surface (splash, onboarding, auth) */

/* Splash */
function ScreenSplash({ onContinue }) {
  return (
    <Phone dark>
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center', color: '#fff', position: 'relative'
      }}>
        {/* lime gradient ring */}
        <div style={{
          position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(188,233,85,0.16) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}></div>

        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: 'rgba(188, 233, 85, 0.10)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(188,233,85,0.30)',
          marginBottom: 28,
          position: 'relative'
        }}>
          <img src="assets/logo-mark.svg" style={{ width: 64, height: 64, borderRadius: 16 }} />
        </div>

        <Logo variant="reversed" height={28} />
        <p style={{
          marginTop: 14, color: 'rgba(255,255,255,0.65)',
          fontSize: 14, lineHeight: 1.45, maxWidth: 260
        }}>
          Learn at your pace. Grow without limits.
        </p>

        <div style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button full size="lg" onClick={onContinue}>Get started</Button>
          <Button full size="lg" variant="ghost-on-dark" onClick={() => onContinue('signin')}>I already have an account</Button>
        </div>
      </div>
    </Phone>
  );
}

/* Onboarding (3 slides) */
function ScreenOnboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const slides = [
    { ico: 'graduation-cap', tag: 'Structured learning',
      title: 'Courses built around your goals',
      body: 'Step-by-step semesters with bite-sized video lessons designed for working professionals.' },
    { ico: 'video', tag: 'Watch and learn',
      title: 'Expert-led video lessons',
      body: 'Pause, rewind, and revisit any lesson. Download worksheets and quizzes to practice offline.' },
    { ico: 'trending-up', tag: 'Track your progress',
      title: 'Stay on course every day',
      body: 'Build streaks, watch your completion grow, and pick up where you left off — anywhere.' },
  ];
  const s = slides[step];
  const last = step === slides.length - 1;

  return (
    <Phone dark scrollKey={step}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onDone} style={{
            background: 'transparent', border: 0, color: 'rgba(255,255,255,0.65)',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '8px 4px'
          }}>Skip</button>
        </div>

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            width: 188, height: 188, borderRadius: 32,
            background: 'linear-gradient(135deg, rgba(188,233,85,0.14) 0%, rgba(188,233,85,0.04) 100%)',
            border: '1px solid rgba(188,233,85,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-accent)',
            marginBottom: 28
          }}>
            <Icon name={s.ico} size={84} strokeWidth={1.25} />
          </div>

          <Eyebrow dark icon="sparkle">{s.tag}</Eyebrow>

          <h1 style={{
            margin: '16px 0 10px', color: '#fff',
            fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 700,
            letterSpacing: '-0.02em', lineHeight: 1.15, textWrap: 'balance'
          }}>{s.title}</h1>
          <p style={{
            margin: 0, color: 'rgba(255,255,255,0.65)',
            fontSize: 14, lineHeight: 1.5, maxWidth: 280
          }}>{s.body}</p>
        </div>

        {/* dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '18px 0' }}>
          {slides.map((_, i) => (
            <span key={i} style={{
              width: i === step ? 22 : 6, height: 6, borderRadius: 6,
              background: i === step ? 'var(--color-accent)' : 'rgba(255,255,255,0.20)',
              transition: 'all 200ms ease'
            }}></span>
          ))}
        </div>

        <Button full size="lg"
                onClick={() => last ? onDone() : setStep(step + 1)}
                iconAfter={last ? null : 'arrow-right'}>
          {last ? 'Get started' : 'Next'}
        </Button>
      </div>
    </Phone>
  );
}

/* Sign in */
function ScreenSignIn({ onSubmit, onSwitch, onBack }) {
  const [email, setEmail] = useState('anjali.silva@edupath.lk');
  const [pw, setPw] = useState('•••••••••');
  const [show, setShow] = useState(false);
  return (
    <Phone>
      <AppBar
        leading={<IconBtn icon="arrow-left" onClick={onBack} />}
        title=""
        transparent />
      <div style={{ flex: 1, padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <Logo height={28} />
        <h1 style={{
          margin: '32px 0 8px',
          fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700,
          letterSpacing: '-0.02em', lineHeight: 1.15
        }}>
          Welcome <span style={{ color: 'var(--color-body-green)', fontWeight: 600 }}>back.</span>
        </h1>
        <p style={{ margin: 0, color: 'var(--color-body-green)', fontSize: 14 }}>
          Sign in to continue your learning.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
          <div className="field">
            <label className="field__label">Email</label>
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label className="field__label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" style={{ width: '100%', paddingRight: 44 }}
                     type={show ? 'text' : 'password'}
                     value={pw} onChange={e => setPw(e.target.value)} placeholder="Your password" />
              <button onClick={() => setShow(!show)} style={{
                position: 'absolute', right: 6, top: 6, width: 36, height: 36,
                background: 'transparent', border: 0, color: 'var(--color-muted)', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name={show ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-body-green)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#152A24', width: 16, height: 16 }} />
              Remember me
            </label>
            <a href="#" style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Forgot?</a>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 24 }}>
          <Button full size="lg" onClick={onSubmit}>Sign in</Button>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-body-green)' }}>
            New to EduPath? <a onClick={onSwitch} style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Create account</a>
          </div>
        </div>
      </div>
    </Phone>
  );
}

/* Sign up */
function ScreenSignUp({ onSubmit, onSwitch, onBack }) {
  return (
    <Phone>
      <AppBar
        leading={<IconBtn icon="arrow-left" onClick={onBack} />}
        title=""
        transparent />
      <div style={{ flex: 1, padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <Logo height={28} />
        <h1 style={{
          margin: '32px 0 8px',
          fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700,
          letterSpacing: '-0.02em', lineHeight: 1.15
        }}>
          Start your <span style={{ color: 'var(--color-body-green)', fontWeight: 600 }}>journey.</span>
        </h1>
        <p style={{ margin: 0, color: 'var(--color-body-green)', fontSize: 14 }}>
          Create an account to enrol in courses.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
          <div className="field">
            <label className="field__label">Full name</label>
            <input className="input" defaultValue="Anjali Silva" placeholder="Your name" />
          </div>
          <div className="field">
            <label className="field__label">Email</label>
            <input className="input" defaultValue="anjali.silva@edupath.lk" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label className="field__label">Password</label>
            <input className="input" type="password" defaultValue="•••••••••" placeholder="At least 8 characters" />
            <span style={{ fontSize: 11, color: 'var(--color-body-green)' }}>Use 8+ characters with a number and a symbol.</span>
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: 'var(--color-body-green)', cursor: 'pointer', marginTop: 4 }}>
            <input type="checkbox" defaultChecked style={{ accentColor: '#152A24', width: 16, height: 16, marginTop: 2 }} />
            I agree to the <a style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Terms</a> &amp; <a style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Privacy Policy</a>.
          </label>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 18 }}>
          <Button full size="lg" onClick={onSubmit}>Create account</Button>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-body-green)' }}>
            Already have one? <a onClick={onSwitch} style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Sign in</a>
          </div>
        </div>
      </div>
    </Phone>
  );
}

/* Pending approval */
function ScreenPending({ onSignOut }) {
  return (
    <Phone>
      <AppBar leading={<Logo height={22} />} transparent trailing={<IconBtn icon="log-out" onClick={onSignOut} />} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{
          width: 88, height: 88, borderRadius: 9999,
          background: 'var(--color-warning-bg)',
          color: 'var(--color-warning)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 22, position: 'relative'
        }}>
          <Icon name="clock" size={36} strokeWidth={1.5} />
          <span style={{
            position: 'absolute', inset: -6, borderRadius: 9999,
            border: '1.5px dashed rgba(217, 119, 6, 0.45)',
            animation: 'spin 8s linear infinite'
          }}></span>
          <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
        </div>

        <Eyebrow icon="clock">Pending approval</Eyebrow>
        <h1 style={{
          margin: '14px 0 10px',
          fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700,
          letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--color-primary)',
          textWrap: 'balance'
        }}>Account awaiting admin approval.</h1>
        <p style={{ margin: 0, color: 'var(--color-body-green)', fontSize: 14, lineHeight: 1.5, maxWidth: 280 }}>
          You'll get an email — and a notification here — once an admin grants your access.
        </p>

        <div style={{ marginTop: 24, padding: 14, background: 'var(--color-light-gray)', borderRadius: 14, fontSize: 12, color: 'var(--color-body-green)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 300 }}>
          <Icon name="info" size={16} />
          Average wait time today is <b style={{ color: 'var(--color-primary)' }}>under 4 hours</b>.
        </div>

        <div style={{ marginTop: 'auto', width: '100%', display: 'flex', gap: 10 }}>
          <Button full variant="secondary" onClick={onSignOut} icon="log-out">Sign out</Button>
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, {
  ScreenSplash, ScreenOnboarding, ScreenSignIn, ScreenSignUp, ScreenPending,
});
