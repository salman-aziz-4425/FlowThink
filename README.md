# Flow Think

A React-based visual interface that allows users to connect YouTube videos to chat nodes and interact with video content through a conversational interface.

<img width="1512" alt="image" src="https://github.com/user-attachments/assets/079f669f-333d-4516-8587-6397e3dc5bc7" />

## Features

- **Visual Node System**: Create and connect different types of nodes through an intuitive drag-and-drop interface.
- **URL Nodes**: Input YouTube video URLs for processing.
- **Chat Nodes**: Interact with processed video content through a chat interface.
- **Real-time Processing**: Visual feedback during video processing and connection states.
- **Interactive Connections**: Bezier curves with animations and status indicators.
- **Responsive Design**: Clean, modern UI with smooth animations and transitions.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A running backend server (on localhost:8000)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

### Usage

1. **Creating Nodes**:
   - Double-click anywhere in the workspace to create a URL node.
   - Alt + Double-click to create a Chat node.

2. **Connecting Nodes**:
   - Drag from a URL node's bottom endpoint to a Chat node's top endpoint.
   - The connection will trigger automatic video processing.

3. **Interacting with Nodes**:
   - URL Node: Enter a YouTube URL.
   - Chat Node: Ask questions about the video content.
   - Drag nodes to reposition them in the workspace.

## Technical Stack

- **Frontend**:
  - React
  - jsPlumb (for node connections)
  - Axios (for API requests)
  - CSS3 with modern features

- **Key Dependencies**:
  - @jsplumb/community
  - axios
  - react
  - react-dom

## Features in Detail

### URL Node
- Input field for YouTube URLs.
- Processing status indicator.
- Connection endpoint at the bottom.
- Visual feedback for processing and connection states.

### Chat Node
- Message history display.
- User and bot message differentiation.
- Markdown support for responses.
- Input field for questions.
- Loading states for API requests.
- Connection endpoint at the top.

### Connections
- Animated Bezier curves.
- Processing state visualization.
- Connection status indicators.
- Detachable connections.

## API Endpoints

The application expects the following endpoints on the backend:

- `POST /connect-url-to-chat`: Process YouTube URLs
  ```json
  {
    "url": "youtube-url"
  }
  ```

- `POST /ask-question`: Handle chat interactions
  ```json
  {
    "question": "user-question",
  }
  ```

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- jsPlumb Community Edition for the connection functionality.
- React team for the amazing framework.
- All contributors and users of this project.
