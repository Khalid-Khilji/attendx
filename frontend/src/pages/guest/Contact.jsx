import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Phone, MapPin, Send, CheckCircle, Sparkles, User } from 'lucide-react'
import { Button, Input, Loader } from '../../components/index'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', message: '' })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pb-12 overflow-x-hidden selection:bg-violet-500/30">
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-5%] w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <section className="px-4 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles size={14} /> Global Support
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black tracking-tighter leading-none mb-6 text-zinc-900 dark:text-white uppercase"
          >
            Get In <span className="bg-linear-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent italic">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto font-medium"
          >
            Technical support: <span className="text-violet-600 font-bold">attendx2025@gmail.com</span>
          </motion.p>
        </div>
      </section>

      <section className="px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {[
              { icon: Phone, title: "Call", info: "+91 98765 43210", color: "from-blue-500 to-cyan-500" },
              { icon: Mail, title: "Email", info: "attendx2025@gmail.com", color: "from-violet-500 to-purple-500" },
              { icon: MapPin, title: "Location", info: "Mumbai, India", color: "from-emerald-500 to-teal-500" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl hover:border-violet-500/30 transition-all"
              >
                <div className={`w-12 h-12 shrink-0 rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                  <item.icon size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.title}</h3>
                  <p className="text-sm md:text-base font-bold text-zinc-900 dark:text-white truncate">{item.info}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 bg-white dark:bg-zinc-900/40 rounded-4xl p-6 md:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20"
                >
                  <Loader text="Transmitting message..." size="lg" />
                </motion.div>
              ) : submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Message Received</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-2">We'll get back to you shortly at {formData.email}</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid md:grid-cols-2 gap-5">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={(val) => setFormData({ ...formData, name: val })}
                      placeholder="Enter your name"
                      icon={User}
                      autoComplete="name"
                      required
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(val) => setFormData({ ...formData, email: val })}
                      placeholder="name@institution.com"
                      icon={Mail}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor='message' className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">Message Body</label>
                    <textarea
                      id='message'
                      name='message'
                      autoComplete='off'
                      rows="5"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-gray-900 text-zinc-900 dark:text-white focus:border-violet-600 dark:focus:border-violet-400 focus:ring-4 focus:ring-violet-500/5 outline-none transition-all font-medium text-sm resize-none"
                      placeholder="How can we help your institution?"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Send}
                    iconPosition="right"
                    className="font-bold uppercase tracking-widest text-xs py-4"
                  >
                    Send Message
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Contact