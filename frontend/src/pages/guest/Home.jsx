import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Camera, Shield, Clock, Users, Fingerprint, Sparkles, ArrowRight } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Camera,
      title: "Face Recognition",
      description: "Advanced retina face detection using OpenCV & ArcFace for accurate attendance marking",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Instant attendance updates with live monitoring and automatic timestamps",
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encrypted face data with privacy-first architecture",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Users,
      title: "Role Management",
      description: "Dedicated portals for Admin, Teachers, and Students with specific access",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: Fingerprint,
      title: "Anti-spoofing",
      description: "Advanced liveness detection to prevent fraudulent attendance",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "Smart Insights",
      description: "AI-powered attendance analytics and predictive reports",
      color: "from-indigo-500 to-blue-500"
    }
  ]

  const steps = [
    { title: "Teacher Records Class", description: "Teacher initiates attendance session with subject details" },
    { title: "Face Detection", description: "Students' faces are detected using retina scanners" },
    { title: "ArcFace Recognition", description: "Advanced face matching for accurate identification" },
    { title: "Auto-mark Attendance", description: "Attendance automatically marked with timestamps" }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15
      }
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500">
      <section className="relative pt-6 md:pt-10 pb-16 px-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-1/4 w-64 md:w-72 h-64 md:h-72 bg-violet-500/20 blur-[120px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-0 right-1/4 w-80 md:w-96 h-80 md:h-96 bg-blue-500/20 blur-[120px] rounded-full"
          />
        </motion.div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-xs md:text-sm font-black uppercase tracking-widest mb-6 md:mb-8 lg:mb-10 backdrop-blur-md"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={14} />
            </motion.div>
            Next-Gen Attendance System
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 80,
              damping: 15,
              delay: 0.3
            }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 md:mb-6 lg:mb-8 leading-[1.1]"
          >
            <span className="text-zinc-900 dark:text-white">Face Recognition</span>
            <br />
            <span className="bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Attendance System
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 80,
              damping: 15,
              delay: 0.4
            }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-500 dark:text-zinc-400 mb-8 md:mb-10 lg:mb-12 max-w-2xl mx-auto font-medium leading-relaxed px-4"
          >
            Mark attendance instantly with retina face detection using OpenCV & ArcFace. 
            Smart, secure, and completely automated.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 80,
              damping: 15,
              delay: 0.5
            }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/contact"
                className="w-full sm:w-auto bg-violet-600 text-white px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-bold text-sm md:text-base lg:text-lg hover:bg-violet-700 transition-all shadow-xl md:shadow-2xl shadow-violet-500/40 flex items-center justify-center gap-2 md:gap-3"
              >
                Get Started <ArrowRight size={16} className="md:w-5 md:h-5" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/about"
                className="block w-full sm:w-auto bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-bold text-sm md:text-base lg:text-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800 backdrop-blur-md"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 lg:py-32 px-4 relative bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -8,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="relative p-6 md:p-8 rounded-2xl md:rounded-4xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-lg md:shadow-xl"
              >
                <motion.div 
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 12 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-violet-600 text-white rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-sm md:text-base lg:text-xl shadow-md md:shadow-lg"
                >
                  {index + 1}
                </motion.div>
                <h3 className="text-base md:text-lg lg:text-xl font-black text-zinc-900 dark:text-white mb-2 md:mb-3 lg:mb-4 mt-4 tracking-tight uppercase">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm lg:text-base text-zinc-500 dark:text-zinc-400 font-medium leading-snug">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80 }}
            className="text-center mb-12 md:mb-16 lg:mb-24"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-zinc-900 dark:text-white mb-4 md:mb-6 tracking-tighter uppercase">
              Powerful <span className="text-violet-600">Features</span>
            </h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "6rem" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-1.5 md:h-2 bg-violet-600 mx-auto rounded-full"
            />
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleVariants}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group relative p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/50 transition-all duration-500 shadow-sm hover:shadow-xl md:hover:shadow-2xl overflow-hidden"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1.5 }}
                  transition={{ duration: 0.7 }}
                  className={`absolute top-0 right-0 w-24 md:w-28 lg:w-32 h-24 md:h-28 lg:h-32 bg-linear-to-br ${feature.color} opacity-[0.03] rounded-bl-full`}
                />
                
                <motion.div 
                  whileHover={{ rotate: 6 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-4 md:mb-6 lg:mb-8 text-white shadow-md md:shadow-lg`}
                >
                  <feature.icon size={20} className="md:w-6 md:h-6 lg:w-7 lg:h-7" strokeWidth={2.5} />
                </motion.div>
                
                <h3 className="text-lg md:text-xl lg:text-2xl font-black text-zinc-900 dark:text-white mb-2 md:mb-3 lg:mb-4 tracking-tight uppercase">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base lg:text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20 lg:py-24 px-4">
        <div className="max-w-6xl mx-auto rounded-2xl md:rounded-3xl lg:rounded-[3rem] bg-zinc-900 dark:bg-white p-8 md:p-16 lg:p-24 text-center relative overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-0 w-64 md:w-80 lg:w-96 h-64 md:h-80 lg:h-96 bg-violet-500/20 blur-[100px] rounded-full"
          />
          
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 80 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white dark:text-zinc-950 mb-4 md:mb-6 lg:mb-8 tracking-tighter uppercase px-2"
            >
              Ready to Transform <br className="hidden md:block" /> Attendance?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
              className="text-sm md:text-base lg:text-xl text-zinc-400 dark:text-zinc-500 mb-6 md:mb-8 lg:mb-12 font-bold uppercase tracking-widest px-4"
            >
              Join institutions already using AttendX
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 80, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6 justify-center px-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/contact"
                  className="block bg-violet-600 text-white px-6 md:px-8 lg:px-10 xl:px-12 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-black text-xs md:text-sm lg:text-base hover:bg-violet-700 transition-all shadow-xl md:shadow-2xl active:scale-95 uppercase tracking-widest"
                >
                  Get Started Today
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/about"
                  className="block bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 md:px-8 lg:px-10 xl:px-12 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-black text-xs md:text-sm lg:text-base hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all border border-zinc-700 dark:border-zinc-200 active:scale-95 uppercase tracking-widest"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home