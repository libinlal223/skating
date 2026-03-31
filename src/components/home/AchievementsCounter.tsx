'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Users, Medal, Calendar, GitBranch } from 'lucide-react';

const stats = [
  { icon: Users, number: 500, suffix: '+', label: 'Students Trained', color: '#E10600' },
  { icon: Medal, number: 30, suffix: '+', label: 'State Medals', color: '#FFD400' },
  { icon: Calendar, number: 10, suffix: '+', label: 'Years Experience', color: '#C0C0C0' },
  { icon: GitBranch, number: 5, suffix: '', label: 'Branches', color: '#E10600' },
];

function Counter({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span>{count}{suffix}</span>;
}

export default function AchievementsCounter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="counters" ref={ref}>
      <div className="counters__bg" />
      <div className="container">
        <div className="counters__grid">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="counters__item"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="counters__icon" style={{ color: stat.color }}>
                <stat.icon size={28} strokeWidth={1.5} />
              </div>
              <div className="counters__number" style={{ color: stat.color }}>
                <Counter target={stat.number} suffix={stat.suffix} inView={isInView} />
              </div>
              <div className="counters__label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      
    </section>
  );
}
