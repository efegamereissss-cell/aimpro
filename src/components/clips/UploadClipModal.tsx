import React, { useState, useEffect } from 'react';
import { useClipsStore } from '../../store/useClipsStore';
import { useLobbyStore } from '../../store/useLobbyStore';
import { ValorantRank } from '../../types/esports';
import { X, Upload, Film, Sparkles, CheckCircle2, Link as LinkIcon } from 'lucide-react';

const AGENT_LIST = ['Jett', 'Reyna', 'Omen', 'Iso', 'Sova', 'Raze', 'Clove', 'Cypher', 'Killjoy', 'Viper', 'Fade', 'Gekko', 'Chamber', 'KAY/O', 'Yoru', 'Breach', 'Phoenix', 'Brimstone', 'Skye', 'Astra', 'Harbor', 'Deadlock'];
const MAP_LIST = ['Ascent', 'Bind', 'Haven', 'Split', 'Sunset', 'Lotus', 'Abyss', 'Breeze', 'Icebox', 'Fracture', 'Pearl'];

export const UploadClipModal: React.FC = () => {
  const isUploadModalOpen = useClipsStore(state => state.isUploadModalOpen);
  const setUploadModalOpen = useClipsStore(state => state.setUploadModalOpen);
  const addClip = useClipsStore(state => state.addClip);
  const userProfile = useLobbyStore(state => state.userProfile);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState(userProfile.name || '');
  const [authorRank, setAuthorRank] = useState<ValorantRank>(userProfile.rank || 'diamond');
  const [agent, setAgent] = useState('Jett');
  const [map, setMap] = useState('Ascent');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isUploadModalOpen && userProfile.name && !authorName) {
      setAuthorName(userProfile.name);
      setAuthorRank(userProfile.rank);
    }
  }, [isUploadModalOpen, userProfile]);

  if (!isUploadModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objUrl = URL.createObjectURL(file);
      setPreviewUrl(objUrl);
      setVideoUrl(objUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = videoUrl.trim() || previewUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    if (!title.trim() || !authorName.trim()) return;

    addClip(
      {
        title: title.trim(),
        description: description.trim() || `${agent} ile ${map} haritasında muazzam bir raunt!`,
        authorName: authorName.trim(),
        authorRank,
        videoUrl: finalUrl,
        agent,
        map,
        tags: [agent, map, 'Topluluk Klibi']
      },
      selectedFile || undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F1420] border border-[#FF4655]/40 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF4655] to-rose-600 flex items-center justify-center text-white shadow-lg">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Topluluk Klibi / Video Yükle</h2>
              <p className="text-xs text-white/50 font-medium">Clutch, ace veya komik anlarını tüm Valorant topluluğuyla paylaş</p>
            </div>
          </div>

          <button
            onClick={() => setUploadModalOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* Video Upload Dropzone or URL */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-white/70 block">
              Video Dosyası Seç (MP4 / WebM) veya Video Linki Gir
            </label>

            <div className="border-2 border-dashed border-white/20 hover:border-[#FF4655]/60 rounded-2xl p-6 text-center bg-black/40 transition-colors relative cursor-pointer group">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-white/70 group-hover:text-[#FF4655] transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <p className="text-xs font-bold text-emerald-400">
                    Seçilen Dosya: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </p>
                ) : (
                  <>
                    <p className="text-xs font-bold text-white/80">
                      Bilgisayarından video yüklemek için buraya tıkla veya sürükle
                    </p>
                    <p className="text-[10px] text-white/40">MP4, WebM, MOV formatları desteklenir</p>
                  </>
                )}
              </div>
            </div>

            {/* Optional URL Input */}
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                placeholder="Veya doğrudan video bağlantısı (MP4 / WebM linki) yapıştırın..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#FF4655]"
              />
            </div>
          </div>

          {/* Video Preview If Available */}
          {previewUrl && (
            <div className="rounded-xl overflow-hidden aspect-video max-h-48 bg-black border border-white/10 mx-auto">
              <video src={previewUrl} controls className="w-full h-full object-contain" />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
              Klip Başlığı *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 1v4 İmkansız Bind Clutch (Tek Mermi Ace)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF4655]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
              Açıklama & Detay
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vuruş nasıl gerçekleşti, hangi roundda oldu..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF4655] resize-none"
            />
          </div>

          {/* Author Name & Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Oyuncu Adınız *
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Örn: AspasFan"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Klipteki Rankınız
              </label>
              <select
                value={authorRank}
                onChange={(e) => setAuthorRank(e.target.value as ValorantRank)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              >
                <option value="iron">Demir</option>
                <option value="bronze">Bronz</option>
                <option value="silver">Gümüş</option>
                <option value="gold">Altın</option>
                <option value="platinum">Platin</option>
                <option value="diamond">Elmas</option>
                <option value="ascendant">Yücelik</option>
                <option value="immortal">Ölümsüzlük</option>
                <option value="radiant">Radyant</option>
              </select>
            </div>
          </div>

          {/* Agent & Map */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Oynanan Ajan
              </label>
              <select
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              >
                {AGENT_LIST.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-white/70 block mb-1">
                Harita
              </label>
              <select
                value={map}
                onChange={(e) => setMap(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF4655]"
              >
                {MAP_LIST.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs md:text-sm transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4655] to-rose-600 hover:from-rose-600 hover:to-[#FF4655] text-white font-black text-xs md:text-sm shadow-[0_0_20px_rgba(255,70,85,0.4)] transition-all hover:scale-105"
            >
              <Film className="w-4 h-4" />
              <span>KLİBİ YAYINLA</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
