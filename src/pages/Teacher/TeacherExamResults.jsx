import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaUser, FaChartBar, FaCalendarAlt, FaChevronLeft, FaRobot, FaDownload, FaUserGraduate, FaTrophy, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ProgressListChart } from '../../components/charts/LightweightCharts';
import "../../styles/glassSystem.css";
import "./teacherpanel.css";

const TeacherExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, resultsRes] = await Promise.all([
          API.get(`/exams/${examId}/details`),
          API.get(`/exams/${examId}/results`)
        ]);
        setExam(examRes.data.exam);
        setResults(resultsRes.data.results || []);
      } catch (err) {
        toast.error("Failed to load results");
        navigate('/teacher/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId, navigate]);

  const stats = {
    total: results.length,
    avg: results.length ? Math.round(results.reduce((a, c) => a + (c.score || 0), 0) / results.length) : 0,
    high: results.length ? Math.max(...results.map(r => r.score)) : 0,
    passed: results.filter(r => r.score >= 40).length
  };

  const chartData = results.map(r => ({
    name: r.student_name.split(' ')[0],
    score: r.score
  })).slice(0, 10);

  if (loading) return <div className="loader-container"><div className="minimalist-spinner"></div></div>;

  return (
    <div className="teacher-container">
      <div className="teacher-navbar">
        <div className="teacher-navbar-content">
          <div className="brand-block">
            <button className="btn-secondary small mr-4" onClick={() => navigate('/teacher/dashboard')}><FaChevronLeft /></button>
            <div className="brand-copy">
              <p className="eyebrow">Results & Analytics</p>
              <h1 className="teacher-title" style={{ fontSize: '24px' }}>{exam?.title}</h1>
            </div>
          </div>
          <div className="glass-chip"><FaRobot /> AI Evaluation</div>
        </div>
      </div>

      <div className="teacher-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 glass-card p-6">
                <ProgressListChart
                  title="Score Distribution"
                  subtitle="Top 10 submitted results."
                  data={chartData.map((entry) => ({ name: entry.name, value: entry.score }))}
                />
            </div>
            
            <div className="flex flex-col gap-4">
                <div className="glass-card p-6 border-l-4 border-indigo-500">
                    <p className="eyebrow text-xs">Total Submissions</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-indigo-900">{stats.total}</span>
                        <span className="text-sm text-gray-500 pb-1">Students</span>
                    </div>
                </div>
                <div className="glass-card p-6 border-l-4 border-green-500">
                    <p className="eyebrow text-xs">Class Average</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-green-600">{stats.avg}%</span>
                        <span className="text-sm text-gray-500 pb-1">Performance</span>
                    </div>
                </div>
                <div className="glass-card p-6 border-l-4 border-amber-500">
                    <p className="eyebrow text-xs">Pass Rate</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-amber-600">{stats.total ? Math.round((stats.passed/stats.total)*100) : 0}%</span>
                        <span className="text-sm text-gray-500 pb-1">{stats.passed} Passed</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="admin-card results-table-wrapper">
          <div className="overflow-x-auto">
            <table className="glass-table w-full">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Student</th>
                  <th>Date</th>
                  <th>Performance</th>
                  <th style={{ paddingRight: '24px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => (
                  <tr key={res.id}>
                    <td style={{ paddingLeft: '24px' }}>
                        <div className="flex items-center gap-3">
                            <div className="student-avatar-mini">
                                {res.student_image ? <img src={res.student_image} alt="" /> : <FaUserGraduate />}
                            </div>
                            <div>
                                <p className="font-bold text-indigo-900 m-0">{res.student_name}</p>
                                <small className="text-gray-400">ID: #{res.student_id}</small>
                            </div>
                        </div>
                    </td>
                    <td className="text-sm text-gray-500">{new Date(res.completed_at).toLocaleDateString()}</td>
                    <td>
                        <div className="flex items-center gap-2">
                            <span className={`font-bold ${res.score >= 70 ? 'text-green-600' : res.score >= 40 ? 'text-indigo-600' : 'text-red-500'}`}>
                                {res.score}%
                            </span>
                            <div className="w-16 bg-gray-100 h-1.5 rounded-full hidden md:block">
                                <div className={`h-full rounded-full ${res.score >= 70 ? 'bg-green-500' : res.score >= 40 ? 'bg-indigo-500' : 'bg-red-500'}`} style={{ width: `${res.score}%` }}></div>
                            </div>
                        </div>
                    </td>
                    <td style={{ paddingRight: '24px' }}>
                        {res.score >= 40 ? 
                            <span className="glass-chip bg-green-50 text-green-700 border-green-200"><FaCheckCircle className="mr-1" /> Pass</span> : 
                            <span className="glass-chip bg-red-50 text-red-700 border-red-200"><FaTimesCircle className="mr-1" /> Fail</span>
                        }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherExamResults;
