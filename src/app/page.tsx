'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Music,
  Pause,
} from 'lucide-react';

type PlayerState = 'playing' | 'paused' | 'loading';

const Home = () => {
  const [playerState, setPlayerState] = useState<PlayerState>('paused');
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);

  const togglePlayPause = () => {
    const nextState = playerState === 'playing' ? 'paused' : 'playing';
    setPlayerState('loading');
    setTimeout(() => {
      setPlayerState(nextState);
    }, 500);
  };

  const handleSkipBack = () => {
    setProgress(0);
    setPlayerState('paused');
  };

  const handleSkipForward = () => {
    setProgress(100);
    setPlayerState('paused');
  };

  // Simulate progress when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playerState === 'playing') {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 100 / 225));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playerState]);

  // Container variants for background and shadow animations
  const containerVariants = {
    playing: {
      background: '#0f0f0f',
      boxShadow:
        '0 -20px 100px rgba(163, 75, 250, 0.2 ),0 20px 200px rgba(220, 50, 250, 0.5)',
    },
    paused: {
      background: '#0f0f0f',
      boxShadow: '0 10px 30px rgba(220, 114, 250, 0.2)',
    },
    loading: {
      background: '#0f0f0f',
      boxShadow: '0 10px 30px rgba(220, 114, 250, 0.2)',
    },
  };

  // Play/Pause button variants
  const playButtonVariants = {
    playing: {
      backgroundColor: '#7C3AED',
      scale: 1,
      transition: { duration: 0.3 },
    },
    paused: {
      backgroundColor: '#7C3AED',
      scale: 1,
      transition: { duration: 0.3 },
    },
    loading: {
      backgroundColor: '#717680',
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  // For pulsing boxShadow in playing state
  const playingBoxShadows = [
    '0 10px 30px rgba(220, 114, 250, 0.2), 0 -20px 70px rgba(220, 114, 250, 0.05)',
    '0 20px 150px rgba(163, 114, 250, 0.3), 0 -20px 100px rgba(163, 114, 250, 0.1)',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className='min-h-screen flex flex-col items-center justify-center p-32 bg-neutral-950'
    >
      <div className='flex-1 flex items-center justify-center w-full'>
        <motion.div
          className='sm:w-500 sm:h-350 rounded-2xl p-24 relative overflow-hidden '
          initial={{}}
          animate={{
            background: containerVariants[playerState].background,
            boxShadow:
              playerState === 'playing'
                ? playingBoxShadows
                : containerVariants[playerState].boxShadow,
          }}
          transition={
            playerState === 'playing'
              ? {
                  boxShadow: {
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  },
                  background: { duration: 0.3, ease: 'easeInOut' },
                }
              : { duration: 0.3, ease: 'easeInOut' }
          }
        >
          {/* Album Artwork */}
          <div className='flex items-start gap-16 mb-20'>
            <motion.div
              className='w-80 h-80 sm:w-120 sm:h-120 rounded-sm sm:rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden'
              animate={{
                scale:
                  playerState === 'playing'
                    ? 1
                    : playerState === 'paused'
                    ? 0.95
                    : 0.9,
                opacity: playerState === 'loading' ? 0.5 : 1,
              }}
              transition={{
                duration: 0.3,
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <motion.div
                animate={
                  playerState === 'playing' ? { rotate: 360 } : { rotate: 0 }
                }
                transition={
                  playerState === 'playing'
                    ? {
                        repeat: Infinity,
                        duration: 20,
                        ease: 'linear',
                      }
                    : {
                        duration: 0.3,
                        ease: 'easeOut',
                      }
                }
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Music className='sm:w-48 sm:h-48 text-white' />
              </motion.div>
            </motion.div>

            <div className='flex-1 pt-8'>
              <h2 className='text-sm sm:text-lg font-semibold text-white sm:mb-4 sm:mt-20'>
                Awesome Song Title
              </h2>
              <p className='text-xs sm:text-sm text-neutral-400'>
                Amazing Artist
              </p>
              {/* Equalizer Bars */}
              <div className='flex items-end gap-4 h-32 mb-5 mt-20'>
                {[0, 1, 2, 3, 4].map((index) => (
                  <motion.div
                    key={index}
                    className='bg-primary-200'
                    style={{ minHeight: '20%', width: 8 }}
                    animate={
                      playerState === 'playing'
                        ? { height: ['20%', '100%', '20%'] }
                        : playerState === 'paused'
                        ? { height: '20%' }
                        : { height: '50%', opacity: 0.5 }
                    }
                    transition={
                      playerState === 'playing'
                        ? {
                            duration: 0.5,
                            ease: 'easeInOut',
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: 'reverse' as const,
                            delay: index * 0.1,
                          }
                        : {
                            duration: 0.3,
                            ease: 'easeOut',
                            delay: 0,
                          }
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='mb-16'>
            <div className='w-full h-8 bg-neutral-800 rounded-full overflow-hidden mb-8'>
              <motion.div
                className='h-full rounded-full'
                style={{
                  background: playerState === 'playing' ? '#a872fa' : '#717680',
                  width: `${progress}%`,
                }}
                animate={{
                  background: playerState === 'playing' ? '#a872fa' : '#535862',
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className='flex justify-between text-xs text-neutral-400'>
              <span>
                {Math.floor(((progress / 100) * 225) / 60)}:
                {(Math.floor((progress / 100) * 225) % 60)
                  .toString()
                  .padStart(2, '0')}
              </span>
              <span>3:45</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className='flex items-center justify-center gap-16 mb-20'>
            <motion.button
              className='cursor-pointer w-32 h-32 flex items-center justify-center text-neutral-400 hover:text-white transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shuffle className='w-16 h-16' />
            </motion.button>

            <motion.button
              className='cursor-pointer w-32 h-32 flex items-center justify-center text-neutral-400 hover:text-white transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkipBack}
            >
              <SkipBack className='w-16 h-16' />
            </motion.button>

            <motion.button
              className='cursor-pointer w-48 h-48 rounded-full flex items-center justify-center text-white disabled:opacity-50'
              variants={playButtonVariants}
              animate={playerState}
              onClick={togglePlayPause}
              disabled={playerState === 'loading'}
              whileHover={{ scale: playerState !== 'loading' ? 1.05 : 1 }}
              whileTap={{ scale: playerState !== 'loading' ? 0.95 : 1 }}
            >
              <AnimatePresence mode='wait'>
                {playerState === 'loading' ? (
                  <motion.div
                    key='loading'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='w-20 h-20 border-2 border-white border-t-transparent rounded-full animate-spin'
                  />
                ) : playerState === 'playing' ? (
                  <motion.div
                    key='pause'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className='flex gap-4'
                  >
                    <Pause className='w-20 h-20' />
                  </motion.div>
                ) : (
                  <motion.div
                    key='play'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Play className='w-20 h-20 ml-4' />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              className='cursor-pointer w-32 h-32 flex items-center justify-center text-neutral-400 hover:text-white transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkipForward}
            >
              <SkipForward className='w-16 h-16' />
            </motion.button>

            <motion.button
              className='cursor-pointer w-32 h-32 flex items-center justify-center text-neutral-400 hover:text-white transition-colors'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Repeat className='w-16 h-16' />
            </motion.button>
          </div>

          {/* Volume Control */}
          <div className='flex items-center gap-12'>
            <Volume2 className='w-16 h-16 text-neutral-400' />
            <div className='flex-1 relative group'>
              <div className='w-full h-4 bg-neutral-700 rounded-full overflow-hidden'>
                <motion.div
                  className='h-full rounded-full bg-neutral-500 group-hover:bg-primary-200 transition-colors duration-200'
                  style={{ width: `${volume}%` }}
                />
              </div>
              <input
                type='range'
                min='0'
                max='100'
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
