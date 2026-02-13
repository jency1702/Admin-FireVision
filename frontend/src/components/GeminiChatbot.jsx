
// import React, { useState, useRef, useEffect } from "react";
// import { Send, X, MessageCircle, Loader } from "lucide-react";
// import ReactMarkdown from "react-markdown";

// const GeminiChatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       type: "bot",
//       text: "Hello! I'm your FireVision AI assistant..How can I help you with fire detection or monitoring?"
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
//                   className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
//                     msg.type === "user"
//                       ? "bg-orange-600 text-white rounded-br-none"
//                       : "bg-gray-100 text-gray-800 rounded-bl-none"
//                   }`}
//                 >
//                   {msg.type === "bot" ? (
//                     <ReactMarkdown
//                       components={{
//                         h3: ({ children }) => (
//                           <h3 className="font-semibold text-sm mt-3 mb-1">
//                             {children}
//                           </h3>
//                         ),
//                         strong: ({ children }) => (
//                           <strong className="font-semibold">{children}</strong>
//                         ),
//                         li: ({ children }) => (
//                           <li className="list-disc ml-4 text-sm">
//                             {children}
//                           </li>
//                         ),
//                         p: ({ children }) => (
//                           <p className="text-sm mb-2 leading-relaxed">
//                             {children}
//                           </p>
//                         )
//                       }}
//                     >
//                       {msg.text}
//                     </ReactMarkdown>
//                   ) : (
//                     msg.text
//                   )}
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



//Hallucination-free
// import React, { useState, useRef, useEffect } from "react";
// import { Send, X, MessageCircle, Loader } from "lucide-react";
// import ReactMarkdown from "react-markdown";

// const GeminiChatbot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       type: "bot",
//       text: "Hello! I'm your **FireVision AI assistant**.\n\nI can help with:\n- Fire detection\n- Smoke alerts\n- Fire safety\n- Emergency response\n\nAsk only fire-related questions."
//     }
//   ]);
//   const [inputValue, setInputValue] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   const API_URL = "http://localhost:5000/api/gemini/chat";

//   const fireKeywords = [
//     "fire",
//     "smoke",
//     "flame",
//     "burn",
//     "heat",
//     "temperature",
//     "fire detection",
//     "fire alarm",
//     "smoke detector",
//     "fire sensor",
//     "thermal",
//     "wildfire",
//     "gas leak",
//     "explosion",
//     "emergency",
//     "evacuation",
//     "fire safety",
//     "fire extinguisher"
//   ];

//   const isFireRelated = (text) => {
//     const lowerText = text.toLowerCase();
//     return fireKeywords.some(keyword => lowerText.includes(keyword));
//   };


//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isLoading]);


//   const sendMessage = async () => {
//     if (!inputValue.trim() || isLoading) return;

//     const userMessage = inputValue.trim();
//     setInputValue("");

    
//     setMessages((prev) => [
//       ...prev,
//       { id: Date.now(), type: "user", text: userMessage }
//     ]);


//     if (!isFireRelated(userMessage)) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           type: "bot",
//           text: "I can answer **only fire-related questions**.\n\nExamples:\n- How does fire detection work?\n- What to do if smoke is detected?\n- Fire safety precautions\n\nPlease ask something related to fire safety or detection."
//         }
//       ]);
//       return;
//     }

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
//           id: Date.now() + 2,
//           type: "bot",
//           text: data.reply
//         }
//       ]);
//     } catch (error) {
//       console.error("Gemini Error:", error);
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 3,
//           type: "bot",
//           text: "FireVision AI service is currently unavailable. Please try again later."
//         }
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };


//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <>
   
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110 z-40"
//         >
//           <MessageCircle className="w-6 h-6" />
//         </button>
//       )}

   
//       {isOpen && (
//         <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
 
//           <div className="bg-orange-600 text-white p-4 rounded-t-lg flex justify-between items-center">
//             <div className="flex items-center gap-2">
//               <MessageCircle className="w-5 h-5" />
//               <span className="font-semibold">FireVision AI</span>
//             </div>
//             <button onClick={() => setIsOpen(false)}>
//               <X className="w-5 h-5" />
//             </button>
//           </div>

        
//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {messages.map((msg) => (
//               <div
//                 key={msg.id}
//                 className={`flex ${
//                   msg.type === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-xs px-4 py-3 rounded-lg text-sm ${
//                     msg.type === "user"
//                       ? "bg-orange-600 text-white rounded-br-none"
//                       : "bg-gray-100 text-gray-800 rounded-bl-none"
//                   }`}
//                 >
//                   {msg.type === "bot" ? (
//                     <ReactMarkdown>{msg.text}</ReactMarkdown>
//                   ) : (
//                     msg.text
//                   )}
//                 </div>
//               </div>
//             ))}

//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="bg-gray-200 px-4 py-2 rounded-lg flex gap-2">
//                   <Loader className="w-4 h-4 animate-spin" />
//                   <span className="text-sm">Analyzing fire data...</span>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

         
//           <div className="border-t p-3 flex gap-2">
//             <input
//               type="text"
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Ask fire & smoke detection questions only..."
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
import { Send, X, MessageCircle, Loader, Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";

const GeminiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm your **FireVision AI assistant**.\n\nI can help with:\n- Fire detection\n- Smoke alerts\n- Fire safety\n- Emergency response\n\nAsk fire-related questions or greet me "
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

 
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  const API_URL = "http://localhost:5000/api/gemini/chat";


  const fireKeywords = [
    "fire",
    "smoke",
    "flame",
    "burn",
    "heat",
    "temperature",
    "fire detection",
    "fire alarm",
    "smoke detector",
    "fire sensor",
    "thermal",
    "wildfire",
    "gas leak",
    "explosion",
    "emergency",
    "evacuation",
    "fire safety",
    "fire extinguisher"
  ];


  const greetingKeywords = [
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening"
  ];

  const isFireRelated = (text) =>
    fireKeywords.some((k) => text.toLowerCase().includes(k));

  const isGreeting = (text) =>
    greetingKeywords.some((g) => text.toLowerCase().includes(g));

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (e) => {
      setInputValue(e.results[0][0].transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "user", text: userMessage }
    ]);

    if (isGreeting(userMessage)) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text:
            "Hello! I'm **FireVision AI**.\n\nI can assist you with:\n- Fire detection\n- Smoke alerts\n- Emergency response\n\nHow can I help you today?"
        }
      ]);
      return;
    }


    if (!isFireRelated(userMessage)) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text:
            "I can answer **only fire-related questions**.\n\nExamples:\n- How does fire detection work?\n- What to do if smoke is detected?\n- Fire safety precautions"
        }
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      if (!data.success) throw new Error();

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, type: "bot", text: data.reply }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          type: "bot",
          text: "FireVision AI service is unavailable. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border">
          <div className="bg-orange-600 text-white p-4 rounded-t-lg flex justify-between">
            <div className="flex gap-2 items-center">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">FireVision AI</span>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

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
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {msg.type === "bot" ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 text-sm">
                <Loader className="w-4 h-4 animate-spin" />
                Analyzing fire data...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask fire & smoke detection questions..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              disabled={isLoading}
            />

            {/* 🎤 Mic */}
            <button
              onClick={startListening}
              disabled={isListening || isLoading}
              className={`p-2 rounded-full ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              title="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-lg"
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



