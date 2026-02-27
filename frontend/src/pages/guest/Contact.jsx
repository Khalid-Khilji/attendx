import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Phone, MapPin, Send, CheckCircle, Sparkles } from 'lucide-react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
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
            className="lg:col-span-3 bg-white dark:bg-zinc-900/40 rounded-4xl p-6 md:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:border-violet-600 outline-none transition-all font-bold text-sm"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:border-violet-600 outline-none transition-all font-bold text-sm"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Message</label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:border-violet-600 outline-none transition-all font-bold text-sm resize-none"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-violet-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 hover:bg-violet-700 transition-all disabled:opacity-50"
                disabled={submitted}
              >
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      <CheckCircle size={16} /> Sent
                    </motion.div>
                  ) : (
                    <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      Send Message <Send size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Contact