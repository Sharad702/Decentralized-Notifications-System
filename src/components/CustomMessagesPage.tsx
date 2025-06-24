import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit, Trash2, MessageSquare } from 'lucide-react';

interface CustomMessage {
  id: string;
  name: string;
  body: string;
}

const CustomMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<CustomMessage | null>(null);
  const [form, setForm] = useState({ name: '', body: '' });

  const openModal = (msg?: CustomMessage) => {
    if (msg) {
      setEditingMessage(msg);
      setForm({ name: msg.name, body: msg.body });
    } else {
      setEditingMessage(null);
      setForm({ name: '', body: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMessage(null);
    setForm({ name: '', body: '' });
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.body.trim()) {
      alert('Please fill in both fields.');
      return;
    }
    if (editingMessage) {
      setMessages(messages.map(m => m.id === editingMessage.id ? { ...editingMessage, ...form } : m));
    } else {
      setMessages([...messages, { id: Date.now().toString(), ...form }]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this message?')) {
      setMessages(messages.filter(m => m.id !== id));
    }
  };

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Custom Messages</h1>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-500 hover:to-purple-500"
        >
          <PlusCircle size={20} /> Add New Message
        </button>
      </div>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/80 rounded-2xl border border-dashed border-slate-300 shadow">
          <MessageSquare className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-xl font-medium text-slate-900 mb-1">No custom messages yet</h3>
          <p className="text-slate-500">Click "Add New Message" to create your first template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col justify-between hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-lg text-slate-800 truncate max-w-[180px]">{msg.name}</span>
                </div>
                <div className="text-slate-600 mt-2 whitespace-pre-line text-sm min-h-[60px]">{msg.body}</div>
              </div>
              <div className="flex gap-2 mt-6 justify-end">
                <button onClick={() => openModal(msg)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button>
                <button onClick={() => handleDelete(msg.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <h2 className="text-2xl font-bold mb-6 text-slate-900">{editingMessage ? 'Edit Message' : 'Add New Message'}</h2>
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2 text-slate-700">Name</label>
                <input
                  className="w-full border border-slate-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Message name"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2 text-slate-700">Message Body</label>
                <textarea
                  className="w-full border border-slate-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Type your message here..."
                />
              </div>
              <div className="flex justify-end gap-2 mt-8">
                <button onClick={closeModal} className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200">Cancel</button>
                <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomMessagesPage; 