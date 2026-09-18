'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card, Badge, Button } from '@/components/ui';
import {
  aiService,
  AIServiceStatus,
  AgentChatResult,
  MeetingNotesResult,
} from '@/services/aiService';
import {
  Bot,
  Sparkles,
  Send,
  User,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  Target,
  RefreshCw,
  Zap,
  Check,
  HelpCircle,
  Info,
  ChevronRight,
  ClipboardList,
  Copy,
  RotateCcw,
  ArrowDown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  data?: any;
  suggestedActions?: string[];
  proposedAction?: {
    action: string;
    requiresConfirmation: boolean;
    proposedData: any;
    summary: string;
  } | null;
  actionConfirmed?: boolean;
}

export default function AIAssistantView() {
  const {
    customers,
    leads,
    role,
    userProfile,
    selectedAiEntity,
    setSelectedAiEntity,
    showToast,
    refreshStats,
  } = useDashboard();

  // Tab: 'chat' | 'meeting-notes'
  const [activeTab, setActiveTab] = useState<'chat' | 'meeting-notes'>('chat');

  // AI Service Status
  const [aiStatus, setAiStatus] = useState<AIServiceStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Selected Entity Context
  const [contextType, setContextType] = useState<'none' | 'customer' | 'lead'>('none');
  const [contextId, setContextId] = useState<string>('');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Meeting Notes State
  const [rawNotes, setRawNotes] = useState('');
  const [isAnalyzingNotes, setIsAnalyzingNotes] = useState(false);
  const [meetingResult, setMeetingResult] = useState<MeetingNotesResult | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [isSavingMeetingAction, setIsSavingMeetingAction] = useState(false);
  const [meetingActionSaved, setMeetingActionSaved] = useState(false);

  // Synchronize preselected context from DashboardContext
  useEffect(() => {
    if (selectedAiEntity) {
      setContextType(selectedAiEntity.type);
      setContextId(selectedAiEntity.id);
    }
  }, [selectedAiEntity]);

  // Check Backend AI Status on Mount
  useEffect(() => {
    const checkStatus = async () => {
      setIsCheckingStatus(true);
      try {
        const st = await aiService.getStatus();
        setAiStatus(st);
      } catch {
        setAiStatus({
          success: false,
          ready: false,
          model: 'gemini-2.0-flash',
          message: 'Unable to connect to AI backend service.',
        });
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, []);

  // Initialize Welcome Message
  useEffect(() => {
    if (messages.length === 0) {
      const welcome: ChatMessage = {
        id: 'msg_welcome',
        sender: 'assistant',
        text: `Hello ${userProfile.name.split(' ')[0]}! I am your heptley AI Sales Agent powered by Gemini.\n\nI can analyze accounts, find overdue follow-ups, evaluate pipeline leads, draft tailored client messages, and transform meeting notes into confirmed CRM actions. What would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'Draft WhatsApp message for new customer',
          'Show my overdue follow-ups',
          'Who are my active customers?',
          'Draft a check-in message',
          'Summarize my top lead',
        ],
      };
      setMessages([welcome]);
    }
  }, [userProfile.name, messages.length]);

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 80);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Auto-scroll chat container to bottom and focus input when messages update
  useEffect(() => {
    scrollToBottom('smooth');
    if (!isSending) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [messages.length, isSending]);

  const handleResetChat = () => {
    const welcome: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      sender: 'assistant',
      text: `Hello ${userProfile.name.split(' ')[0]}! I am your heptley AI Sales Agent powered by Gemini.\n\nI can analyze accounts, find overdue follow-ups, evaluate pipeline leads, draft tailored client messages, and transform meeting notes into confirmed CRM actions. What would you like to explore?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Show my overdue follow-ups',
        'Who are my active customers?',
        'Draft a check-in message',
        'Summarize my top lead',
      ],
    };
    setMessages([welcome]);
    showToast('Conversation reset', 'info');
  };

  // Handler: Send Message to Agent
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isSending) return;

    // Smart confirmation intent: if user typed or clicked 'confirm follow-up', execute pending proposal
    const lowerQ = query.toLowerCase();
    if (lowerQ.includes('confirm follow-up') || lowerQ === 'confirm' || lowerQ === 'yes, confirm') {
      const pendingMsg = [...messages].reverse().find((m) => m.proposedAction && !m.actionConfirmed);
      if (pendingMsg && pendingMsg.proposedAction) {
        await handleConfirmAction(
          pendingMsg.id,
          pendingMsg.proposedAction.action,
          pendingMsg.proposedAction.proposedData
        );
        if (!textToSend) setInputMessage('');
        return;
      }
    }

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsSending(true);
    setChatError(null);

    // Context payload: only attach if user explicitly selected a customer or lead context
    const contextPayload: { customerId?: string; leadId?: string } = {};
    if (contextType === 'customer' && contextId) {
      contextPayload.customerId = contextId;
    } else if (contextType === 'lead' && contextId) {
      contextPayload.leadId = contextId;
    }

    try {
      const res: AgentChatResult = await aiService.chatAgent(query, contextPayload);

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: res.data,
        suggestedActions: res.suggestedActions,
        proposedAction: res.proposedAction,
        actionConfirmed: false,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Error: ${err.message || 'The AI service encountered an issue processing your request.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setChatError(err.message || 'Request failed');
    } finally {
      setIsSending(false);
    }
  };

  // Handler: Confirm Proposed Action
  const handleConfirmAction = async (msgId: string, action: string, proposedData: any) => {
    try {
      const res = await aiService.confirmAction(action, proposedData);
      showToast(res.message || 'Action executed and saved to CRM!', 'success');
      refreshStats();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, actionConfirmed: true } : msg
        )
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm action', 'error');
    }
  };

  // Handler: Analyze Meeting Notes
  const handleAnalyzeMeetingNotes = async () => {
    if (!rawNotes.trim() || isAnalyzingNotes) return;
    setIsAnalyzingNotes(true);
    setNotesError(null);
    setMeetingActionSaved(false);

    try {
      const res = await aiService.analyzeMeetingNotes(rawNotes);
      setMeetingResult(res);
    } catch (err: any) {
      setNotesError(err.message || 'Failed to analyze meeting notes.');
    } finally {
      setIsAnalyzingNotes(false);
    }
  };

  // Handler: Save Meeting Follow-up to CRM
  const handleSaveMeetingFollowUp = async () => {
    if (!meetingResult?.suggestedFollowUp) return;
    setIsSavingMeetingAction(true);

    try {
      const targetDate = new Date();
      targetDate.setDate(
        targetDate.getDate() + (meetingResult.suggestedFollowUp.recommendedDaysFromNow || 2)
      );
      const dateStr = targetDate.toISOString().split('T')[0];

      // Use context or first available customer/lead
      const entityId = contextId || customers[0]?.customerId || customers[0]?.id || 'GENERAL';
      const entityName =
        contextType === 'customer'
          ? customers.find((c) => c.customerId === contextId || c.id === contextId)?.name || 'Client'
          : contextType === 'lead'
          ? leads.find((l) => l.leadId === contextId || l.id === contextId)?.name || 'Lead'
          : 'General Account';

      const proposedData = {
        title: meetingResult.suggestedFollowUp.title || 'Follow-up on Meeting Discussion',
        entityType: contextType === 'lead' ? 'lead' : 'customer',
        entityId: entityId,
        entityName: entityName,
        date: dateStr,
        time: '11:00',
        type: meetingResult.suggestedFollowUp.type || 'Call',
        priority: 'High',
        note: `Agenda: ${meetingResult.suggestedFollowUp.agenda}. Requirements: ${meetingResult.requirements.join(
          ', '
        )}`,
      };

      await aiService.confirmAction('proposeFollowUp', proposedData);
      setMeetingActionSaved(true);
      showToast('Meeting follow-up scheduled in CRM!', 'success');
      refreshStats();
    } catch (err: any) {
      showToast(err.message || 'Failed to save meeting follow-up', 'error');
    } finally {
      setIsSavingMeetingAction(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              AI Sales Assistant
            </h2>

            {aiStatus?.ready ? (
              <Badge variant="active">Gemini 2.0 Live</Badge>
            ) : isCheckingStatus ? (
              <Badge variant="neutral">Checking...</Badge>
            ) : (
              <Badge variant="warning">Config Required</Badge>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Autonomous CRM intelligence, customer insights, and write-action proposals mediated by safe tool boundaries.
          </p>
        </div>

        {/* Tab switcher: Live Agent Chat vs Meeting Notes Analyzer */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-surface-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'chat' ? 'var(--brand-accent)' : 'transparent',
              color: activeTab === 'chat' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Bot size={15} />
            <span>Sales Agent Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('meeting-notes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'meeting-notes' ? 'var(--brand-accent)' : 'transparent',
              color: activeTab === 'meeting-notes' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <ClipboardList size={15} />
            <span>Meeting Notes to Action</span>
          </button>
        </div>
      </div>

      {/* Backend Status Warning Alert if not ready */}
      {aiStatus && !aiStatus.ready && (
        <Card
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Gemini API Key Configuration Needed
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0', lineHeight: 1.45 }}>
                {aiStatus.message} To activate real Google Gemini generation, set <code>GEMINI_API_KEY=your_key</code> in <code>backend/.env</code>. The CRM is running safely with real tool boundaries and database guards.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Entity Context Bar */}
      <div
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid var(--border-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Working Context:
            </span>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => {
                  setContextType('none');
                  setContextId('');
                  setSelectedAiEntity(null);
                }}
                className={`btn btn-sm ${contextType === 'none' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                Entire CRM
              </button>

              <button
                onClick={() => {
                  setContextType('customer');
                  setContextId(customers[0]?.customerId || customers[0]?.id || '');
                }}
                className={`btn btn-sm ${contextType === 'customer' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                Customer
              </button>

              <button
                onClick={() => {
                  setContextType('lead');
                  setContextId(leads[0]?.leadId || leads[0]?.id || '');
                }}
                className={`btn btn-sm ${contextType === 'lead' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                Lead
              </button>
            </div>

            {contextType === 'customer' && (
              <select
                className="input-field"
                value={contextId}
                onChange={(e) => setContextId(e.target.value)}
                style={{ height: '32px', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-md)' }}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.customerId || c.id}>
                    {c.name} ({c.company}) · {c.customerId}
                  </option>
                ))}
              </select>
            )}

            {contextType === 'lead' && (
              <select
                className="input-field"
                value={contextId}
                onChange={(e) => setContextId(e.target.value)}
                style={{ height: '32px', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-md)' }}
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.leadId || l.id}>
                    {l.name} ({l.company}) · {l.leadId} [{l.status}]
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Role scope: <strong style={{ color: 'var(--text-primary)' }}>{role === 'sales' ? `Your Accounts (${userProfile.memberId || 'Sales'})` : 'Organization Wide (Admin)'}</strong>
          </div>
        </div>

      {/* VIEW 1: SALES AGENT CHAT */}
      {activeTab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Main Chat Container */}
          <div
            style={{
              padding: 0,
              height: 'calc(100vh - 235px)',
              minHeight: '380px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1.5px solid var(--border-strong)',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Chat Top Bar */}
            <div
              style={{
                padding: '0.65rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span>Active Conversation ({messages.length} messages)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw size={13} />}
                onClick={handleResetChat}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                title="Start a new conversation"
              >
                Reset Chat
              </Button>
            </div>

            {/* Messages Area */}
            <div
              ref={chatContainerRef}
              onScroll={handleChatScroll}
              style={{
                flex: '1 1 0%',
                minHeight: 0,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: 'var(--bg-surface-subtle)',
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  {/* Sender Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.35rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {msg.sender === 'assistant' ? (
                      <>
                        <Sparkles size={13} style={{ color: 'var(--brand-accent)' }} />
                        <strong style={{ color: 'var(--text-primary)' }}>heptley AI Sales Agent</strong>
                      </>
                    ) : (
                      <>
                        <strong style={{ color: 'var(--text-primary)' }}>{userProfile.name}</strong>
                        <User size={13} />
                      </>
                    )}
                    <span>· {msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '0.85rem 1.15rem',
                      borderRadius:
                        msg.sender === 'user'
                          ? 'var(--radius-lg) var(--radius-lg) 2px var(--radius-lg)'
                          : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 2px',
                      backgroundColor: msg.sender === 'user' ? 'var(--brand-accent)' : 'var(--bg-surface)',
                      color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                      boxShadow: 'var(--shadow-sm)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.875rem',
                      lineHeight: 1.55,
                    }}
                  >
                    {msg.text}

                    {/* Render drafted message preview if available */}
                    {Boolean(msg.data?.body || msg.data?.content || (msg.data?.channel && msg.data?.message)) && (() => {
                      const draftBody = (msg.data?.body || msg.data?.content || msg.data?.message) as string;
                      const channelName = msg.data?.channel || (msg.data?.subject ? 'Email' : 'Message');
                      return (
                        <div
                          style={{
                            marginTop: '0.85rem',
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface-subtle)',
                            border: '1px solid var(--border-default)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: 'var(--brand-accent)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              }}
                            >
                              {channelName} Draft
                            </span>
                          </div>
                          {msg.data.subject && (
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Subject: </span>
                              {msg.data.subject}
                            </div>
                          )}
                          <div
                            style={{
                              padding: '0.75rem',
                              backgroundColor: 'var(--bg-surface)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              whiteSpace: 'pre-wrap',
                              fontSize: '0.8125rem',
                              lineHeight: 1.5,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {draftBody}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Copy size={13} />}
                              onClick={() => {
                                const text = msg.data.subject
                                  ? `Subject: ${msg.data.subject}\n\n${draftBody}`
                                  : draftBody;
                                navigator.clipboard.writeText(text);
                                showToast(`${channelName} draft copied to clipboard!`, 'info');
                              }}
                            >
                              {msg.data.subject ? 'Copy Email' : 'Copy Message Draft'}
                            </Button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Render proposed write-action card if required */}
                    {msg.proposedAction && (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          border: '1px solid var(--brand-accent)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                          <Calendar size={15} style={{ color: 'var(--brand-accent)' }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-accent)', textTransform: 'uppercase' }}>
                            Proposed CRM Action: {msg.proposedAction.action}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.825rem', margin: '0 0 0.5rem', fontWeight: 500 }}>
                          {msg.proposedAction.summary}
                        </p>

                        {msg.actionConfirmed ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>
                            <CheckCircle2 size={14} />
                            <span>Confirmed & Written to CRM Database</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<Check size={14} />}
                              onClick={() =>
                                handleConfirmAction(
                                  msg.id,
                                  msg.proposedAction!.action,
                                  msg.proposedAction!.proposedData
                                )
                              }
                            >
                              Confirm & Save to CRM
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setMessages((prev) =>
                                  prev.map((m) =>
                                    m.id === msg.id ? { ...m, proposedAction: null } : m
                                  )
                                );
                              }}
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Suggested Quick Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(act)}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '9999px',
                            border: '1px solid var(--border-default)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--brand-accent)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          <Zap size={11} />
                          <span>{act}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--brand-accent)' }} />
                  <span>Agent analyzing CRM data and querying Gemini...</span>
                </div>
              )}
            </div>

            {/* Floating Jump to Latest Button */}
            {showScrollBottom && (
              <button
                type="button"
                onClick={() => scrollToBottom('smooth')}
                style={{
                  position: 'absolute',
                  bottom: '125px',
                  right: '24px',
                  backgroundColor: 'var(--brand-accent)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
              >
                <ArrowDown size={13} />
                <span>Jump to Latest</span>
              </button>
            )}

            {/* Quick Action Suggestion Chips Bar */}
            <div
              style={{
                padding: '0.45rem 1rem',
                backgroundColor: 'var(--bg-surface)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '0.45rem',
                overflowX: 'auto',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => handleSendMessage('Show all my overdue follow-ups')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', gap: '0.3rem' }}
              >
                <Clock size={13} style={{ color: '#EF4444' }} />
                <span>Overdue Follow-ups</span>
              </button>

              <button
                onClick={() => {
                  const targetCust = customers.find((c) => c.customerId === contextId || c.id === contextId) || customers[0];
                  if (targetCust) {
                    setContextType('customer');
                    setContextId(targetCust.customerId || targetCust.id);
                    handleSendMessage(`Summarize customer ${targetCust.name} (${targetCust.customerId})`);
                  } else {
                    handleSendMessage('Summarize my customer accounts');
                  }
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', gap: '0.3rem' }}
              >
                <Building size={13} style={{ color: 'var(--brand-accent)' }} />
                <span>Summarize Customer</span>
              </button>

              <button
                onClick={() => {
                  const targetCust = customers.find((c) => c.customerId === contextId || c.id === contextId) || customers[0];
                  if (targetCust) {
                    setContextType('customer');
                    setContextId(targetCust.customerId || targetCust.id);
                    handleSendMessage(`Draft a follow-up email about contract status for ${targetCust.name} (${targetCust.customerId})`);
                  } else {
                    handleSendMessage('Draft a follow-up email about contract status');
                  }
                }}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', gap: '0.3rem' }}
              >
                <FileText size={13} style={{ color: '#10B981' }} />
                <span>Draft Email</span>
              </button>

              <button
                onClick={() => handleSendMessage('What are my high priority tasks today?')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', gap: '0.3rem' }}
              >
                <Zap size={13} style={{ color: '#F59E0B' }} />
                <span>Today's Priorities</span>
              </button>
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                padding: '0.65rem 1rem',
                backgroundColor: 'var(--bg-surface)',
                borderTop: '1.5px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  contextType === 'customer'
                    ? `Ask about this customer or send next command... (Press Enter)`
                    : contextType === 'lead'
                    ? `Ask about this lead or send next command... (Press Enter)`
                    : `Type your message or ask a CRM question... (Press Enter)`
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isSending}
                style={{
                  flex: 1,
                  height: '44px',
                  padding: '0 1.15rem',
                  borderRadius: '9999px',
                  border: '1.5px solid var(--border-strong)',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                }}
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                isLoading={isSending}
                leftIcon={<Send size={15} />}
                style={{
                  borderRadius: '9999px',
                  padding: '0.65rem 1.4rem',
                  fontWeight: 800,
                }}
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 2: MEETING NOTES TO ACTION */}
      {activeTab === 'meeting-notes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
          {/* Raw Notes Input Card */}
          <Card
            title="Raw Meeting Notes / Call Transcript"
            subtitle="Paste notes or unstructured minutes to extract requirements and generate confirmed CRM actions"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                placeholder="Example: Had a 30-minute sync with Rohan from Apex Digital. They want a complete redesign of their enterprise portal with SSO and audit logs. Budget is around 5 to 6 Lakhs. Target delivery is mid November. He asked me to send a formal proposal by Thursday and schedule a follow-up demo next Monday."
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                rows={10}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  lineHeight: 1.55,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRawNotes(
                      'Met with Vikram and Ananya from Global Logistics Inc. They are expanding to 3 new branch offices. Need our Enterprise CRM package with customized workflow automation. Budget approved up to ₹7,50,000. Need project completion within 60 days. Requested a follow-up call on Friday at 3:00 PM to review contract clauses.'
                    )
                  }
                >
                  Load Sample Note
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Sparkles size={15} />}
                  isLoading={isAnalyzingNotes}
                  disabled={!rawNotes.trim()}
                  onClick={handleAnalyzeMeetingNotes}
                >
                  Extract Requirements & Next Steps
                </Button>
              </div>

              {notesError && (
                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: 'var(--color-error)',
                    fontSize: '0.825rem',
                  }}
                >
                  <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
                  {notesError}
                </div>
              )}
            </div>
          </Card>

          {/* Structured Intelligence Card */}
          <Card
            title="Structured Extraction & Proposed CRM Action"
            subtitle="Synthesized requirements, budget constraints, and actionable next steps"
          >
            {!meetingResult && !isAnalyzingNotes && (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ opacity: 0.4, margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem' }}>Paste notes on the left and click Extract to see structured intelligence.</p>
              </div>
            )}

            {isAnalyzingNotes && (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--brand-accent)', margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Extracting key points, budget, and commitments with Gemini...
                </p>
              </div>
            )}

            {meetingResult && !isAnalyzingNotes && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Requirements */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10B981' }}>
                    Identified Requirements
                  </span>
                  <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {meetingResult.requirements?.map((req, i) => (
                      <li key={i} style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Budget & Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Budget Indicated
                    </span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0 0' }}>
                      {meetingResult.budget || 'Not specified in notes'}
                    </p>
                  </div>

                  <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Delivery Timeline
                    </span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0 0' }}>
                      {meetingResult.timeline || 'Not specified in notes'}
                    </p>
                  </div>
                </div>

                {/* Important Considerations */}
                {meetingResult.importantPoints?.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F59E0B' }}>
                      Key Considerations & Client Commitments
                    </span>
                    <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {meetingResult.importantPoints.map((pt, i) => (
                        <li key={i} style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Action Callout */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-accent)' }}>
                      Proposed Follow-up Action
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {meetingResult.suggestedFollowUp?.title || meetingResult.nextAction}
                    </div>
                    {meetingResult.suggestedFollowUp?.agenda && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                        Agenda: {meetingResult.suggestedFollowUp.agenda}
                      </p>
                    )}
                  </div>

                  {meetingActionSaved ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.85rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} />
                      <span>Follow-up confirmed and recorded in CRM!</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Calendar size={14} />}
                      isLoading={isSavingMeetingAction}
                      onClick={handleSaveMeetingFollowUp}
                    >
                      Confirm & Schedule Follow-up in CRM
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
