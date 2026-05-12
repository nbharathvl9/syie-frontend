"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Edit2, Trash2, Briefcase, MessageSquare, Github, Linkedin, Mail, Code2, Settings, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { postApi, authApi } from '@/lib/api';
import NotificationModal from '@/components/NotificationModal';
import ConfirmModal from '@/components/ConfirmModal';
import MarkdownContent from '@/components/MarkdownContent';
import { formatPostTime } from '@/lib/timeUtils';

export default function StudentProfile() {
  const { roll } = useParams();
  const [posts, setPosts] = useState([]);
  const [profileUser, setProfileUser] = useState({ name: "", roll: roll, socialLinks: {} });
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showSocialEdit, setShowSocialEdit] = useState(false);
  const [socialLinks, setSocialLinks] = useState({ github: '', linkedin: '', leetcode: '', codeforces: '', email: '', portfolio: '' });
  const { user } = useAuth();
  const { notification, showError, showSuccess, dismiss } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await postApi.getByStudent(roll);
        const postsData = res.data.posts || res.data;
        setPosts(Array.isArray(postsData) ? postsData : []);
        try {
          const userRes = await authApi.getUserByRoll(roll);
          if (userRes.data) {
            setProfileUser({ name: userRes.data.fullName, roll: userRes.data.rollNumber, socialLinks: userRes.data.socialLinks || {} });
            setSocialLinks(userRes.data.socialLinks || { github: '', linkedin: '', leetcode: '', codeforces: '', email: '', portfolio: '' });
          }
        } catch {
          if (postsData.length > 0) setProfileUser({ name: postsData[0].authorName, roll, socialLinks: {} });
        }
        if (user) setIsOwnProfile(user.rollNumber === roll);
      } catch (err) { console.error("Error loading profile:", err); }
    };
    fetchData();
  }, [roll, user]);

  const confirmDelete = async () => {
    try {
      await postApi.delete(deleteConfirmId);
      setPosts(posts.filter(p => p._id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch { showError('Error deleting post'); }
  };

  const startEdit = (post) => { setEditingPostId(post._id); setEditedContent(post.experience); };
  const cancelEdit = () => { setEditingPostId(null); setEditedContent(""); };

  const saveEdit = async (postId) => {
    try {
      await postApi.update(postId, { experience: editedContent });
      setPosts(posts.map(p => p._id === postId ? { ...p, experience: editedContent } : p));
      setEditingPostId(null); setEditedContent("");
    } catch (err) { showError(err.response?.data?.msg || 'Failed to edit post'); }
  };

  const saveSocialLinks = async () => {
    try {
      const res = await authApi.updateSocialLinks(socialLinks);
      const updatedLinks = res.data.socialLinks;
      setProfileUser({ ...profileUser, socialLinks: updatedLinks });
      setSocialLinks(updatedLinks);
      setShowSocialEdit(false);
      showSuccess('Social links updated successfully!');
    } catch (err) { showError(err.response?.data?.msg || 'Failed to update social links'); }
  };

  const interviewPosts = posts.filter(p => p.postType !== 'Discussion').length;
  const discussPosts = posts.filter(p => p.postType === 'Discussion').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="h-32 bg-gradient-to-r from-gray-900 to-black w-full"></div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-md">
            <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-3xl font-black text-gray-300">
              {profileUser.name?.[0] || "U"}
            </div>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-black tracking-tight uppercase">{profileUser.name || "Student"}</h1>
            <p className="text-sm font-mono text-gray-500 tracking-widest uppercase">{profileUser.roll}</p>
          </div>
          <div className="flex gap-6 text-center">
            <div><span className="block text-xl font-black">{interviewPosts}</span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Interviews</span></div>
            <div><span className="block text-xl font-black">{discussPosts}</span><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Discussions</span></div>
          </div>
        </div>

        {/* Social Links */}
        {(isOwnProfile || Object.values(profileUser.socialLinks || {}).some(link => link)) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Connect</h3>
              {isOwnProfile && (
                <button onClick={() => setShowSocialEdit(true)} className="text-xs text-gray-600 hover:text-black flex items-center gap-1 transition-colors">
                  <Settings size={14} /><span className="hidden sm:inline">Edit Links</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {profileUser.socialLinks?.github && <a href={profileUser.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"><Github size={16} />GitHub</a>}
              {profileUser.socialLinks?.linkedin && <a href={profileUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-medium text-blue-700 transition-colors"><Linkedin size={16} />LinkedIn</a>}
              {profileUser.socialLinks?.leetcode && <a href={profileUser.socialLinks.leetcode} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-xl text-sm font-medium text-orange-700 transition-colors"><Code2 size={16} />LeetCode</a>}
              {profileUser.socialLinks?.codeforces && <a href={profileUser.socialLinks.codeforces} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-medium text-red-700 transition-colors"><Code2 size={16} />Codeforces</a>}
              {profileUser.socialLinks?.email && <a href={`mailto:${profileUser.socialLinks.email}`} className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 rounded-xl text-sm font-medium text-green-700 transition-colors"><Mail size={16} />Email</a>}
              {profileUser.socialLinks?.portfolio && <a href={profileUser.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-xl text-sm font-medium text-purple-700 transition-colors"><Globe size={16} />Portfolio</a>}
            </div>
          </div>
        )}

        <h2 className="mt-10 mb-6 text-sm font-black text-gray-400 uppercase tracking-widest">Activity</h2>
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-black uppercase flex-1">{post.companyName}</h3>
                {post.postType === 'Discussion'
                  ? <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-wider"><MessageSquare size={12} />Discussion</span>
                  : <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-wider"><Briefcase size={12} />Interview</span>}
              </div>
              {isOwnProfile && (
                <div className="flex gap-3 mb-4">
                  <button onClick={() => startEdit(post)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"><Edit2 size={14} /><span className="hidden sm:inline">Edit</span></button>
                  <button onClick={() => setDeleteConfirmId(post._id)} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium transition-colors"><Trash2 size={14} /><span className="hidden sm:inline">Delete</span></button>
                </div>
              )}
              {editingPostId === post._id ? (
                <div className="mb-4">
                  <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none resize-none" rows="6" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => saveEdit(post._id)} className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800">SAVE</button>
                    <button onClick={cancelEdit} className="px-4 py-2 bg-gray-100 text-black rounded-lg text-xs font-bold hover:bg-gray-200">CANCEL</button>
                  </div>
                </div>
              ) : <MarkdownContent content={post.experience} className="mb-4" />}
              <span className="text-[10px] font-bold text-gray-400">{formatPostTime(post.createdAt)}</span>
            </div>
          ))}
          {posts.length === 0 && <p className="text-center text-gray-400 py-10">No activity yet.</p>}
        </div>
      </div>

      <ConfirmModal show={!!deleteConfirmId} title="Delete Post?" message="Are you sure you want to delete this post?"
        confirmLabel="Delete" danger onConfirm={confirmDelete} onCancel={() => setDeleteConfirmId(null)} />

      {/* Social Links Edit Modal */}
      {showSocialEdit && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowSocialEdit(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-slideUp max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black uppercase mb-4">Edit Social Links</h3>
            <div className="space-y-4">
              {[
                { key: 'github', icon: <Github size={14} />, label: 'GitHub Profile URL', placeholder: 'https://github.com/username' },
                { key: 'linkedin', icon: <Linkedin size={14} />, label: 'LinkedIn Profile URL', placeholder: 'https://linkedin.com/in/username' },
                { key: 'leetcode', icon: <Code2 size={14} />, label: 'LeetCode Profile URL', placeholder: 'https://leetcode.com/username' },
                { key: 'codeforces', icon: <Code2 size={14} />, label: 'Codeforces Profile URL', placeholder: 'https://codeforces.com/profile/username' },
                { key: 'email', icon: <Mail size={14} />, label: 'Email Address', placeholder: 'your.email@example.com', type: 'email' },
                { key: 'portfolio', icon: <Globe size={14} />, label: 'Portfolio Website URL', placeholder: 'https://yourportfolio.com' },
              ].map(({ key, icon, label, placeholder, type }) => (
                <div key={key}>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">{icon} {label}</label>
                  <input type={type || 'url'} value={socialLinks[key] || ''} onChange={(e) => setSocialLinks({ ...socialLinks, [key]: e.target.value })}
                    placeholder={placeholder} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSocialEdit(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all uppercase tracking-wide">Cancel</button>
              <button onClick={saveSocialLinks} className="flex-1 px-4 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all uppercase tracking-wide">Save</button>
            </div>
          </div>
        </div>
      )}

      <NotificationModal {...notification} onDismiss={dismiss} />
    </div>
  );
}