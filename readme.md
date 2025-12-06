# DOCMIND

![Logo for docmind](/docmind/static/logo.png)

Upload PDF and text files, then ask questions via a prompt. Get answers powered by AI using Retrieval-Augmented Generation (RAG).

## Features
- Upload multiple PDF and text files
- Ask natural language questions about the content
- AI-powered answers using Groq's Llama 3.3 model
- Vector search with FAISS for efficient retrieval
- Custom Flask UI for web-based interaction
- Stateless processing with per-query file handling

## Setup

### Prerequisites
- Python 3.10+
- Conda (recommended for environment management)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd docmind
   ```

2. Create and activate conda environment:
   ```bash
   conda env create -f environment.yml
   conda activate docmind-env
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Run the Flask app:
   ```bash
   python -m flask --app docmind run --debug
   ```

   Or use the launch script:
   ```bash
   ./commands/launch_dev.sh
   ```

5. Open your browser to `http://127.0.0.1:5000/`

## Usage

1. Visit the home page and click "Start Analyzing Now" for the custom Flask interface, or "Try Gradio Interface" for the Gradio UI.
2. Upload one or more PDF or text files.
3. Enter your question in the query box.
4. Get AI-generated answers based on the uploaded content.

## Technologies Used
- **Python**: Main programming language
- **Flask**: Web framework for the custom UI
- **PyMuPDF**: PDF text extraction
- **SentenceTransformers**: Text embeddings
- **FAISS**: Vector similarity search
- **Groq + Llama 3.3**: Large language model for answer generation
- **HTML/CSS**: Frontend styling

## Project Structure
```
docmind/
├── __init__.py              # Flask app factory
├── config.py                # Application configuration
├── routes.py                # Flask routes
├── llm_processor.py         # LLM processing interface
├── pdf_utility.py           # PDF processing utilities
├── static/                  # CSS, images, etc.
├── templates/               # HTML templates
llm/
├── __init__.py              # RAG pipeline and query processing
app.py                       # Application entry point
requirements.txt             # Python dependencies
environment.yml              # Conda environment
commands/
├── launch_dev.sh            # Development launch script
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
See LICENSE file for details.
