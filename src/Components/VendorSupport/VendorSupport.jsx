import { useState } from 'react';

const VendorSupport = () => {
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [ticketForm, setTicketForm] = useState({
    category: '',
    subject: '',
    description: ''
  });

  const knowledgeBaseArticles = [
    {
      id: 1,
      title: 'Getting Started Guide',
      content: 'Learn the basics of our platform and how to set up your vendor account...'
    },
    {
      id: 2,
      title: 'Payment Processing',
      content: 'Understanding payment cycles, transfers, and transaction fees...'
    },
    {
      id: 3,
      title: 'Common Technical Issues',
      content: 'Solutions to frequent technical problems and troubleshooting steps...'
    }
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    // Handle ticket submission logic here
    setTicketForm({ category: '', subject: '', description: '' });
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatMessages([...chatMessages, { text: chatInput, sender: 'user' }]);
    setChatInput('');
    
    // Simulate response (in real app, this would be handled by your backend)
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        text: "Thanks for reaching out! A support agent will be with you shortly.",
        sender: 'system'
      }]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Knowledge Base Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Knowledge Base</h2>
        <div className="space-y-4">
          {knowledgeBaseArticles.map((article) => (
            <div key={article.id} className="border-b-2 border-gray-200 pb-4">
              <button
                onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                className="w-full text-left font-semibold text-black hover:text-gray-700 flex justify-between items-center"
              >
                {article.title}
                <span className="text-xl">{expandedArticle === article.id ? '−' : '+'}</span>
              </button>
              {expandedArticle === article.id && (
                <p className="mt-2 text-gray-600">{article.content}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Ticket Submission Form */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Submit a Ticket</h2>
        <form onSubmit={handleTicketSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Category
            </label>
            <select
              value={ticketForm.category}
              onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-0"
            >
              <option value="">Select a category</option>
              <option value="technical">Technical Issue</option>
              <option value="billing">Billing</option>
              <option value="account">Account Management</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={ticketForm.subject}
              onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
              placeholder="Brief description of your issue"
              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={ticketForm.description}
              onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
              placeholder="Please provide detailed information about your issue"
              rows={4}
              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-0"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Submit Ticket
          </button>
        </form>
      </section>

      {/* Real-Time Chat Widget */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Live Chat Support</h2>
        <div className="h-64 border-2 border-gray-200 rounded-lg mb-4 p-4 overflow-y-auto">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <span
                className={`inline-block px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                {message.text}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-black focus:ring-0"
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
};

export default VendorSupport;