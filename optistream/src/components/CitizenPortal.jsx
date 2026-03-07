import { useState } from 'react'
import { Camera, CheckCircle2, LoaderCircle, MapPin, Star, Trophy, Upload } from 'lucide-react'

function CitizenPortal({ profile, mission, uploadResultTemplate }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState(null)

  const onUpload = () => {
    setResult(null)
    setIsVerifying(true)

    setTimeout(() => {
      setIsVerifying(false)
      setResult({
        ...uploadResultTemplate,
        imageName: selectedFile ? selectedFile.name : 'gauge-capture.jpeg',
        verifiedAt: new Date().toLocaleTimeString(),
      })
    }, 1800)
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              className="h-12 w-12 rounded-full border border-slate-700 object-cover"
              src={profile.avatarUrl}
              alt="Citizen avatar"
            />
            <div>
              <p className="text-sm text-slate-400">Welcome back</p>
              <h2 className="text-lg font-semibold text-white">{profile.greeting}</h2>
            </div>
          </div>

          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-right">
            <p className="text-xs uppercase tracking-wide text-yellow-300/80">Trust Score</p>
            <p className="flex items-center justify-end gap-1 text-sm font-semibold text-yellow-200">
              <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
              {profile.trustScore}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-cyan-700 to-slate-900 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/90">Active Mission</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{mission.title}</h3>
          <p className="mt-1 text-cyan-100">{mission.status}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/40 bg-slate-950/35 px-3 py-1 text-sm text-cyan-100">
            <Trophy className="h-4 w-4" />
            {mission.bounty}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Gauge Upload</h4>
          <p className="mt-1 text-sm text-slate-400">
            Capture or upload a river gauge image (JPEG) for AI extraction and geospatial verification.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="block rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
              <span className="mb-2 inline-flex items-center gap-2 text-slate-400">
                <Camera className="h-4 w-4" />
                Select JPEG Photo
              </span>
              <input
                type="file"
                accept="image/jpeg"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                className="block w-full cursor-pointer text-sm text-slate-300 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-cyan-500/20 file:px-3 file:py-2 file:text-cyan-200 hover:file:bg-cyan-500/30"
              />
            </label>

            <button
              type="button"
              onClick={onUpload}
              disabled={isVerifying}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isVerifying ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isVerifying ? 'Processing...' : 'Capture / Upload'}
            </button>
          </div>

          {isVerifying && (
            <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              AI Verifying GPS & Extracting Water Level...
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Level: {result.level}, Location Verified
              </p>
              <p className="inline-flex items-center gap-2 text-emerald-200/90">
                <MapPin className="h-4 w-4" />
                {result.location}
              </p>
              <p className="text-emerald-200/90">Source Image: {result.imageName}</p>
              <p className="text-emerald-200/90">Verified At: {result.verifiedAt}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CitizenPortal
