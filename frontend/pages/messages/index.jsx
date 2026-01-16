import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaComments, 
  FaSearch, 
  FaPaperPlane,
  FaArrowLeft,
  FaUser,
  FaBuilding,
  FaBriefcase,
  FaCircle,
  FaEllipsisV,
  FaArchive,
  FaTimes,
  FaCheck,
  FaCheckDouble,
  FaPaperclip,
  FaImage
} from 'react-icons/fa';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Messages() {
  const { user, userType } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      markAsRead(selectedConversation._id);
    }
  }, [selectedConversation?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/conversations');
      setConversations(response.data.data.conversations || []);
      
      // Auto-select from URL if present
      if (router.query.id) {
        const conv = response.data.data.conversations.find(c => c._id === router.query.id);
        if (conv) setSelectedConversation(conv);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await api.get(`/chat/conversations/${conversationId}/messages?limit=100`);
      setMessages(response.data.data.messages || []);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await api.put(`/chat/conversations/${conversationId}/read`);
      setConversations(prev => 
        prev.map(c => c._id === conversationId 
          ? { ...c, unreadCount: { ...c.unreadCount, [user._id]: 0 } }
          : c
        )
      );
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const response = await api.post(`/chat/conversations/${selectedConversation._id}/messages`, {
        content: newMessage.trim()
      });
      
      const message = response.data.data.message;
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update conversation list
      setConversations(prev => prev.map(c => 
        c._id === selectedConversation._id 
          ? { ...c, lastMessage: message, updatedAt: new Date() }
          : c
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const archiveConversation = async (conversationId) => {
    try {
      await api.put(`/chat/conversations/${conversationId}/archive`);
      toast.success('Conversation archived');
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      toast.error('Failed to archive conversation');
    }
    setShowMenu(null);
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants) return null;
    return conversation.participants.find(p => p._id !== user?._id);
  };

  const getUnreadCount = (conversation) => {
    if (!conversation?.unreadCount || !user) return 0;
    return conversation.unreadCount[user._id] || 0;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const other = getOtherParticipant(conv);
    const search = searchTerm.toLowerCase();
    return (
      other?.name?.toLowerCase().includes(search) ||
      conv.application?.job?.title?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <Head>
        <title>Messages - JobPulse</title>
        <meta name="description" content="Chat with employers and applicants" />
      </Head>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-xl border-b border-white/10 px-4 py-4"
          >
            <div className="max-w-7xl mx-auto flex items-center space-x-4">
              <Link href={userType === 'employer' ? '/employer/dashboard' : '/user/dashboard'} className="text-gray-400 hover:text-white transition-colors">
                <FaArrowLeft className="text-xl" />
              </Link>
              <div className="flex items-center space-x-3">
                <FaComments className="text-2xl text-orange-500" />
                <h1 className="text-xl font-bold text-white">Messages</h1>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conversations List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`w-full md:w-96 bg-black/30 border-r border-white/10 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}
            >
              {/* Search */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <FaComments className="text-4xl text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const other = getOtherParticipant(conversation);
                    const unread = getUnreadCount(conversation);
                    const isSelected = selectedConversation?._id === conversation._id;

                    return (
                      <div
                        key={conversation._id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`relative p-4 border-b border-white/5 cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-orange-500/10 border-l-2 border-l-orange-500' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            other?.company 
                              ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                              : 'bg-gradient-to-br from-orange-500 to-red-500'
                          }`}>
                            {other?.company ? <FaBuilding /> : (other?.name?.charAt(0) || 'U')}
                            {unread > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center">
                                {unread > 9 ? '9+' : unread}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-medium truncate ${unread > 0 ? 'text-white' : 'text-gray-300'}`}>
                                {other?.name || other?.company || 'Unknown'}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.updatedAt)}
                              </span>
                            </div>
                            {conversation.application?.job?.title && (
                              <p className="text-xs text-orange-400 truncate flex items-center">
                                <FaBriefcase className="mr-1" />
                                {conversation.application.job.title}
                              </p>
                            )}
                            <p className={`text-sm truncate ${unread > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Menu Button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === conversation._id ? null : conversation._id); }}
                          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors"
                        >
                          <FaEllipsisV />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {showMenu === conversation._id && (
                          <div className="absolute top-10 right-4 bg-gray-800 border border-white/20 rounded-lg shadow-xl z-10">
                            <button
                              onClick={(e) => { e.stopPropagation(); archiveConversation(conversation._id); }}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 w-full text-left"
                            >
                              <FaArchive />
                              <span>Archive</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center space-x-4">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden text-gray-400 hover:text-white transition-colors"
                    >
                      <FaArrowLeft />
                    </button>
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      getOtherParticipant(selectedConversation)?.company 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                        : 'bg-gradient-to-br from-orange-500 to-red-500'
                    }`}>
                      {getOtherParticipant(selectedConversation)?.company 
                        ? <FaBuilding /> 
                        : (getOtherParticipant(selectedConversation)?.name?.charAt(0) || 'U')
                      }
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {getOtherParticipant(selectedConversation)?.name || 
                         getOtherParticipant(selectedConversation)?.company || 'Unknown'}
                      </h3>
                      {selectedConversation.application?.job?.title && (
                        <p className="text-xs text-gray-400">
                          Re: {selectedConversation.application.job.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <FaComments className="text-4xl mb-4" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message, index) => {
                          const isOwn = message.sender?._id === user?._id;
                          const isSystem = message.type === 'system';
                          const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender?._id !== message.sender?._id);

                          if (isSystem) {
                            return (
                              <div key={message._id} className="flex justify-center">
                                <span className="px-3 py-1 bg-white/5 text-gray-400 text-xs rounded-full">
                                  {message.content}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={message._id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`flex items-end space-x-2 max-w-[75%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                {!isOwn && showAvatar && (
                                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {message.sender?.name?.charAt(0) || 'U'}
                                  </div>
                                )}
                                {!isOwn && !showAvatar && <div className="w-8" />}
                                
                                <div className={`rounded-2xl px-4 py-2 ${
                                  isOwn 
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                                    : 'bg-white/10 text-white'
                                }`}>
                                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                  <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                    <span>{formatTime(message.createdAt)}</span>
                                    {isOwn && (
                                      message.read 
                                        ? <FaCheckDouble className="text-blue-300" />
                                        : <FaCheck />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="bg-black/30 backdrop-blur-xl border-t border-white/10 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FaPaperPlane />
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
                  <FaComments className="text-6xl mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-white mb-2">Your Messages</h3>
                  <p className="text-center">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
