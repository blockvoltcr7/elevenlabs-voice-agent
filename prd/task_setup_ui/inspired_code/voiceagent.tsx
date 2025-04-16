'use client'

import { useState, useEffect, useRef } from 'react'
import { Conversation } from '@11labs/client'
import { Mic, MicOff, Volume2, VolumeX, RefreshCw } from 'lucide-react'

// shadcn UI components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
  id: string
  sender: 'user' | 'agent'
  text: string
  final: boolean
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'
type AgentMode = 'idle' | 'listening' | 'speaking'

export default function VoiceAgent() {
  // State
  const [conversation, setConversation] = useState<any>(null)
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [mode, setMode] = useState<AgentMode>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState<number>(0.8)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [visualizerData, setVisualizerData] = useState<Uint8Array | null>(null)
  const [showPermissionDialog, setShowPermissionDialog] = useState<boolean>(false)
  const [showEndDialog, setShowEndDialog] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)

  // Refs
  const animationRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Cleanup conversation on unmount
  useEffect(() => {
    return () => {
      if (conversation) {
        conversation.endSession()
      }
    }
  }, [conversation])

  // Handle message from ElevenLabs
  const handleMessage = (message: any) => {
    if (!message.text) return

    // Find if there's a tentative message from the same sender
    const tentativeIndex = messages.findIndex(
      m => m.sender === (message.isUser ? 'user' : 'agent') && !m.final
    )

    if (tentativeIndex >= 0) {
      // Update the existing tentative message
      const updatedMessages = [...messages]
      updatedMessages[tentativeIndex] = {
        ...updatedMessages[tentativeIndex],
        text: message.text,
        final: message.final || false,
      }
      setMessages(updatedMessages)
    } else {
      // Add a new message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: message.isUser ? 'user' : 'agent',
        text: message.text,
        final: message.final || false,
      }])
    }
  }

  // Handle errors
  const handleError = (err: any) => {
    console.error('ElevenLabs error:', err)
    setError(err?.message || 'An unknown error occurred')
    setStatus('disconnected')
    setMode('idle')
  }

  // Start conversation
  const startConversation = async () => {
    try {
      setError(null)
      setStatus('connecting')
      setProgress(0)
      
      // Simulate connection progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Request microphone permissions
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (err) {
        clearInterval(progressInterval)
        setShowPermissionDialog(true)
        setStatus('disconnected')
        throw new Error('Microphone permission denied')
      }

      // Get signed URL from our API
      const response = await fetch('/api/elevenlabs')
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Initialize conversation
      const conv = await Conversation.startSession({
        signedUrl: data.signedUrl,
        onConnect: () => {
          setStatus('connected')
          setMode('listening')
          clearInterval(progressInterval)
          setProgress(100)
        },
        onDisconnect: () => {
          setStatus('disconnected')
          setMode('idle')
        },
        onMessage: handleMessage,
        onStatusChange: (newStatus: string) => {
          console.log('Status changed:', newStatus)
        },
        onModeChange: (newMode: string) => {
          setMode(newMode === 'speaking' ? 'speaking' : 'listening')
        },
        onError: handleError,
      })
      
      setConversation(conv)
      
      // Start audio visualization
      startVisualization(conv)
    } catch (err: any) {
      handleError(err)
    }
  }

  // End conversation
  const endConversation = async () => {
    if (conversation) {
      await conversation.endSession()
      setConversation(null)
      setStatus('disconnected')
      setMode('idle')
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }

  // Confirm ending conversation
  const confirmEndConversation = () => {
    if (status === 'connected') {
      setShowEndDialog(true)
    }
  }

  // Reset conversation
  const resetConversation = () => {
    setMessages([])
    if (status === 'connected') {
      // Keep the connection but clear messages
    } else {
      // Start a new conversation
      startConversation()
    }
  }

  // Toggle mute
  const toggleMute = async () => {
    if (!conversation) return
    
    if (isMuted) {
      await conversation.setVolume({ volume })
    } else {
      await conversation.setVolume({ volume: 0 })
    }
    
    setIsMuted(!isMuted)
  }

  // Handle volume change
  const handleVolumeChange = async (newVolume: number[]) => {
    if (!conversation) return
    
    const value = newVolume[0]
    setVolume(value)
    
    if (!isMuted) {
      await conversation.setVolume({ volume: value })
    }
  }

  // Start visualization
  const startVisualization = (conv: any) => {
    const updateVisualization = async () => {
      try {
        if (mode === 'listening') {
          const data = await conv.getInputByteFrequencyData()
          setVisualizerData(data)
        } else if (mode === 'speaking') {
          const data = await conv.getOutputByteFrequencyData()
          setVisualizerData(data)
        }
      } catch (err) {
        console.error('Visualization error:', err)
      }
      
      animationRef.current = requestAnimationFrame(updateVisualization)
    }
    
    animationRef.current = requestAnimationFrame(updateVisualization)
  }

  // Render audio visualizer
  const renderVisualizer = () => {
    if (!visualizerData) return null
    
    const barCount = 40 // Number of bars to show
    const sampleSize = Math.floor(visualizerData.length / barCount)
    const bars = []
    
    for (let i = 0; i < barCount; i++) {
      // Get average of this frequency range
      let sum = 0
      for (let j = 0; j < sampleSize; j++) {
        const index = i * sampleSize + j
        if (index < visualizerData.length) {
          sum += visualizerData[index]
        }
      }
      const average = sum / sampleSize
      const height = (average / 255) * 100 // Convert to percentage height
      
      bars.push(
        <div 
          key={i} 
          className="w-1 bg-white rounded-full mx-px"
          style={{ 
            height: `${Math.max(3, height)}%`,
            opacity: mode === 'idle' ? 0.3 : 0.8,
          }}
        />
      )
    }
    
    return (
      <div className="flex items-end justify-center h-16 mb-4 space-x-0">
        {bars}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ElevenLabs Voice Agent</CardTitle>
            <Badge variant={
              status === 'connected' ? 'secondary' :
              status === 'connecting' ? 'outline' : 'destructive'
            }>
              {status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {status === 'connecting' && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Connecting to ElevenLabs...</p>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          <ScrollArea className="h-full pr-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center">
                  {status === 'connected' 
                    ? 'Say something to start the conversation' 
                    : 'Press the Start button to begin'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-white text-black' 
                          : 'bg-secondary border border-border'
                      } ${!message.final ? 'opacity-70' : ''}`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>
        
        <div className="px-4">
          {renderVisualizer()}
        </div>
        
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex items-center space-x-2">
            <Button
              onClick={status === 'connected' ? confirmEndConversation : startConversation}
              disabled={status === 'connecting'}
              variant={status === 'connected' ? 'destructive' : 'default'}
            >
              {status === 'connected' ? 'End' : 'Start'} Conversation
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={resetConversation}
              title="Reset conversation"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              disabled={!conversation}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <div className="w-32">
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                disabled={!conversation}
              />
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* Permission Dialog */}
      <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Microphone Access Required</AlertDialogTitle>
            <AlertDialogDescription>
              This app needs access to your microphone to enable voice conversations with the AI agent.
              Please allow microphone access in your browser settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPermissionDialog(false)}>
              OK, I'll enable it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* End Conversation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end your current conversation with the AI agent. 
              The conversation history will remain visible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEndDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowEndDialog(false)
                endConversation()
              }}
            >
              End Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}