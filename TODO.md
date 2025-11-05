# TODO: Combine Flask Frontend with RAG Backend into Full-Stack Project

## Step 1: Update requirements.txt
- Add all missing dependencies with versions: flask==2.3.3, PyMuPDF==1.23.8, gradio==4.0.0, sentence-transformers==2.2.2, faiss-cpu==1.7.4, groq==0.4.1, python-dotenv==1.0.0

## Step 2: Create environment.yml
- Create conda environment file with Python 3.10, conda-forge channel, and dependencies from requirements.txt

## Step 3: Integrate RAG into Flask - Replace llm/__init__.py
- Adapt RAG logic from rag_llm_documind.py to process files per query (extract text from PDFs and text files, chunk, embed, index, retrieve, answer)
- Add support for text files alongside PDFs
- Implement persistent FAISS index (save/load to disk)

## Step 4: Update docmind/__init__.py
- Modify /response_page route to use new query_processor
- Add error handling (invalid files, missing API key)
- Add file cleanup (delete temp files after processing)

## Step 5: Consolidate Interface - Embed Gradio into Flask
- Add new route (e.g., /gradio) to launch Gradio interface within Flask app
- Allow users to choose between custom Flask UI or Gradio for querying

## Step 6: Enhancements
- Improve chunking (smarter overlap)
- Add error pages for failures
- Add logging
- Ensure stateless per-query processing with optimization for persistent index

## Step 7: Followup Steps
- Create conda environment and install dependencies
- Test Flask app locally (run with flask run, upload PDFs/text, query)
- Test with multiple files and edge cases (no files, invalid formats)
- Verify RAG answers are accurate and cite sources
