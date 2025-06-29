import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Edit3,
  Trash2,
  Copy,
  MoreHorizontal,
  Calendar,
  Star,
  StarOff,
  Eye,
  Download,
  Upload,
  Bookmark,
  Layers,
  Zap,
  Users,
  Crown,
  Sparkles,
  FileText,
  Settings,
  User
} from 'lucide-react';
import TemplateCard from './TemplateCard';
import CreateTemplateModal from './CreateTemplateModal';

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
  message: {
    subject: string;
    body: string;
    variables: string[];
  };
  config: {
    triggerConfig: Record<string, any>;
    actionConfig: Record<string, any>;
  };
}

interface TemplatesPageProps {
  onCreateWorkflow: (workflow: any) => void;
  templates: Template[];
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  onCreateTemplate: (template: any) => void;
  onEditTemplate: (id: string, updates: any) => void;
  onDeleteTemplate: (id: string) => void;
}

const TemplatesPage: React.FC<TemplatesPageProps> = ({ onCreateWorkflow, templates, setTemplates, onCreateTemplate, onEditTemplate, onDeleteTemplate }) => {
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'usage' | 'rating'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<'all' | 'defi' | 'nft' | 'gaming' | 'dao' | 'custom'>('all');

  const filteredAndSortedTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'usage':
          comparison = a.usageCount - b.usageCount;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const stats = {
    total: templates.length,
    favorites: templates.filter(t => t.isFavorite).length,
    byCategory: {
      defi: templates.filter(t => t.category === 'defi').length,
      nft: templates.filter(t => t.category === 'nft').length,
      gaming: templates.filter(t => t.category === 'gaming').length,
      dao: templates.filter(t => t.category === 'dao').length,
      custom: templates.filter(t => t.category === 'custom').length
    }
  };

  const categories = [
    { id: 'all', label: 'All Categories', icon: Layers, count: templates.length },
    { id: 'defi', label: 'DeFi', icon: Zap, count: stats.byCategory.defi },
    { id: 'nft', label: 'NFT', icon: Sparkles, count: stats.byCategory.nft },
    { id: 'gaming', label: 'Gaming', icon: Users, count: stats.byCategory.gaming },
    { id: 'dao', label: 'DAO', icon: Crown, count: stats.byCategory.dao }
  ];

  const handleCreateTemplate = (newTemplate: any) => {
    const template: Template = {
      id: Date.now().toString(),
      ...newTemplate,
      author: 'You',
      usageCount: 0,
      rating: 5.0,
      isFavorite: false,
      isPublic: false,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTemplates([...templates, template]);
  };

  const handleToggleFavorite = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const handleUseTemplate = async (template: Template) => {
    const workflow = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      triggerType: template.triggerType,
      actionType: template.actionType,
      sourceAddress: template.config.triggerConfig.contractAddress || '0x742d35Cc6635C0532925a3b8D42ff8D91f4d0bC0',
      actionParams: template.config.actionConfig,
      isActive: true,
      executionCount: 0,
      successRate: 100,
      createdAt: new Date()
    };
    onCreateWorkflow(workflow);
    // Atomic increment usageCount in backend
    const res = await fetch(`/api/templates/${template.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usageCount: 'increment' })
    });
    const updated = await res.json();
    setTemplates(prev => prev.map(t => t.id === template.id ? updated : t));
  };

  const handleModalSubmit = (template: any) => {
    if (editingTemplate) {
      onEditTemplate(editingTemplate.id, template);
      setEditingTemplate(null);
    } else {
      onCreateTemplate(template);
    }
    setShowCreateTemplateModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                My Templates
              </h1>
              <p className="text-slate-600 text-lg">
                Create and manage your personal workflow templates
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateTemplateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Template
            </motion.button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Templates', value: stats.total, icon: FileText, color: 'blue' },
              { label: 'Favorites', value: stats.favorites, icon: Star, color: 'yellow' },
              { label: 'Total Usage', value: templates.reduce((sum, t) => sum + (Number(t.usageCount) || 0), 0), icon: Eye, color: 'green' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isActive = filterCategory === category.id;
              
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterCategory(category.id as any)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-50 border border-slate-200/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {category.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              >
                <option value="created">Sort by Created</option>
                <option value="name">Sort by Name</option>
                <option value="usage">Sort by Usage</option>
                <option value="rating">Sort by Rating</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors bg-white/80 backdrop-blur-sm"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </button>

              {/* View Mode */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-l-xl transition-colors ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-r-xl transition-colors ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Templates */}
        {filteredAndSortedTemplates.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
              : "space-y-6"
            }
          >
            {filteredAndSortedTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TemplateCard
                  template={template}
                  viewMode={viewMode}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={() => { setEditingTemplate(template); setShowCreateTemplateModal(true); }}
                  onDelete={() => onDeleteTemplate(template.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-slate-200/50 shadow-lg max-w-md mx-auto">
              <FileText className="w-20 h-20 mx-auto mb-6 text-slate-400" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {searchTerm || filterCategory !== 'all' ? 'No templates found' : 'No templates yet'}
              </h3>
              <p className="text-slate-600 mb-8">
                {searchTerm || filterCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Create your first template to get started with reusable workflows'
                }
              </p>
              {(!searchTerm && filterCategory === 'all') && (
                <button
                  onClick={() => setShowCreateTemplateModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300"
                >
                  Create Your First Template
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Create Template Modal */}
        <CreateTemplateModal
          isOpen={showCreateTemplateModal}
          onClose={() => { setShowCreateTemplateModal(false); setEditingTemplate(null); }}
          onSubmit={handleModalSubmit}
          initialData={editingTemplate}
        />
      </div>
    </div>
  );
};

export default TemplatesPage;