
import React from "react";
import { Button } from "@/components/ui/button";
import { FadeIn, SlideInFromRight } from "@/components/animations/FadeIn";
import { Link } from "react-router-dom";
import { Shield, ChevronRight, BarChart2, CreditCard, Lock, Globe, PieChart, TrendingUp, CheckCircle } from "lucide-react";
import SecurityTipAlert from "@/components/SecurityTipAlert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Landing = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Advanced Fraud Protection",
      description: "AI-powered detection systems that identify and prevent fraudulent transactions in real-time."
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-indigo-500" />,
      title: "Real-time Analytics",
      description: "Comprehensive dashboards providing instant insights into transaction patterns and risk factors."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-teal-500" />,
      title: "Transaction Monitoring",
      description: "Continuously track and analyze every transaction for suspicious activities and patterns."
    },
    {
      icon: <Lock className="h-6 w-6 text-orange-500" />,
      title: "Secure Authentication",
      description: "Multi-factor authentication and biometric verification to ensure only authorized access."
    }
  ];

  const testimonials = [
    {
      quote: "SecuraSentry has transformed our approach to fraud management, reducing our fraud losses by 68% in just three months.",
      author: "Sarah J.",
      role: "Chief Security Officer",
      company: "FinTech Global"
    },
    {
      quote: "The real-time alerts and intuitive dashboard have made my team significantly more efficient at detecting and preventing fraudulent activities.",
      author: "Michael T.",
      role: "Fraud Prevention Manager",
      company: "Commerce Bank"
    },
    {
      quote: "We've been able to scale our operations without compromising on security, thanks to SecuraSentry's robust platform.",
      author: "Elena R.",
      role: "CTO",
      company: "PayNow Solutions"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.3] pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-primary/20 via-indigo-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-teal-400/20 via-indigo-500/20 to-primary/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              Intelligent Fraud Detection
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-indigo-600 to-purple-700 text-transparent bg-clip-text">
              Protect Your Business with AI-Powered Fraud Detection
            </h1>
            <p className="text-lg md:text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
              SecuraSentry provides real-time transaction monitoring and advanced analytics to protect your business from fraud and financial crimes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 shadow-md hover:shadow-lg">
                Get Started <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="border-slate-300">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 mt-16 md:mt-24">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 flex items-center">
                <TrendingUp className="h-10 w-10 text-teal-500 mr-4" />
                <div>
                  <h3 className="font-semibold text-slate-900">99.8%</h3>
                  <p className="text-sm text-slate-600">Fraud Detection Accuracy</p>
                </div>
              </div>
              <div className="p-4 flex items-center">
                <Globe className="h-10 w-10 text-indigo-500 mr-4" />
                <div>
                  <h3 className="font-semibold text-slate-900">Global Coverage</h3>
                  <p className="text-sm text-slate-600">Operating in 120+ Countries</p>
                </div>
              </div>
              <div className="p-4 flex items-center">
                <PieChart className="h-10 w-10 text-orange-500 mr-4" />
                <div>
                  <h3 className="font-semibold text-slate-900">68% Reduction</h3>
                  <p className="text-sm text-slate-600">In Fraud-Related Losses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200">
              Our Platform
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Comprehensive Fraud Protection</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our advanced platform combines AI, machine learning, and expert analysis to provide unmatched security for your financial transactions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Tip Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <SecurityTipAlert className="mb-0" />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Trusted by Industry Leaders</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See what our clients are saying about SecuraSentry's fraud detection platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="mb-4 text-amber-500 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="italic text-slate-700 mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/90 via-indigo-600/90 to-purple-700/90 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Secure Your Business?</h2>
            <p className="text-lg mb-8 text-white/90">
              Join thousands of businesses that trust SecuraSentry for their fraud detection and prevention needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-white" />
                <span className="font-semibold text-xl text-white">SecuraSentry</span>
              </div>
              <p className="text-sm">
                Protecting businesses with advanced AI-powered fraud detection and prevention solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><Link to="/auth" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2023 SecuraSentry. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
