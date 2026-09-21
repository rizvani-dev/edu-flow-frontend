export const AI_PROMPT_PRESETS = [
  {
    id: 'student-summary',
    label: 'Student Summary',
    prompt: 'Summarize the latest student performance, key risks, strengths, and next actions.',
  },
  {
    id: 'attendance',
    label: 'Attendance Insight',
    prompt: 'Review attendance trends and suggest practical interventions for improvement.',
  },
  {
    id: 'fees',
    label: 'Fee Follow-up',
    prompt: 'Draft a polite but clear fee reminder with urgency and parent-friendly wording.',
  },
  {
    id: 'simplify',
    label: 'Simplify Report',
    prompt: 'Simplify this school report into short, clear language for parents.',
  },
];

export const buildDashboardAiContext = ({ role, user, dashboard, extra = {} }) => ({
  role,
  user: user
    ? {
        id: user.id,
        name: user.name,
        school_id: user.school_id,
        school_name: user.school_name,
      }
    : null,
  dashboard,
  ...extra,
});
