import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Shield, Users, Target, Award, Sparkles, ArrowUpRight } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

const About = () => {
  const values = [
    { icon: Shield, title: "Privacy First", description: "End-to-end encryption for all facial biometric data." },
    { icon: Target, title: "High Accuracy", description: "99.9% precision using state-of-the-art ArcFace engines." },
    { icon: Users, title: "User-Centric", description: "Intuitive workflows for students and faculty members." },
    { icon: Award, title: "Industry Leading", description: "Setting new standards in automated academic tracking." }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pb-20 overflow-hidden">
      <section className="px-4 sm:px-6 pb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-0 right-[10%] w-48 sm:w-56 md:w-72 h-48 sm:h-56 md:h-72 bg-violet-500/20 blur-[80px] sm:blur-[100px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mb-5 sm:mb-6 md:mb-8"
          >
            <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" /> Our Story
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-zinc-900 dark:text-white mb-4 sm:mb-6 md:mb-8 tracking-tighter leading-[1.1]"
          >
            Modernizing Academia with <br className="hidden sm:block" />
            <span className="bg-linear-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent italic">
              AI Biometrics
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed px-4 sm:px-0"
          >
            AttendX was born from a simple vision: to eliminate the friction of manual attendance and empower institutions with real-time intelligence.
          </motion.p>
        </div>
      </section>

      <section className="px-4 sm:px-6 mb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/30 transition-all duration-500"
          >
            <div className="absolute top-4 sm:top-5 md:top-6 right-4 sm:right-5 md:right-6 text-violet-500/20 group-hover:text-violet-500 transition-colors">
              <ArrowUpRight size={20} className="sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-900 dark:text-white mb-3 sm:mb-4 md:mb-6 uppercase tracking-tight">Our Mission</h2>
            <p className="text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              To digitize identity verification in education, providing high-fidelity attendance data that allows educators to focus on what matters most: teaching.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative bg-zinc-900 dark:bg-zinc-100 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 border border-zinc-800 dark:border-zinc-200 transition-all duration-500"
          >
            <div className="absolute top-4 sm:top-5 md:top-6 right-4 sm:right-5 md:right-6 text-white/10 dark:text-black/10">
              <ArrowUpRight size={20} className="sm:w-6 sm:h-6 md:w-8 md:h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white dark:text-zinc-950 mb-3 sm:mb-4 md:mb-6 uppercase tracking-tight">Our Vision</h2>
            <p className="text-sm sm:text-base md:text-lg text-zinc-400 dark:text-zinc-500 leading-relaxed font-medium">
              We envision a seamless campus experience where technology works invisibly in the background to ensure security and compliance across every classroom.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 sm:px-6 mb-20 py-16 sm:py-20 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-3 sm:mb-4 uppercase tracking-tighter">Core Values</h2>
            <div className="w-12 sm:w-14 md:w-16 h-1 bg-violet-600 mx-auto rounded-full" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 md:gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group text-center p-4 sm:p-5 md:p-6"
              >
                <div className="w-16 sm:w-18 md:w-20 h-16 sm:h-18 md:h-20 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl sm:rounded-3xl md:rounded-4xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-sm group-hover:shadow-xl group-hover:border-violet-500/20 transition-all duration-500 group-hover:-translate-y-2">
                  <value.icon className="text-violet-600 dark:text-violet-400 w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" strokeWidth={1.5} />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-zinc-900 dark:text-white mb-2 sm:mb-3 uppercase tracking-tight">{value.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-50 sm:max-w-55 md:max-w-62.5 mx-auto">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto bg-violet-600 rounded-2xl sm:rounded-3xl md:rounded-[3rem] p-8 sm:p-12 md:p-20 relative overflow-hidden text-center shadow-xl sm:shadow-2xl shadow-violet-500/30"
        >
          <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-white/10 blur-[60px] sm:blur-[80px] md:blur-[100px] rounded-full" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white mb-4 sm:mb-5 md:mb-6 uppercase tracking-tighter leading-none">
            Join the Next Era of <br /> Education
          </h2>
          <p className="text-violet-100 text-sm sm:text-base md:text-lg lg:text-xl mb-8 sm:mb-10 md:mb-12 font-medium max-w-xl mx-auto px-4">
            Ready to implement world-class biometric tracking in your institution?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-white text-violet-600 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-zinc-100 transition-all active:scale-95"
          >
            Get Started <ArrowUpRight size={14} className="sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}

export default About