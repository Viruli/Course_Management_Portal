/* EduPath Mobile — atomic components.
   Loaded on window so other Babel files can use them. */

const { useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;

/* Lucide wrapper — renders `<i data-lucide>` and refreshes on mount. */
function Icon({ name, size = 18, color, strokeWidth = 1.75, style, className }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons({ nameAttr: 'data-lucide' });
  });
  return (
    <i ref={ref}
       data-lucide={name}
       className={className}
       style={{
         width: size, height: size,
         display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
         color, strokeWidth,
         ...(style || {})
       }} />
  );
}

/* Logo image (default | reversed | mark) */
function Logo({ variant = 'default', height = 28 }) {
  const src = variant === 'reversed' ? 'assets/logo-reversed.svg'
            : variant === 'mark'     ? 'assets/logo-mark.svg'
                                     : 'assets/logo-default.svg';
  return <img src={src} alt="EduPath" style={{ height, display: 'block' }} />;
}

/* Button — primary / secondary / ghost / dark */
function Button({ children, variant = 'primary', size, full, icon, iconAfter, onClick, type = 'button', disabled, dark, ...rest }) {
  const cls = ['btn', `btn--${variant}`, size && `btn--${size}`, full && 'btn--full'].filter(Boolean).join(' ');
  return (
    <button className={cls} type={type} onClick={onClick} disabled={disabled} {...rest}>
      {icon && <Icon name={icon} size={size === 'lg' ? 18 : 16} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={size === 'lg' ? 18 : 16} />}
    </button>
  );
}

/* Avatar — supports image src or initials fallback */
function Avatar({ src, name = '?', size = 36, variant }) {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className={'avatar' + (variant ? ' avatar--' + variant : '')}
          style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}>
      {src ? <img src={src} alt={name} /> : initials}
    </span>
  );
}

/* Badge */
function Badge({ children, tone = 'success', icon }) {
  return (
    <span className={'badge badge--' + tone}>
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  );
}

/* Eyebrow pill */
function Eyebrow({ children, dark, lime, icon }) {
  return (
    <span className={'eyebrow-pill' + (dark ? ' dark' : '') + (lime ? ' lime' : '')}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/* Status bar */
function StatusBar({ dark, time = '9:30' }) {
  return (
    <div className={'statusbar' + (dark ? ' dark' : '')}>
      <span>{time}</span>
      <div className="statusbar__icons">
        <Icon name="signal" size={14} />
        <Icon name="wifi" size={14} />
        <Icon name="battery-full" size={16} />
      </div>
    </div>
  );
}

/* Gesture pill */
function GestureBar({ dark }) {
  return <div className={'gesture-bar' + (dark ? ' dark' : '')}><i></i></div>;
}

/* Phone shell — owns status + body + gesture bar */
function Phone({ children, dark, time, scrollKey }) {
  const bodyRef = useRef(null);
  // reset scroll when scrollKey changes (i.e. screen change)
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [scrollKey]);
  return (
    <div className="phone">
      <div className={'phone__screen' + (dark ? ' dark' : '')}>
        <div className="phone__cam"></div>
        <StatusBar dark={dark} time={time} />
        <div className="screen-body" ref={bodyRef}>{children}</div>
        <GestureBar dark={dark} />
      </div>
    </div>
  );
}

/* App bar */
function AppBar({ title, leading, trailing, transparent, dark, subtitle }) {
  return (
    <header className={'appbar' + (transparent ? ' transparent' : '') + (dark ? ' dark' : '')}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="appbar__title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, fontWeight: 500, color: dark ? 'rgba(255,255,255,0.6)' : 'var(--color-muted)', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {trailing}
    </header>
  );
}

/* IconButton */
function IconBtn({ icon, onClick, dark, dot, size = 20 }) {
  return (
    <button className={'iconbtn' + (dark ? ' dark' : '')} onClick={onClick}>
      <Icon name={icon} size={size} />
      {dot && <span className="iconbtn__dot"></span>}
    </button>
  );
}

/* Bottom navigation */
function BottomNav({ items, active, onChange }) {
  return (
    <nav className="bottom-nav">
      {items.map(it => {
        const isActive = it.id === active;
        return (
          <button key={it.id}
                  className={'bottom-nav__item' + (isActive ? ' bottom-nav__item--active' : '')}
                  onClick={() => onChange(it.id)}>
            <span className="bottom-nav__item__pill">
              <Icon name={it.ico} size={20} />
            </span>
            <span>{it.label}</span>
            {it.badge && <span className="bottom-nav__item__badge">{it.badge}</span>}
          </button>
        );
      })}
    </nav>
  );
}

/* Progress bar */
function Progress({ pct, onDark, showLabel = true }) {
  return (
    <div className={'progress' + (onDark ? ' on-dark' : '')}>
      <div className="progress__bar"><i style={{ width: pct + '%' }}></i></div>
      {showLabel && <span className="progress__pct">{pct}%</span>}
    </div>
  );
}

/* Tabs (segmented) */
function Tabs({ items, active, onChange, dark }) {
  return (
    <div className={'tabs' + (dark ? ' dark' : '')}>
      {items.map(it => (
        <button key={it.id}
                className={'tabs__item' + (active === it.id ? ' tabs__item--active' : '')}
                onClick={() => onChange(it.id)}>
          {it.ico && <Icon name={it.ico} size={14} />}
          {it.label}
          {it.count != null && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              padding: '1px 6px', borderRadius: 9999,
              background: active === it.id ? 'var(--color-accent)' : 'rgba(21,42,36,0.08)',
              color: 'var(--color-primary)'
            }}>{it.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* Course cover with emblem */
function CourseCover({ kind = 'math', emblem = 'calculator', tag, pct, height = 'auto', overlay }) {
  return (
    <div className={'cover cover--' + kind} style={{ height }}>
      {tag && <span className="cover__tag">{tag}</span>}
      <Icon name={emblem} size={56} className="cover__icon" strokeWidth={1.25} />
      {pct != null && <span className="cover__pct">{pct}%</span>}
      {overlay}
    </div>
  );
}

/* Course card (used in lists / grids) */
function CourseCard({ course, onClick, compact }) {
  return (
    <button onClick={onClick}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              border: '1px solid var(--color-stroke)',
              background: 'var(--color-surface)', borderRadius: 16,
              overflow: 'hidden', padding: 0, cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
              transition: 'transform 200ms, box-shadow 200ms'
            }}>
      <CourseCover kind={course.kind} emblem={course.emblem} tag={course.tag} height={compact ? 100 : 130} />
      <div style={{ padding: 14 }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>{course.title}</h3>
        <div className="h-meta" style={{ marginTop: 8 }}>
          <Icon name="layers" size={11} />
          <span>{course.lessons} lessons</span>
          <span className="dot-sep"></span>
          <Icon name="clock" size={11} />
          <span>{course.time}</span>
        </div>
        {course.progress != null && course.progress > 0 ? (
          <div style={{ marginTop: 10 }}>
            <Progress pct={course.progress} />
          </div>
        ) : course.instructor ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <Avatar size={20} name={course.instructor} src={course.instructorAvatar} />
            <span style={{ fontSize: 12, color: 'var(--color-body-green)', fontWeight: 500 }}>{course.instructor}</span>
          </div>
        ) : null}
      </div>
    </button>
  );
}

/* Search field */
function SearchField({ value, onChange, placeholder = 'Search', dark }) {
  return (
    <div className="input-icon" style={{ width: '100%' }}>
      <span className="input-icon__ico"><Icon name="search" size={18} /></span>
      <input className={'input' + (dark ? ' input--dark' : '')}
             value={value}
             onChange={e => onChange && onChange(e.target.value)}
             placeholder={placeholder} />
    </div>
  );
}

/* Generic page padding wrapper */
function PageBody({ children, padding = 16, gap = 16, style }) {
  return <div style={{ padding, display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>;
}

/* Empty state block */
function EmptyState({ icon = 'inbox', title, body, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', padding: '40px 24px', gap: 12
    }}>
      <span style={{
        width: 64, height: 64, borderRadius: 9999,
        background: 'var(--color-light-gray)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-body-green)'
      }}>
        <Icon name={icon} size={28} />
      </span>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>{title}</h3>
      {body && <p style={{ margin: 0, color: 'var(--color-body-green)', fontSize: 13, maxWidth: 260, lineHeight: 1.45 }}>{body}</p>}
      {action}
    </div>
  );
}

/* Stat card (small) */
function Stat({ label, value, ico, tone = 'default', delta }) {
  const dark = tone === 'dark';
  return (
    <div style={{
      flex: 1,
      borderRadius: 14,
      padding: 14,
      background: dark ? 'var(--color-primary)' : 'var(--color-surface)',
      border: '1px solid ' + (dark ? 'rgba(255,255,255,0.08)' : 'var(--color-stroke)'),
      color: dark ? '#fff' : 'var(--color-primary)',
      display: 'flex', flexDirection: 'column', gap: 8,
      minWidth: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          width: 30, height: 30, borderRadius: 8,
          background: dark ? 'rgba(255,255,255,0.10)' : 'var(--color-light-gray)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: dark ? 'var(--color-accent)' : 'var(--color-primary)'
        }}>
          <Icon name={ico} size={14} />
        </span>
        {delta && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 10,
            color: dark ? 'var(--color-accent)' : 'var(--color-success-deep)'
          }}>{delta}</span>
        )}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 500, color: dark ? 'rgba(255,255,255,0.65)' : 'var(--color-body-green)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, Logo, Button, Avatar, Badge, Eyebrow,
  StatusBar, GestureBar, Phone, AppBar, IconBtn,
  BottomNav, Progress, Tabs, CourseCover, CourseCard,
  SearchField, PageBody, EmptyState, Stat,
});
