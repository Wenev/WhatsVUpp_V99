import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Send, LogOut, Users } from "lucide-react"
import logo from "../assets/VUnt.webp"

interface ChatPageProps {
  username: string
  setUsername: (username: string) => void
}

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
}

const ChatPage: React.FC<ChatPageProps> = ({ username, setUsername }) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [onlineUsers] = useState(251) 
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottomIfAtBottom = () => {
    const container = chatContainerRef.current
    if (!container) return

    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    if (isAtBottom) {
      container.scrollTop = container.scrollHeight
    }
  }
  const chatContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollToBottomIfAtBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages`)
      const data = await response.json()
      if (data == null) {
        setMessages([])
      } else {
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: username, content: newMessage }),
      })
      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      } else {
        console.error("Failed to send message.")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("username")
    setUsername("")
    navigate("/")
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4">
      <div className="absolute overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col">
        <Card className="backdrop-blur-sm bg-white/95 shadow-xl border-0 mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                  <img src={logo} alt="WhatsVUpp Logo" className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    WhatsVUpp
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{onlineUsers} online</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                  <p className="text-sm text-gray-600">{username}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="flex-1 backdrop-blur-sm bg-white/95 shadow-xl border-0 mb-4 flex flex-col">
          <CardContent className="flex-1 p-0 flex flex-col">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <img src={logo} alt="WhatsVUpp Logo" className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === username ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.sender === username
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                        }`}
                    >
                      {msg.sender !== username && (
                        <p className="text-xs font-semibold mb-1 text-purple-600">{msg.sender}</p>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div
                        className={`flex items-center gap-1 mt-2 ${msg.sender === username ? "justify-end" : "justify-start"
                          }`}
                      >
                        <p className={`text-xs opacity-70`}>{formatTime(msg.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-12 py-3 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-full"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full w-10 h-9 p-0"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ChatPage
