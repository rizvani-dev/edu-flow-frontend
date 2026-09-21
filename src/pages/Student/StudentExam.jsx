import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaClock, FaCheckCircle, FaArrowRight, FaArrowLeft, FaStopwatch, FaRobot, FaExclamationTriangle, FaCheckSquare, FaChartBar, FaThList, FaLayerGroup } from 'react-icons/fa';
import "../../styles/glassSystem.css"; /* Keep existing glass system */
import "../../styles/designTokens.css";
import "./studentPanel.css";
import "./studentExam.css"; /* New CSS file for exam-specific styles */

const StudentExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await API.get(`/exams/${examId}`);
        const examData = res.data.exam;

        if (examData.completed_at) {
            toast("You have already completed this exam.", { icon: '✅' });
            navigate('/student/dashboard');
            return;
        }

        // Resilient parsing for questions
        if (typeof examData.questions === 'string') {
          try {
            examData.questions = JSON.parse(examData.questions);
          } catch (e) {
            console.error("Questions parse error", e);
          }
        }

        setExam(examData);
        setTimeLeft((examData.duration_minutes || 30) * 60);
      } catch (err) {
        toast.error("Failed to load exam details");
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, navigate]);

  const handleSubmit = useCallback(async () => {
    if (submitting || examFinished) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const res = await API.post(`/exams/${examId}/submit`, { answers: selectedAnswers });
      setFinalScore(res.data.score);
      setExamFinished(true);
      toast.success("Exam submitted successfully!");
    } catch (err) {
      toast.error("Submission failed. Please contact your teacher.");
    } finally {
      setSubmitting(false);
    }
  }, [examId, selectedAnswers, submitting, examFinished]);

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !examFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted, timeLeft, examFinished, handleSubmit]);

  const handleAnswerSelect = (optionIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
    
    // Auto-advance if not the last question
    if (currentIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 400); // 400ms delay for visual feedback
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) return <div className="loader-container"><div className="minimalist-spinner"></div></div>;

  // Resilient check for questions
  const questions = exam?.questions || [];
  if (questions.length === 0) {
    return (
      <div className="student-container flex items-center justify-center p-12" style={{ minHeight: '80vh' }}>
        <div className="exam-message-card">
          <div className="icon-large opacity-40"><FaExclamationTriangle /></div>
          <h2 className="title">No Questions Found</h2>
          <p className="subtitle">This exam record exists but contains no valid questions. Please notify your teacher to regenerate the content.</p>
          <button className="exam-btn exam-btn-primary exam-start-button" onClick={() => navigate('/student/dashboard')}>
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (examFinished) {
    return (
      <div className="student-container exam-message-screen">
        <div className="exam-message-card">
          <FaCheckCircle className="icon-large text-green-500" />
          <h2 className="title text-indigo-900">Submitted!</h2>
          <p className="subtitle">Your responses have been recorded and graded by the AI Engine.</p>
          <div className="score-display">
            <span className="score-label">AI-Calculated Score</span>
            <div className="score-value">{finalScore}%</div>
          </div>
          <button className="exam-btn exam-btn-primary exam-start-button" onClick={() => navigate('/student/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="student-container exam-start-screen">
        <div className="w-full">
          <button className="exam-btn exam-btn-secondary mb-8" onClick={() => navigate('/student/dashboard')}><FaArrowLeft /> Back to Dashboard</button>
          <div className="exam-start-card">
            <div className="bg-icon"><FaLayerGroup /></div>
            <div className="exam-start-header">
              <div>
                <h1 className="exam-start-title">{exam?.title}</h1>
                <p className="exam-start-subtitle">{exam?.subject} • {exam?.difficulty} Difficulty</p>
              </div>
              <div className="glass-chip exam-start-ai-chip"><FaRobot className="mr-2" /> AI Assessment</div>
            </div>
            
            <div className="exam-start-stats-grid">
              <div className="exam-start-stat-card">
                <FaClock className="icon text-indigo-500" />
                <p className="label">Duration</p>
                <p className="value">{exam?.duration_minutes} Mins</p>
              </div>
              <div className="exam-start-stat-card">
                <FaChartBar className="icon text-indigo-500" />
                <p className="label">Total Marks</p>
                <p className="value">{exam?.marks} Pts</p>
              </div>
              <div className="exam-start-stat-card">
                <FaThList className="icon text-indigo-500" />
                <p className="label">Questions</p>
                <p className="value">{questions.length} Items</p>
              </div>
            </div>

            <div className="exam-start-warning-banner">
              <FaExclamationTriangle className="icon" />
              <p>Once you start, the timer cannot be paused. Ensure you have a stable connection. The exam will auto-submit if time expires.</p>
            </div>

            <button className="exam-btn exam-btn-primary exam-start-button" onClick={() => setIsStarted(true)}>Start AI Assessment</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progressPercentage = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="student-container">
      <div className="student-exam-container">
        {/* Sticky Header with Timer */}
        <div className="exam-header-sticky">
          <div className="flex-center-gap">
            <h2 className="exam-header-title">{exam?.title}</h2>
            <div className="glass-chip exam-header-progress-chip">
              Q {currentIdx + 1} of {questions.length}
            </div>
          </div>
          <div className={`exam-timer ${timeLeft < 60 ? 'warning' : ''}`}>
            <FaStopwatch /> {formatTime(timeLeft)}
          </div>
          <button className="exam-btn exam-btn-danger exam-btn-small" onClick={() => { if(window.confirm("Finish and submit now?")) handleSubmit(); }}>Submit Exam</button>
        </div>

        {/* Progress bar */}
        <div className="exam-progress-bar">
          <div className="exam-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>

        {/* Question Area */}
        <div className="question-area">
          <h3 className="question-text">
            <span className="question-number-chip">Q{currentIdx + 1}</span>
            {currentQuestion?.question}
          </h3>

          <div className="options-grid">
            {Array.isArray(currentQuestion?.options) ? currentQuestion.options.map((option, i) => (
              <div 
                key={i} 
                onClick={() => handleAnswerSelect(i)}
                className={`option-item ${selectedAnswers[currentIdx] === i ? 'selected' : 'default'}`}
              >
                <div className={`option-indicator ${selectedAnswers[currentIdx] === i ? 'selected' : 'default'}`}>
                    {String.fromCharCode(65 + i)}
                </div>
                <span className={`option-text ${selectedAnswers[currentIdx] === i ? 'selected' : 'default'}`}>{option}</span>
                {selectedAnswers[currentIdx] === i && <FaCheckCircle className="selected-check-icon" />}
              </div>
            )) : (
              <div className="option-unavailable">
                <FaExclamationTriangle className="icon" />
                <p>Option data for this question is unavailable.</p>
              </div>
            )}
          </div>

          {/* Question Navigator */}
          <div className="question-navigator">
            {questions.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`question-nav-item ${currentIdx === idx ? 'current' : selectedAnswers[idx] !== undefined ? 'answered' : 'default'}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>

          <div className="exam-navigation-footer">
            <button className="exam-btn exam-btn-secondary" disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)}><FaArrowLeft /> Previous</button>
            
            {currentIdx === questions.length - 1 ? (
              <button className="exam-btn exam-btn-success" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Final Submit'}
              </button>
            ) : (
              <button className="exam-btn exam-btn-primary" onClick={() => setCurrentIdx(prev => prev + 1)}>Next <FaArrowRight /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExam;