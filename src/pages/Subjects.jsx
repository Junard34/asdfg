import { useState, useEffect } from 'react';
import supabase from "../lib/supabase";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    instructor: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('subject_code');
    
    if (error) {
      console.error('Error fetching subjects:', error);
    } else {
      setSubjects(data || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingSubject) {
      const { error } = await supabase
        .from('subjects')
        .update(formData)
        .eq('id', editingSubject.id);
      
      if (error) {
        console.error('Error updating subject:', error);
      } else {
        fetchSubjects();
        closeModal();
      }
    } else {
      const { error } = await supabase
        .from('subjects')
        .insert([formData]);
      
      if (error) {
        console.error('Error adding subject:', error);
      } else {
        fetchSubjects();
        closeModal();
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting subject:', error);
      } else {
        fetchSubjects();
      }
    }
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      subject_code: '',
      subject_name: '',
      instructor: ''
    });
    setShowModal(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      instructor: subject.instructor
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setFormData({
      subject_code: '',
      subject_name: '',
      instructor: ''
    });
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg shadow-lg shadow-cyan-500/50"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                IT Dashboard
              </span>
            </div>
            <div className="flex space-x-1">
              <a href="/" className="px-4 py-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50">
                Home
              </a>
              <a href="/students" className="px-4 py-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50">
                Students
              </a>
              <a href="/subjects" className="px-4 py-2 rounded-lg transition-all duration-300 bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20">
                Subjects
              </a>
              <a href="/grades" className="px-4 py-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50">
                Grades
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 bg-clip-text text-transparent">
              Subjects
            </h1>
            <p className="text-gray-400 mt-2">Manage course subjects and instructors</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50"
          >
            Add Subject
          </button>
        </div>

        {/* Table */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Subject Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Subject Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Instructor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-gray-300 font-medium">{subject.subject_code}</td>
                    <td className="px-6 py-4 text-gray-300">{subject.subject_name}</td>
                    <td className="px-6 py-4 text-gray-300">{subject.instructor}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(subject)}
                          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all duration-300 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject Code</label>
                <input
                  type="text"
                  value={formData.subject_code}
                  onChange={(e) => setFormData({...formData, subject_code: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject Name</label>
                <input
                  type="text"
                  value={formData.subject_name}
                  onChange={(e) => setFormData({...formData, subject_name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300"
                >
                  {editingSubject ? 'Update' : 'Add'} Subject
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}