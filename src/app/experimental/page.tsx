'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, easeInOut, RepeatType } from 'framer-motion';
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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (playerState === 'playing') {
      setPlayerState('loading');
      audioRef.current.pause();
    } else {
      setPlayerState('loading');
      audioRef.current.play();
    }
  };

  const handleSkipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      setPlayerState('paused');
      audioRef.current.pause();
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = duration;
      setCurrentTime(duration);
      setProgress(100);
      setPlayerState('paused');
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(duration ? (audio.currentTime / duration) * 100 : 0);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const onPlay = () => setPlayerState('playing');
    const onPause = () => setPlayerState('paused');
    const onEnded = () => {
      setPlayerState('paused');
      setCurrentTime(duration);
      setProgress(100);
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [duration]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleProgressBarClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percent * 100);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Container variants for background and shadow animations
  const containerVariants = {
    playing: {
      background: '#1a1a1a',
    },
    paused: {
      background: '#0f0f0f',
    },
    loading: {
      background: '#0f0f0f',
    },
  };

  // For pulsing boxShadow in playing state
  const playingBoxShadows = [
    '0 0 60px 10px rgba(163, 114, 250, 0.3), 0 0 120px 30px rgba(255, 0, 128, 0.3)',
    '0 0 80px 20px rgba(255, 0, 128, 0.7), 0 0 120px 30px rgba(163, 114, 250, 0.4)',
    '0 0 60px 10px rgba(163, 114, 250, 0.7), 0 0 120px 30px rgba(255, 0, 128, 0.4)',
  ];

  // Animated boxShadow for playing state
  const animatedBoxShadow = useMemo(
    () =>
      playerState === 'playing'
        ? {
            boxShadow: [
              '0 0 80px 20px rgba(255, 0, 128, 0.7), 0 0 120px 30px rgba(163, 114, 250, 0.4)',
              '0 0 60px 10px rgba(163, 114, 250, 0.7), 0 0 120px 30px rgba(255, 0, 128, 0.4)',
            ],
            transition: {
              boxShadow: {
                duration: 1,
                repeat: Infinity,
                repeatType: 'reverse' as RepeatType,
                ease: easeInOut,
              },
            },
          }
        : {
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
            transition: { boxShadow: { duration: 1 } },
          },
    [playerState]
  );

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className='min-h-screen flex flex-col items-center justify-center p-32 bg-gradient-to-br from-[#5a4283] to-[#251938]'
    >
      <div className='flex-1 flex items-center justify-center w-full'>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{
            opacity: 1,
            y: 0,
            boxShadow:
              playerState === 'playing'
                ? playingBoxShadows
                : animatedBoxShadow.boxShadow,
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
                  opacity: { duration: 1, ease: 'easeOut' },
                  y: { duration: 1, ease: 'easeOut' },
                }
              : {
                  ...animatedBoxShadow.transition,
                  opacity: { duration: 1, ease: 'easeOut' },
                  y: { duration: 1, ease: 'easeOut' },
                }
          }
          className='sm:w-500 sm:h-350 rounded-2xl p-24 relative overflow-hidden'
          style={{ background: containerVariants[playerState].background }}
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
                borderRadius: playerState === 'playing' ? '50%' : '12px',
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
                <Music className='w-48 h-48 text-white' />
              </motion.div>
            </motion.div>

            <div className='flex-1 pt-8'>
              <h2 className='text-sm sm:text-lg font-semibold text-white sm:mb-4 sm:mt-20'>
                {/* Change Title Here */}
                Kartini - Archipelago Series
              </h2>
              <p className='text-xs sm:text-sm text-neutral-400'>
                {/* Change Artist Here */}
                Epic Majestic Orchestral
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
                            repeatType: 'reverse' as RepeatType,
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
            <div
              className='w-full h-8 bg-neutral-800 rounded-full overflow-hidden mb-8 cursor-pointer'
              onClick={handleProgressBarClick}
            >
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
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
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

          {/* Audio Element (hidden) */}
          <audio
            ref={audioRef}
            src={'/Kartini - Archipelago Series - Epic Majestic Orchestral.wav'} // Change Song Path Here
            preload='auto'
            style={{ display: 'none' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
