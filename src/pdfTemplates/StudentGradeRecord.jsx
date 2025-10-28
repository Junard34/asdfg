import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#06b6d4',
    paddingBottom: 15,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0891b2',
    textAlign: 'center',
    marginBottom: 5,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#164e63',
    marginTop: 10,
  },
  subjectSection: {
    marginTop: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#ecfeff',
    borderRadius: 5,
    borderLeft: 4,
    borderLeftColor: '#06b6d4',
  },
  subjectTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0e7490',
    marginBottom: 5,
  },
  subjectInfo: {
    fontSize: 10,
    color: '#164e63',
    marginBottom: 3,
  },
  tableContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0891b2',
    padding: 10,
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    padding: 10,
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    padding: 10,
    fontSize: 9,
    backgroundColor: '#f0fdfa',
  },
  col1: { width: '15%' },
  col2: { width: '25%' },
  col3: { width: '12%' },
  col4: { width: '12%' },
  col5: { width: '12%' },
  col6: { width: '12%' },
  col7: { width: '12%' },
  analysisSection: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
    border: 1,
    borderColor: '#cbd5e1',
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0e7490',
    marginBottom: 10,
  },
  analysisText: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: 8,
    textAlign: 'justify',
  },
  statisticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 15,
  },
  statBox: {
    width: '30%',
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    border: 1,
    borderColor: '#06b6d4',
  },
  statLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  studentsSection: {
    marginTop: 15,
  },
  studentsList: {
    marginTop: 10,
  },
  passedHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
    marginTop: 10,
  },
  failedHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
    marginTop: 15,
  },
  studentItem: {
    fontSize: 9,
    color: '#334155',
    marginBottom: 4,
    paddingLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  generatedDate: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 5,
  },
  remarkPass: {
    color: '#059669',
    fontWeight: 'bold',
  },
  remarkFail: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
});

const StudentGradeRecord = ({ subject, students, grades, analysis }) => {
  // Calculate average using Philippine Grading System
  const calculateAverage = (studentGrades) => {
    if (!studentGrades) return 5.0;

    const gradeValues = [
      parseFloat(studentGrades.prelim) || 0,
      parseFloat(studentGrades.midterm) || 0,
      parseFloat(studentGrades.semifinal) || 0,
      parseFloat(studentGrades.final) || 0,
    ].filter(g => g > 0);

    if (gradeValues.length === 0) return 5.0;
    const avg = gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length;
    return parseFloat(avg.toFixed(2));
  };

  // Get remark based on grade
  const getRemark = (average) => {
    if (average === 5.0 || average === 0) return 'No Grade';
    if (average <= 3.0) return 'PASSED';
    return 'FAILED';
  };

  // Calculate class statistics
  const allAverages = students.map(s => calculateAverage(grades[s.id])).filter(a => a > 0 && a < 5.0);
  const classAvg = allAverages.length > 0 
    ? (allAverages.reduce((a, b) => a + b, 0) / allAverages.length).toFixed(2) 
    : 'N/A';
  const highest = allAverages.length > 0 ? Math.min(...allAverages).toFixed(2) : 'N/A';
  const lowest = allAverages.length > 0 ? Math.max(...allAverages).toFixed(2) : 'N/A';
  const passedCount = students.filter(s => {
    const avg = calculateAverage(grades[s.id]);
    return avg > 0 && avg <= 3.0 && avg < 5.0;
  }).length;
  const failedCount = students.filter(s => {
    const avg = calculateAverage(grades[s.id]);
    return avg > 3.0 && avg < 5.0;
  }).length;

  const currentDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>IT DEPARTMENT GRADE MANAGEMENT SYSTEM</Text>
          <Text style={styles.documentTitle}>Student Grade Record Report</Text>
          <Text style={styles.generatedDate}>Generated: {currentDate}</Text>
        </View>

        {/* Subject Information */}
        <View style={styles.subjectSection}>
          <Text style={styles.subjectTitle}>
            {subject?.subject_code} - {subject?.subject_name}
          </Text>
          <Text style={styles.subjectInfo}>Instructor: {subject?.instructor}</Text>
          <Text style={styles.subjectInfo}>
            Total Students: {students.length} | Passed: {passedCount} | Failed: {failedCount}
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statisticsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Class Average</Text>
            <Text style={styles.statValue}>{classAvg}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Highest Grade</Text>
            <Text style={styles.statValue}>{highest}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lowest Grade</Text>
            <Text style={styles.statValue}>{lowest}</Text>
          </View>
        </View>

        {/* Grades Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Student #</Text>
            <Text style={styles.col2}>Name</Text>
            <Text style={styles.col3}>Prelim</Text>
            <Text style={styles.col4}>Midterm</Text>
            <Text style={styles.col5}>Semifinal</Text>
            <Text style={styles.col6}>Final</Text>
            <Text style={styles.col7}>Average</Text>
          </View>

          {students.map((student, index) => {
            const studentGrades = grades[student.id] || {};
            const average = calculateAverage(studentGrades);
            const remark = getRemark(average);
            const isAlt = index % 2 === 1;

            return (
              <View key={student.id} style={isAlt ? styles.tableRowAlt : styles.tableRow}>
                <Text style={styles.col1}>{student.student_number}</Text>
                <Text style={styles.col2}>
                  {student.first_name} {student.last_name}
                </Text>
                <Text style={styles.col3}>
                  {studentGrades.prelim || 'N/A'}
                </Text>
                <Text style={styles.col4}>
                  {studentGrades.midterm || 'N/A'}
                </Text>
                <Text style={styles.col5}>
                  {studentGrades.semifinal || 'N/A'}
                </Text>
                <Text style={styles.col6}>
                  {studentGrades.final || 'N/A'}
                </Text>
                <Text 
                  style={[
                    styles.col7,
                    remark === 'PASSED' ? styles.remarkPass : remark === 'FAILED' ? styles.remarkFail : {}
                  ]}
                >
                  {average === 5.0 ? 'N/A' : average}
                </Text>
              </View>
            );
          })}
        </View>

        {/* AI Analysis */}
        {analysis && (
          <View style={styles.analysisSection}>
            <Text style={styles.analysisTitle}>AI-Generated Performance Analysis</Text>
            <Text style={styles.analysisText}>{analysis.analysis}</Text>

            {analysis.passedStudents && analysis.passedStudents.length > 0 && (
              <View style={styles.studentsSection}>
                <Text style={styles.passedHeader}>
                  ✓ Passed Students ({analysis.passedStudents.length}):
                </Text>
                {analysis.passedStudents.map((name, idx) => (
                  <Text key={idx} style={styles.studentItem}>• {name}</Text>
                ))}
              </View>
            )}

            {analysis.failedStudents && analysis.failedStudents.length > 0 && (
              <View style={styles.studentsSection}>
                <Text style={styles.failedHeader}>
                  ✗ Failed Students ({analysis.failedStudents.length}):
                </Text>
                {analysis.failedStudents.map((name, idx) => (
                  <Text key={idx} style={styles.studentItem}>• {name}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Philippine Grading System: 1.0 (Excellent) - 5.0 (Failed) | Passing Grade: 3.0 and below
          </Text>
          <Text style={{ marginTop: 3 }}>
            This document is computer-generated and contains AI-assisted analysis.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default StudentGradeRecord;