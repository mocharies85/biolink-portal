import React from 'react';
import { X, QrCode, Download, Lock } from 'lucide-react';
import { LinkItem } from '../types';

interface BioModalsProps {
  username: string;
  showQrModal: boolean;
  onCloseQr: () => void;
  qrImageUrl: string;
  onDownloadQr: () => void;

  pinModalOpen: boolean;
  targetPinLink: LinkItem | null;
  pinInput: string;
  pinError: string;
  isVerifyingPin: boolean;
  onPinChange: (val: string) => void;
  onUnlockPin: (e: React.FormEvent) => void;
  onClosePin: () => void;
}

export default function BioModals({
  username,
  showQrModal,
  onCloseQr,
  qrImageUrl,
  onDownloadQr,
  pinModalOpen,
  targetPinLink,
  pinInput,
  pinError,
  isVerifyingPin,
  onPinChange,
  onUnlockPin,
  onClosePin,
}: BioModalsProps) {
  return (
    <>
      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center">
            <button
              type="button"
              onClick={onCloseQr}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">Scan QR Code</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
              Scan to open <strong>@{username}</strong>&apos;s biolink hub on any smartphone.
            </p>

            <div className="my-5 p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              <img
                src={qrImageUrl}
                alt="Biolink QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>

            <button
              type="button"
              onClick={onDownloadQr}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res PNG</span>
            </button>
          </div>
        </div>
      )}

      {/* PIN Unlock Modal */}
      {pinModalOpen && targetPinLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
                <Lock className="w-6 h-6" />
              </div>

              <h4 className="text-base font-bold text-white">Protected Link</h4>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                {targetPinLink.title}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Enter the access PIN code to unlock this link.
              </p>
            </div>

            <form onSubmit={onUnlockPin} className="mt-5 space-y-3">
              <div>
                <input
                  type="password"
                  maxLength={12}
                  autoFocus
                  placeholder="Enter PIN..."
                  value={pinInput}
                  onChange={(e) => onPinChange(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-bold py-2.5 px-4 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 transition"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-1.5 text-center font-medium">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClosePin}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPin || !pinInput.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  {isVerifyingPin ? 'Unlocking...' : 'Unlock Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}