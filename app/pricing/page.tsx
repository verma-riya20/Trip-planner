'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for casual travelers',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Up to 3 trips per month',
        'Basic itinerary planning',
        'Standard map features',
        'Mobile app access',
        'Community support',
        'Basic weather info',
      ],
      highlighted: false,
      cta: 'Get Started',
    },
    {
      name: 'Basic',
      description: 'Great for regular explorers',
      price: { monthly: 9.99, yearly: 99.99 },
      features: [
        'Unlimited trips',
        'Advanced itinerary planning',
        'Real-time collaboration',
        'Offline maps',
        'Budget tracking',
        'Expense splitting',
        'Photo gallery',
        'Email support',
      ],
      highlighted: false,
      cta: 'Start Free Trial',
    },
    {
      name: 'Advanced',
      description: 'For serious adventure seekers',
      price: { monthly: 19.99, yearly: 199.99 },
      features: [
        'Everything in Basic',
        'AI-powered recommendations',
        'Premium accommodations',
        'Flight & hotel booking',
        'Travel insurance info',
        'Currency converter',
        'Local guides directory',
        'Video call support',
        'Group trip management',
        'Custom itinerary AI',
        'Travel statistics & insights',
      ],
      highlighted: true,
      cta: 'Start Free Trial',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Choose the perfect plan for your travel adventures
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`text-lg font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
            style={{
              backgroundColor: billingCycle === 'yearly' ? '#FF5722' : '#e5e7eb',
            }}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-lg font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
            <span className="ml-2 inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
              Save 17%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl transition-all duration-300 hover:shadow-2xl ${
                plan.highlighted
                  ? 'md:scale-105 bg-[#FF5722] text-white shadow-2xl'
                  : 'bg-white border-2 border-gray-200 hover:border-orange-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className={`p-8 ${plan.highlighted ? 'border-b border-orange-400' : 'border-b border-gray-200'}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={plan.highlighted ? 'text-orange-100' : 'text-gray-600'}>{plan.description}</p>

                {/* Price */}
                <div className="mt-6">
                  <span className="text-5xl font-bold">
                    ${plan.price[billingCycle] === 0 ? '0' : plan.price[billingCycle].toFixed(2)}
                  </span>
                  {plan.price[billingCycle] > 0 && (
                    <span className={plan.highlighted ? 'text-orange-100' : 'text-gray-600'}>
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="p-8">
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 mb-8 ${
                    plan.highlighted
                      ? 'bg-white text-[#FF5722] hover:bg-orange-50'
                      : 'bg-[#FF5722] text-white hover:bg-orange-600'
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className={`flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? 'text-yellow-300' : 'text-green-500'
                        }`}
                        size={20}
                      />
                      <span className={plan.highlighted ? 'text-orange-50' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              question: 'Can I switch plans anytime?',
              answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
            },
            {
              question: 'Is there a free trial for paid plans?',
              answer: 'Absolutely! Both Basic and Advanced plans come with a 14-day free trial. No credit card required.',
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept all major credit cards, PayPal, and Apple Pay for seamless transactions.',
            },
            {
              question: 'Do you offer refunds?',
              answer: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with your purchase.',
            },
          ].map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#FF5722] text-white py-16 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to plan your next adventure?</h2>
          <p className="text-orange-100 mb-8">
            Join thousands of travelers who trust Trip Planner for their journey
          </p>
          <button className="bg-white text-[#FF5722] px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
            Get Started for Free
          </button>
        </div>
      </div>
    </div>
  );
}
