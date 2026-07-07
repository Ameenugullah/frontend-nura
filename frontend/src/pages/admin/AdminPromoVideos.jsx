import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, RefreshCw, Video } from 'lucide-react';
import { getPromoVideos, savePromoVideo, deletePromoVideo } from '../../lib/api';

const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
const MAX_BYTES     = 200 * 1024 * 1024; // 200 MB

export default function AdminPromoVideos() {
  const [videos,     setVideos]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [savingSlot, setSavingSlot] = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await getPromoVideos();
    setVideos(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getBySlot = (slot) => videos.find(v => v.slot === slot) || null;

  const handleUpload = async (slot, file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Unsupported format. Please upload MP4, WebM, or MOV.');
      return;
    }
    if (file.size > MAX_BYTES) {
      alert('File is too large. Maximum size is 200 MB.');
      return;
    }
    setSavingSlot(slot);
    try {
      const existing = getBySlot(slot);
      await savePromoVideo(existing?.id || null, slot, file, `Promo Video ${slot}`);
      await load();
    } catch (err) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingSlot(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePromoVideo(id);
      setConfirmId(null);
      await load();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">


      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light font-display text-charcoal-800">Promo Videos</h1>
          <p className="mt-1 text-xs font-body text-stone-400">
            Manage the promotional videos shown on the homepage. Maximum 2 videos.
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 text-xs font-body text-stone-500 hover:text-charcoal-800 transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>


      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => <div key={i} className="aspect-video bg-stone-200 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(slot => (
            <SlotCard
              key={slot}
              slot={slot}
              video={getBySlot(slot)}
              saving={savingSlot === slot}
              onUpload={file => handleUpload(slot, file)}
              onDeleteClick={id => setConfirmId(id)}
            />
          ))}
        </div>
      )}


      <div className="p-4 bg-stone-50 border border-stone-200 space-y-1 text-xs font-body text-stone-500">
        <p><strong>Video 1</strong> plays first. <strong>Video 2</strong> follows and they alternate indefinitely.</p>
        <p>If only one video is uploaded it loops continuously.</p>
        <p>Supported formats: <strong>MP4, WebM, MOV</strong> · Max size per video: <strong>200 MB</strong></p>
      </div>


      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60">
          <div className="w-full max-w-sm p-6 text-center bg-white">
            <Trash2 size={24} className="mx-auto mb-3 text-blush-500" />
            <h3 className="mb-2 text-sm font-semibold font-body text-charcoal-800">Remove this video?</h3>
            <p className="mb-5 text-xs font-body text-stone-400">It will be removed from the homepage immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirmId)} className="flex-1 py-2 btn-blush">Remove</button>
              <button onClick={() => setConfirmId(null)}     className="flex-1 py-2 btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SlotCard({ slot, video, saving, onUpload, onDeleteClick }) {
  const inputRef = useRef(null);

  return (
    <div className="border border-stone-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500">
          Video {slot}
        </p>
        {video && (
          <button
            onClick={() => onDeleteClick(video.id)}
            className="text-stone-400 hover:text-blush-500 transition-colors"
            title="Remove video"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {video ? (
        <div className="relative overflow-hidden aspect-video bg-stone-900">
          <video
            src={video.video}
            className="absolute inset-0 w-full h-full object-cover"
            muted playsInline preload="metadata"
            controls
          />
        </div>
      ) : (
        <div className="aspect-video bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-3">
          <Video size={28} className="text-stone-300" strokeWidth={1.5} />
          <p className="text-xs font-body text-stone-400">No video uploaded</p>
        </div>
      )}

      <label className={`flex items-center justify-center gap-2 py-2.5 w-full cursor-pointer font-body text-xs tracking-wider uppercase transition-colors ${
        saving ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'btn-outline'
      }`}>
        {saving ? (
          <><RefreshCw size={13} className="animate-spin" /> Uploading…</>
        ) : (
          <><Upload size={13} /> {video ? 'Replace Video' : 'Upload Video'}</>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
          className="hidden"
          disabled={saving}
          onChange={e => {
            const f = e.target.files[0];
            if (f) { onUpload(f); e.target.value = ''; }
          }}
        />
      </label>
    </div>
  );
}
