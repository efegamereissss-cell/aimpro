import React, { useRef, useState } from 'react';
import { VideoClip } from '../../types/esports';
import { RankBadge } from '../ui/RankBadge';
import { useClipsStore } from '../../store/useClipsStore';
import { Heart, Eye, MessageSquare, Play, Pause, Volume2, VolumeX, MapPin, Share2 } from 'lucide-react';

interface ClipCardProps {
  clip: VideoClip;
}

export const ClipCard: React.FC<ClipCardProps> = ({ clip }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const likeClip = useClipsStore(state => state.likeClip);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="bg-[#0F1420]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-[#FF4655]/40 transition-all flex flex-col justify-between group">
      
      {/* Video Container */}
      <div
        onClick={togglePlay}
        className="relative aspect-video bg-black cursor-pointer overflow-hidden group/video"
      >
        <video
          ref={videoRef}
          src={clip.videoUrl}
          loop
          muted={isMuted}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />

        {/* Play / Pause Overlay Icon */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] transition-all group-hover/video:bg-black/30">
            <div className="w-14 h-14 rounded-full bg-[#FF4655] flex items-center justify-center text-white shadow-[0_0_25px_rgba(255,70,85,0.7)] group-hover/video:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-white translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Top Floating Badges: Agent & Map */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-xs font-black text-white flex items-center gap-1 shadow-md">
              <span>{clip.agent}</span>
            </span>
            <span className="px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white/80 flex items-center gap-1 shadow-md">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{clip.map}</span>
            </span>
          </div>

          <button
            onClick={toggleMute}
            className="pointer-events-auto p-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white/80 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Bottom Floating Author info */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
          <RankBadge rank={clip.authorRank} size="sm" />
          <span className="px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-bold">
            {clip.authorName}
          </span>
        </div>
      </div>

      {/* Content & Details */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-sm md:text-base font-black text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
            {clip.title}
          </h3>
          <p className="text-xs text-white/60 font-medium line-clamp-2 mt-1">
            {clip.description}
          </p>
        </div>

        {/* Tags */}
        {clip.tags && clip.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {clip.tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/5">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Row: Likes, Views, Comments */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-bold text-white/60">
            <button
              onClick={() => likeClip(clip.id)}
              className={`flex items-center gap-1.5 transition-colors ${
                clip.isLiked ? 'text-rose-500 font-black' : 'hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${clip.isLiked ? 'fill-rose-500' : ''}`} />
              <span>{clip.likes}</span>
            </button>

            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-white/40" />
              <span>{clip.views}</span>
            </span>

            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4 text-white/40" />
              <span>{clip.commentsCount}</span>
            </span>
          </div>

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            title="Klip Linkini Kopyala"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
