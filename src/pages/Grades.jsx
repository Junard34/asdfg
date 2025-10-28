import { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import supabase from "../lib/supabase";
import StudentGradeRecord from '../pdfTemplates/StudentGradeRecord';
import { studentsAnalyzer } from '../lib/ai';

export default function Grades() {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchGrades();
    }
  }, [selectedSubject]);

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

  const fetchGrades = async () => {
    if (!selectedSubject) return;

    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('subject_id', selectedSubject);
    
    if (error) {
      console.error('Error fetching grades:', error);
    } else {
      const gradesMap = {};
      data.forEach(grade => {
        gradesMap[grade.student_id] = {
          id: grade.id,
          prelim: grade.prelim || '',
          midterm: grade.midterm || '',
          semifinal: grade.semifinal || '',
          final: grade.final || ''
        };
      });
      setGrades(gradesMap);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedSubject) {
      alert('Please select a subject first');
      return;
    }

    setLoading(true);

    for (const student of students) {
      const studentGrades = grades[student.id] || {};
      const gradeData = {
        student_id: student.id,
        subject_id: parseInt(selectedSubject),
        prelim: studentGrades.prelim ? parseFloat(studentGrades.prelim) : null,
        midterm: studentGrades.midterm ? parseFloat(studentGrades.midterm) : null,
        semifinal: studentGrades.semifinal ? parseFloat(studentGrades.semifinal) : null,
        final: studentGrades.final ? parseFloat(studentGrades.final) : null
      };

      if (studentGrades.id) {
        const { error } = await supabase
          .from('grades')
          .update(gradeData)
          .eq('id', studentGrades.id);
        
        if (error) console.error('Error updating grade:', error);
      } else {
        const { error } = await supabase
          .from('grades')
          .insert([gradeData]);
        
        if (error) console.error('Error inserting grade:', error);
      }
    }

    setLoading(false);
    alert('Grades saved successfully!');
    fetchGrades();
  };

  const calculateAverage = (studentId) => {
    const studentGrades = grades[studentId];
    if (!studentGrades) return '-';

    const gradeValues = [
      parseFloat(studentGrades.prelim) || 0,
      parseFloat(studentGrades.midterm) || 0,
      parseFloat(studentGrades.semifinal) || 0,
      parseFloat(studentGrades.final) || 0
    ].filter(g => g > 0);

    if (gradeValues.length === 0) return '-';
    const avg = gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length;
    return avg.toFixed(2);
  };

  const downloadPDF = async (selectedSubjectData, aiAnalysisData) => {
    try {
      const blob = await pdf(
        <StudentGradeRecord
          subject={selectedSubjectData}
          students={students}
          grades={grades}
          analysis={aiAnalysisData}
        />
      ).toBlob();

      const fileName = `Grade_Report_${selectedSubjectData?.subject_code}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const generateAnalysis = async () => {
    if (!selectedSubject || students.length === 0) {
      alert('Please select a subject with enrolled students');
      return;
    }

    setAnalyzing(true);

    try {
      // Get AI analysis
      const result = await studentsAnalyzer(parseInt(selectedSubject));
      
      if (result.success) {
        const selectedSubjectData = subjects.find(s => s.id === parseInt(selectedSubject));
        
        // Display analysis in UI
        const { analysis, passedStudents, failedStudents } = result.data;
        let analysisText = `AI Performance Analysis\n\n`;
        analysisText += `Subject: ${selectedSubjectData?.subject_code} - ${selectedSubjectData?.subject_name}\n`;
        analysisText += `Instructor: ${selectedSubjectData?.instructor}\n\n`;
        analysisText += `${analysis}\n\n`;
        analysisText += `Passed Students (${passedStudents.length}):\n`;
        passedStudents.forEach(name => {
          analysisText += `  ✓ ${name}\n`;
        });
        analysisText += `\nFailed Students (${failedStudents.length}):\n`;
        failedStudents.forEach(name => {
          analysisText += `  ✗ ${name}\n`;
        });
        
        setAnalysis(analysisText);

        // Generate and download PDF
        await downloadPDF(selectedSubjectData, result.data);

        alert('Analysis generated and PDF downloaded successfully!');
      } else {
        alert('Failed to generate analysis: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      alert('An error occurred while generating the analysis.');
    }

    setAnalyzing(false);
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
              <a href="/subjects" className="px-4 py-2 rounded-lg transition-all duration-300 text-gray-400 hover:text-cyan-300 hover:bg-gray-800/50">
                Subjects
              </a>
              <a href="/grades" className="px-4 py-2 rounded-lg transition-all duration-300 bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20">
                Grades
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 bg-clip-text text-transparent">
            Grades Management
          </h1>
          <p className="text-gray-400 mt-2">Manage student grades and generate AI-powered reports (Philippine Grading System: 1.0 - 5.0)</p>
        </div>

        {/* Subject Selection */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 mb-6 backdrop-blur-sm">
          <label className="block text-sm font-medium text-gray-400 mb-3">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="">-- Choose a subject --</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_code} - {subject.subject_name}
              </option>
            ))}
          </select>
        </div>

        {selectedSubject && (
          <>
            {/* Grades Table */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Student Number</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Prelim</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Midterm</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Semifinal</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Final</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-gray-300 font-medium">{student.student_number}</td>
                        <td className="px-6 py-4 text-gray-300">{student.first_name} {student.last_name}</td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={grades[student.id]?.prelim || ''}
                            onChange={(e) => handleGradeChange(student.id, 'prelim', e.target.value)}
                            className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="0"
                            min="1.0"
                            max="5.0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={grades[student.id]?.midterm || ''}
                            onChange={(e) => handleGradeChange(student.id, 'midterm', e.target.value)}
                            className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="0"
                            min="1.0"
                            max="5.0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={grades[student.id]?.semifinal || ''}
                            onChange={(e) => handleGradeChange(student.id, 'semifinal', e.target.value)}
                            className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="0"
                            min="1.0"
                            max="5.0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={grades[student.id]?.final || ''}
                            onChange={(e) => handleGradeChange(student.id, 'final', e.target.value)}
                            className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="0"
                            min="1.0"
                            max="5.0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-6 py-4 text-cyan-400 font-semibold">{calculateAverage(student.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={handleSaveGrades}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Grades'}
              </button>
              <button
                onClick={generateAnalysis}
                disabled={analyzing}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? 'Generating...' : 'Generate AI Analysis & Download PDF'}
              </button>
            </div>

            {/* Analysis Report */}
            {analysis && (
              <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Analysis Report</h2>
                <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {analysis}
                </pre>
              </div>
            )}
          </>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}