import { Link } from 'react-router-dom';
import { Link as LinkIcon, Shield, CheckCircle, Users, Clock, Award, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar'; 

const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: 'Comprehensive Coverage',
      description: 'Protection for life, health, auto, and property with customizable plans.',
    },
    {
      icon: Clock,
      title: 'Fast Claims Processing',
      description: 'Get your claims processed within 24-48 hours with our streamlined system.',
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Our dedicated team is available round the clock to assist you.',
    },
    {
      icon: Award,
      title: 'Trusted by Thousands',
      description: 'Over 50,000 satisfied customers trust us with their insurance needs.',
    },
  ];

  const plans = [
    {
      name: 'Basic',
      price: '29',
      features: ['Life Insurance', 'Basic Health Coverage', 'Email Support', 'Online Portal Access'],
      popular: false,
    },
    {
      name: 'Professional',
      price: '79',
      features: ['Everything in Basic', 'Auto Insurance', 'Property Coverage', 'Priority Support', 'Family Plans'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '149',
      features: ['Everything in Professional', 'Business Coverage', 'Dedicated Agent', 'Custom Plans', 'Premium Benefits'],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Navbar (fixed) */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden">
        {/* Background Effects — subtle on white */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              Protect What{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Matters Most
              </span>
            </h1>

            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Comprehensive insurance solutions tailored to your needs. Experience peace of mind with our reliable coverage and exceptional service.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:from-emerald-400 hover:to-cyan-400 transition-all transform hover:scale-105 shadow-2xl shadow-emerald-500/20"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg
                hover:bg-slate-50 hover:shadow-lg hover:shadow-emerald-400/4 transition-all transform hover:scale-[1.03]"
              >
                <span>Sign In to Account</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { value: '10K+', label: 'Active Customers' },
              { value: '₹2Cr+', label: 'Claims Paid' },
              { value: '98.9%', label: 'Uptime' },
              { value: '4.5★', label: 'Customer Rating' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-white border border-slate-300 shadow-sm">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-slate-600 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">InsureOne</span>
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              We combine cutting-edge technology with personalized service to deliver the best insurance experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-white border border-slate-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-colors">
                    <Icon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section (updated) */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Pricing</span>
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include our core protection features.
            </p>
          </div>

          {/* ensure grid items stretch so we can align buttons to bottom */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((plan, index) => (
              // make each card a flex column and full height
              <div
                key={index}
                className={`relative flex flex-col h-full p-6 rounded-2xl transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-emerald-500/10 to-cyan-500/10 border-2 border-emerald-500/30 shadow-md hover:-translate-y-2 hover:shadow-lg'
                    : 'bg-white border border-slate-300 shadow-sm hover:-translate-y-2 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-white text-xs font-bold shadow-sm">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-slate-600 text-base">$</span>
                    <span className="text-3xl md:text-4xl font-bold text-slate-900 mx-1">{plan.price}</span>
                    <span className="text-slate-600">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6 text-sm text-slate-700">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link
                    to="/register"
                    className={`block w-full text-center py-2 px-4 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400'
                        : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-10 rounded-3xl bg-white border border-slate-300 overflow-hidden shadow-sm">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 pointer-events-none"></div>

            <div className="relative text-center z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Ready to Get Protected?
              </h2>
              <p className="text-slate-600 text-base mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust InsureOne with their insurance needs. Start your journey to peace of mind today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold text-lg hover:from-emerald-400 hover:to-cyan-400 transition-all transform hover:scale-105 shadow-2xl shadow-emerald-500/20"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg
                  hover:bg-slate-50 hover:shadow-lg hover:shadow-emerald-400/4 transition-all transform hover:scale-[1.03]"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">InsureOne</span>
              </div>
              <p className="text-slate-600 max-w-sm leading-relaxed">
                Providing comprehensive insurance solutions since 2020. Your security is our priority.
              </p>
            </div>

            <div>
              <h4 className="text-slate-900 font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
              <li>
                <Link to="/login" className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors">
                  <LinkIcon className="h-4 w-4 text-emerald-400" />
                  <span>Sign In</span>
                </Link>
              </li>

              <li>
                <Link to="/register" className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors">
                  <LinkIcon className="h-4 w-4 text-emerald-400" />
                  <span>Register</span>
                </Link>
              </li>
            </ul>
            </div>

            <div>
              <h4 className="text-slate-900 font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  <span>+91-9876543210</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  <span>support@insureone.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  <span>Bengaluru, India 560085</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-500">
              © {new Date().getFullYear()} InsureOne Insurance. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;