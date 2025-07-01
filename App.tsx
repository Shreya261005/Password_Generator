import React, { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw, Settings, Shield, Check, Eye, EyeOff } from 'lucide-react';

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 12,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
};

function App() {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
  const [strength, setStrength] = useState(0);

  const generatePassword = useCallback(() => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    if (options.includeUppercase) charset += uppercase;
    if (options.includeLowercase) charset += lowercase;
    if (options.includeNumbers) charset += numbers;
    if (options.includeSymbols) charset += symbols;

    if (charset === '') {
      setPassword('Select at least one character type');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < options.length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(newPassword);
    setPasswordHistory(prev => [newPassword, ...prev.slice(0, 4)]);
  }, [options]);

  const calculateStrength = useCallback((pwd: string) => {
    let score = 0;
    const checks = [
      pwd.length >= 8,
      pwd.length >= 12,
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /[0-9]/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd),
      pwd.length >= 16,
    ];

    score = checks.filter(Boolean).length;
    return Math.min(score / 7, 1) * 100;
  }, []);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    setStrength(calculateStrength(password));
  }, [password, calculateStrength]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return 'from-red-500 to-red-600';
    if (strength < 60) return 'from-yellow-500 to-orange-500';
    if (strength < 80) return 'from-blue-500 to-indigo-500';
    return 'from-green-500 to-emerald-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };

  const setPresetStrength = (preset: 'weak' | 'medium' | 'strong') => {
    const presets = {
      weak: { ...DEFAULT_OPTIONS, length: 8, includeSymbols: false },
      medium: { ...DEFAULT_OPTIONS, length: 12 },
      strong: { ...DEFAULT_OPTIONS, length: 16 },
    };
    setOptions(presets[preset]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Password Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Create secure passwords with customizable options
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Password Display */}
          <div className="mb-8">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-white font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Generated Password
                </label>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="relative bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                <div className="font-mono text-lg text-white break-all pr-12">
                  {showPassword ? password : '•'.repeat(password.length)}
                </div>
                
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all duration-200 group"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    )}
                  </button>
                  
                  <button
                    onClick={generatePassword}
                    className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all duration-200 group"
                  >
                    <RefreshCw className="w-4 h-4 text-purple-400 group-hover:text-purple-300 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Strength Indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Password Strength</span>
                <span className={`text-sm font-semibold bg-gradient-to-r ${getStrengthColor(strength)} bg-clip-text text-transparent`}>
                  {getStrengthText(strength)}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getStrengthColor(strength)} transition-all duration-500 ease-out`}
                  style={{ width: `${strength}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">Quick Presets</label>
            <div className="grid grid-cols-3 gap-3">
              {(['weak', 'medium', 'strong'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setPresetStrength(preset)}
                  className="py-3 px-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-white font-medium transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 capitalize"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-6">
            {/* Length Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-semibold">Password Length</label>
                <span className="text-blue-400 font-mono text-lg">{options.length}</span>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                value={options.length}
                onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>4</span>
                <span>32</span>
              </div>
            </div>

            {/* Character Options */}
            <div>
              <label className="block text-white font-semibold mb-3">Character Types</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'includeUppercase', label: 'Uppercase (A-Z)', example: 'ABC' },
                  { key: 'includeLowercase', label: 'Lowercase (a-z)', example: 'abc' },
                  { key: 'includeNumbers', label: 'Numbers (0-9)', example: '123' },
                  { key: 'includeSymbols', label: 'Symbols (!@#)', example: '!@#' },
                ].map(({ key, label, example }) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={options[key as keyof PasswordOptions] as boolean}
                      onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-slate-500 bg-transparent checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                    />
                    <div className="flex-1">
                      <div className="text-white group-hover:text-blue-200 transition-colors duration-200">
                        {label}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{example}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Password History */}
          {passwordHistory.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-600/30">
              <label className="block text-white font-semibold mb-3">Recent Passwords</label>
              <div className="space-y-2">
                {passwordHistory.slice(0, 3).map((historyPassword, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-600/20"
                  >
                    <span className="font-mono text-slate-300 text-sm truncate flex-1 mr-3">
                      {historyPassword}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(historyPassword)}
                      className="p-1 text-slate-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="mt-8">
            <button
              onClick={generatePassword}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Generate New Password
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400">
          <p className="text-sm">
            Keep your accounts secure with strong, unique passwords
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  );
}

export default App;