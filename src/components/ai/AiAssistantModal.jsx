import React, { useMemo, useState } from 'react';
import { FaCopy, FaFilePdf, FaMagic, FaPaperPlane, FaRobot, FaTimes, FaWaveSquare } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { AI_PROMPT_PRESETS } from '../../ai/aiPromptTemplates';
import { sendAiChatMessage, streamAiChatMessage } from '../../ai/aiService';
import { exportAssistantMessageAsPdf } from '../../utils/assistantExport';
import './aiPanels.css';

const createMessage = (role, text) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  text,
});

const buildRolePrompt = (context, text) => {
  const schoolName = context?.user?.school_name || context?.user?.schoolName || 'EduFlow';
  const role = context?.role || 'school user';
  const route = context?.route || 'dashboard';
  const profileName = context?.user?.name || 'current user';

  return [
    `School name: ${schoolName}`,
    `Current workflow: ${role} dashboard`,
    `Current route: ${route}`,
    `Profile in focus: ${profileName}`,
    'Return the answer in clean Markdown with: a short title, useful headings, concise paragraphs, and bullet points when needed.',
    'Keep the advice role-aware. Teacher workflows should stay teacher-focused, admin workflows should stay admin-focused, and student workflows should stay student-focused.',
    'If you generate a report or recommendation, mention the school name naturally and use only the provided context.',
    '',
    text,
  ].join('\n');
};

const renderStructuredText = (text) => {
  const lines = String(text || '').split('\n');
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`list-${key}`} className="ai-message-list-block">
        {listItems.map((item, index) => (
          <li key={`${key}-${index}`}>{item}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(index);
      return;
    }

    if (line.startsWith('- ') || /^\d+\.\s/.test(line)) {
      listItems.push(line.replace(/^-\s|^\d+\.\s/, ''));
      return;
    }

    flushList(index);

    if (line.startsWith('### ')) {
      elements.push(<h5 key={index}>{line.slice(4)}</h5>);
      return;
    }

    if (line.startsWith('## ')) {
      elements.push(<h4 key={index}>{line.slice(3)}</h4>);
      return;
    }

    if (line.startsWith('# ')) {
      elements.push(<h3 key={index}>{line.slice(2)}</h3>);
      return;
    }

    elements.push(<p key={index}>{line}</p>);
  });

  flushList('end');
  return elements;
};

const AiAssistantModal = ({ isOpen, onClose, context, embedded = false }) => {
  const [messages, setMessages] = useState(() => [
    createMessage('assistant', 'Ask for student insights, attendance summaries, fee reminders, or a simplified academic report.'),
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(true);

  const contextLabel = useMemo(() => {
    const role = context?.role?.replace('_', ' ') || 'dashboard';
    return `AI copiloting the ${role} workspace`;
  }, [context?.role]);

  const schoolName = context?.user?.school_name || 'EduFlow';

  if (!isOpen) return null;

  const pushAssistantPlaceholder = () => {
    const placeholder = createMessage('assistant', '');
    setMessages((prev) => [...prev, placeholder]);
    return placeholder.id;
  };

  const submitMessage = async (presetPrompt) => {
    const text = (presetPrompt || draft).trim();
    if (!text || sending) return;

    const compiledPrompt = buildRolePrompt(context, text);
    const userMessage = createMessage('user', text);
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setSending(true);

    try {
      if (streaming) {
        const assistantId = pushAssistantPlaceholder();
        await streamAiChatMessage({
          message: compiledPrompt,
          context,
          onToken: (token) => {
            setMessages((prev) =>
              prev.map((message) => (message.id === assistantId ? { ...message, text: `${message.text}${token}` } : message))
            );
          },
        });
      } else {
        const result = await sendAiChatMessage({ message: compiledPrompt, context });
        setMessages((prev) => [...prev, createMessage('assistant', result.text || result.message || 'No response received.')]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, createMessage('assistant', error.message || 'AI assistant is temporarily unavailable.')]);
    } finally {
      setSending(false);
    }
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
      toast.success('AI response copied');
    } catch {
      toast.error('Copy failed. Please try again.');
    }
  };

  const content = (
    <div className="ai-assistant-modal" onClick={(event) => event.stopPropagation()}>
        <div className="ai-assistant-header">
          <div>
            <p className="ai-panel-kicker">Edu Flow AI</p>
            <h3>Futuristic School Copilot</h3>
            <p className="ai-panel-subtitle">{contextLabel}</p>
          </div>

          <div className="ai-assistant-actions">
            <button
              type="button"
              className={`ai-toggle-btn ${streaming ? 'active' : ''}`}
              onClick={() => setStreaming((prev) => !prev)}
              title="Toggle streaming responses"
            >
              <FaWaveSquare /> Stream
            </button>
            <button type="button" className="ai-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="ai-preset-row">
          {AI_PROMPT_PRESETS.map((preset) => (
            <button key={preset.id} type="button" className="ai-preset-chip" onClick={() => submitMessage(preset.prompt)}>
              <FaMagic /> {preset.label}
            </button>
          ))}
        </div>

        <div className="ai-message-list">
          {messages.map((message) => (
            <div key={message.id} className={`ai-message-bubble ${message.role}`}>
              <div className="ai-message-icon">{message.role === 'assistant' ? <FaRobot /> : 'You'}</div>
              <div className="ai-message-copy">
                {message.text ? renderStructuredText(message.text) : <p>{sending && message.role === 'assistant' ? 'Thinking...' : ''}</p>}
                {message.role === 'assistant' && message.text ? (
                  <div className="ai-message-tools">
                    <button type="button" className="ai-message-tool" onClick={() => copyMessage(message.text)}>
                      <FaCopy /> Copy
                    </button>
                    <button
                      type="button"
                      className="ai-message-tool"
                      onClick={() =>
                        exportAssistantMessageAsPdf({
                          schoolName,
                          title: `${context?.role || 'school'} AI report`,
                          text: message.text,
                        })
                      }
                    >
                      <FaFilePdf /> Save PDF
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="ai-input-row">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask for summaries, insights, recommendations, or report simplification..."
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitMessage();
              }
            }}
          />
          <button type="button" className="ai-send-btn" disabled={sending} onClick={() => submitMessage()}>
            {sending ? 'Thinking...' : <><FaPaperPlane /> Send</>}
          </button>
        </div>
      </div>
  );

  if (embedded) {
    return <div className="ui-card">{content}</div>;
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: 0 }}>
      {content}
    </div>
  );
};

export default AiAssistantModal;
