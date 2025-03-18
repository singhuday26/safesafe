
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CheckCircle, CreditCard, Bell, Zap, BarChart3, Users } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import SafeSafeLogo from "@/components/SafeSafeLogo";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navigation */}
      <header className="px-6 lg:px-10 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 backdrop-blur-sm bg-white/60">
        <div className="container mx-auto flex justify-between items-center">
          <SafeSafeLogo size="lg" />
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="space-x-6">
              <Link to="#features" className="text-gray-600 hover:text-primary transition-colors">Features</Link>
              <Link to="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Testimonials</Link>
              <Link to="#pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</Link>
            </nav>
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <span className="sr-only">Open menu</span>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="container mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-4xl mx-auto text-center">
              <SafeSafeLogo size="xl" className="mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-primary to-indigo-600 mb-6">
                Protect Your Financial Future with SafeSafe
              </h1>
              <p className="text-lg md:text-xl text-slate-700 mb-10 max-w-3xl mx-auto">
                Advanced fraud detection and financial protection for individuals and businesses. Stay one step ahead of threats with real-time monitoring and smart alerts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={() => navigate("/auth")}>
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="px-8" onClick={() => navigate("/auth")}>
                  See Demo
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Security Features</h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                SafeSafe provides enterprise-grade security features to protect your financial data and transactions around the clock.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="featured-card bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                  <Shield className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Fraud Detection</h3>
                <p className="text-slate-600">Continuously monitor transactions and activity patterns to identify and prevent fraudulent actions before they impact you.</p>
              </div>
              
              <div className="featured-card bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-5">
                  <Bell className="text-amber-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Alerts</h3>
                <p className="text-slate-600">Receive immediate notifications about suspicious activities through multiple channels including email, SMS, and push notifications.</p>
              </div>
              
              <div className="featured-card bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-5">
                  <CreditCard className="text-green-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Payment Protection</h3>
                <p className="text-slate-600">Secure all your payment methods with advanced encryption and verification protocols that meet industry standards.</p>
              </div>
              
              <div className="featured-card bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                  <BarChart3 className="text-indigo-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Risk Analytics</h3>
                <p className="text-slate-600">Gain insights into your security posture with comprehensive risk scoring and detailed analytical reports.</p>
              </div>
              
              <div className="featured-card bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                  <Lock className="text-purple-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multi-factor Authentication</h3>
                <p className="text-slate-600">Add extra layers of security to your account with customizable authentication options including biometrics and authenticator apps.</p>
              </div>
              
              <div className="featured-card bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-5">
                  <Users className="text-rose-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Team Access Controls</h3>
                <p className="text-slate-600">Manage permissions and access levels for team members with granular controls and detailed audit logs.</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Thousands</h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Hear from our users about how SafeSafe has transformed their approach to financial security.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-gray-500">Small Business Owner</p>
                  </div>
                </div>
                <p className="text-slate-600">"SafeSafe has given me peace of mind knowing my business transactions are protected. The real-time alerts have saved us from several fraudulent attempts."</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-semibold">Michael Chen</h4>
                    <p className="text-sm text-gray-500">Financial Analyst</p>
                  </div>
                </div>
                <p className="text-slate-600">"The analytical capabilities of SafeSafe are impressive. I can track security metrics and identify potential vulnerabilities before they become problems."</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-semibold">Emma Rodriguez</h4>
                    <p className="text-sm text-gray-500">Personal Banking</p>
                  </div>
                </div>
                <p className="text-slate-600">"After experiencing identity theft, I switched to SafeSafe. Their multi-factor authentication and constant monitoring has made me feel secure again."</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Choose the plan that fits your needs with no hidden fees or surprises.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="border border-slate-200 rounded-xl p-6 bg-white">
                <h3 className="text-xl font-semibold mb-2">Basic</h3>
                <p className="text-slate-600 mb-4">Personal protection essentials</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$9</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Basic fraud monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Email alerts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Monthly security reports</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Get Started</Button>
              </div>
              
              <div className="border-2 border-primary rounded-xl p-6 bg-white relative">
                <div className="absolute top-0 transform -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <p className="text-slate-600 mb-4">Advanced protection for individuals</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Real-time fraud monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>SMS, email & push notifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Multi-factor authentication</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Weekly security reports</span>
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </div>
              
              <div className="border border-slate-200 rounded-xl p-6 bg-white">
                <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                <p className="text-slate-600 mb-4">Complete solution for businesses</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$99</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Enterprise-grade security</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Team access controls</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>API integration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Custom analytics dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to secure your financial future?</h2>
              <p className="text-lg text-blue-100 mb-8">
                Join thousands of users who trust SafeSafe to protect their financial data and transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => navigate("/auth")}>
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-600">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <SafeSafeLogo size="lg" className="text-white mb-4" />
              <p className="text-slate-400 mb-4">
                Advanced fraud detection and financial protection for everyone.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400">© 2023 SafeSafe, Inc. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
