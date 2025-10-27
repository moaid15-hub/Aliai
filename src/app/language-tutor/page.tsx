// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, BookOpen, Target, TrendingUp, MessageSquare, Settings, CheckCircle, AlertCircle, Star, BarChart3, Languages } from 'lucide-react';

export default function LanguageTutorPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('spanish');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    proficiencyLevel: 'Beginner',
    totalMessages: 0,
    vocabularyCount: new Set(),
    grammarAccuracy: 0,
    sessionCount: 0
  });
  const [learningGoals, setLearningGoals] = useState([
    { id: 1, text: 'Master basic greetings', completed: false, progress: 20 },
    { id: 2, text: 'Learn present tense verbs', completed: false, progress: 10 },
    { id: 3, text: 'Expand food vocabulary', completed: false, progress: 0 }
  ]);
  const [feedback, setFeedback] = useState(null);
  const [showLessonMode, setShowLessonMode] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState(new Set());
  const [progressStats, setProgressStats] = useState({
    vocabularyGrowth: [20, 35, 50, 65, 78],
    grammarAccuracy: [60, 65, 70, 75, 80],
    conversationLength: [5, 8, 12, 15, 18]
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages: Record<string, { name: string; flag: string }> = {
    spanish: { name: 'Spanish (Español)', flag: '🇪🇸' },
    french: { name: 'French (Français)', flag: '🇫🇷' },
    german: { name: 'German (Deutsch)', flag: '🇩🇪' },
    japanese: { name: 'Japanese (日本語)', flag: '🇯🇵' },
    italian: { name: 'Italian (Italiano)', flag: '🇮🇹' },
    portuguese: { name: 'Portuguese (Português)', flag: '🇵🇹' },
    chinese: { name: 'Chinese (中文)', flag: '🇨🇳' },
    korean: { name: 'Korean (한국어)', flag: '🇰🇷' }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getProficiencyColor = (level: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'text-green-600 bg-green-100',
      'Intermediate': 'text-yellow-600 bg-yellow-100',
      'Advanced': 'text-red-600 bg-red-100',
      'Native': 'text-purple-600 bg-purple-100'
    };
    return colors[level] || colors.Beginner;
  };

  const generateLearningGoals = (level: string, language: string) => {
    const goalsByLevel: Record<string, Record<string, string[]>> = {
      Beginner: {
        spanish: [
          'Master basic greetings and introductions',
          'Learn present tense regular verbs',
          'Build food and drink vocabulary',
          'Practice numbers 1-100',
          'Use basic question words (qué, cómo, dónde)'
        ],
        french: [
          'Master basic greetings (bonjour, bonsoir)',
          'Learn present tense être and avoir',
          'Build family and home vocabulary',
          'Practice French pronunciation',
          'Use basic question words'
        ],
        german: [
          'Master basic greetings and politeness',
          'Learn German cases (Nominativ, Akkusativ)',
          'Build everyday vocabulary',
          'Practice German pronunciation',
          'Learn basic sentence structure'
        ]
      },
      Intermediate: {
        spanish: [
          'Master past tenses (preterite and imperfect)',
          'Learn subjunctive mood basics',
          'Expand professional vocabulary',
          'Practice complex sentence structures',
          'Understand cultural expressions'
        ]
      }
    };

    const goals = goalsByLevel[level]?.[language] || goalsByLevel.Beginner.spanish;
    return goals.slice(0, 3).map((text, index) => ({
      id: Date.now() + index,
      text,
      completed: false,
      progress: Math.floor(Math.random() * 30)
    }));
  };

  const analyzeProficiencyLevel = (messageHistory: any[]) => {
    if (messageHistory.length < 3) return 'Beginner';
    if (messageHistory.length < 10) return 'Beginner';
    if (messageHistory.length < 20) return 'Intermediate';
    return 'Advanced';
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage];
      const detectedLevel = analyzeProficiencyLevel(conversationHistory);

      const prompt = `
You are a friendly, encouraging language tutor helping someone learn ${languages[selectedLanguage].name}.

Conversation history: ${JSON.stringify(conversationHistory.slice(-5).map(m => ({ sender: m.sender, text: m.text })))}

Current user message: "${currentMessage}"
User's proficiency level: ${detectedLevel}
Learning goals: ${learningGoals.map(g => g.text).join(', ')}
Lesson mode: ${showLessonMode}

Respond with a JSON object in this exact format:
{
  "tutorResponse": "Your encouraging response in ${languages[selectedLanguage].name}. ${showLessonMode ? 'Focus on teaching specific grammar or vocabulary.' : 'Keep the conversation natural and flowing.'}",
  "englishTranslation": "The exact same response translated to English",
  "feedback": {
    "positive": ["Positive aspects of their language use"],
    "corrections": ["Gentle corrections if needed"],
    "suggestions": ["Helpful suggestions for improvement"]
  },
  "grammarAnalysis": {
    "accuracy": 85,
    "detectedLevel": "${detectedLevel}",
    "strengths": ["Areas they did well"],
    "improvements": ["Areas to work on"]
  },
  "vocabularyUsed": ["words", "they", "used"],
  "progressNotes": "Brief encouraging note about their progress"
}

Your entire response MUST be valid JSON only. DO NOT include any text outside the JSON structure.
`;

      // استخدام API route بدلاً من window.claude.complete
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: prompt
          }],
          skipSearch: true,
          forceAIResponse: true
        })
      });

      const data = await response.json();

      // محاولة استخراج JSON من الاستجابة
      let parsedResponse;
      try {
        // إذا كانت الاستجابة مباشرة
        parsedResponse = JSON.parse(data.response);
      } catch (e) {
        // إذا كانت الاستجابة محاطة بنص إضافي، نحاول استخراج JSON
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse JSON response');
        }
      }

      const tutorMessage = {
        id: Date.now() + 1,
        text: parsedResponse.tutorResponse,
        englishTranslation: parsedResponse.englishTranslation,
        sender: 'tutor',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, tutorMessage]);
      setFeedback(parsedResponse.feedback);

      // Update user profile
      setUserProfile(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        proficiencyLevel: parsedResponse.grammarAnalysis.detectedLevel,
        grammarAccuracy: parsedResponse.grammarAnalysis.accuracy,
        vocabularyCount: new Set([...prev.vocabularyCount, ...parsedResponse.vocabularyUsed])
      }));

      // Update progress stats
      if (userProfile.totalMessages % 5 === 0) {
        setProgressStats(prev => ({
          vocabularyGrowth: [...prev.vocabularyGrowth, userProfile.vocabularyCount.size],
          grammarAccuracy: [...prev.grammarAccuracy, parsedResponse.grammarAnalysis.accuracy],
          conversationLength: [...prev.conversationLength, conversationHistory.length]
        }));
      }

    } catch (error) {
      console.error('Error getting tutor response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `I'm sorry, I'm having trouble responding right now. Let's continue practicing! (${selectedLanguage === 'spanish' ? '¡Sigamos practicando!' : selectedLanguage === 'french' ? 'Continuons à pratiquer!' : 'Let\'s keep practicing!'})`,
        sender: 'tutor',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    setMessages([]);
    setFeedback(null);
    setTranslatedMessages(new Set());
    const newGoals = generateLearningGoals(userProfile.proficiencyLevel, newLang);
    setLearningGoals(newGoals);
  };

  const toggleGoalCompletion = (goalId) => {
    setLearningGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? { ...goal, completed: !goal.completed, progress: goal.completed ? goal.progress : 100 }
          : goal
      )
    );
  };

  const toggleMessageTranslation = (messageId) => {
    setTranslatedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const addCustomGoal = () => {
    const goalText = prompt('Enter your learning goal:');
    if (goalText?.trim()) {
      const newGoal = {
        id: Date.now(),
        text: goalText.trim(),
        completed: false,
        progress: 0
      };
      setLearningGoals(prev => [...prev, newGoal]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-800">Language Tutor</h1>
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(languages).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>

              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getProficiencyColor(userProfile.proficiencyLevel)}`}>
                {userProfile.proficiencyLevel}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowLessonMode(!showLessonMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showLessonMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showLessonMode ? 'Lesson Mode' : 'Chat Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">{languages[selectedLanguage].flag}</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Ready to practice {languages[selectedLanguage].name}?
              </h2>
              <p className="text-gray-500">
                Start a conversation and I'll help you learn with personalized feedback!
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors'
              } ${message.sender === 'tutor' ? 'cursor-pointer' : ''}`}
              onClick={message.sender === 'tutor' ? () => toggleMessageTranslation(message.id) : undefined}
              >
                {message.sender === 'tutor' && (
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Languages className="h-3 w-3 text-gray-400" />
                  </div>
                )}
                <p className="pr-4">
                  {message.sender === 'tutor' && translatedMessages.has(message.id)
                    ? message.englishTranslation || message.text
                    : message.text
                  }
                </p>
                {message.sender === 'tutor' && translatedMessages.has(message.id) && (
                  <p className="text-xs mt-1 text-gray-500 italic">
                    English translation
                  </p>
                )}
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-500">Tutor is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Type your message in ${languages[selectedLanguage].name}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !currentMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Progress Overview */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Progress Overview
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Messages:</span>
              <span className="font-medium">{userProfile.totalMessages}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Vocabulary:</span>
              <span className="font-medium">{userProfile.vocabularyCount.size} words</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Accuracy:</span>
              <span className="font-medium">{userProfile.grammarAccuracy}%</span>
            </div>
          </div>
        </div>

        {/* Learning Goals */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Learning Goals
            </h3>
            <button
              onClick={addCustomGoal}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {learningGoals.map((goal) => (
              <div key={goal.id} className="p-2 bg-gray-50 rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${goal.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {goal.text}
                    </p>
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleGoalCompletion(goal.id)}
                    className="ml-2 mt-1"
                  >
                    {goal.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Feedback */}
        {feedback && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Feedback
            </h3>
            {feedback.positive.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-green-600 mb-1">Great job!</p>
                {feedback.positive.map((item, idx) => (
                  <p key={idx} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                    {item}
                  </p>
                ))}
              </div>
            )}
            {feedback.corrections.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-orange-600 mb-1">Small corrections:</p>
                {feedback.corrections.map((item, idx) => (
                  <p key={idx} className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                    {item}
                  </p>
                ))}
              </div>
            )}
            {feedback.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-blue-600 mb-1">Try this:</p>
                {feedback.suggestions.map((item, idx) => (
                  <p key={idx} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex-1 p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Learning Stats
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vocabulary Growth</p>
              <div className="flex items-end space-x-1 h-8">
                {progressStats.vocabularyGrowth.slice(-5).map((value, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-600 rounded-t"
                    style={{ height: `${(value / 100) * 100}%`, width: '20%' }}
                  ></div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Grammar Accuracy</p>
              <div className="flex items-end space-x-1 h-8">
                {progressStats.grammarAccuracy.slice(-5).map((value, idx) => (
                  <div
                    key={idx}
                    className="bg-green-600 rounded-t"
                    style={{ height: `${value}%`, width: '20%' }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
