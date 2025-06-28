import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  className?: string;
}

export default function AudioPlayer({ audioUrl, title, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setError('Unable to load audio file');
      setIsLoading(false);
    };
    const handleCanPlay = () => {
      setError(null);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl]);

  // Check if the audio URL is valid
  const isValidAudioUrl = audioUrl && (
    audioUrl.startsWith('data:audio/') || 
    audioUrl.startsWith('http') || 
    audioUrl.startsWith('https')
  );

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || error) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      setIsPlaying(!isPlaying);
    } catch (playError) {
      console.error('Error playing audio:', playError);
      setError('Failed to play audio');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!isValidAudioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_audio.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Don't render if audio URL is invalid
  if (!isValidAudioUrl) {
    console.warn('Invalid audio URL provided to AudioPlayer:', audioUrl);
    return null;
  }

  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-semibold">Audio Unavailable</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <p className="text-red-600 text-xs mt-2">
              The audio file may have been generated in a previous session and is no longer accessible.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6 ${className}`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading || !!error}
          className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </button>

        {/* Progress Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">🎵 Listen to this article</span>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading || !!error}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-gray-600" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            disabled={isLoading || !!error}
            className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isLoading || !!error || !isValidAudioUrl}
          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Download audio"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </motion.div>
  );
}