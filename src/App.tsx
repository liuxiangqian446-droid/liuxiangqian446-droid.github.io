import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

const videos = {
  hero: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4',
  cinematic: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4',
  metrics: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4',
  technology: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4',
  footer: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4'
}
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><'
const ease = [0.215, 0.61, 0.355, 1] as const

function SynapseXLogo({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  const d = 'M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z'
  return <svg className={className} viewBox="-50 -50 100 100" fill="none" aria-hidden="true">{[0, 90, 180, 270].map((r) => <path key={r} d={d} transform={`rotate(${r})`} fill="currentColor" />)}</svg>
}

function ScrambleIn({ text, delay, triggered }: { text: string; delay: number; triggered: boolean }) {
  const [output, setOutput] = useState('\u00a0')
  useEffect(() => {
    if (!triggered) { setOutput('\u00a0'); return }
    let frame = 0
    const timer = window.setTimeout(() => {
      const tick = window.setInterval(() => {
        frame += .5
        setOutput(text.split('').map((character, index) => {
          if (character === ' ') return ' '
          if (index < frame) return character
          if (index < frame + 3) return chars[Math.floor(Math.random() * chars.length)]
          return ' '
        }).join(''))
        if (frame >= text.length + 3) window.clearInterval(tick)
      }, 25)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [delay, text, triggered])
  return <>{output}</>
}

function ScrambleText({ text, isHovered, className = '' }: { text: string; isHovered: boolean; className?: string }) {
  const [output, setOutput] = useState(text)
  useEffect(() => {
    if (!isHovered) { setOutput(text); return }
    let frame = 0
    const timer = window.setInterval(() => {
      frame++
      const reveal = Math.floor(frame / 4)
      setOutput(text.split('').map((char, index) => char === ' ' || index < reveal ? char : chars[Math.floor(Math.random() * chars.length)]).join(''))
      if (reveal >= text.length) window.clearInterval(timer)
    }, 25)
    return () => window.clearInterval(timer)
  }, [isHovered, text])
  return <span className={className}>{output}</span>
}

function SquashHamburger({ open }: { open: boolean }) {
  const spring = { type: 'spring', stiffness: 300, damping: 20 }
  return <span className="relative block h-[12px] w-[18px] sm:h-[12px] sm:w-[18px] max-sm:h-[10px] max-sm:w-[15px]">
    <motion.span className="absolute left-0 top-0 h-[1.5px] w-full bg-white max-sm:h-[1.2px]" animate={open ? { rotate:45, y:5 } : { rotate:0, y:0 }} transition={spring} />
    <motion.span className="absolute left-0 top-[5px] h-[1.5px] w-full bg-white max-sm:top-[4px] max-sm:h-[1.2px]" animate={open ? { opacity:0, scaleX:0 } : { opacity:1, scaleX:1 }} transition={spring} />
    <motion.span className="absolute bottom-0 left-0 h-[1.5px] w-full bg-white max-sm:h-[1.2px]" animate={open ? { rotate:-45, y:-5 } : { rotate:0, y:0 }} transition={spring} />
  </span>
}

function AutoVideo({ src, className = '' }: { src: string; className?: string }) {
  return <video className={`video-cover ${className}`} src={src} autoPlay muted loop playsInline />
}

function Hero({ ready }: { ready: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTime = useRef(0)
  const seeking = useRef(false)
  const lastX = useRef<number | null>(null)
  const seek = useCallback(() => {
    const video = videoRef.current
    if (!video || seeking.current || !Number.isFinite(targetTime.current)) return
    seeking.current = true
    video.currentTime = targetTime.current
  }, [])
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onMove = (event: MouseEvent) => {
      if (!Number.isFinite(video.duration)) return
      if (lastX.current !== null) targetTime.current = Math.max(0, Math.min(video.duration, targetTime.current + ((event.clientX - lastX.current) / window.innerWidth) * video.duration * .8))
      lastX.current = event.clientX
      seek()
    }
    const onLeave = () => { lastX.current = null }
    const onLoaded = () => { targetTime.current = 0; video.currentTime = 0 }
    const onSeeked = () => { seeking.current = false; if (Math.abs(video.currentTime - targetTime.current) > .035) seek() }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseleave', onLeave)
    video.addEventListener('loadedmetadata', onLoaded); video.addEventListener('seeked', onSeeked)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseleave', onLeave); video.removeEventListener('loadedmetadata', onLoaded); video.removeEventListener('seeked', onSeeked) }
  }, [seek])
  return <section className="relative flex h-screen min-h-[620px] h-[100dvh] flex-col overflow-hidden px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24 md:px-8" id="top">
    <video ref={videoRef} className="video-cover" src={videos.hero} muted playsInline preload="auto" />
    <div className="video-shade" /><div className="dot-grid pointer-events-none absolute inset-0 opacity-[.05]" />
    <div className="watermark pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 translate-y-[50px] select-none whitespace-nowrap text-[clamp(170px,49vw,720px)] leading-none tracking-[-.08em]">eonlim Ai</div>
    <motion.div initial={{ opacity:0 }} animate={{ opacity:ready ? 1 : 0 }} transition={{ duration:1 }} className="relative z-10 flex flex-1 flex-col justify-end">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-xl flex-col gap-4"><h1 className="text-[clamp(40px,10vw,100px)] font-light leading-[.95] tracking-[-.055em]"><ScrambleIn text="刘嘉明" delay={200} triggered={ready} /><br /><span className="inline-block whitespace-nowrap text-[.65em] tracking-[-.04em]"><ScrambleIn text="Leon Scott" delay={500} triggered={ready} /></span></h1><motion.div initial={{ opacity:0,y:25 }} animate={ready ? { opacity:1,y:0 } : {}} transition={{ duration:.9, ease, delay:.2 }} className="grid max-w-md grid-cols-2 gap-x-5 gap-y-2 border-t border-white/25 pt-3 text-[12px] leading-relaxed text-white/80"><span>+ AI 企培讲师</span><span>+ 工信部人工智能高级研发工程师</span><span>+ RPA 开发工程师</span><span>+ 阿里 AI 技能认证专家</span><span>+ 短视频 + IP 操盘手</span><span>+ 企业 AI Native 化实践者</span><span>+ 知识库搭建指导者</span><span className="col-span-2 text-white">+ Codex、WorkBuddy、OpenClaw 等训练营教练</span></motion.div></div>
        <h1 className="text-left text-[clamp(40px,10vw,100px)] font-light leading-[.95] tracking-[-.055em] md:text-right"><ScrambleIn text="乾恒 Ai" delay={700} triggered={ready} /><br /><span className="inline-block whitespace-nowrap text-[.65em] tracking-[-.04em]"><ScrambleIn text="eonlim Ai" delay={1000} triggered={ready} /></span></h1>
      </div>
    </motion.div>
  </section>
}

function Navbar({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false); const [hover, setHover] = useState('')
  const jump = (position:number) => { window.scrollTo({ top:position, behavior:'smooth' }); setOpen(false) }
  return <motion.header initial={{ opacity:0 }} animate={{ opacity:ready ? 1 : 0 }} transition={{ duration:.8 }} className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between px-4 sm:px-6 md:px-8">
    <div className="flex gap-2">
      <motion.button whileHover={{ scale:1.02, backgroundColor:'rgba(255,255,255,.22)' }} whileTap={{ scale:.98 }} className={`glass hidden h-12 items-center gap-2 rounded-[14px] px-5 text-[16px] font-medium tracking-tight sm:flex ${open ? 'md:hidden' : ''}`}><SynapseXLogo />SynapseX</motion.button>
      <motion.div animate={{ width:open ? 290 : 48 }} transition={{ type:'spring', stiffness:350, damping:28 }} className="glass flex h-12 overflow-hidden rounded-[14px]">
        <button onClick={() => setOpen(!open)} className={`flex shrink-0 items-center justify-center ${open ? 'ml-1.5 h-9 w-9 self-center rounded-[11px] bg-white/10 hover:bg-white/20' : 'h-12 w-12'}`} aria-label="Open menu"><SquashHamburger open={open} /></button>
        <AnimatePresence>{open && <motion.div initial={{ opacity:0,x:15 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:8 }} className="flex items-center gap-6 pl-4 text-[16px] text-white/85"><button onMouseEnter={() => setHover('about')} onMouseLeave={() => setHover('')} onClick={() => jump(window.innerHeight)}><ScrambleText text="About" isHovered={hover === 'about'} /></button><button onMouseEnter={() => setHover('metrics')} onMouseLeave={() => setHover('')} onClick={() => jump(window.innerHeight * 2)}><ScrambleText text="Metrics" isHovered={hover === 'metrics'} /></button></motion.div>}</AnimatePresence>
      </motion.div>
    </div>
    <motion.button whileHover={{ scale:1.03, backgroundColor:'#e2e2e6' }} whileTap={{ scale:.97 }} onMouseEnter={() => setHover('download')} onMouseLeave={() => setHover('')} className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[14px] text-black"><i className="bi bi-apple text-[16px]" /><ScrambleText text="Download" isHovered={hover === 'download'} /></motion.button>
  </motion.header>
}

function Cinematic() {
  const ref = useRef<HTMLElement>(null); const { scrollYProgress } = useScroll({ target:ref, offset:['start end','end start'] }); const spring = useSpring(scrollYProgress,{ stiffness:15,damping:32,mass:1.8 }); const rotateX = useTransform(spring,[0,1],[24,0]); const y = useTransform(spring,[0,1],[60,-120]); const opacity = useTransform(spring,[.3,.5],[0,1]);
  return <section ref={ref} className="relative flex h-screen min-h-[620px] h-[100dvh] items-center justify-center overflow-hidden"><AutoVideo src={videos.cinematic}/><div className="video-shade" /><div className="absolute inset-x-0 top-0 z-10 h-[180px] bg-gradient-to-b from-[#010103] to-transparent" /><motion.p style={{ rotateX,y,translateZ:15,opacity }} className="relative z-20 max-w-5xl px-6 text-center text-[22px] font-normal leading-[1.35] tracking-[-.02em] sm:px-12 sm:text-[30px] md:text-[36px] lg:text-[42px]">A neural-AI interface built on the architecture of the human nervous system. SynapseX translates synaptic activity into computational intelligence. Every signal becomes measurable, structured, and visible. It continuously reconstructs internal state as a dynamic neural map. Biological noise is filtered into actionable cognitive patterns.</motion.p></section>
}

const metricItems = [['2.4ms','Synaptic Latency'],['99.7%','Signal Accuracy'],['140B','Neural Parameters']]
function Metrics() { return <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-32 pt-32"><AutoVideo src={videos.metrics}/><div className="video-shade" /><div className="relative z-10 w-full max-w-6xl"><motion.p whileInView={{ opacity:1 }} initial={{ opacity:0 }} viewport={{ once:true, amount:.3 }} transition={{ duration:1.2 }} className="mb-20 text-center text-[13px] uppercase tracking-[.2em] text-white/40 sm:text-[14px]">Performance Metrics</motion.p><div className="grid gap-16 md:grid-cols-3 md:gap-8">{metricItems.map(([value,label],i) => <motion.div key={value} initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true, amount:.3 }} transition={{ duration:.8, delay:i*.15 }} className="text-center"><p className="text-[clamp(48px,10vw,96px)] font-light leading-none tracking-[-.04em]">{value}</p><p className="mt-4 text-[13px] tracking-wide text-white/40 sm:text-[15px]">{label}</p></motion.div>)}</div></div></section> }

const features = [['Cortical Mapping','Real-time spatial reconstruction of active neural regions.'],['Signal Isolation','Separates cognitive intent from biological noise.'],['State Prediction','Anticipates cognitive transitions before they occur.'],['Loop Feedback','Closed-loop adjustment based on outcome correlation.']]
function Technology() { return <section className="relative flex h-screen min-h-[650px] h-[100dvh] flex-col overflow-hidden px-8 py-12 sm:px-12 sm:py-16 md:px-16"><AutoVideo src={videos.technology}/><div className="video-shade" /><div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between"><motion.h2 initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true, amount:.3 }} transition={{ duration:1 }} className="text-[clamp(36px,8vw,72px)] font-light leading-[.95] tracking-[-.03em]">Adaptive<br/>Intelligence</motion.h2><motion.p initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true, amount:.3 }} transition={{ duration:1,delay:.2 }} className="max-w-xs text-[13px] leading-relaxed text-white/50 sm:text-[15px] md:pt-2 md:text-right">The system learns your neural baseline within 72 hours. From there, every cognitive state is mapped, predicted, and optimized in real time.</motion.p></div><div className="flex-1"/><motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true,amount:.3 }} transition={{ duration:1,delay:.3 }} className="relative z-10 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">{features.map(([title,desc],i) => <motion.div key={title} initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:.7,delay:i*.1 }}><h3 className="mb-2 text-[14px] sm:text-[16px]">{title}</h3><p className="text-[12px] leading-relaxed text-white/40 sm:text-[14px]">{desc}</p></motion.div>)}</motion.div></section> }

function Architecture() { const layers = [['Layer 1','Capture'],['Layer 2','Process'],['Layer 3','Interface']]; return <section className="flex min-h-screen items-center justify-center bg-black px-6 py-32 text-center"><div className="w-full max-w-3xl"><motion.div initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true,amount:.4 }} transition={{ duration:1 }}><p className="mb-8 text-[13px] uppercase tracking-[.2em] text-white/40 sm:text-[14px]">Architecture</p><h2 className="mb-10 text-[clamp(28px,6vw,56px)] font-light leading-[1.15] tracking-[-.02em]">Three layers. Zero friction.</h2><p className="mx-auto max-w-xl text-[15px] leading-relaxed text-white/45 sm:text-[17px]">Sensor layer captures raw bioelectric signals. Processing layer isolates intent. Interface layer delivers structured output to any connected system.</p></motion.div><motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true,amount:.4 }} transition={{ duration:1.2,delay:.4 }} className="mt-20 flex flex-col items-center gap-4">{layers.map(([layer,value]) => <div key={layer} className="flex h-[72px] w-full max-w-md items-center justify-between rounded-lg border border-white/10 px-6"><span className="text-[12px] uppercase tracking-[.15em] text-white/30">{layer}</span><span className="text-[16px] font-light sm:text-[18px]">{value}</span></div>)}</motion.div></div></section> }

function Footer() { return <footer className="flex min-h-[400px] flex-col overflow-hidden bg-black md:flex-row"><div className="relative h-[300px] md:h-auto md:w-1/2"><AutoVideo src={videos.footer}/><div className="video-shade" /></div><div className="flex flex-1 flex-col justify-between p-10 sm:p-16"><div><div className="mb-8 flex items-center gap-2 text-white/70"><SynapseXLogo/><span className="text-[15px] font-medium tracking-tight">SynapseX</span></div><p className="max-w-sm text-[14px] leading-relaxed text-white/40 sm:text-[15px]">The next evolution of human-machine interaction. Built for those who refuse to be limited by biology alone.</p></div><p className="mt-12 text-[12px] text-white/25">(c) 2026 SynapseX Labs. All rights reserved.</p></div></footer> }

export default function App() { const [ready,setReady] = useState(false); useEffect(() => { const timer = window.setTimeout(() => setReady(true),800); return () => window.clearTimeout(timer) },[]); return <main style={{ fontFamily:'"Space Mono", monospace' }}><Hero ready={ready}/><Cinematic/><Metrics/><Technology/><Architecture/><Footer/></main> }
