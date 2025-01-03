import React, { useState, useEffect } from 'react'
import { FaArrowCircleUp } from 'react-icons/fa'
import { PuffLoader } from 'react-spinners'

const API_URL = 'http://localhost:4000/api/chat'

const Home = () => {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMessages, setHasMessages] = useState(false)

  useEffect(() => {
    setHasMessages(chatHistory.length > 0)
  }, [chatHistory])

  const generateResponse = async (messages) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate response');
    }

    return response.json();
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    const userInput = message
    
    try {
      // Add user message to chat history
      const newMessage = { role: 'user', content: userInput }
      setChatHistory(prev => [...prev, newMessage])
      
      // Clear input early
      setMessage('')
      
      // Generate AI response
      const messages = [...chatHistory, newMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponse = await generateResponse(messages)
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse.content 
      }])
    } catch (error) {
      console.error('Error:', error)
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: error.message,
        isError: true 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#1C1C1C]">
      {/* Chat history area - fixed at the top */}
      <div className="w-full max-w-2xl mx-auto flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${
              chat.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[50%] p-4 rounded-lg ${
                chat.role === 'user'
                  ? 'bg-gray-700 text-white'
                  : chat.isError 
                    ? 'bg-red-900 text-red-200'
                    : 'bg-gray-800 text-gray-200'
              }`}
            >
              {chat.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input container with centered positioning and linear transition */}
      <div 
        className={`w-full transition-transform duration-100 ease-linear ${
          hasMessages 
            ? 'transform translate-y-0' 
            : 'transform translate-y-[-30vh]'
        }`}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          {!hasMessages && (
            <h1 className="text-white text-4xl font-medium mb-8 text-center">
              What can I help with?
            </h1>
          )}
          <form onSubmit={handleSubmit} className="flex space-x-4 mb-4">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = 'inherit';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Message . . ."
              className="flex-1 resize-none rounded-full border border-gray-600 bg-[#2C2C2C] p-3 pl-5 focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[50px] max-h-[200px] overflow-hidden text-white placeholder-gray-400"
              rows="1"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={` text-5xl self-end ${
                isLoading 
                  ? 'cursor-not-allowed' 
                  : ''
              } text-white`}
              disabled={isLoading}
            >
              {isLoading ? <PuffLoader color="#fff" size={50} /> : <FaArrowCircleUp />
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home
