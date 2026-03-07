import { Brain, Users, Target, Lock, ArrowRight, BarChart3, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(71,85,105,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(71,85,105,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/80 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Nexora</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth" className="px-5 py-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-all duration-200">
                Sign In
              </Link>
              <Link href="/auth?mode=signup" className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Powered by collective intelligence
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-[1.1]">
            Make better decisions
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              together
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Nexora helps teams make smarter decisions through structured deliberation,
            anonymous input, AI-powered synthesis, and permanent immutable records.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?mode=signup" className="group inline-flex items-center gap-2 px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-0.5 justify-center">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth" className="inline-block px-10 py-4 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-xl transition-all duration-200 border-2 border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why teams choose Nexora</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<Users className="w-6 h-6" />} title="Balanced Participation" description="Every voice matters equally. Anonymous input phases prevent loudest-voice bias." />
            <FeatureCard icon={<Target className="w-6 h-6" />} title="Reasoning Analysis" description="AI detects gaps in thinking and surfaces perspectives that might be overlooked." />
            <FeatureCard icon={<BarChart3 className="w-6 h-6" />} title="Smart Synthesis" description="Group thinking synthesized into clear, quality-weighted decisions automatically." />
            <FeatureCard icon={<Lock className="w-6 h-6" />} title="Immutable Records" description="Every decision permanently stored on Filecoin. Transparent, tamper-proof audit trail." />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-200/80 p-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">How Nexora Works</h2>
            <p className="text-slate-600 text-center mb-14 text-lg">Five steps to better group decisions</p>
            <div className="space-y-10">
              <Step number="1" title="Admin Creates a Session" description="Give your session a title. A unique 6-character code is generated automatically." />
              <Step number="2" title="Admin Adds Questions" description="Inside the session, add as many questions as you need. Members will respond to each one." />
              <Step number="3" title="Members Join & Respond" description="Share the code. Members join, pick from Strongly Agree to Strongly Disagree, and write their reasoning." />
              <Step number="4" title="Cognitive Diversity Mapping" description="The system maps the opinion spectrum and highlights unique perspectives and underrepresented viewpoints." />
              <Step number="5" title="Synthesis & Permanent Record" description="A decision synthesis is generated and everything is stored immutably on Filecoin." />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center bg-slate-900 rounded-3xl p-20 shadow-2xl">
          <Shield className="w-12 h-12 text-blue-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
            Built on trust and transparency
          </h2>
          <p className="text-slate-300 text-xl mb-10 leading-relaxed">
            All sessions and decisions are stored permanently on Filecoin —
            no one can alter or delete the record of your team's reasoning.
          </p>
          <Link href="/auth?mode=signup" className="inline-block px-10 py-4 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group bg-white rounded-2xl p-7 border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/40 transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-all duration-300">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}