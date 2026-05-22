import Link from 'next/link';

export default function Home() {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', background: 'linear-gradient(to right, #f2f2f2, #a0a0a0)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
        Turn Words into Wealth
      </h1>
      <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
        ProofStudio helps high-ticket coaches and course creators instantly generate 
        high-converting content packs from client testimonials.
      </p>
      <div className="flex gap-4" style={{ justifyContent: 'center' }}>
        <Link href="/signup" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Get Started Free
        </Link>
        <Link href="/login" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Login to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-3 mt-8" style={{ marginTop: '6rem', textAlign: 'left' }}>
        <div className="card">
          <h3>1. Collect Testimonials</h3>
          <p className="mt-4">Input your client's raw feedback, role, and the core result metric they achieved.</p>
        </div>
        <div className="card">
          <h3>2. AI Generation</h3>
          <p className="mt-4">Our fine-tuned engine creates LinkedIn posts, video scripts, and landing page blocks.</p>
        </div>
        <div className="card">
          <h3>3. Deploy & Profit</h3>
          <p className="mt-4">Copy the generated assets and use them directly in your marketing funnel.</p>
        </div>
      </div>
    </div>
  );
}
