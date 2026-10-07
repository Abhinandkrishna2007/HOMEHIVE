import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const VerifiedBadge = ({ text = 'Verified', size = 12 }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-50">
      <CheckCircle2 size={size} className="stroke-[2.5]" />
      <span>{text}</span>
    </span>
  );
};

export default VerifiedBadge;
