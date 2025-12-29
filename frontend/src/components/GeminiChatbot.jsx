



// import React, { useState, useRef, useEffect } from "react";
// import { Send, X, MessageCircle, Loader } from "lucide-react";
// import ReactMarkdown from "react-markdown";

// const GeminiChatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       type: "bot",
//       text: "Hello! I'm your FireVision AI assistant 🔥 How can I help you with fire detection or monitoring?"
//     }
//   ]);
//   const [inputValue, setInputValue] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   const API_URL = "http://localhost:5000/api/gemini/chat";

//   // Auto scroll
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isLoading]);

//   // Send message
//   const sendMessage = async () => {
//     if (!inputValue.trim() || isLoading) return;

//     const userMessage = inputValue.trim();
//     setInputValue("");

//     setMessages((prev) => [
//       ...prev,
//       { id: Date.now(), type: "user", text: userMessage }
//     ]);

//     setIsLoading(true);

//     try {
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ message: userMessage })
//       });

//       const data = await response.json();

//       if (!data.success) {
//         throw new Error(data.error || "Gemini error");
//       }

//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           type: "bot",
//           text: data.reply
//         }
//       ]);
//     } catch (error) {
//       console.error("Gemini Error:", error);
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           type: "bot",
//           text: "⚠️ AI service is currently unavailable. Please try again later."
//         }
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Enter key send
//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <>
//       {/* Floating Button */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110 z-40"
//         >
//           <MessageCircle className="w-6 h-6" />
//         </button>
//       )}

//       {/* Chat Window */}
//       {isOpen && (
//         <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
//           {/* Header */}
//           <div className="bg-orange-600 text-white p-4 rounded-t-lg flex justify-between items-center">
//             <div className="flex items-center gap-2">
//               <MessageCircle className="w-5 h-5" />
//               <span className="font-semibold">FireVision AI</span>
//             </div>
//             <button onClick={() => setIsOpen(false)}>
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {messages.map((msg) => (
//               <div
//                 key={msg.id}
//                 className={`flex ${
//                   msg.type === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
//                     msg.type === "user"
//                       ? "bg-orange-600 text-white rounded-br-none"
//                       : "bg-gray-200 text-gray-800 rounded-bl-none"
//                   }`}
//                 >
//                   {msg.text}
//                 </div>
//               </div>
//             ))}

//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="bg-gray-200 px-4 py-2 rounded-lg flex gap-2">
//                   <Loader className="w-4 h-4 animate-spin" />
//                   <span className="text-sm">Thinking...</span>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input */}
//           <div className="border-t p-3 flex gap-2">
//             <input
//               type="text"
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Ask about fire detection..."
//               className="flex-1 border rounded-lg px-3 py-2 text-sm"
//               disabled={isLoading}
//             />
//             <button
//               onClick={sendMessage}
//               disabled={isLoading || !inputValue.trim()}
//               className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white p-2 rounded-lg"
//             >
//               <Send className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default GeminiChatbot;

import React, { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle, Loader } from "lucide-react";
import ReactMarkdown from "react-markdown";

const GeminiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm your FireVision AI assistant 🔥 How can I help you with fire detection or monitoring?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = "http://localhost:5000/api/gemini/chat";

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Send message
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "user", text: userMessage }
    ]);

    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Gemini error");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: data.reply
        }
      ]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: "⚠️ AI service is currently unavailable. Please try again later."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter key send
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110 z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-orange-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">FireVision AI</span>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
                    msg.type === "user"
                      ? "bg-orange-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.type === "bot" ? (
                    <ReactMarkdown
                      components={{
                        h3: ({ children }) => (
                          <h3 className="font-semibold text-sm mt-3 mb-1">
                            {children}
                          </h3>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        li: ({ children }) => (
                          <li className="list-disc ml-4 text-sm">
                            {children}
                          </li>
                        ),
                        p: ({ children }) => (
                          <p className="text-sm mb-2 leading-relaxed">
                            {children}
                          </p>
                        )
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg flex gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about fire detection..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white p-2 rounded-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChatbot;
