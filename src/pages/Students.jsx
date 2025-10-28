import { useState, useEffect } from 'react';
import supabase from "../lib/supabase";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_number: '',
    first_name: '',
    last_name: '',
    course: '',
    year_level: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('student_number');
    
    if (error) {
      console.error('Error fetching students:', error);
    } else {
      setStudents(data || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingStudent) {
      const { error } = await supabase
        .from('students')
        .update(formData)
        .eq('id', editingStudent.id);
      
      if (error) {
        console.error('Error updating student:', error);
      } else {
        fetchStudents();
        closeModal();
      }
    } else {
      const { error } = await supabase
        .from('students')
        .insert([formData]);
      
      if (error) {
        console.error('Error adding student:', error);
      } else {
        fetchStudents();
        closeModal();
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting student:', error);
      } else {
        fetchStudents();
      }
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      student_number: '',
      first_name: '',
      last_name: '',
      course: '',
      year_level: ''
    });
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      student_number: student.student_number,
      first_name: student.first_name,
      last_name: student.last_name,
      course: student.course,
      year_level: student.year_level
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      student_number: '',
      first_name: '',
      last_name: '',
      course: '',
      year_level: ''
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
              <a href="/students" className="px-4 py-2 rounded-lg transition-all duration-300 bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20">
                Students
              </a>
              <a href="/subjects" className="px-4 py-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50">
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
              Students
            </h1>
            <p className="text-gray-400 mt-2">Manage student information</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50"
          >
            Add Student
          </button>
        </div>

        {/* Table */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Student Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">First Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Last Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Year Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{student.student_number}</td>
                    <td className="px-6 py-4 text-gray-300">{student.first_name}</td>
                    <td className="px-6 py-4 text-gray-300">{student.last_name}</td>
                    <td className="px-6 py-4 text-gray-300">{student.course}</td>
                    <td className="px-6 py-4 text-gray-300">{student.year_level}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all duration-300 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
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
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Student Number</label>
                <input
                  type="text"
                  value={formData.student_number}
                  onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Course</label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Year Level</label>
                <input
                  type="number"
                  value={formData.year_level}
                  onChange={(e) => setFormData({...formData, year_level: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  required
                  min="1"
                  max="4"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300"
                >
                  {editingStudent ? 'Update' : 'Add'} Student
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}