// Ready-to-use HeroSection export
import Link from "next/link";
import Image from "next/image";
import { Plus, ArrowUp, CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import { useState, useEffect } from "react";

// Minimal Button, Badge, and Textarea components for portability
function Button({ children, ...props }) {
  return <button {...props} style={{ borderRadius: 8, padding: '8px 16px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>{children}</button>;
}
function Badge({ children }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>{children}</span>;
}
function Textarea(props) {
  return <textarea {...props} style={{ width: '100%', minHeight: 48, borderRadius: 8, border: '1px solid #ccc', padding: 8 }} />;
}

function ThemeSwitch() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);
  return (
    <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
      {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
    </Button>
  );
}

const SUGGESTIONS = [
  "Vajag labu kāzu fotogrāfu Valmierā",
  "Meklēju labu mājas lapu izstrādātāju",
  "Meklēju gudru grāmatvedi",
  "Kas šī ir par platformu",
];

export default function HeroSection() {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', background: 'radial-gradient(125% 125% at 50% 90%,#ffffff 40%,#f4f4f5 100%)', textAlign: 'center', fontSize: 14 }}>
      <nav style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 8vw' }}>
        <Link href="#" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="https://media.zoptero.com/img/zoptero-logo-32x32.svg" alt="zoptero.com logo" width={40} height={40} />
          <span style={{ position: 'absolute', left: -9999 }}>Shadcn UI Kit</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button as="a" href="/sign-in">Ienākt</Button>
          <ThemeSwitch />
        </div>
      </nav>
      <div style={{ width: '100%', maxWidth: 480, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Badge><CheckIcon size={12} style={{ color: '#059669' }} /> Informācijas platforma</Badge>
        <header style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Ekspertu meklētājs.</h1>
          <p style={{ color: '#666', fontSize: 14, margin: 0 }}>Tu meklē. Mēs atrodam. Ar MI.</p>
        </header>
        <div style={{ background: '#f4f4f5', marginTop: 16, width: '100%', borderRadius: 16, padding: 16 }}>
          <Textarea placeholder="Un ko vēlies atrast Tu?" rows={3} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <Button aria-label="Add"><Plus size={16} /></Button>
            <Button aria-label="Send"><ArrowUp size={16} /></Button>
          </div>
        </div>
        <div style={{ width: '100%', display: 'grid', gap: 8, marginTop: 16, gridTemplateColumns: '1fr 1fr' }}>
          {SUGGESTIONS.map((text, i) => (
            <a key={i} href="#" style={{ display: 'block', borderRadius: 999, border: '1px solid #ccc', padding: 8, fontSize: 14, textDecoration: 'none', color: '#222', background: '#fff', marginBottom: 4 }}>{text}</a>
          ))}
        </div>
      </div>
      <p style={{ color: '#888', fontSize: 12, paddingBottom: 12 }}>
        By messaging us, you agree to our <a href="#" style={{ color: '#0070f3', textDecoration: 'underline' }}>Terms of Use</a> and confirm you&apos;ve read our <a href="#" style={{ color: '#0070f3', textDecoration: 'underline' }}>Privacy Policy</a>.
      </p>
    </section>
  );
}
