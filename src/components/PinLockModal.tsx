import React, { useState } from 'react';
import { useCardio } from '../context/CardioContext';
import { Lock } from 'lucide-react';

export const PinLockModal: React.FC = () => {
  const { isLocked, setIsLocked, verifyPin, pin, config } = useCardio();
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleDigit = (digit: string) => {
    if (inputPin.length < 6) {
      const nextPin = inputPin + digit;
      setInputPin(nextPin);
      setError(false);
      
      if (nextPin.length === pin.length) {
        if (verifyPin(nextPin)) {
          setIsLocked(false);
          setInputPin('');
        } else {
          setError(true);
          setTimeout(() => {
            setInputPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setInputPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-slate-900 select-none">
      <div className="max-w-xs w-full text-center space-y-5 bg-white p-6 rounded-lg shadow-xl border border-slate-300">
        {/* Hospital Branding */}
        <div className="flex flex-col items-center">
          <div className="w-11 h-11 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center mb-2.5">
            <Lock className="w-5 h-5 text-blue-700 stroke-[1.75]" />
          </div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">CardioGuardia</h2>
          <p className="text-xs text-slate-500">{config.hospitalName}</p>
        </div>

        {/* PIN Indicators */}
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2.5">
            Ingresá el PIN clínico de la guardia
          </p>
          <div className="flex justify-center gap-2.5">
            {Array.from({ length: pin.length }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-150 ${
                  error
                    ? 'bg-rose-600 scale-110'
                    : i < inputPin.length
                    ? 'bg-blue-700 scale-110 shadow-xs'
                    : 'border border-slate-300 bg-slate-100'
                }`}
              />
            ))}
          </div>
          {error && (
            <p className="text-xs text-rose-600 font-medium mt-2">
              PIN incorrecto. Reintentar.
            </p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="w-14 h-11 mx-auto rounded-md bg-white hover:bg-slate-100 active:bg-blue-50 active:text-blue-700 text-base font-mono font-semibold text-slate-800 transition-colors flex items-center justify-center border border-slate-300 shadow-xs"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="w-14 h-11 mx-auto rounded-md bg-white hover:bg-slate-100 active:bg-blue-50 active:text-blue-700 text-base font-mono font-semibold text-slate-800 transition-colors flex items-center justify-center border border-slate-300 shadow-xs"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-14 h-11 mx-auto rounded-md bg-slate-50 hover:bg-rose-50 active:bg-rose-100 text-xs font-medium transition-colors flex items-center justify-center border border-slate-300 text-slate-700 hover:text-rose-700 shadow-xs"
          >
            Borrar
          </button>
        </div>

        {/* Demo Hint */}
        <div className="text-[11px] text-slate-500 border border-slate-200 py-1.5 px-3 rounded-md bg-slate-50">
          PIN de prueba: <strong className="text-slate-800 font-mono tabular-nums">{pin}</strong>
        </div>
      </div>
    </div>
  );
};