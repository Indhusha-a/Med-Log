import { motion } from 'framer-motion'
import {
  Bot,
  Calendar,
  CalendarCheck,
  ClipboardList,
  Clock,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { LandingNavbar } from '@/pages/landing/LandingNavbar'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
}

export function LandingPage() {
  return (
    <div className="bg-app-bg">
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <AssistantShowcase />
      <FinalCta />
      <Footer />
    </div>
  )
}

const TRUST_POINTS = [
  { icon: Clock, label: '1-hour cancellation safeguard, enforced server-side' },
  { icon: ShieldCheck, label: 'Role-based access for patients, doctors, admins' },
  { icon: Bot, label: 'AI assistant scoped to your own appointments' },
]

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-deep pb-28 pt-36 sm:pb-36 sm:pt-44">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <motion.div
        className="absolute -left-40 -top-20 h-[560px] w-[560px] rounded-full bg-blue-accent/20 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-blue-primary/25 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-app-bg to-transparent" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-accent" /> Role-based, AI-assisted care scheduling
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 font-display text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl"
          >
            Healthcare appointments.
            <br />
            Reimagined.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-5 max-w-md text-base text-white/60"
          >
            Book appointments effortlessly, manage your healthcare schedule, and get intelligent assistance
            throughout your journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              to="/signup"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy-deep transition-transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Sign In
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6"
          >
            {TRUST_POINTS.map((point) => (
              <li key={point.label} className="flex items-center gap-2.5 text-sm text-white/55">
                <point.icon className="h-4 w-4 shrink-0 text-blue-accent" />
                {point.label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div
            aria-hidden="true"
            className="absolute -right-6 -top-6 h-full w-full rounded-2xl border border-white/10 bg-white/[0.03]"
          />
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-lifted backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Upcoming appointment</p>
              <span className="rounded-full bg-blue-accent/20 px-2 py-0.5 text-[11px] font-medium text-blue-accent">
                Scheduled
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-accent/20 text-blue-accent">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Dr. Amara Fernando</p>
                <p className="text-xs text-white/50">General Medicine</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/60">
              <div className="rounded-lg bg-white/5 px-3 py-2">
                <p className="text-white/40">Date</p>
                <p className="mt-0.5 font-medium text-white">Thu, 14 Oct</p>
              </div>
              <div className="rounded-lg bg-white/5 px-3 py-2">
                <p className="text-white/40">Time</p>
                <p className="mt-0.5 font-medium text-white">10:00 AM</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute -bottom-6 -left-8 flex items-center gap-2 rounded-xl border border-white/10 bg-navy-dark/90 px-3.5 py-2.5 shadow-lifted backdrop-blur-xl"
          >
            <Bot className="h-4 w-4 text-blue-accent" />
            <p className="text-xs text-white/80">"You have 2 appointments today."</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Effortless Appointment Booking',
    description: 'Find a doctor, inspect available slots, choose an appointment type, and confirm through a guided flow.',
  },
  {
    icon: Calendar,
    title: 'Smart Schedule Management',
    description: 'View upcoming appointments, search and filter bookings, and manage eligible appointments yourself.',
  },
  {
    icon: ClipboardList,
    title: 'Doctor Workspace',
    description: 'Manage appointments, add availability slots, and resolve completed or missed consultations.',
  },
  {
    icon: Bot,
    title: 'AI Healthcare Assistant',
    description: 'Get role-aware assistance with appointment information and booking guidance, on demand.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Role-Based Access',
    description: 'Separate, appropriate workspaces for patients, doctors, and administrators.',
  },
  {
    icon: Users,
    title: 'Clear Appointment Tracking',
    description: 'Understand scheduled, completed, cancelled, no-show, and rescheduling-required appointments at a glance.',
  },
]

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">
          Everything a modern clinic needs
        </h2>
        <p className="mt-3 text-text-secondary">
          Built around the real workflow of booking, managing, and resolving appointments.
        </p>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-soft transition-shadow hover:shadow-lifted"
          >
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-accent to-blue-primary transition-transform duration-300 group-hover:scale-x-100"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-soft text-blue-primary transition-colors group-hover:bg-navy-dark group-hover:text-white">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-text-primary">{feature.title}</h3>
            <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const STEPS = [
  { title: 'Choose your role and sign in', description: 'Patient, doctor, or admin — each gets their own dedicated workspace.' },
  { title: 'Manage appointments or availability', description: 'Book, reschedule, cancel, or resolve — all through your own workspace.' },
  { title: 'Get AI-powered assistance', description: 'Ask the assistant about your appointments or how to book, any time.' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">How it works</h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div key={step.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-dark font-display text-lg font-semibold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-text-primary">{step.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AssistantShowcase() {
  return (
    <section id="ai-assistant" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div {...fadeUp}>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-soft px-3 py-1 text-xs font-medium text-blue-primary">
            <Bot className="h-3.5 w-3.5" /> AI Assistant
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-text-primary sm:text-4xl">
            Ask, don't dig through menus
          </h2>
          <p className="mt-4 text-text-secondary">
            A role-aware assistant answers questions about appointments, doctors, and scheduling — nothing else. It
            guides patients toward booking and gives doctors a quick read on their day, all scoped strictly to the
            logged-in user's own data.
          </p>
          <p className="mt-3 text-sm text-text-muted">
            These are illustrative previews of the assistant's interface — not a live session.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="rounded-2xl border border-border bg-navy-dark p-5 shadow-lifted">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <MessageCircle className="h-4 w-4 text-blue-accent" />
            <p className="text-sm font-medium text-white">Live preview</p>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <ChatBubble from="user" text="I want to book an appointment." />
            <ChatBubble
              from="assistant"
              text="I can help you get started. Choose a doctor first, and I'll help you find an available slot."
            />
            <ChatBubble from="user" text="How many appointments do I have today?" />
            <ChatBubble from="assistant" text="Let me check your schedule — one moment." />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ChatBubble({ from, text }: { from: 'user' | 'assistant'; text: string }) {
  return (
    <div className={from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          from === 'user'
            ? 'max-w-[80%] rounded-2xl bg-blue-accent/20 px-3.5 py-2 text-sm text-white'
            : 'max-w-[80%] rounded-2xl bg-white/10 px-3.5 py-2 text-sm text-white/90'
        }
      >
        {text}
      </div>
    </div>
  )
}

function FinalCta() {
  return (
    <section className="bg-navy-deep py-24">
      <motion.div {...fadeUp} className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          A better way to manage every appointment.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/signup" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-navy-deep">
            Create your account
          </Link>
          <Link to="/login" className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
            Sign In
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-primary" />
          <span className="font-display text-sm font-semibold text-text-primary">Med-Log</span>
        </div>
        <p className="text-xs text-text-muted">Appointment management, built for the AI Engineering assessment.</p>
      </div>
    </footer>
  )
}
