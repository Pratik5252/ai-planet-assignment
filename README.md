# 🤖 AI Workflow Builder

A powerful visual workflow builder that allows users to create AI-powered workflows using drag-and-drop components. Build custom AI pipelines with document processing, knowledge retrieval, and LLM integration.

![AI Workflow Builder](https://img.shields.io/badge/AI-Workflow%20Builder-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

### 🧠 **AI Components**

#### 📝 **User Query Component**

-   Entry point for user queries
-   Configurable input preprocessing
-   Supports follow-up conversations

#### 📚 **Knowledge Base Component**

-   **PDF Document Upload**: Extract text from PDFs using PyMuPDF
-   **Embedding Generation**: Create vector embeddings using OpenAI/Google models
-   **Vector Storage**: Store embeddings in ChromaDB
-   **Context Retrieval**: Find relevant context based on user queries

#### 🤖 **LLM Engine Component**

-   **Multi-Model Support**: OpenAI GPT, Google Gemini
-   **Custom Prompts**: User-defined prompt templates
-   **Context Integration**: Combine user queries with retrieved context
-   **Web Search**: Optional SerpAPI integration for real-time information

#### 📤 **Output Component**

-   **Chat Interface**: Display AI responses in conversation format
-   **Metadata Display**: Show context usage and execution details
-   **Export Options**: Save conversations and results

### 🔧 **Workflow Execution**

#### 🏗️ **Build Stack**

-   **Workflow Validation**: Check component connections and configurations
-   **API Key Validation**: Ensure all required API keys are provided
-   **Dependency Checking**: Verify workflow can execute successfully

#### 💬 **Chat with Stack**

-   **Interactive Conversations**: Real-time chat with your workflow
-   **Context Persistence**: Maintain conversation context across messages
-   **Execution Logs**: Detailed step-by-step execution tracking
-   **Error Handling**: Graceful failure with helpful error messages

### 🔐 **Security & Privacy**

-   **User-Provided API Keys**: No hardcoded credentials, users control their own API keys
-   **Secure Storage**: API keys handled securely without server-side storage
-   **CORS Protection**: Configured for secure cross-origin requests

## 🛠️ **Tech Stack**

### **Frontend**

-   **React 18** with TypeScript
-   **ReactFlow** for visual workflow building
-   **Shadcn/ui** for modern UI components
-   **Tailwind CSS** for styling
-   **React Query (TanStack)** for API state management
-   **Vite** for fast development and building

### **Backend**

-   **FastAPI** with Python 3.11+
-   **SQLModel** for database ORM
-   **PostgreSQL** for data persistence
-   **ChromaDB** for vector storage
-   **PyMuPDF** for PDF processing
-   **OpenAI API** for embeddings and LLM
-   **Google Gemini API** for alternative LLM
-   **SerpAPI** for web search capabilities

## 🚀 **Quick Start**

### **Prerequisites**

-   Python 3.11+
-   PostgreSQL database
-   API keys for OpenAI/Google/SerpAPI (user-provided)

### **1. Clone Repository**

```bash
git clone https://github.com/Pratik5252/ai-planet-assignment
cd ai-workflow-builder
```

### **2. Setup Backend**

```bash
cd server

# Create virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start server
uvicorn app.main:app --reload
```

### **3. Setup Frontend**

```bash
cd client

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

### **4. Access Application**

-   **Frontend**: http://localhost:5173
-   **Backend API**: http://localhost:8000
-   **API Documentation**: http://localhost:8000/docs

### **Component Architecture**

```
Frontend (React)
├── WorkflowEditor - Visual workflow builder
├── WorkflowManagement - Workflow CRUD operations
├── Components - Reusable UI components
└── API Layer - React Query integration

Backend (FastAPI)
├── API Routes - RESTful endpoints
├── Services - Business logic
│   ├── WorkflowExecution - Core execution engine
│   ├── DocumentService - PDF processing
│   ├── KnowledgeService - Vector operations
│   └── LLMService - AI model integration
├── Models - Database schemas
└── Database - PostgreSQL + ChromaDB
```

## 📡 **API Endpoints**

### **Workflow Management**

```http
GET    /api/workflows/              # List all workflows
POST   /api/workflows/              # Create new workflow
GET    /api/workflows/{id}          # Get workflow details
PUT    /api/workflows/{id}          # Update workflow
PUT    /api/workflows/{id}/save     # Save workflow canvas
```

### **Workflow Execution**

```http
POST   /api/workflows/{id}/validate    # Validate workflow
POST   /api/workflows/{id}/execute     # Execute workflow
POST   /api/workflows/{id}/chat        # Chat with workflow
```

### **File Management**

```http
POST   /api/upload/                 # Upload documents
```

## 🎯 **Usage Examples**

### **1. Simple Q&A Workflow**

```
User Query → LLM Engine → Output
```

Perfect for direct AI conversations without context.

### **2. Document-Based RAG Workflow**

```
User Query → Knowledge Base → LLM Engine → Output
```

Upload PDFs, ask questions, get contextually relevant answers.

### **3. Web-Enhanced Workflow**

```
User Query → Knowledge Base → LLM Engine (with SerpAPI) → Output
```

Combine document knowledge with real-time web search.

## 🔧 **Configuration**

### **Environment Variables**

#### **Backend (.env)**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/db_name

# Optional: Default API keys for testing
# (Users should provide their own API keys through the UI)
OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here
SERP_API_KEY=your_serp_key_here
```

#### **Frontend (.env)**

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=AI Workflow Builder
```

## 🚀 **Deployment**

### **Frontend (Vercel)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
cd client
vercel --prod
```

### **Backend (Render/Railway)**

```bash
# Ensure requirements.txt is up to date
pip freeze > requirements.txt

# Deploy to your preferred platform
# Configure environment variables in platform dashboard
```

### **Database (Supabase/Neon)**

-   Create PostgreSQL instance
-   Update DATABASE_URL in environment variables
-   Database tables will be created automatically on startup
