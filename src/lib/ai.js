import supabase from './supabase';

const GEMINI_API_KEY = 'AIzaSyC7joAHqkUUKDSyF7GsdFRngbw2kEBmz5A';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Analyze students' performance for a specific subject using Gemini AI
 * @param {number} subjectId - The subject ID to analyze
 * @returns {Promise<Object>} Analysis result with passed/failed students
 */
export async function studentsAnalyzer(subjectId) {
  try {
    // Fetch subject details
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();

    if (subjectError) throw subjectError;

    // Fetch grades with student information
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select(`
        *,
        students (
          id,
          student_number,
          first_name,
          last_name,
          course,
          year_level
        )
      `)
      .eq('subject_id', subjectId);

    if (gradesError) throw gradesError;

    // Prepare data for Gemini
    const studentsData = grades.map(grade => {
      const student = grade.students;
      const average = calculateAverage(grade);
      
      return {
        name: `${student.first_name} ${student.last_name}`,
        student_number: student.student_number,
        course: student.course,
        year_level: student.year_level,
        grades: {
          prelim: grade.prelim || 0,
          midterm: grade.midterm || 0,
          semifinal: grade.semifinal || 0,
          final: grade.final || 0
        },
        average: average
      };
    });

    // Create prompt for Gemini
    const prompt = `Analyze the following student performance data for ${subject.subject_code} - ${subject.subject_name} taught by ${subject.instructor}.

Student Data:
${JSON.stringify(studentsData, null, 2)}

Please provide:
1. A comprehensive analysis of the overall class performance, trends, and patterns
2. Identify students who passed (average <= 3.0 using Philippine Grading System)
3. Identify students who failed (average > 3.0)

Return your response in this exact JSON format:
{
  "analysis": "Your detailed analysis here...",
  "passedStudents": ["Student Name 1", "Student Name 2"],
  "failedStudents": ["Student Name 3"]
}

Important: Return ONLY valid JSON, no additional text or markdown formatting.`;

    // Call Gemini API
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Extract text from Gemini response
    const generatedText = result.candidates[0].content.parts[0].text;
    
    // Parse JSON from response (remove markdown code blocks if present)
    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    
    const analysisResult = JSON.parse(cleanedText);

    return {
      success: true,
      data: analysisResult,
      subject: {
        code: subject.subject_code,
        name: subject.subject_name,
        instructor: subject.instructor
      }
    };

  } catch (error) {
    console.error('Error in studentsAnalyzer:', error);
    return {
      success: false,
      error: error.message,
      data: {
        analysis: "Failed to generate analysis. Please try again.",
        passedStudents: [],
        failedStudents: []
      }
    };
  }
}

/**
 * Calculate average grade for a student
 * @param {Object} grade - Grade object with prelim, midterm, semifinal, final
 * @returns {number} Average grade
 */
function calculateAverage(grade) {
  const gradeValues = [
    parseFloat(grade.prelim) || 0,
    parseFloat(grade.midterm) || 0,
    parseFloat(grade.semifinal) || 0,
    parseFloat(grade.final) || 0
  ].filter(g => g > 0);

  if (gradeValues.length === 0) return 0;
  const avg = gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length;
  return parseFloat(avg.toFixed(2));
}