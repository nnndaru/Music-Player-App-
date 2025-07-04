'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Pause,
} from 'lucide-react';

type PlayerState = 'playing' | 'paused' | 'loading';

const Home = () => {
  // State Management
  const [playerState, setPlayerState] = useState<PlayerState>('paused');
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Event Handlers
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

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
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

  // Audio event listeners
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

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Container variants
  const containerVariants = {
    playing: {
      background: '#1a1a1a',
      boxShadow: '0 0 50px rgba(139, 92, 246, 0.3)',
    },
    paused: {
      background: '#0f0f0f',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    },
    loading: {
      background: '#0f0f0f',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    },
  };

  // Play/Pause button variants
  const playButtonVariants = {
    playing: {
      backgroundColor: '#7C3AED',
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
    paused: {
      backgroundColor: '#7C3AED',
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
    loading: {
      backgroundColor: '#717680',
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
  };

  // Album artwork variants
  const albumArtworkVariants = {
    playing: {
      scale: 1,
      opacity: 1,
      rotate: 360,
      transition: {
        scale: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        rotate: { repeat: Infinity, duration: 20, ease: 'linear' as const },
      },
    },
    paused: {
      scale: 0.95,
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
    loading: {
      scale: 0.9,
      opacity: 0.5,
      rotate: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
  };

  // Equalizer bar variants
  const equalizerBarVariants = {
    playing: {
      scaleY: [0.2, 1, 0.2],
      opacity: 1,
      transition: {
        scaleY: {
          duration: 1.2,
          ease: 'easeInOut' as const,
          repeat: Infinity,
          repeatType: 'reverse' as const,
        },
        opacity: { duration: 0.3 },
      },
    },
    paused: {
      scaleY: 0.2,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' as const },
    },
    loading: {
      scaleY: 0.5,
      opacity: 0.5,
      transition: { duration: 0.3, ease: 'easeOut' as const },
    },
  };

  // Progress bar variants
  const progressBarVariants = {
    playing: {
      backgroundColor: '#a872fa',
      transition: { duration: 0.3 },
    },
    paused: {
      backgroundColor: '#717680',
      transition: { duration: 0.3 },
    },
    loading: {
      backgroundColor: '#717680',
      transition: { duration: 0.3 },
    },
  };

  return (
    // Main Container
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className='min-h-screen flex flex-col items-center justify-center p-32 bg-neutral-950'
    >
      <div className='flex-1 flex items-center justify-center w-full'>
        <motion.div
          className='sm:w-500 sm:h-350 rounded-2xl p-24 relative overflow-hidden'
          initial={{}}
          animate={{
            background: containerVariants[playerState].background,
            boxShadow: containerVariants[playerState].boxShadow,
          }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
        >
          {/* Album Artwork */}
          <div className='flex items-start gap-16 mb-12'>
            <motion.div
              className='w-80 h-80 sm:w-120 sm:h-120 rounded-sm sm:rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden'
              variants={albumArtworkVariants}
              animate={playerState}
              style={{ willChange: 'transform, opacity' }}
            >
              <div className='flex justify-center items-center h-full'>
                <Image
                  src='/album-art.png'
                  alt='Album Artwork'
                  width={192}
                  height={192}
                  className='sm:w-48 sm:h-48 w-32 h-32 object-cover rounded-lg'
                />
              </div>
            </motion.div>

            {/* Title and Artist */}
            <div className='flex-1 pt-8'>
              <h2 className='text-sm sm:text-lg font-semibold text-white sm:mb-4 sm:mt-20'>
                Kartini - Archipelago Series
              </h2>
              <p className='text-xs sm:text-sm text-neutral-400'>
                Epic Majestic Orchestral
              </p>

              {/* Equalizer Bars */}
              <motion.div
                className='flex items-end gap-4 h-32 mb-10 mt-20'
                transition={{
                  staggerChildren: playerState === 'playing' ? 0.1 : 0,
                }}
                animate={playerState}
              >
                {[0, 1, 2, 3, 4].map((index) => (
                  <motion.div
                    key={index}
                    className='bg-primary-200 origin-bottom w-8 h-32'
                    variants={equalizerBarVariants}
                    style={{ willChange: 'transform, opacity' }}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div
              className='w-full h-8 bg-neutral-800 rounded-full overflow-hidden mb-12 cursor-pointer'
              onClick={handleProgressBarClick}
            >
              <motion.div
                className='h-full rounded-full'
                style={{
                  width: `${progress}%`,
                  willChange: 'background-color',
                }}
                variants={progressBarVariants}
                animate={playerState}
              />
            </div>

            {/* Time Display */}
            <div className='flex justify-between text-xs text-neutral-400'>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className='flex items-center justify-center gap-16 mb-20'>
            {/* Shuffle Button */}
            <motion.button
              className={`cursor-pointer w-36 h-36 flex items-center justify-center rounded-lg transition-colors ${
                isShuffle
                  ? 'text-white bg-neutral-700'
                  : 'text-primary-200 hover:text-white hover:bg-neutral-700'
              }`}
              onClick={() => setIsShuffle((prev) => !prev)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shuffle className='w-20 h-20' />
            </motion.button>

            {/* Skip Back Button */}
            <motion.button
              className='cursor-pointer w-36 h-36 flex items-center justify-center text-neutral-400 hover:text-white transition-colors hover:bg-neutral-700 rounded-lg'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkipBack}
            >
              <SkipBack className='w-20 h-20' />
            </motion.button>

            {/* Play/Pause Button */}
            <motion.button
              className='cursor-pointer w-56 h-56 rounded-full flex items-center justify-center text-white disabled:opacity-50'
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

            {/* Skip Forward Button */}
            <motion.button
              className='cursor-pointer w-36 h-36 flex items-center justify-center text-neutral-400 hover:text-white transition-colors hover:bg-neutral-700 rounded-lg'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkipForward}
            >
              <SkipForward className='w-20 h-20' />
            </motion.button>

            {/* Repeat Button */}
            <motion.button
              className={`cursor-pointer w-36 h-36 flex items-center justify-center rounded-lg transition-colors ${
                isRepeat
                  ? 'text-white bg-neutral-700'
                  : 'text-primary-200 hover:text-white hover:bg-neutral-700'
              }`}
              onClick={() => setIsRepeat((prev) => !prev)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Repeat className='w-20 h-20' />
            </motion.button>
          </div>

          {/* Volume Control */}
          <div className='flex items-center gap-12'>
            <Volume2 className='w-20 h-20 text-neutral-400' />
            <div className='flex-1 relative group'>
              <div className='w-full h-4 bg-neutral-800 rounded-full overflow-hidden'>
                <motion.div
                  className='h-full rounded-full bg-neutral-400 group-hover:bg-primary-200 transition-colors duration-200'
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

          {/* Audio Element */}
          <audio
            ref={audioRef}
            src='/Kartini - Archipelago Series - Epic Majestic Orchestral.wav'
            preload='auto'
            style={{ display: 'none' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
