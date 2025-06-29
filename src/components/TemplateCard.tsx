import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  StarOff, 
  Download, 
  Eye, 
  Users, 
  Calendar,
  Crown,
  Zap,
  Mail,
  Webhook,
  MessageSquare,
  Coins,
  Palette,
  Activity,
  TrendingUp,
  Clock,
  Tag,
  Play,
  MoreHorizontal
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'defi' | 'nft' | 'gaming' | 'dao' | 'custom';
  triggerType: 'eth_transfer' | 'nft_purchase' | 'contract_event' | 'token_transfer' | 'price_alert';
  actionType: 'email' | 'webhook' | 'discord' | 'slack' | 'telegram';
  isPublic: boolean;
  isFavorite: boolean;
  isPremium: boolean;
  usageCount: number;
  rating: number;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

interface TemplateCardProps {
  template: Template;
  viewMode: 'grid' | 'list';
  onToggleFavorite: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  viewMode, 
  onToggleFavorite, 
  onEdit, 
  onDelete
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((open) => !open);
  };
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit();
  };
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete();
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'eth_transfer': return <Coins className="w-4 h-4" />;
      case 'nft_purchase': return <Palette className="w-4 h-4" />;
      case 'contract_event': return <Activity className="w-4 h-4" />;
      case 'token_transfer': return <Zap className="w-4 h-4" />;
      case 'price_alert': return <TrendingUp className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'webhook': return <Webhook className="w-4 h-4" />;
      case 'discord': return <MessageSquare className="w-4 h-4" />;
      case 'slack': return <MessageSquare className="w-4 h-4" />;
      case 'telegram': return <MessageSquare className="w-4 h-4" />;
      default: return <Webhook className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'defi': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'nft': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'gaming': return 'bg-green-100 text-green-700 border-green-200';
      case 'dao': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
                {template.isPremium && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(template.category)}`}>
                  {template.category.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-600 text-sm mb-3">{template.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{template.usageCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getTriggerIcon(template.triggerType)}
                <span className="text-sm text-slate-600">→</span>
                {getActionIcon(template.actionType)}
              </div>
              <span className="text-sm text-slate-600">by {template.author}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => onToggleFavorite(template.id)}
              className={`p-2 rounded-lg transition-colors ${
                template.isFavorite 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {template.isFavorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
            </button>
            <button ref={buttonRef} onClick={handleMenuClick} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {menuOpen && (
              <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                <button onClick={handleEdit} className="block w-full text-left px-4 py-2 hover:bg-slate-100">Edit</button>
                <button onClick={handleDelete} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Delete</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 group"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 opacity-60"></div>
      
      {/* Premium Badge */}
      {template.isPremium && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold">
            <Crown className="w-3 h-3" />
            PRO
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(template.category)}`}>
                {template.category.toUpperCase()}
              </span>
              {!template.isPublic && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                  Private
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {template.name}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {template.description}
            </p>
          </div>
          
          <div className="relative">
            <button ref={buttonRef} onClick={handleMenuClick} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {menuOpen && (
              <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                <button onClick={handleEdit} className="block w-full text-left px-4 py-2 hover:bg-slate-100">Edit</button>
                <button onClick={handleDelete} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Delete</button>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Flow */}
        <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-gradient-to-r from-slate-50/80 to-white/80 rounded-2xl border border-slate-200/50">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
            {getTriggerIcon(template.triggerType)}
            <span className="text-xs font-semibold">{template.triggerType.replace('_', ' ')}</span>
          </div>
          <div className="w-6 h-px bg-slate-300"></div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-xl border border-green-200">
            {getActionIcon(template.actionType)}
            <span className="text-xs font-semibold">{template.actionType}</span>
          </div>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                +{template.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats & Actions */}
      <div className="relative z-10 px-6 py-4 bg-gradient-to-r from-slate-50/80 to-white/80 border-t border-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(template.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={() => onToggleFavorite(template.id)}
            className={`p-2 rounded-lg transition-colors ${
              template.isFavorite
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={template.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {template.isFavorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateCard;