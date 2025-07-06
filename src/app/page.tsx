'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Pause,
} from 'lucide-react';

type PlayerState = 'playing' | 'paused' | 'loading';

// Tooltip Component
const Tooltip = ({
  children,
  minWidth = 'min-w-[120px]',
}: {
  children: React.ReactNode;
  minWidth?: string;
}) => (
  <div
    className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-4 py-2 rounded bg-neutral-800 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity duration-200 text-center ${minWidth}`}
  >
    {children}
  </div>
);

// Tooltip Messages

const TOOLTIP_SHUFFLE = (isShuffle: boolean) =>
  isShuffle ? 'Shuffle mode is on' : 'Shuffle mode is off';

const TOOLTIP_SKIP_BACK = (currentTrackIndex: number, repeatMode: string) =>
  repeatMode === 'one'
    ? 'Restart current track'
    : currentTrackIndex === 0
    ? 'This is the first track'
    : 'Skip to previous track';

const TOOLTIP_PLAY_PAUSE = (playerState: string) =>
  playerState === 'loading'
    ? 'Loading...'
    : playerState === 'playing'
    ? 'Pause'
    : 'Play';

const TOOLTIP_SKIP_FORWARD = (
  repeatMode: string,
  currentTrackIndex: number,
  playlistLength: number
) =>
  repeatMode === 'one'
    ? 'Restart current track'
    : repeatMode === 'none' && currentTrackIndex === playlistLength - 1
    ? 'This is the last track'
    : 'Skip to next track';

const TOOLTIP_REPEAT = (repeatMode: string) => {
  switch (repeatMode) {
    case 'none':
      return 'Repeat mode is off';
    case 'all':
      return 'Repeat all tracks';
    case 'one':
      return 'Repeat current track';
    default:
      return 'Repeat mode is off';
  }
};

const Home = () => {
  // State Management

  // Player state and refs
  const [playerState, setPlayerState] = useState<PlayerState>('paused');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Shuffle/repeat state
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');

  // Playlist and track state
  const playlist = [
    {
      title: 'Kartini',
      artist: 'Epic Majestic Orchestral',
      src: '/Kartini - Archipelago Series - Epic Majestic Orchestral.wav',
    },
    {
      title: 'Kasih Ibu',
      artist: 'Ferdinand Marsa & Clarissa Tamara',
      src: '/Kasih Ibu - Ferdinand Marsa & Clarissa Tamara.wav',
    },
    {
      title: 'Laskar Pelangi',
      artist: 'Trinity Youth Symphony Orchestra',
      src: '/Laskar Pelangi - Trinity Youth Symphony Orchestra.wav',
    },
  ];
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Volume/mute state
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(70);

  // Volume/mute effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Volume/mute handlers
  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (value === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  // Progress bar drag state
  const [isDragging, setIsDragging] = useState(false);

  // Progress bar drag handlers
  const handleProgressUpdate = useCallback(
    (clientX: number) => {
      if (!audioRef.current || !duration) return;
      const progressBar = document.querySelector(
        '.progress-bar'
      ) as HTMLDivElement;
      if (!progressBar) return;
      const rect = progressBar.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percent * 100);
    },
    [audioRef, duration, setCurrentTime, setProgress]
  );

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressUpdate(e.clientX);
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  // Global mouse listeners for drag
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleProgressUpdate(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleProgressUpdate]);

  // Volume drag state
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);

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
      if (repeatMode === 'one') {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        setProgress(0);
        return;
      }
      if (audioRef.current.currentTime > 3 || currentTrackIndex === 0) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        setProgress(0);
      } else {
        setCurrentTrackIndex((prev) => Math.max(0, prev - 1));
      }
      setPlayerState('paused');
      audioRef.current.pause();
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      if (repeatMode === 'one') {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        setProgress(0);
        return;
      }
      if (isShuffle && playlist.length > 1) {
        let nextIndex = Math.floor(Math.random() * playlist.length);
        while (nextIndex === currentTrackIndex) {
          nextIndex = Math.floor(Math.random() * playlist.length);
        }
        setCurrentTrackIndex(nextIndex);
      } else if (currentTrackIndex < playlist.length - 1) {
        setCurrentTrackIndex((prev) => prev + 1);
      } else if (repeatMode === 'all') {
        setCurrentTrackIndex(0);
      } else {
        audioRef.current.currentTime = duration;
        setCurrentTime(duration);
        setProgress(100);
        setPlayerState('paused');
        audioRef.current.pause();
      }
    }
  };

  // Format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let playTimeout: NodeJS.Timeout | null = null;
    let pauseTimeout: NodeJS.Timeout | null = null;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(duration ? (audio.currentTime / duration) * 100 : 0);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const onPlay = () => {
      if (playTimeout) clearTimeout(playTimeout);
      playTimeout = setTimeout(() => setPlayerState('playing'), 500);
    };
    const onPause = () => {
      if (pauseTimeout) clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => setPlayerState('paused'), 500);
    };
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 'all') {
        if (currentTrackIndex < playlist.length - 1) {
          setCurrentTrackIndex((prev) => prev + 1);
        } else {
          setCurrentTrackIndex(0);
        }
      } else if (isShuffle && playlist.length > 1) {
        let nextIndex = Math.floor(Math.random() * playlist.length);
        while (nextIndex === currentTrackIndex) {
          nextIndex = Math.floor(Math.random() * playlist.length);
        }
        setCurrentTrackIndex(nextIndex);
      } else if (currentTrackIndex < playlist.length - 1) {
        setCurrentTrackIndex((prev) => prev + 1);
      } else {
        setPlayerState('paused');
        setCurrentTime(duration);
        setProgress(100);
      }
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
      if (playTimeout) clearTimeout(playTimeout);
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [repeatMode, isShuffle, currentTrackIndex, duration, playlist.length]);

  // Update audio src
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = playlist[currentTrackIndex].src;
      setCurrentTime(0);
      setProgress(0);
      setDuration(0);
      if (playerState === 'playing') {
        audioRef.current.play();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex]);

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
                  width={60}
                  height={60}
                  className='object-contain rounded-lg'
                />
              </div>
            </motion.div>

            {/* Title and Artist */}
            <div className='flex-1 pt-8 pl-12'>
              <h2 className='text-sm sm:text-lg font-semibold text-white sm:mb-4 sm:mt-20'>
                {playlist[currentTrackIndex].title}
              </h2>
              <p className='text-xs sm:text-sm text-neutral-400'>
                {playlist[currentTrackIndex].artist}
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
                    className='bg-primary-300 origin-bottom w-8 h-32'
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
              className='progress-bar w-full h-8 bg-neutral-800 rounded-full overflow-hidden mb-12 cursor-pointer select-none'
              onMouseDown={handleProgressMouseDown}
              onMouseUp={handleProgressMouseUp}
            >
              <motion.div
                className='h-full rounded-l-full'
                style={{
                  width: `${progress}%`,
                  backgroundColor:
                    playerState === 'playing' ? '#7c3aed' : '#717680',
                  willChange: 'background-color',
                }}
                transition={{ duration: 0.3 }}
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
            <div className='relative group'>
              <motion.button
                className={
                  `cursor-pointer w-36 h-36 flex items-center justify-center rounded-lg transition-colors ` +
                  (isShuffle
                    ? 'text-primary-300 bg-neutral-800'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800')
                }
                onClick={() => setIsShuffle((prev) => !prev)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 1000, damping: 20 }}
              >
                <Shuffle className='w-20 h-20' />
              </motion.button>
              <Tooltip>{TOOLTIP_SHUFFLE(isShuffle)}</Tooltip>
            </div>

            {/* Skip Back Button */}
            <div className='relative group'>
              <motion.button
                className='cursor-pointer w-36 h-36 flex items-center justify-center text-neutral-400 hover:text-white transition-colors hover:bg-neutral-700 rounded-lg'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSkipBack}
                transition={{ type: 'spring', stiffness: 1000, damping: 20 }}
              >
                <SkipBack className='w-20 h-20' />
              </motion.button>
              <Tooltip>
                {TOOLTIP_SKIP_BACK(currentTrackIndex, repeatMode)}
              </Tooltip>
            </div>

            {/* Play/Pause Button */}
            <div className='relative group'>
              <motion.button
                className='cursor-pointer w-56 h-56 rounded-full flex items-center justify-center text-white disabled:opacity-50'
                style={{
                  backgroundColor:
                    playerState === 'loading' ? '#717680' : '#7c3aed',
                }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 1000, damping: 20 }}
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
              <Tooltip minWidth='min-w-[80px]'>
                {TOOLTIP_PLAY_PAUSE(playerState)}
              </Tooltip>
            </div>

            {/* Skip Forward Button */}
            <div className='relative group'>
              <motion.button
                className='cursor-pointer w-36 h-36 flex items-center justify-center text-neutral-400 hover:text-white transition-colors hover:bg-neutral-700 rounded-lg'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSkipForward}
                transition={{ type: 'spring', stiffness: 1000, damping: 20 }}
              >
                <SkipForward className='w-20 h-20' />
              </motion.button>
              <Tooltip>
                {TOOLTIP_SKIP_FORWARD(
                  repeatMode,
                  currentTrackIndex,
                  playlist.length
                )}
              </Tooltip>
            </div>

            {/* Repeat Button */}
            <div className='relative group'>
              <motion.button
                className={
                  `cursor-pointer w-36 h-36 flex items-center justify-center rounded-lg transition-colors ` +
                  (repeatMode !== 'none'
                    ? 'text-primary-300 bg-neutral-800'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800')
                }
                onClick={() => {
                  setRepeatMode((prev) => {
                    switch (prev) {
                      case 'none':
                        return 'one';
                      case 'one':
                        return 'all';
                      case 'all':
                        return 'none';
                      default:
                        return 'none';
                    }
                  });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 1000, damping: 20 }}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className='w-20 h-20' />
                ) : (
                  <Repeat className='w-20 h-20' />
                )}
              </motion.button>
              <Tooltip>{TOOLTIP_REPEAT(repeatMode)}</Tooltip>
            </div>
          </div>

          {/* Volume Control */}
          <div className='flex items-center gap-4 h-20'>
            <div className='relative flex items-center group h-full'>
              <button
                type='button'
                onClick={handleMuteToggle}
                className='focus:outline-none cursor-pointer flex items-center h-full'
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className='w-20 h-20 text-neutral-400' />
                ) : (
                  <Volume2 className='w-20 h-20 text-neutral-400' />
                )}
              </button>
              <Tooltip minWidth='60px'>
                {isMuted || volume === 0 ? 'Unmute' : 'Mute'}
              </Tooltip>
            </div>
            <div className='flex-1 relative group h-full flex items-center'>
              <div className='w-full h-4 bg-neutral-800 rounded-full overflow-hidden flex items-center'>
                <motion.div
                  className='h-full rounded-full bg-[#717680] group-hover:bg-primary-300 transition-colors duration-200'
                  style={{ width: `${volume}%` }}
                />
                {isVolumeDragging && (
                  <div
                    className='absolute top-1/2 -translate-y-1/2 h-8 w-8 bg-white rounded-full opacity-100 transition-opacity duration-200 -translate-x-1/2'
                    style={{
                      left: `${volume}%`,
                    }}
                  />
                )}
              </div>
              <input
                type='range'
                min='0'
                max='100'
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                onMouseDown={() => setIsVolumeDragging(true)}
                onMouseUp={() => setIsVolumeDragging(false)}
                onMouseLeave={() => setIsVolumeDragging(false)}
                onTouchStart={() => setIsVolumeDragging(true)}
                onTouchEnd={() => setIsVolumeDragging(false)}
              />
            </div>
          </div>

          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={playlist[currentTrackIndex].src}
            preload='auto'
            style={{ display: 'none' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
