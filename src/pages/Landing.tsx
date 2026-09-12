import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  GraduationCap,
  Bell,
  Search,
  Users,
  Calendar,
  Briefcase,
  Code,
  Megaphone,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "Stay Updated",
    description: "Never miss important campus announcements, events, or deadlines.",
    color: "text-purple-500",
    bg: "bg-purple-100",
  },
  {
    icon: Briefcase,
    title: "Find Internships",
    description: "Discover internship opportunities shared by peers and faculty.",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    icon: Calendar,
    title: "Campus Events",
    description: "Keep track of workshops, seminars, and college fest events.",
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    icon: Code,
    title: "Hackathons",
    description: "Find hackathons and coding competitions to sharpen your skills.",
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
  {
    icon: GraduationCap,
    title: "Academics",
    description: "Access study resources, exam schedules, and academic updates.",
    color: "text-sky-500",
    bg: "bg-sky-100",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    description: "Share and read general announcements from the college community.",
    color: "text-pink-500",
    bg: "bg-pink-100",
  },
];

const stats = [
  { label: "Categories", value: "5+" },
  { label: "Students", value: "1000+" },
  { label: "Posts Daily", value: "50+" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen clay-gradient-hero overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-200/40 animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 rounded-3xl bg-pink-200/40 animate-float-delayed rotate-12" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 rounded-2xl bg-blue-200/40 animate-float-slow -rotate-12" />
        <div className="absolute bottom-20 right-1/3 w-16 h-16 rounded-full bg-green-200/40 animate-float rotate-45" />
      </div>

      {/* Navbar */}
      <nav className="clay-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="clay-btn-primary w-10 h-10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              UniQuest
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <button
                    className="clay-btn-primary px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
                    onClick={() => navigate("/dashboard")}
                  >
                    Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      className="clay-btn px-5 py-2.5 text-sm font-semibold"
                      onClick={() => navigate("/auth")}
                    >
                      Log In
                    </button>
                    <button
                      className="clay-btn-primary px-5 py-2.5 text-sm font-semibold"
                      onClick={() => navigate("/auth")}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 clay-pill mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Your College Notice Board
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6"
          >
            Never Miss a{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              Campus Update
            </span>{" "}
            Again
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto"
          >
            UniQuest is your one-stop college notice board for events,
            internships, hackathons, academics, and everything campus life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              className="clay-btn-primary px-8 py-4 text-base font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              className="clay-btn px-8 py-4 text-base font-semibold flex items-center gap-2 w-full sm:w-auto justify-center"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Search className="w-5 h-5" />
              Explore Features
            </button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center gap-8 mt-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A simple, powerful notice board built for college students. Share and
            discover what matters on campus.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="clay-post"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="clay text-center py-16 px-8"
        >
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Join Your Campus Community
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Create an account to start posting notices, sharing opportunities, and
            staying connected with your college.
          </p>
          <button
            className="clay-btn-primary px-8 py-4 text-base font-bold inline-flex items-center gap-2"
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
          >
            {isAuthenticated ? "Go to Dashboard" : "Sign Up Now"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="clay-nav py-6 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="font-bold">UniQuest</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for students, by students. Simple campus notice board.
          </p>
        </div>
      </footer>
    </div>
  );
}
