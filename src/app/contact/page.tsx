'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I get started with MyKard?",
    answer: "Getting started is easy! Simply sign up for an account, choose your plan, and follow our onboarding process. Our team will guide you through the setup."
  },
  {
    question: "What types of credentials can I manage?",
    answer: "MyKard supports various types of credentials including educational certificates, professional certifications, licenses, and custom credentials from any issuing organization."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption and security protocols to protect your data. All credentials are stored securely and access is controlled through advanced authentication methods."
  },
  {
    question: "Can I integrate MyKard with other systems?",
    answer: "Absolutely! MyKard offers robust API integration capabilities that allow you to connect with your existing HR systems, learning management systems, and other platforms."
  },
  {
    question: "What support options are available?",
    answer: "We offer 24/7 customer support through email, live chat, and phone. Premium plans also include dedicated account management and priority support."
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  });

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      message: ''
    });
    
    setIsSubmitting(false);
    alert('Thank you for your message! We will get back to you promptly.');
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section with Background Pattern */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-linear-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-6 pt-24 pb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              
             
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Let's Start a{' '}
              <span className="bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>

          </div>

          {/* Main Content Layout */}
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start" style={{marginTop: '80px'}}>
            {/* Left Side - Contact Info Cards */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
              {/* Email Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300" style={{marginBottom: '10px'}}>
                <div className="text-center">
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
                    
                    <a href="mailto:hello@MyKard.com" className="text-purple-600 hover:text-purple-700 font-medium">
                      hello@MyKard.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Media Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300" style={{marginTop: '10px'}}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Follow Us</h3>
                      
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <a
                      href="#"
                      className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-all duration-300 group"
                    >
                      <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-all duration-300 group"
                    >
                      <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-all duration-300 group"
                    >
                      <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-all duration-300 group"
                    >
                      <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* FAQ Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300" style={{marginTop: '10px'}}>
                <div className="text-center">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                  </div>
                  
                  <div className="space-y-5 text-left">
                    {faqData.map((faq, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleFAQ(index)}
                          className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200 rounded-lg"
                        >
                          <span className="font-medium text-gray-900 text-sm">{faq.question}</span>
                          <svg
                            className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                              openFAQ === index ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openFAQ === index && (
                          <div className="px-4 pb-3">
                            <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="relative">
              {/* Floating Elements for Visual Appeal */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                borderRadius: '50%',
                filter: 'blur(20px)',
                zIndex: 0
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(79, 70, 229, 0.1))',
                borderRadius: '50%',
                filter: 'blur(15px)',
                zIndex: 0
              }} />
              
              <div style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                padding: '48px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                zIndex: 1,
                minHeight: '600px'
              }}>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  
                  <h2 style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #1F2937, #374151)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '12px',
                    lineHeight: '1.2'
                  }}>
                    Let's Create Something Amazing Together
                  </h2>
                  
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Name Fields Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                        paddingLeft: '4px'
                      }}>
                        First Name *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          style={{
                            width: '100%',
                            height: '56px',
                            padding: '0 20px 0 48px',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#1F2937',
                            background: 'rgba(249, 250, 251, 0.8)',
                            border: '2px solid rgba(209, 213, 219, 0.6)',
                            borderRadius: '16px',
                            outline: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            backdropFilter: 'blur(10px)'
                          }}
                          placeholder="Enter first name"
                          onFocus={(e) => {
                            e.target.style.borderColor = '#3B82F6';
                            e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                            e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(209, 213, 219, 0.6)';
                            e.target.style.background = 'rgba(249, 250, 251, 0.8)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        
                      </div>
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px',
                        paddingLeft: '4px'
                      }}>
                        Last Name
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            height: '56px',
                            padding: '0 20px 0 48px',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#1F2937',
                            background: 'rgba(249, 250, 251, 0.8)',
                            border: '2px solid rgba(209, 213, 219, 0.6)',
                            borderRadius: '16px',
                            outline: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            backdropFilter: 'blur(10px)'
                          }}
                          placeholder="Enter last name"
                          onFocus={(e) => {
                            e.target.style.borderColor = '#3B82F6';
                            e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                            e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(209, 213, 219, 0.6)';
                            e.target.style.background = 'rgba(249, 250, 251, 0.8)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        
                      </div>
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div style={{ position: 'relative' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                      paddingLeft: '4px'
                    }}>
                      Phone Number *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          height: '56px',
                          padding: '0 20px 0 48px',
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#1F2937',
                          background: 'rgba(249, 250, 251, 0.8)',
                          border: '2px solid rgba(209, 213, 219, 0.6)',
                          borderRadius: '16px',
                          outline: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          backdropFilter: 'blur(10px)'
                        }}
                        placeholder="Enter your phone number"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3B82F6';
                          e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                          e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(209, 213, 219, 0.6)';
                          e.target.style.background = 'rgba(249, 250, 251, 0.8)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      
                    </div>
                  </div>

                  {/* Email Field */}
                  <div style={{ position: 'relative' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                      paddingLeft: '4px'
                    }}>
                      Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%',
                          height: '56px',
                          padding: '0 20px 0 48px',
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#1F2937',
                          background: 'rgba(249, 250, 251, 0.8)',
                          border: '2px solid rgba(209, 213, 219, 0.6)',
                          borderRadius: '16px',
                          outline: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          backdropFilter: 'blur(10px)'
                        }}
                        placeholder="Enter your email address"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3B82F6';
                          e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                          e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(209, 213, 219, 0.6)';
                          e.target.style.background = 'rgba(249, 250, 251, 0.8)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      
                    </div>
                  </div>

                  {/* Message Field */}
                  <div style={{ position: 'relative' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                      paddingLeft: '4px'
                    }}>
                      Your Message
                    </label>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        style={{
                          width: '100%',
                          minHeight: '120px',
                          padding: '16px 20px 16px 48px',
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#1F2937',
                          background: 'rgba(249, 250, 251, 0.8)',
                          border: '2px solid rgba(209, 213, 219, 0.6)',
                          borderRadius: '16px',
                          outline: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          backdropFilter: 'blur(10px)',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Tell us about your project or ask us anything..."
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3B82F6';
                          e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                          e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(209, 213, 219, 0.6)';
                          e.target.style.background = 'rgba(249, 250, 251, 0.8)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      height: '64px',
                      background: isSubmitting 
                        ? 'linear-gradient(135deg, #9CA3AF, #6B7280)' 
                        : 'linear-gradient(135deg, #3B82F6, #9333EA, #4F46E5)',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '700',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      boxShadow: isSubmitting 
                        ? 'none' 
                        : '0 10px 25px rgba(59, 130, 246, 0.3)',
                      transform: isSubmitting ? 'none' : 'translateY(0)',
                      marginTop: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        const target = e.target as HTMLButtonElement;
                        target.style.transform = 'translateY(-2px)';
                        target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        const target = e.target as HTMLButtonElement;
                        target.style.transform = 'translateY(0)';
                        target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div 
                          className="animate-spin"
                          style={{
                            width: '24px',
                            height: '24px',
                            border: '3px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '3px solid white',
                            borderRadius: '50%'
                          }} 
                        />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  {/* Footer Note */}
                  
                </form>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}