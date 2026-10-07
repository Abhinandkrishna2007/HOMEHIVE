import React from 'react';
import { HelpCircle } from 'lucide-react';

const EmptyState = ({
  icon: Icon = HelpCircle,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-orange-50 text-brand-orange flex items-center justify-center mb-5 shadow-inner">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-bold text-brand-navy mb-1.5">{title}</h3>
      <p className="text-sm text-brand-muted max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-brand-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-full transition-all-custom shadow-md shadow-brand-navy/10 hover:shadow-brand-navy/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
