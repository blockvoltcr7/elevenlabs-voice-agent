# ElevenLabs Voice Agent - UI/UX Documentation (Dark Mode)

## Overview

The ElevenLabs Voice Agent application provides a conversational interface where users can interact with AI agents through voice. This document outlines the UI components, user flows, and design guidelines to ensure a seamless and intuitive experience, using a black and white dark mode theme powered by shadcn UI.

## Design System

We'll be using [shadcn UI](https://ui.shadcn.com/) - a collection of reusable components built with Radix UI and Tailwind CSS. The components are designed to be:
- Accessible, adhering to WAI-ARIA standards
- Customizable with Tailwind CSS
- Maintainable, using Typescript for type safety
- Consistent, with a cohesive design language

## Core UI Components

### 1. Main Conversation Interface

The primary screen features:

- **Header Section**: App title using shadcn's `<Typography.H1>` component and status indicator
- **Conversation Area**: Displays text transcripts using shadcn's `<Card>` components
- **Audio Visualization**: Visual feedback of audio input/output using animated SVG
- **Control Panel**: Contains interaction buttons and settings using shadcn's `<Button>` variants

### 2. Status Indicators

The application has several dynamic status indicators to keep users informed:

- **Connection Status**:
  - Connecting: shadcn `<Badge variant="outline">` with pulsing animation
  - Connected: shadcn `<Badge variant="secondary">` 
  - Disconnected: shadcn `<Badge variant="destructive">`

- **Agent Mode**:
  - Listening: shadcn `<Button>` with Lucide microphone icon and subtle pulse animation
  - Speaking: shadcn `<Button>` with Lucide volume icon and animation
  - Idle: shadcn `<Button variant="ghost">` with static icon

### 3. Audio Visualization

Two visualization components provide real-time feedback:

- **Input Visualization**: Shows the user's voice input levels using an animated SVG with white waveform lines on dark background
- **Output Visualization**: Represents the AI agent's speech output using a complementary visualization with inverted colors

### 4. Control Panel

The control panel offers intuitive interaction options:

- **Start/Stop Button**: Primary shadcn `<Button>` with appropriate icon
- **Volume Control**: shadcn `<Slider>` and `<Button>` with Lucide volume icons
- **Settings Button**: shadcn `<DropdownMenu>` with configuration options
- **Reset Button**: shadcn `<Button variant="outline">` with Lucide refresh icon

## Color Palette (Dark Mode)

- **Background Colors**:
  - Primary Background: #09090B (shadcn/ui background)
  - Secondary Background: #18181B (card/component background)
  - Tertiary Background: #27272A (hover states)

- **Text Colors**:
  - Primary Text: #FFFFFF (high contrast text)
  - Secondary Text: #A1A1AA (muted text)
  - Tertiary Text: #52525B (placeholder text)

- **Accent Colors**:
  - Primary Accent: #FFFFFF (buttons, active elements)
  - Secondary Accent: #A1A1AA (borders, dividers)

- **Status Colors**:
  - Success: #FFFFFF with soft green glow (#10B981 at 20% opacity)
  - Warning: #FFFFFF with soft amber glow (#F59E0B at 20% opacity)
  - Error: #FFFFFF with soft red glow (#EF4444 at 20% opacity)

## Typography

Using the default shadcn/ui typography with Inter font:

- **Headings**: 
  - H1: 2.25rem/36px (Bold)
  - H2: 1.875rem/30px (Bold)
  - H3: 1.5rem/24px (Bold)
  - H4: 1.25rem/20px (Bold)

- **Body Text**: 
  - Default: 1rem/16px (Regular)
  - Small: 0.875rem/14px (Regular)

## User Flows

### 1. First-Time Experience

1. **Welcome Screen**:
   - shadcn `<Card>` with brief explanation
   - shadcn `<Button variant="default">` as call-to-action

2. **Permission Request**:
   - shadcn `<Alert>` explaining microphone access
   - shadcn `<Button>` to initiate permission request
   - shadcn `<AlertDialog>` if permission is denied

3. **Setup Complete**:
   - shadcn `<Alert variant="success">` with confirmation
   - Automatic transition to main interface

### 2. Starting a Conversation

1. User presses the shadcn `<Button>` labeled "Start Conversation"
2. Connection status changes to "Connecting" with appropriate `<Badge>`
3. shadcn `<Progress>` component shows connection progress
4. Upon successful connection, status changes to "Connected"
5. Agent enters "Listening" mode, with visual cue to begin speaking

### 3. During Conversation

1. **User Speaking**:
   - Input visualization activates with white lines on dark background
   - Real-time transcription appears in conversation area using shadcn `<Card variant="outline">`
   - Agent shows "Listening" status

2. **Agent Speaking**:
   - Output visualization activates
   - AI response appears in conversation area using shadcn `<Card>`
   - Agent shows "Speaking" status

3. **Turn Taking**:
   - Clear visual transitions between modes
   - Brief pauses with "Thinking" status shown with shadcn `<Skeleton>` component for natural flow

### 4. Ending a Conversation

1. User clicks "End Conversation" button
2. shadcn `<AlertDialog>` appears for confirmation
3. Connection status changes to "Disconnected"
4. Conversation remains visible with option to restart or clear

## Responsive Design

The interface adapts to different screen sizes using shadcn's responsive design principles:

### Desktop
- Full-width layout with side-by-side conversation and controls
- Larger visualization areas
- Expanded conversation history in shadcn `<ScrollArea>`

### Tablet
- Responsive grid layout
- Slightly condensed controls
- Scrollable conversation area

### Mobile
- Stacked vertical layout
- Compact controls with shadcn `<Sheet>` for expandable settings
- Focus on current conversation with minimized history

## Accessibility Considerations

- **Visual Accessibility**:
  - Inherits shadcn's accessibility features
  - High contrast between white text and dark background
  - Alternative text for all visual indicators
  - Screen reader compatibility for status changes

- **Hearing Accessibility**:
  - Full transcription of all audio content in shadcn `<Card>` components
  - Visual alternatives to audio cues
  - Volume controls with wide adjustment range using shadcn `<Slider>`

- **Motor Accessibility**:
  - Large, easily tappable control buttons
  - Keyboard navigation support via shadcn's built-in accessibility
  - Voice command alternatives for core actions

## Animation Guidelines

- **Microphone Animation**: Subtle white pulse effect during listening mode (300ms)
- **Waveform Visualization**: Smooth, responsive white lines on dark background (60fps)
- **Status Transitions**: Eased transitions between states (200ms)
- **Button Feedback**: Quick feedback for user interactions (100ms)

## Error States and Handling

### Connection Errors
- shadcn `<Alert variant="destructive">` with informative message
- Automatic retry option with shadcn `<Progress>` countdown
- Manual retry button prominently displayed

### Permission Denied
- shadcn `<AlertDialog>` with friendly explanation
- Step-by-step instructions to enable permissions
- Alternative interaction options if available

### API Errors
- shadcn `<Toast>` with non-technical error messages
- Clear next steps for resolution
- Option to report issues via shadcn `<Dialog>` form

## Implementation Notes

The UI should be implemented using React components with shadcn UI and Tailwind CSS:

1. **Setting up shadcn UI**:
   ```bash
   npx shadcn-ui@latest init
   ```
   
   Configure with:
   - TypeScript: Yes
   - Style: Default (dark mode)
   - Base color: Slate
   - Global CSS: Yes
   - CSS variables: Yes
   - React Server Components: Yes
   - Components directory: @/components/ui
   - Utils directory: @/lib/utils
   - Include tailwind.config.js: Yes

2. **Installing required components**:
   ```bash
   npx shadcn-ui@latest add button card badge alert dialog progress slider toast
   ```

3. **Additional considerations**:
   - Use React's `useState` and `useEffect` for component state management
   - Implement Canvas or SVG for audio visualizations with white on black theme
   - Ensure proper cleanup of audio resources when components unmount
   - Use responsive Tailwind classes for adaptive layouts
   - Consider using Framer Motion for more complex animations

This document serves as a guideline for implementing the Voice Agent interface with a black and white dark mode theme using shadcn UI. The actual implementation may evolve based on user testing and technical constraints, but should maintain the core principles outlined here.