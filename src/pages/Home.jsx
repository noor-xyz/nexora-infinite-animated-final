import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { worlds } from '../data/worlds'

const particles = Array.from({ length: 18 }, (_, i) => i)

export default function Home() {
  return <div className="app landing-page">
    <div className="hero-scene" aria-hidden="true">
      <div className="grid-floor" />
      <div className="hero-orbit orbit-a" />
      <div className="hero-orbit orbit-b" />
      <div className="hero-crystal crystal-a">N</div>
      <div className="hero-crystal crystal-b">X</div>
      {particles.map(i => <span key={i} className="particle" style={{ '--i': i }} />)}
    </div>
    <Navbar />
    <main className="hero">
      <div className="hero-copy">
        <div className="badge hero-badge">⚡ AI-POWERED TECHNICAL LEARNING</div>
        <p className="hero-brand">NEXORA <span>· Learn. Play. Level Up.</span></p>
        <h1>LEARN.<br/>PLAY.<br/><span>LEVEL UP.</span></h1>
        <p className="description">Build real coding skills through quests, hands-on challenges, and a personal AI learning mentor.</p>
        <div className="buttons"><Link to="/signup" className="primary-btn">Start Learning <span>→</span></Link><a href="#how-it-works" className="secondary-btn">How it works</a></div>
        <div className="hero-stats"><span>LEARN BY DOING</span><span>GUIDED BY AI</span><span>PROGRESS THAT COUNTS</span></div>
      </div>
      <div className="hero-console" aria-label="NEXORA progression preview">
        <div className="console-top"><span>◉ THE NEXORA LOOP</span><span className="live-dot">LEARN · PLAY · GROW</span></div>
        <div className="console-orb"><div className="console-core">NX</div></div>
        <div className="console-level"><span>YOUR NEXT SKILL STARTS HERE</span><strong>READY</strong></div>
        <div className="console-path">
          <span><i>01</i><b>Choose a world</b></span>
          <span><i>02</i><b>Solve a quest</b></span>
          <span><i>03</i><b>Build real progress</b></span>
        </div>
      </div>
    </main>

    <section className="features reveal-section" id="how-it-works" aria-labelledby="how-title">
      <div className="section-heading how-heading"><p className="section-label">YOUR ADVENTURE, AT YOUR PACE</p><h2 id="how-title">How NEXORA Works</h2><p>Small wins turn into skills you can use.</p></div>
      <div className="feature-card"><div className="feature-icon">◈</div><span className="step-number">01 · EXPLORE</span><h2>Choose Your World</h2><p>Pick a technical skill and find your next learning path.</p></div>
      <div className="feature-card"><div className="feature-icon">⚡</div><span className="step-number">02 · PRACTICE</span><h2>Complete Quests</h2><p>Test your understanding with focused, hands-on challenges.</p></div>
      <div className="feature-card"><div className="feature-icon">✦</div><span className="step-number">03 · PROGRESS</span><h2>Level Up</h2><p>Earn progress for your work and keep building your skills.</p></div>
    </section>

    <section className="worlds reveal-section" id="worlds"><div className="section-heading"><p className="section-label">EXPLORE THE UNIVERSE</p><h2>Choose Your <span>World</span></h2><p>Explore technical learning paths and take the next step in your journey.</p></div><div className="world-grid">{worlds.map(w => <Link to="/signup" className="world-card landing" key={w.id}><div className={`world-icon ${w.color}`}>{w.icon}</div><div className="world-card-glow" /><h3>{w.name}</h3><p>{w.description}</p><span>EXPLORE THE PATH →</span></Link>)}</div></section>

    <section className="ai-section reveal-section"><div className="ai-content"><p className="section-label">INTELLIGENT LEARNING</p><h2>A mentor for the<br/><span>learning journey.</span></h2><p className="ai-description">Ask NEXORA AI Mentor about a coding concept, a bug, or your next challenge. Get guided explanations that help you understand—not just copy an answer.</p><div className="ai-example"><div className="ai-top"><span>🤖 NEXORA AI MENTOR</span><span className="ai-status">GUIDED LEARNING</span></div><div className="mentor-example-modes"><span>💡 Hints</span><span>📚 Explanations</span><span>🐛 Debugging</span><span>🎯 Practice</span></div><div className="quest-created"><span>✦</span><div><strong>Learn one step at a time</strong><p>Ask follow-up questions and keep exploring the idea.</p></div></div><Link to="/signup" className="secondary-btn">Meet Your Mentor →</Link></div></div><div className="ai-visual"><div className="ai-orb"><div className="orb-core">AI</div></div><div className="floating-card card-one">💡 Guided Hint</div><div className="floating-card card-two">🐛 Debug Together</div><div className="floating-card card-three">🎯 Practice Next</div></div></section>
    <section className="final-cta reveal-section">
      <span className="eyebrow">YOUR NEXT LEVEL STARTS WITH ONE STEP</span>
      <h2>Ready to build a skill?</h2>
      <p>Pick a world, take on a quest, and let NEXORA help you keep moving.</p>
      <Link to="/signup" className="primary-btn">Start Learning <span>→</span></Link>
    </section>
    <footer className="landing-footer"><strong>NEXORA</strong><span>Learn. Play. Level Up.</span><span>Build skills one quest at a time.</span></footer>
  </div>
}
