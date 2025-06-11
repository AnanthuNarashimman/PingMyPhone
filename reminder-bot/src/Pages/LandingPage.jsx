import { MessageCircle, Clock, Zap, Shield, Check, ArrowRight } from 'lucide-react';
import '../Styles/PageStyles/LandingPage.css'

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {

    const navigate = useNavigate();

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);
    return (
        <div className="landing-page">
            {/* Animated Background */}
            <div className="bg-animation"></div>

            {/* Header */}
            <header className="header">
                <div className="container">
                    <nav className="nav">
                        <div className="logo">
                            <MessageCircle className="logo-icon" />
                            <span>PingMyPhone</span>
                        </div>
                        <button className="cta-button primary gstarted" onClick={() => {navigate('/login')}}>
                            Get Started
                            <ArrowRight size={18} />
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className={`hero ${isVisible ? 'visible' : ''}`}>
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Never Miss What <span className="gradient-text">Matters</span>
                        </h1>
                        <p className="hero-subtitle">
                            Set custom reminders on the web, get notified instantly on Telegram.
                            Simple, reliable, and always in your pocket.
                        </p>
                        <div className="hero-buttons">
                            <button className="cta-button primary large" onClick={() => {navigate('/login')}}>
                                Start Reminding
                                <ArrowRight size={20} />
                            </button>
                            
                                <a href="#how" className='cta-buttonlink'><button className="cta-button secondary large seehowButton">See How It Works</button></a>
                           
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="phone-mockup">
                            <div className="phone-screen">
                                <div className="telegram-message">
                                    <div className="message-bubble">
                                        <Clock size={16} />
                                        <span>Reminder: Call mom at 3 PM</span>
                                    </div>
                                    <div className="message-time">Just now</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title">Why Choose PingMyPhone?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Zap />
                            </div>
                            <h3>Timed Notifications</h3>
                            <p>Get reminders delivered directly to your Telegram chat. No app switching required.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Clock />
                            </div>
                            <h3>Flexible Scheduling</h3>
                            <p>Set reminders for any date and time. Perfect for both urgent tasks and future planning.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Shield />
                            </div>
                            <h3>Simple & Secure</h3>
                            <p>Easy setup with your Telegram ID. Your data stays private and secure.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title" id='how'>How It Works</h2>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Connect Your Telegram</h3>
                                <p>Enter your Telegram ID to link your account</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Create Reminders</h3>
                                <p>Set up custom reminders with your preferred date and time</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Get Notified</h3>
                                <p>Receive your reminders directly in your Telegram chat</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Never Forget Again?</h2>
                        <p>Join users who trust PingMyPhone to keep them on track</p>
                        <button className="cta-button primary large" onClick={() => {navigate('/login')}}>
                            Get Started Now
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <MessageCircle size={24} />
                            <span>PingMyPhone</span>
                        </div>
                        <p>Built with ❤️ for productivity enthusiasts</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
