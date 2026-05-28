/**
 * Chatbot Conversation Memory System
 * Tracks and learns from conversations for better future responses
 */

class ConversationMemory {
  constructor(maxSize = 100) {
    this.conversations = new Map();
    this.maxSize = maxSize;
    this.learnings = [];
    this.patterns = new Map();
  }

  /**
   * Store conversation
   */
  storeConversation(sessionId, messages) {
    if (this.conversations.size >= this.maxSize) {
      // Remove oldest
      const firstKey = this.conversations.keys().next().value;
      this.conversations.delete(firstKey);
    }

    this.conversations.set(sessionId, {
      messages,
      timestamp: new Date(),
      duration: messages.length,
      topics: this.extractTopics(messages)
    });

    // Learn from conversation
    this.learn(messages);
  }

  /**
   * Extract topics from messages
   */
  extractTopics(messages) {
    const topics = [];
    const topicKeywords = {
      'Nhân sự': ['nhân viên', 'hợp đồng', 'chấm công', 'lương', 'tuyển dụng'],
      'Dự án': ['dự án', 'công việc', 'task', 'tiến độ', 'deadline'],
      'Bán hàng': ['đơn hàng', 'khách hàng', 'bán', 'giá', 'hóa đơn'],
      'Mua hàng': ['nhà cung cấp', 'đặt hàng', 'chào giá', 'mua'],
      'Kho hàng': ['tồn kho', 'sản phẩm', 'xuất', 'nhập', 'kiểm kê'],
      'Tài chính': ['tài chính', 'báo cáo', 'doanh thu', 'chi phí', 'lợi nhuận'],
      'Sản xuất': ['sản xuất', 'production', 'BOM', 'qui trình', 'MRP']
    };

    messages.forEach(msg => {
      const text = (msg.content || '').toLowerCase();
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
          if (!topics.includes(topic)) {
            topics.push(topic);
          }
        }
      });
    });

    return topics;
  }

  /**
   * Learn from conversation
   */
  learn(messages) {
    messages.forEach((msg, index) => {
      if (msg.role === 'user' && messages[index + 1]?.role === 'assistant') {
        const question = msg.content.toLowerCase();
        const answer = messages[index + 1].content;

        // Store pattern
        const pattern = this.extractPattern(question);
        if (pattern) {
          if (!this.patterns.has(pattern)) {
            this.patterns.set(pattern, []);
          }
          this.patterns.get(pattern).push({
            question,
            answer,
            timestamp: new Date()
          });
        }

        // Store learning
        this.learnings.push({
          type: 'question-answer',
          question,
          answer,
          timestamp: new Date(),
          accuracy: 0.5 // Will be updated based on feedback
        });
      }
    });

    // Keep learnings manageable
    if (this.learnings.length > this.maxSize * 2) {
      this.learnings = this.learnings.slice(-this.maxSize);
    }
  }

  /**
   * Extract pattern from question
   */
  extractPattern(question) {
    // Match common question patterns
    const patterns = [
      { regex: /^(làm cách nào|cách nào|làm sao)/i, pattern: 'how-to' },
      { regex: /^(cái gì|là gì|meaning)/i, pattern: 'what-is' },
      { regex: /^(tại sao|why)/i, pattern: 'why' },
      { regex: /^(bao nhiêu|how many|mấy)/i, pattern: 'how-many' },
      { regex: /^(đâu|where|ở đâu)/i, pattern: 'where' },
      { regex: /^(có thể|can I|được không)/i, pattern: 'can-do' },
      { regex: /^(ai|who)/i, pattern: 'who' }
    ];

    for (const { regex, pattern } of patterns) {
      if (regex.test(question)) {
        return pattern;
      }
    }

    return null;
  }

  /**
   * Find similar conversations
   */
  findSimilar(query, limit = 3) {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const scored = [];

    this.conversations.forEach((conv, sessionId) => {
      let score = 0;
      conv.messages.forEach(msg => {
        if (msg.role === 'user') {
          const msgTerms = msg.content.toLowerCase().split(/\s+/);
          const matches = queryTerms.filter(term => 
            msgTerms.some(mTerm => mTerm.includes(term) || term.includes(mTerm))
          ).length;
          score += matches;
        }
      });

      if (score > 0) {
        scored.push({ sessionId, score, topics: conv.topics });
      }
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalConversations: this.conversations.size,
      totalLearnings: this.learnings.length,
      patterns: Array.from(this.patterns.keys()),
      averageConversationLength: Array.from(this.conversations.values())
        .reduce((sum, conv) => sum + conv.duration, 0) / this.conversations.size || 0,
      topics: Array.from(new Set(
        Array.from(this.conversations.values()).flatMap(c => c.topics)
      ))
    };
  }

  /**
   * Export conversation data
   */
  exportData() {
    return {
      conversations: Array.from(this.conversations.entries()),
      learnings: this.learnings,
      patterns: Array.from(this.patterns.entries()),
      stats: this.getStats(),
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Clear memory
   */
  clear() {
    this.conversations.clear();
    this.learnings = [];
    this.patterns.clear();
  }
}

// Create singleton
const conversationMemory = new ConversationMemory();

/**
 * Global function to update memory
 */
window.updateChatbotMemory = function(sessionId, messages) {
  conversationMemory.storeConversation(sessionId, messages);
};

/**
 * Get memory stats
 */
window.getChatbotMemoryStats = function() {
  return conversationMemory.getStats();
};

export { ConversationMemory, conversationMemory };
