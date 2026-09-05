"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const districts = [
  'Kenya Rift Valley',
  'Kenya Central District',
  'Kenya Lake Victoria',
  'Kenya Mount Kenya',
  'Kenya Eastern District',
  'Kenya Western District',
  'Kenya Coast District'
];

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  district: z.string().min(1, "Please select a district"),
  localChurch: z.string().min(2, "Local church is required"),
  phone: z.string().regex(/^(?:254|\+254|0)?(7[0-9]{8}|1[0-9]{8})$/, "Invalid Kenyan phone number"),
  registrationType: z.enum(["Full Board", "Day Scholar"]),
  freeTshirtSize: z.enum(["S", "M", "L", "XL", "XXL"]),
  extraTshirtQuantity: z.number().min(0).max(20)
});

type FormData = z.infer<typeof schema>

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      extraTshirtQuantity: 0,
      registrationType: "Full Board",
    }
  })

  const watchRegType = watch("registrationType", "Full Board")

  const totalAmount = watchRegType === 'Full Board' ? 5350 : 2600;

  const onProceedToPayment = async (data: FormData) => {
    setLoading(true);
    setFormData(data);
    
    try {
      const formattedPhone = data.phone.startsWith('+') ? data.phone : 
                            data.phone.startsWith('254') ? `+${data.phone}` : 
                            `+254${data.phone.substring(1)}`

      const apiPayload = {
        fullName: data.fullName,
        district: data.district,
        localChurch: data.localChurch,
        phoneNumber: formattedPhone,
        registrationType: data.registrationType,
        tShirtSize: data.freeTshirtSize,
        extraTShirt: data.extraTshirtQuantity > 0,
        extraTShirtSize: data.extraTshirtQuantity > 0 ? data.freeTshirtSize : undefined
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      })

      const result = await res.json()
      
      if (result.success) {
        // Data saved successfully, move to step 2 for M-PESA instructions
        setStep(2);
      } else {
        alert(result.error || "An error occurred");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  }

  const submitFinalRegistration = () => {
    // Already saved to DB in step 1, just go to success page
    router.push('/success');
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center animate-fade-in-up">
          <div className="brand flex items-center" aria-label="Church of the Nazarene Men's Conference">
            <img className="h-12 w-auto transition-transform hover:scale-105 duration-300" src="/logo.png" alt="Church of the Nazarene logo" />
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6">
            <a href="#registration" className="font-medium text-zinc-600 hover:text-zinc-950 transition-colors">Register</a>
            <Link href="/portal" className="font-medium text-zinc-600 hover:text-zinc-950 transition-colors">Check Balance</Link>
            <Link href="/admin/login" className="font-medium text-zinc-600 hover:text-zinc-950 transition-colors">Admin</Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-zinc-600 focus:outline-none" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <nav className="md:hidden bg-white border-t border-zinc-100 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-fade-in-up">
            <a href="#registration" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50">Register</a>
            <Link href="/portal" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50">Check Balance</Link>
            <Link href="/admin/login" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50">Admin</Link>
          </nav>
        )}
      </header>

      <main>
        <section className="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-12 justify-between items-center relative z-10">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3 animate-fade-in-up delay-100">Annual Gathering</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight animate-fade-in-up delay-200">
                Conference Registration
              </h1>
              <p className="text-lg text-zinc-300 leading-relaxed animate-fade-in-up delay-300">
                Secure your place for the Church of the Nazarene Men&apos;s Conference.
                Complete your details and finalize your payment via M-PESA.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl w-full max-w-md animate-fade-in-up delay-400 shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
              <h3 className="text-xl font-bold border-b border-white/10 pb-4 mb-4 text-zinc-100">Participation Fees</h3>
              <ul className="space-y-4">
                <li className="flex justify-between border-b border-white/5 pb-3 text-zinc-300">
                  <span>Full Board</span>
                  <strong className="text-white">KSh 5,350</strong>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-3 text-zinc-300">
                  <span>Day Scholar</span>
                  <strong className="text-white">KSh 2,600</strong>
                </li>
                <li className="pt-2">
                  <div className="flex justify-between text-zinc-200 font-bold mb-1">
                    <span className="uppercase text-sm tracking-wider">Confirmation Fee</span>
                    <strong className="text-white text-lg">KSh 500</strong>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    * The KSh 500 confirmation fee is a standalone payment required today to secure your spot. This amount is <strong>NOT</strong> deducted from your package cost above.<br/>
                    <span className="text-red-400 font-semibold">* The remaining participation fee balance must be cleared by 15th November.</span>
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="registration" className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="mb-12 text-center animate-fade-in-up">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Participant Details</p>
              <h2 className="text-3xl font-extrabold text-zinc-900">
                {step === 1 ? "Register Today" : "Complete Payment"}
              </h2>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/40 p-6 md:p-10 border border-zinc-100 animate-fade-in-up delay-200">
              {step === 1 ? (
                <form id="registration-form" onSubmit={handleSubmit(onProceedToPayment)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2 font-medium text-sm text-zinc-700 group">
                      <span className="transition-colors group-focus-within:text-zinc-900">Full Name</span>
                      <input type="text" placeholder="e.g. John Kamau" {...register("fullName")} className="p-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 outline-none transition-all duration-300 bg-zinc-50 focus:bg-white" />
                      {errors.fullName && <span className="text-red-500 text-xs animate-fade-in-up">{errors.fullName.message}</span>}
                    </label>

                    <label className="flex flex-col gap-2 font-medium text-sm text-zinc-700 group">
                      <span className="transition-colors group-focus-within:text-zinc-900">District</span>
                      <select {...register("district")} className="p-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 outline-none transition-all duration-300 bg-zinc-50 focus:bg-white cursor-pointer">
                        <option value="">Select district</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {errors.district && <span className="text-red-500 text-xs animate-fade-in-up">{errors.district.message}</span>}
                    </label>

                    <label className="flex flex-col gap-2 font-medium text-sm text-zinc-700 group">
                      <span className="transition-colors group-focus-within:text-zinc-900">Local Church</span>
                      <input type="text" placeholder="e.g. Nakuru N.C.C" {...register("localChurch")} className="p-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 outline-none transition-all duration-300 bg-zinc-50 focus:bg-white" />
                      {errors.localChurch && <span className="text-red-500 text-xs animate-fade-in-up">{errors.localChurch.message}</span>}
                    </label>

                    <label className="flex flex-col gap-2 font-medium text-sm text-zinc-700 group">
                      <span className="transition-colors group-focus-within:text-zinc-900">Phone Number</span>
                      <input type="tel" placeholder="+2547XXXXXXXX" {...register("phone")} className="p-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 outline-none transition-all duration-300 bg-zinc-50 focus:bg-white" />
                      {errors.phone && <span className="text-red-500 text-xs animate-fade-in-up">{errors.phone.message}</span>}
                    </label>
                  </div>

                  <div className="mt-12 pt-10 border-t border-zinc-100">
                    <h3 className="text-xl font-bold mb-6 text-zinc-900">Registration Option</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className={`border-2 p-5 rounded-2xl cursor-pointer flex items-start gap-4 transition-all duration-300 ${watchRegType === 'Full Board' ? 'border-zinc-900 bg-zinc-50 shadow-md transform scale-[1.02]' : 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50'}`}>
                        <input type="radio" value="Full Board" {...register("registrationType")} className="mt-1 accent-zinc-900 w-5 h-5 cursor-pointer transition-transform" />
                        <span className="flex flex-col">
                          <strong className="text-lg text-zinc-900">Full Board</strong>
                          <small className="text-zinc-500 mt-1 font-medium">KSh 5,350</small>
                        </span>
                      </label>
                      <label className={`border-2 p-5 rounded-2xl cursor-pointer flex items-start gap-4 transition-all duration-300 ${watchRegType === 'Day Scholar' ? 'border-zinc-900 bg-zinc-50 shadow-md transform scale-[1.02]' : 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50'}`}>
                        <input type="radio" value="Day Scholar" {...register("registrationType")} className="mt-1 accent-zinc-900 w-5 h-5 cursor-pointer transition-transform" />
                        <span className="flex flex-col">
                          <strong className="text-lg text-zinc-900">Day Scholar</strong>
                          <small className="text-zinc-500 mt-1 font-medium">KSh 2,600</small>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-12 pt-10 border-t border-zinc-100">
                    <h3 className="text-xl font-bold mb-6 text-zinc-900">T-Shirt Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <label className="flex flex-col gap-2 font-medium text-sm text-zinc-700 group">
                        <span className="transition-colors group-focus-within:text-zinc-900">Included Free T-Shirt Size</span>
                        <select {...register("freeTshirtSize")} className="p-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 outline-none transition-all duration-300 bg-zinc-50 focus:bg-white cursor-pointer">
                          <option value="">Select size</option>
                          <option>S</option>
                          <option>M</option>
                          <option>L</option>
                          <option>XL</option>
                          <option>XXL</option>
                        </select>
                        {errors.freeTshirtSize && <span className="text-red-500 text-xs animate-fade-in-up">{errors.freeTshirtSize.message}</span>}
                      </label>

                      <label className="flex flex-col gap-2 font-medium text-sm text-zinc-700 group">
                        <span className="transition-colors group-focus-within:text-zinc-900">Extra T-Shirts (KSh 700 each, paid on site)</span>
                        <input type="number" min="0" max="20" {...register("extraTshirtQuantity", { valueAsNumber: true })} className="p-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-zinc-800 focus:border-zinc-800 outline-none transition-all duration-300 bg-zinc-50 focus:bg-white" />
                      </label>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-end">
                    <button type="submit" className="bg-zinc-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center min-w-[200px] shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:shadow-zinc-900/30 hover:-translate-y-1">
                      Proceed to Pay KSh 500
                    </button>
                  </div>
                </form>
              ) : (
                <div className="animate-fade-in-up">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 md:p-10 text-center">
                    <h3 className="text-2xl font-bold text-green-900 mb-2">Confirmation Required</h3>
                    <p className="text-green-800 mb-2 text-lg">Package Price: <strong>KSh {totalAmount.toLocaleString()}</strong></p>
                    <p className="text-green-800 mb-2 text-lg">Confirmation Fee Due Now: <strong className="text-xl">KSh 500</strong></p>
                    <p className="text-green-700 mb-8 text-sm">
                      Balance of KSh {totalAmount.toLocaleString()} to be paid later. 
                      <strong className="block mt-1 text-red-600">Please note: All balances must be cleared by 15th November.</strong>
                    </p>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100 text-left max-w-lg mx-auto mb-8">
                      <h4 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        M-PESA Instructions
                      </h4>
                      <ol className="list-decimal list-inside space-y-3 text-zinc-700">
                        <li>Go to M-PESA Menu</li>
                        <li>Select <strong>Lipa na M-PESA</strong></li>
                        <li>Select <strong>Pochi la Biashara</strong></li>
                        <li>Enter Phone Number: <strong className="text-green-700 text-lg">0723552949</strong></li>
                        <li>Enter Amount: <strong className="text-green-700 text-lg">500</strong></li>
                        <li>Enter your M-PESA PIN</li>
                      </ol>
                    </div>

                    <button 
                      onClick={submitFinalRegistration} 
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center w-full max-w-lg mx-auto shadow-lg shadow-green-900/20 hover:shadow-xl hover:-translate-y-1"
                    >
                      I Have Sent the Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 text-zinc-500 py-8 border-t border-zinc-900 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Church of the Nazarene. All rights reserved.</p>
          <Link href="/admin/login" className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Admin Panel Login
          </Link>
        </div>
      </footer>
    </div>
  )
}
